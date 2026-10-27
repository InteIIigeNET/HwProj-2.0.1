import {useCallback, useEffect, useMemo} from 'react';
import {useCourseDispatch, useCourseState, useCourseStore} from '../hooks';
import {loadCoursePage, refreshCourseGroups, refreshCourseSolutions} from '../courseThunks';
import {updateCourseFiles, setProcessingLoading} from '../slices/courseFileSlice';
import {selectIsExpert, selectIsLecturer, selectUserId} from '../slices/userSlice';
import ApiSingleton from '@/api/ApiSingleton';
import {FileInfoDTO, ScopeDTO, StudentSolutionsTableTaskDto, StatisticsCourseMatesModel, StudentSolutionsTableHomeworkDto} from '@/api';
import {CourseUnitType} from '@/components/Files/CourseUnitType';
import {FileStatus} from '@/components/Files/FileStatus';
import {enqueueSnackbar} from 'notistack';
import {selectHomeworks, selectStudentSolutions} from '../courseSelectors';

export type StartProcessingFn = (
    homeworkId: number,
    courseUnitType: CourseUnitType,
    previouslyExistingFilesCount: number,
    waitingNewFilesCount: number,
    deletingFilesIds: number[]
) => void;

export const useIsCourseMentor = () => {
    const mentors = useCourseState(state => state.course.mentors);
    const userId = useCourseState(selectUserId);
    return mentors.some(m => m.userId === userId);
};

export const useUnratedSolutionsCount = () => {
    const studentSolutions = useCourseState(selectStudentSolutions);
    return studentSolutions
        .flatMap((x: StatisticsCourseMatesModel) => x.homeworks ?? [])
        .flatMap((x: StudentSolutionsTableHomeworkDto) => x.tasks ?? [])
        .filter((t: StudentSolutionsTableTaskDto) => t.solutions?.slice(-1)[0]?.state === 0)
        .length;
};

export const useCoursePageData = () => {
    const course = useCourseState(state => state.course.currentCourseMeta);
    const courseId = useCourseState(state => state.course.courseId);
    const status = useCourseState(state => state.course.status);
    const error = useCourseState(state => state.course.error);
    const warnings = useCourseState(state => state.course.warnings);
    const solutionsError = useCourseState(state => state.solutions.error);
    const isFound = useCourseState(state => state.course.isFound);
    const mentors = useCourseState(state => state.course.mentors);
    const acceptedStudents = useCourseState(state => state.course.acceptedStudents);
    const newStudents = useCourseState(state => state.course.newStudents);
    const groups = useCourseState(state => state.groups.items);
    const courseHomeworks = useCourseState(selectHomeworks);
    const studentSolutions = useCourseState(selectStudentSolutions);
    const userId = useCourseState(selectUserId);
    const isLecturer = useCourseState(selectIsLecturer);
    const isExpert = useCourseState(selectIsExpert);

    return {
        course,
        courseId,
        status,
        error,
        warnings,
        solutionsError,
        isFound,
        mentors,
        acceptedStudents,
        newStudents,
        groups,
        courseHomeworks,
        studentSolutions,
        userId,
        isLecturer,
        isExpert,
        isLecturerOrExpertOnSite: isLecturer || isExpert,
        isSignedInCourse: newStudents?.some(cm => cm.userId === userId) ?? false,
        isAcceptedStudent: acceptedStudents?.some(cm => cm.userId === userId) ?? false,
    };
};

export const useCourseLoader = (courseId: number) => {
    const dispatch = useCourseDispatch();
    const store = useCourseStore();
    const scopeId = useCourseState(state => state.course.scopeId);

    const loadCourse = useCallback(() => dispatch(loadCoursePage({courseId})), [dispatch, courseId]);

    const loadStudentSolutions = useCallback(() => {
        if (scopeId) return dispatch(refreshCourseSolutions({courseId, scopeId}));
    }, [dispatch, courseId, scopeId]);

    const loadGroups = useCallback(async () => {
        if (!scopeId) return;
        const result = await dispatch(refreshCourseGroups({courseId, scopeId}));
        const current = store.getState();
        if (refreshCourseGroups.rejected.match(result) && !result.meta.aborted && !result.meta.condition
            && current.course.courseId === courseId && current.course.scopeId === scopeId
            && current.groups.requestId === result.meta.requestId) {
            enqueueSnackbar(result.payload ?? 'Не удалось обновить группы курса', {
                variant: 'error',
                autoHideDuration: 4000,
            });
        }
    }, [dispatch, store, courseId, scopeId]);

    return {loadCourse, loadStudentSolutions, loadGroups};
};

export const useRefreshCourse = () => {
    const dispatch = useCourseDispatch();
    const scopeId = useCourseState(state => state.course.scopeId);
    return useCallback((courseId: number) => {
        return dispatch(loadCoursePage({courseId, refresh: true, scopeId}));
    }, [dispatch, scopeId]);
};

export const useCourseFiles = (courseId: number) => {
    const dispatch = useCourseDispatch();
    const store = useCourseStore();
    const scopeId = useCourseState(state => state.course.scopeId);
    const isCurrent = useCallback(() => {
        const course = store.getState().course;
        return scopeId != null && course.courseId === courseId && course.scopeId === scopeId;
    }, [store, courseId, scopeId]);

    const updateFiles = useCallback((files: FileInfoDTO[], unitType: CourseUnitType, unitId: number) => {
        if (isCurrent()) dispatch(updateCourseFiles({files, unitType, unitId}));
    }, [dispatch, isCurrent]);

    const setFileLoading = useCallback((homeworkId: number, isLoading: boolean) => {
        if (isCurrent()) dispatch(setProcessingLoading({homeworkId, isLoading}));
    }, [dispatch, isCurrent]);

    return {updateFiles, setFileLoading};
};

interface FileProcessingOperation {
    unitId: number;
    controller: AbortController;
    timer?: ReturnType<typeof setTimeout>;
    timeout?: ReturnType<typeof setTimeout>;
}

export const useCourseFilePolling = (
    courseId: number,
    updateFiles: (files: FileInfoDTO[], unitType: CourseUnitType, unitId: number) => void,
    setFileLoading: (homeworkId: number, isLoading: boolean) => void
) => {
    const processing = useMemo(() => ({
        active: false,
        operations: new Map<string, FileProcessingOperation>(),
    }), [courseId, updateFiles, setFileLoading]);

    const stopProcessing = useCallback((key: string) => {
        const operation = processing.operations.get(key);
        if (!operation) return;
        processing.operations.delete(key);
        clearTimeout(operation.timer);
        clearTimeout(operation.timeout);
        operation.controller.abort();
        setFileLoading(operation.unitId, false);
    }, [processing, setFileLoading]);

    const startProcessing = useCallback<StartProcessingFn>(
        (homeworkId, courseUnitType, previouslyExistingFilesCount, waitingNewFilesCount, deletingFilesIds) => {
            if (!processing.active) return;
            const key = `${courseUnitType}:${homeworkId}`;
            stopProcessing(key);
            const operation: FileProcessingOperation = {unitId: homeworkId, controller: new AbortController()};
            processing.operations.set(key, operation);
            const expectedCount = previouslyExistingFilesCount - deletingFilesIds.length + waitingNewFilesCount;
            const scopeDto: ScopeDTO = {courseId, courseUnitType, courseUnitId: homeworkId};
            const isCurrent = () => processing.active && processing.operations.get(key) === operation;

            const fetchFiles = async () => {
                try {
                    const files = await ApiSingleton.filesApi.filesGetStatuses(scopeDto, {signal: operation.controller.signal});
                    if (!isCurrent()) return;
                    updateFiles(files, courseUnitType, homeworkId);
                    if (files.length === expectedCount
                        && files.every(file => file.status !== FileStatus.Uploading && file.status !== FileStatus.Deleting)) {
                        stopProcessing(key);
                        return;
                    }
                } catch {
                    if (!isCurrent()) return;
                }
                operation.timer = setTimeout(fetchFiles, 1000);
            };

            operation.timer = setTimeout(fetchFiles, 1000);
            operation.timeout = setTimeout(() => {
                if (!isCurrent()) return;
                stopProcessing(key);
                enqueueSnackbar('Не удалось дождаться завершения обработки файлов. Обновите страницу, чтобы проверить их состояние.', {
                    variant: 'warning',
                    autoHideDuration: 4000,
                });
            }, 10000);
            setFileLoading(homeworkId, true);
        },
        [courseId, updateFiles, setFileLoading, stopProcessing, processing]
    );

    useEffect(() => {
        processing.active = true;
        return () => {
            processing.active = false;
            for (const key of processing.operations.keys()) stopProcessing(key);
        };
    }, [processing, stopProcessing]);

    return {startProcessing};
};
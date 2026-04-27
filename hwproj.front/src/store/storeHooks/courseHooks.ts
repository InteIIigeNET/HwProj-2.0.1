import {useCallback, useEffect, useRef} from 'react';
import {useCourseDispatch, useCourseState} from '../hooks';
import {
    setCourse,
    setMentors,
    setAcceptedStudents,
    setNewStudents,
    toCurrentCourseMeta
} from '../slices/courseSlice';
import {setHomeworks} from '../slices/homeworkSlice';
import {setStudentSolutions} from '../slices/solutionSlice';
import {setCourseFiles, updateCourseFiles, setProcessingLoading} from '../slices/courseFileSlice';
import {setUser, UserRole} from '../slices/userSlice';
import {resetEditingState} from '../slices/courseEditingSlice';
import {setGroups} from '../slices/groupSlice';
import ApiSingleton from '@/api/ApiSingleton';
import {FileInfoDTO, ScopeDTO, StudentSolutionsTableTaskDto, StatisticsCourseMatesModel, StudentSolutionsTableHomeworkDto} from '@/api';
import {CourseUnitType} from '@/components/Files/CourseUnitType';
import {FileStatus} from '@/components/Files/FileStatus';
import {enqueueSnackbar} from 'notistack';
import ErrorsHandler from '@/components/Utils/ErrorsHandler';

export type StartProcessingFn = (
    homeworkId: number,
    courseUnitType: CourseUnitType,
    previouslyExistingFilesCount: number,
    waitingNewFilesCount: number,
    deletingFilesIds: number[]
) => void;

export const useIsCourseMentor = () => {
    const mentors = useCourseState(state => state.course.mentors);
    const userId = useCourseState(state => state.user.userId);
    return mentors.some(m => m.userId === userId);
};

export const useUnratedSolutionsCount = () => {
    const studentSolutions = useCourseState(state => state.solutions.studentSolutions);
    return studentSolutions
        .flatMap((x: StatisticsCourseMatesModel) => x.homeworks ?? [])
        .flatMap((x: StudentSolutionsTableHomeworkDto) => x.tasks ?? [])
        .filter((t: StudentSolutionsTableTaskDto) => t.solutions?.slice(-1)[0]?.state === 0)
        .length;
};

export const useCoursePageData = () => {
    const course = useCourseState(state => state.course.currentCourseMeta);
    const isFound = useCourseState(state => state.course.isFound);
    const mentors = useCourseState(state => state.course.mentors);
    const acceptedStudents = useCourseState(state => state.course.acceptedStudents);
    const newStudents = useCourseState(state => state.course.newStudents);
    const groups = useCourseState(state => state.groups.items);
    const courseHomeworks = useCourseState(state => state.homeworks.items);
    const studentSolutions = useCourseState(state => state.solutions.studentSolutions);
    const userId = useCourseState(state => state.user.userId);
    const isLecturer = useCourseState(state => state.user.isLecturer);
    const isExpert = useCourseState(state => state.user.isExpert);

    return {
        course,
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
    const userId = useCourseState(state => state.user.userId);
    const isLecturerOrExpertOnSite = useCourseState(state => state.user.isLecturer || state.user.isExpert);

    const initUser = useCallback(() => {
        const id = ApiSingleton.authService.getUserId();
        const role = ApiSingleton.authService.getRole() as UserRole;
        dispatch(setUser({userId: id, role}));
    }, [dispatch]);

    const loadCourse = useCallback(async () => {
        const course = await ApiSingleton.coursesApi.coursesGetCourseData(courseId);

        const shouldRefreshToken = !isLecturerOrExpertOnSite && course && course.mentors!.some(t => t.userId === userId);
        if (shouldRefreshToken) {
            const newToken = await ApiSingleton.accountApi.accountRefreshToken();
            newToken.value && ApiSingleton.authService.refreshToken(newToken.value.accessToken!);
            return null;
        }

        dispatch(setCourse(toCurrentCourseMeta(course)));
        dispatch(setMentors(course.mentors!));
        dispatch(setAcceptedStudents(course.acceptedStudents!));
        dispatch(setNewStudents(course.newStudents!));
        dispatch(setGroups(course.groups ?? []));
        dispatch(setHomeworks(course.homeworks!));
        return course;
    }, [dispatch, courseId, userId, isLecturerOrExpertOnSite]);

    const loadStudentSolutions = useCallback(async () => {
        const res = await ApiSingleton.statisticsApi.statisticsGetCourseStatistics(courseId);
        dispatch(setStudentSolutions(res));
    }, [dispatch, courseId]);

    const resetEditing = useCallback(() => {
        dispatch(resetEditingState());
    }, [dispatch]);

    return {initUser, loadCourse, loadStudentSolutions, resetEditing};
};

export const useRefreshCourse = () => {
    const dispatch = useCourseDispatch();
    return useCallback(async (courseId: number) => {
        const course = await ApiSingleton.coursesApi.coursesGetCourseData(courseId);
        dispatch(setCourse(toCurrentCourseMeta(course)));
        dispatch(setMentors(course.mentors ?? []));
        dispatch(setAcceptedStudents(course.acceptedStudents ?? []));
        dispatch(setNewStudents(course.newStudents ?? []));
        dispatch(setGroups(course.groups ?? []));
        dispatch(setHomeworks(course.homeworks ?? []));
    }, [dispatch]);
};

export const useCourseFiles = (courseId: number, defaultIsCourseMentor?: boolean) => {
    const dispatch = useCourseDispatch();

    const loadCourseFiles = useCallback(async (isCourseMentor = defaultIsCourseMentor ?? false) => {
        let files = [] as FileInfoDTO[];
        try {
            files = await ApiSingleton.filesApi.filesGetFilesInfo(courseId, !isCourseMentor);
        } catch (e) {
            const errors = await ErrorsHandler.getErrorMessages(e as Response);
            enqueueSnackbar(errors[0], {variant: 'warning', autoHideDuration: 1990});
        }
        dispatch(setCourseFiles(files));
    }, [dispatch, courseId, defaultIsCourseMentor]);

    const updateFiles = useCallback((files: FileInfoDTO[], unitType: CourseUnitType, unitId: number) => {
        dispatch(updateCourseFiles({files, unitType, unitId}));
    }, [dispatch]);

    const setFileLoading = useCallback((homeworkId: number, isLoading: boolean) => {
        dispatch(setProcessingLoading({homeworkId, isLoading}));
    }, [dispatch]);

    return {loadCourseFiles, updateFiles, setFileLoading};
};

export const useCourseFilePolling = (
    courseId: number,
    updateFiles: (files: FileInfoDTO[], unitType: CourseUnitType, unitId: number) => void,
    setFileLoading: (homeworkId: number, isLoading: boolean) => void
) => {
    const intervalsRef = useRef<Record<number, { interval: NodeJS.Timeout; timeout: NodeJS.Timeout }>>({});

    const stopProcessing = useCallback((homeworkId: number) => {
        if (intervalsRef.current[homeworkId]) {
            const {interval, timeout} = intervalsRef.current[homeworkId];
            clearInterval(interval);
            clearTimeout(timeout);
            delete intervalsRef.current[homeworkId];
        }
    }, []);

    const startProcessing = useCallback<StartProcessingFn>(
        (homeworkId, courseUnitType, previouslyExistingFilesCount, waitingNewFilesCount, deletingFilesIds) => {
            stopProcessing(homeworkId);
            let attempt = 0;
            const maxAttempts = 10;
            const delay = 1000;
            const scopeDto: ScopeDTO = {
                courseId,
                courseUnitType,
                courseUnitId: homeworkId,
            };

            const fetchFiles = async () => {
                if (attempt >= maxAttempts) {
                    stopProcessing(homeworkId);
                    enqueueSnackbar('Превышено допустимое количество попыток получения информации о файлах', {
                        variant: 'warning',
                        autoHideDuration: 2000,
                    });
                    return;
                }
                attempt++;
                try {
                    const files = await ApiSingleton.filesApi.filesGetStatuses(scopeDto);
                    if (
                        waitingNewFilesCount === 0 &&
                        files.filter(f => f.status === FileStatus.ReadyToUse).length ===
                            previouslyExistingFilesCount - deletingFilesIds.length
                    ) {
                        updateFiles(files, courseUnitType, homeworkId);
                        setFileLoading(homeworkId, false);
                    }
                    if (
                        waitingNewFilesCount > 0 &&
                        files.filter(f => !deletingFilesIds.some(dfi => dfi === f.id)).length ===
                            previouslyExistingFilesCount - deletingFilesIds.length + waitingNewFilesCount
                    ) {
                        updateFiles(files, courseUnitType, homeworkId);
                        setFileLoading(homeworkId, false);
                    }
                    if (
                        files.length === previouslyExistingFilesCount - deletingFilesIds.length + waitingNewFilesCount &&
                        files.every(f => f.status !== FileStatus.Uploading && f.status !== FileStatus.Deleting)
                    ) {
                        stopProcessing(homeworkId);
                        setFileLoading(homeworkId, false);
                    }
                } catch (error) {
                    console.error(`Ошибка (попытка ${attempt}):`, error);
                }
            };

            const interval = setInterval(fetchFiles, delay);
            const timeout = setTimeout(() => {
                stopProcessing(homeworkId);
                setFileLoading(homeworkId, false);
            }, 10000);
            intervalsRef.current[homeworkId] = {interval, timeout};
            setFileLoading(homeworkId, true);
        },
        [courseId, updateFiles, setFileLoading, stopProcessing]
    );

    useEffect(() => {
        return () => {
            Object.values(intervalsRef.current).forEach(({interval, timeout}) => {
                clearInterval(interval);
                clearTimeout(timeout);
            });
            intervalsRef.current = {};
        };
    }, []);

    return {startProcessing};
};
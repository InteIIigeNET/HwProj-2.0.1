import {useCallback} from 'react';
import {useCourseDispatch, useCourseState} from './hooks';
import {setCourse, setMentors, setAcceptedStudents, setNewStudents} from './slices/courseSlice';
import {setHomeworks} from './slices/homeworkSlice';
import {setStudentSolutions} from './slices/solutionSlice';
import {setCourseFiles, updateCourseFiles, setProcessingLoading} from './slices/courseFileSlice';
import {setUser, UserRole} from './slices/userSlice';
import {resetEditingState} from './slices/courseEditingSlice';
import ApiSingleton from '@/api/ApiSingleton';
import {FileInfoDTO} from '@/api';
import {CourseUnitType} from '@/components/Files/CourseUnitType';
import {enqueueSnackbar} from 'notistack';
import ErrorsHandler from '@/components/Utils/ErrorsHandler';

export const useCourseLoader = (courseId: number) => {
    const dispatch = useCourseDispatch();
    const userId = useCourseState(state => state.user.userId);
    const isMentor = useCourseState(state => state.user.isLecturer || state.user.isExpert);

    const initUser = useCallback(() => {
        const id = ApiSingleton.authService.getUserId();
        const role = ApiSingleton.authService.getRole() as UserRole;
        dispatch(setUser({userId: id, role}));
    }, [dispatch]);

    const loadCourse = useCallback(async () => {
        const course = await ApiSingleton.coursesApi.coursesGetCourseData(courseId);

        const shouldRefreshToken = !isMentor && course && course.mentors!.some(t => t.userId === userId);
        if (shouldRefreshToken) {
            const newToken = await ApiSingleton.accountApi.accountRefreshToken();
            newToken.value && ApiSingleton.authService.refreshToken(newToken.value.accessToken!);
            return null;
        }

        dispatch(setCourse(course));
        dispatch(setMentors(course.mentors!));
        dispatch(setAcceptedStudents(course.acceptedStudents!));
        dispatch(setNewStudents(course.newStudents!));
        dispatch(setHomeworks(course.homeworks!));
        return course;
    }, [dispatch, courseId, userId, isMentor]);

    const loadStudentSolutions = useCallback(async () => {
        const res = await ApiSingleton.statisticsApi.statisticsGetCourseStatistics(courseId);
        dispatch(setStudentSolutions(res));
    }, [dispatch, courseId]);

    const resetEditing = useCallback(() => {
        dispatch(resetEditingState());
    }, [dispatch]);

    return {initUser, loadCourse, loadStudentSolutions, resetEditing};
};

export const useCourseFiles = (courseId: number, isCourseMentor: boolean) => {
    const dispatch = useCourseDispatch();

    const loadCourseFiles = useCallback(async () => {
        let files = [] as FileInfoDTO[];
        try {
            files = await ApiSingleton.filesApi.filesGetFilesInfo(courseId, !isCourseMentor);
        } catch (e) {
            const errors = await ErrorsHandler.getErrorMessages(e as Response);
            enqueueSnackbar(errors[0], {variant: 'warning', autoHideDuration: 1990});
        }
        dispatch(setCourseFiles(files));
    }, [dispatch, courseId, isCourseMentor]);

    const updateFiles = useCallback((files: FileInfoDTO[], unitType: CourseUnitType, unitId: number) => {
        dispatch(updateCourseFiles({files, unitType, unitId}));
    }, [dispatch]);

    const setFileLoading = useCallback((homeworkId: number, isLoading: boolean) => {
        dispatch(setProcessingLoading({homeworkId, isLoading}));
    }, [dispatch]);

    return {loadCourseFiles, updateFiles, setFileLoading};
};
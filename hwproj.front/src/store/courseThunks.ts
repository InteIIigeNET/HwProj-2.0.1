import {createAsyncThunk} from '@reduxjs/toolkit';
import type {FileInfoDTO, GroupViewModel} from '@/api';
import ApiSingleton from '@/api/ApiSingleton';
import {setUser, type UserRole} from './slices/userSlice';
import {serializeDates, type StoredCourse, type StoredStudentSolutions} from './courseModels';

interface CourseRequestState {
    course: {
        courseId: number | null;
        requestId: string | null;
        scopeId: string | null;
    };
}

interface LoadCourseArgs {
    courseId: number;
    refresh?: boolean;
    scopeId?: string | null;
}

interface LoadedCourse {
    course: StoredCourse;
    solutions?: StoredStudentSolutions[];
    files?: FileInfoDTO[];
    warnings: string[];
}

export const loadCoursePage = createAsyncThunk<LoadedCourse, LoadCourseArgs, {
    state: CourseRequestState;
    rejectValue: string;
}>(
    'course/loadPage',
    async ({courseId}, {dispatch, getState, requestId, signal, rejectWithValue}) => {
        const ensureCurrent = () => {
            const current = getState().course;
            if (signal.aborted || current.courseId !== courseId || current.requestId !== requestId) {
                throw new DOMException('Course request is no longer current', 'AbortError');
            }
        };
        const readUser = () => {
            const role = ApiSingleton.authService.getRole() as UserRole | null;
            const userId = role ? ApiSingleton.authService.getUserId() : null;
            const user = userId && role ? {userId, role} : null;
            dispatch(setUser(user));
            return user;
        };

        try {
            let user = readUser();
            let course = await ApiSingleton.coursesApi.coursesGetCourseData(courseId, {signal});
            ensureCurrent();
            if (!course) return rejectWithValue('Курс не найден');

            const userId = user?.userId;
            if (user && user.role !== 'Lecturer' && user.role !== 'Expert'
                && course.mentors?.some(mentor => mentor.userId === userId)) {
                const token = await ApiSingleton.accountApi.accountRefreshToken({signal});
                ensureCurrent();
                if (!token.value?.accessToken) return rejectWithValue('Не удалось обновить права доступа');
                ApiSingleton.authService.refreshToken(token.value.accessToken);
                user = readUser();
                course = await ApiSingleton.coursesApi.coursesGetCourseData(courseId, {signal});
                ensureCurrent();
            }

            const isMentor = !!user && !!course.mentors?.some(mentor => mentor.userId === user.userId);
            const canViewSolutions = isMentor
                || (!!user && !!course.acceptedStudents?.some(student => student.userId === user.userId));
            const scopeId = getState().course.scopeId;
            if (scopeId) {
                if (canViewSolutions) dispatch(refreshCourseSolutions({courseId, scopeId}, {signal}));
                if (user) dispatch(refreshCourseFiles({courseId, scopeId, uploadedOnly: !isMentor}, {signal}));
            }

            return {
                course: serializeDates(course),
                solutions: canViewSolutions ? undefined : [],
                files: user ? undefined : [],
                warnings: [],
            };
        } catch (error) {
            ensureCurrent();
            return rejectWithValue(error instanceof Response && error.status === 404
                ? 'Курс не найден'
                : 'Не удалось загрузить курс. Попробуйте ещё раз.');
        }
    },
    {
        condition: ({courseId, refresh, scopeId}, {getState}) => !refresh
            || (getState().course.courseId === courseId && getState().course.scopeId === scopeId),
    },
);

export const refreshCourseSolutions = createAsyncThunk<StoredStudentSolutions[], {
    courseId: number;
    scopeId: string;
}, {state: CourseRequestState; rejectValue: string}>(
    'solution/refresh',
    async ({courseId}, {signal, rejectWithValue}) => {
        try {
            return serializeDates(await ApiSingleton.statisticsApi.statisticsGetCourseStatistics(courseId, {signal}));
        } catch {
            return rejectWithValue('Не удалось обновить решения студентов');
        }
    },
    {
        condition: ({courseId, scopeId}, {getState}) => getState().course.courseId === courseId
            && getState().course.scopeId === scopeId,
    },
);

export const refreshCourseFiles = createAsyncThunk<FileInfoDTO[], {
    courseId: number;
    scopeId: string;
    uploadedOnly: boolean;
}, {state: CourseRequestState; rejectValue: string}>(
    'courseFiles/refresh',
    async ({courseId, uploadedOnly}, {signal, rejectWithValue}) => {
        try {
            return await ApiSingleton.filesApi.filesGetFilesInfo(courseId, uploadedOnly, undefined, {signal});
        } catch {
            return rejectWithValue('Не удалось загрузить файлы курса');
        }
    },
    {
        condition: ({courseId, scopeId}, {getState}) => getState().course.courseId === courseId
            && getState().course.scopeId === scopeId,
    },
);

export const refreshCourseGroups = createAsyncThunk<GroupViewModel[], {
    courseId: number;
    scopeId: string;
}, {state: CourseRequestState; rejectValue: string}>(
    'groups/refresh',
    async ({courseId}, {signal, rejectWithValue}) => {
        try {
            return await ApiSingleton.courseGroupsApi.courseGroupsGetAllCourseGroups(courseId, {signal});
        } catch {
            return rejectWithValue('Не удалось обновить группы курса');
        }
    },
    {
        condition: ({courseId, scopeId}, {getState}) => getState().course.courseId === courseId
            && getState().course.scopeId === scopeId,
    },
);
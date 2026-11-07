import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {FileInfoDTO} from "@/api";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import {loadCoursePage, refreshCourseFiles} from '../courseThunks';

interface ProcessingState {
    isLoading: boolean;
}

interface CourseFilesState {
    requestId: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    revision: number;
    loadingRevision: number | null;
    items: FileInfoDTO[];
    processingFilesState: Record<number, ProcessingState>;
}

const initialState: CourseFilesState = {
    requestId: null,
    status: 'idle',
    error: null,
    revision: 0,
    loadingRevision: null,
    items: [],
    processingFilesState: {},
}

const courseFilesSlice = createSlice({
    name: "courseFiles",
    initialState,
    reducers: {
        setCourseFiles(state, action: PayloadAction<FileInfoDTO[]>) {
            state.items = action.payload;
            state.revision += 1;
        },

        updateCourseFiles(state, action: PayloadAction<{
            files: FileInfoDTO[];
            unitType: CourseUnitType;
            unitId: number;
        }>) {
            const { files, unitType, unitId } = action.payload;
            state.items = [
                ...state.items.filter(f => !(f.courseUnitType === unitType && f.courseUnitId === unitId)),
                ...files
            ];
            state.revision += 1;
        },

        setProcessingLoading(state, action: PayloadAction<{ homeworkId: number; isLoading: boolean }>) {
            const { homeworkId, isLoading } = action.payload;
            state.processingFilesState[homeworkId] = { isLoading };
        },
    },
    extraReducers: builder => {
        builder.addCase(loadCoursePage.pending, state => {
            state.requestId = null;
            state.status = 'idle';
            state.error = null;
            state.loadingRevision = null;
        });
        builder.addCase(loadCoursePage.fulfilled, (state, action) => {
            if (!action.payload.files) return;
            state.items = action.payload.files;
            state.revision += 1;
            state.requestId = null;
            state.status = 'succeeded';
            state.error = null;
            state.loadingRevision = null;
        });
        builder.addCase(refreshCourseFiles.pending, (state, action) => {
            state.requestId = action.meta.requestId;
            state.status = 'loading';
            state.error = null;
            state.loadingRevision = state.revision;
        });
        builder.addCase(refreshCourseFiles.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            if (state.revision === state.loadingRevision) {
                state.items = action.payload;
                state.revision += 1;
            }
            state.requestId = null;
            state.status = 'succeeded';
            state.loadingRevision = null;
        });
        builder.addCase(refreshCourseFiles.rejected, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            state.requestId = null;
            state.status = action.meta.aborted ? 'idle' : 'failed';
            state.error = action.meta.aborted ? null : action.payload ?? 'Не удалось загрузить файлы курса';
            state.loadingRevision = null;
        });
    },
})

export const {setCourseFiles, updateCourseFiles, setProcessingLoading} = courseFilesSlice.actions;

export default courseFilesSlice.reducer;
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {FileInfoDTO} from "@/api";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import {loadCoursePage} from '../courseThunks';

interface ProcessingState {
    isLoading: boolean;
}

interface CourseFilesState {
    revision: number;
    loadingRevision: number | null;
    items: FileInfoDTO[];
    processingFilesState: Record<number, ProcessingState>;
}

const initialState: CourseFilesState = {
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
            state.loadingRevision = state.revision;
        });
        builder.addCase(loadCoursePage.fulfilled, (state, action) => {
            if (action.payload.files && state.revision === state.loadingRevision) {
                state.items = action.payload.files;
                state.revision += 1;
            }
            state.loadingRevision = null;
        });
        builder.addCase(loadCoursePage.rejected, state => {
            state.loadingRevision = null;
        });
    },
})

export const {setCourseFiles, updateCourseFiles, setProcessingLoading} = courseFilesSlice.actions;

export default courseFilesSlice.reducer;
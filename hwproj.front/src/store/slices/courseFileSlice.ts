import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {FileInfoDTO} from "@/api";
import {CourseUnitType} from "@/components/Files/CourseUnitType";

interface ProcessingState {
    isLoading: boolean;
}

interface CourseFilesState {
    items: FileInfoDTO[];
    processingFilesState: Record<number, ProcessingState>;
}

const initialState: CourseFilesState = {
    items: [],
    processingFilesState: {},
}

const courseFilesSlice = createSlice({
    name: "courseFiles",
    initialState,
    reducers: {
        setCourseFiles(state, action: PayloadAction<FileInfoDTO[]>) {
            state.items = action.payload;
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
        },

        setProcessingLoading(state, action: PayloadAction<{ homeworkId: number; isLoading: boolean }>) {
            const { homeworkId, isLoading } = action.payload;
            state.processingFilesState[homeworkId] = { isLoading };
        },

        clearCourseFiles(state) {
            state.items = [];
            state.processingFilesState = {};
        },
    },
})

export const { setCourseFiles, 
    updateCourseFiles, 
    setProcessingLoading, 
    clearCourseFiles 
} = courseFilesSlice.actions;

export default courseFilesSlice.reducer;
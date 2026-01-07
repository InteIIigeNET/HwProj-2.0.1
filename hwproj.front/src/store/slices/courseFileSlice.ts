import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {FileInfoDTO} from "@/api";
import {CourseUnitType} from "@/components/Files/CourseUnitType";

interface ProcessingState {
    isLoading: boolean;
}

interface CourseFilesState {
    courseFiles: FileInfoDTO[];
    processingFilesState: Record<number, ProcessingState>;
}

const initialState: CourseFilesState = {
    courseFiles: [],
    processingFilesState: {},
}

const courseFilesSlice = createSlice({
    name: "courseFiles",
    initialState,
    reducers: {
        setCourseFiles(state, action: PayloadAction<FileInfoDTO[]>) {
            state.courseFiles = action.payload;
        },

        updateCourseFiles(state, action: PayloadAction<{
            files: FileInfoDTO[];
            unitType: CourseUnitType;
            unitId: number;
        }>) {
            const { files, unitType, unitId } = action.payload;
            state.courseFiles = [
                ...state.courseFiles.filter(f => !(f.courseUnitType === unitType && f.courseUnitId === unitId)),
                ...files
            ];
        },

        setProcessingLoading(state, action: PayloadAction<{ homeworkId: number; isLoading: boolean }>) {
            const { homeworkId, isLoading } = action.payload;
            state.processingFilesState[homeworkId] = { isLoading };
        },

        clearCourseFiles(state) {
            state.courseFiles = [];
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
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StatisticsCourseMatesModel } from '@/api';

interface SolutionState {
    studentSolutions: StatisticsCourseMatesModel[];
    isLoaded: boolean;
}

const initialState: SolutionState = {
    studentSolutions: [],
    isLoaded: false,
};

const solutionSlice = createSlice({
    name: "solution",
    initialState,
    reducers: {
        setStudentSolutions(state, action: PayloadAction<StatisticsCourseMatesModel[]>) {
            state.studentSolutions = action.payload;
            state.isLoaded = true;
        },
        
        clearStudentSolutions(state) {
            state.studentSolutions = [];
            state.isLoaded = false;
        },
    },
});

export const { setStudentSolutions, clearStudentSolutions } = solutionSlice.actions;
export default solutionSlice.reducer;
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {StatisticsCourseMatesModel} from '@/api';

interface SolutionState {
    studentSolutions: StatisticsCourseMatesModel[];
}

const initialState: SolutionState = {
    studentSolutions: [],
};

const solutionSlice = createSlice({
    name: "solution",
    initialState,
    reducers: {
        setStudentSolutions(state, action: PayloadAction<StatisticsCourseMatesModel[]>) {
            state.studentSolutions = action.payload;
        },
    },
});

export const {setStudentSolutions} = solutionSlice.actions;

export default solutionSlice.reducer;
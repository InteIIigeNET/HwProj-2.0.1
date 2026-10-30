import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {StatisticsCourseMatesModel} from '@/api';
import {loadCoursePage, refreshCourseSolutions} from '../courseThunks';
import {serializeDates, type StoredStudentSolutions} from '../courseModels';

interface SolutionState {
    requestId: string | null;
    error: string | null;
    studentSolutions: StoredStudentSolutions[];
}

const initialState: SolutionState = {
    requestId: null,
    error: null,
    studentSolutions: [],
};

const solutionSlice = createSlice({
    name: "solution",
    initialState,
    reducers: {
        setStudentSolutions: {
            prepare: (solutions: StatisticsCourseMatesModel[]) => ({payload: serializeDates(solutions)}),
            reducer(state, action: PayloadAction<StoredStudentSolutions[]>) {
                state.studentSolutions = action.payload;
            },
        },
    },
    extraReducers: builder => {
        builder.addCase(loadCoursePage.pending, (state, action) => {
            state.requestId = action.meta.requestId;
            state.error = null;
        });
        builder.addCase(loadCoursePage.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            if (action.payload.solutions) state.studentSolutions = action.payload.solutions;
            state.requestId = null;
            state.error = null;
        });
        builder.addCase(loadCoursePage.rejected, (state, action) => {
            if (state.requestId === action.meta.requestId) state.requestId = null;
        });
        builder.addCase(refreshCourseSolutions.pending, (state, action) => {
            state.requestId = action.meta.requestId;
            state.error = null;
        });
        builder.addCase(refreshCourseSolutions.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            state.studentSolutions = action.payload;
            state.requestId = null;
        });
        builder.addCase(refreshCourseSolutions.rejected, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            state.requestId = null;
            state.error = action.meta.aborted ? null : action.payload ?? 'Не удалось обновить решения студентов';
        });
    },
});

export const {setStudentSolutions} = solutionSlice.actions;

export default solutionSlice.reducer;
import {createSelector} from '@reduxjs/toolkit';
import type {RootState} from './store';
import {toHomeworkView, toStudentSolutionsView} from './courseModels';

export const selectHomeworks = createSelector(
    [(state: RootState) => state.homeworks.items],
    homeworks => homeworks.map(toHomeworkView),
);

export const selectDraftHomeworks = createSelector(
    [(state: RootState) => state.editing.draftHomeworks],
    homeworks => homeworks.map(toHomeworkView),
);

export const selectStudentSolutions = createSelector(
    [(state: RootState) => state.solutions.studentSolutions],
    students => students.map(toStudentSolutionsView),
);
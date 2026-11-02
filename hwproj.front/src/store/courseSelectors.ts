import {createSelector} from '@reduxjs/toolkit';
import type {HomeworkTaskViewModel, HomeworkViewModel} from '@/api';
import type {RootState} from './store';
import {toHomeworkView, toStudentSolutionsView, toTaskView} from './courseModels';

export const selectHomeworks = createSelector(
    [(state: RootState) => state.homeworks.items],
    homeworks => homeworks.map(toHomeworkView),
);

export const selectDraftHomeworks = createSelector(
    [(state: RootState) => state.editing.draftHomeworks],
    homeworks => homeworks.map(toHomeworkView),
);

export const selectHomeworkById = createSelector(
    [(state: RootState, homeworkId: number) => state.homeworks.items.find(homework => homework.id === homeworkId)],
    homework => homework ? toHomeworkView(homework) : undefined,
);

export const selectDraftHomeworkById = createSelector(
    [(state: RootState, homeworkId: number) => state.editing.draftHomeworks.find(homework => homework.id === homeworkId)],
    homework => homework ? toHomeworkView(homework) : undefined,
);

export const selectDraftTaskById = createSelector(
    [(state: RootState, homeworkId: number, taskId: number) => state.editing.draftHomeworks
        .find(homework => homework.id === homeworkId)?.tasks?.find(task => task.id === taskId)],
    task => task ? toTaskView(task) : undefined,
);

export const mergeHomeworkDraft = createSelector(
    [
        (committed: HomeworkViewModel | undefined) => committed,
        (_committed: HomeworkViewModel | undefined, draft: HomeworkViewModel) => draft,
        (_committed: HomeworkViewModel | undefined, _draft: HomeworkViewModel, isHomeworkEditing: boolean) => isHomeworkEditing,
    ],
    (committed, draft, isHomeworkEditing): HomeworkViewModel => {
        const tasks = new Map<number, HomeworkTaskViewModel>();
        for (const task of committed?.tasks ?? []) tasks.set(task.id!, task);
        for (const task of draft.tasks ?? []) tasks.set(task.id!, task);

        const homework = isHomeworkEditing || !committed ? {...committed, ...draft} : committed;
        return {...homework, tasks: Array.from(tasks.values())};
    },
);

export const selectMergedHomeworkById = createSelector(
    [
        selectHomeworkById,
        selectDraftHomeworkById,
        (state: RootState, homeworkId: number) => state.editing.homeworkEditingIds.includes(homeworkId),
    ],
    (committed, draft, isHomeworkEditing) => draft ? mergeHomeworkDraft(committed, draft, isHomeworkEditing) : committed,
);

export const selectMergedHomeworks = createSelector(
    [selectHomeworks, selectDraftHomeworks, (state: RootState) => state.editing.homeworkEditingIds],
    (committedHomeworks, draftHomeworks, homeworkEditingIds) => {
        const result = committedHomeworks.map(homework => {
            const draft = draftHomeworks.find(candidate => candidate.id === homework.id);
            return draft ? mergeHomeworkDraft(homework, draft, homeworkEditingIds.includes(homework.id!)) : homework;
        });

        return [...result, ...draftHomeworks.filter(homework => homework.id! < 0)];
    },
);

export const selectStudentSolutions = createSelector(
    [(state: RootState) => state.solutions.studentSolutions],
    students => students.map(toStudentSolutionsView),
);
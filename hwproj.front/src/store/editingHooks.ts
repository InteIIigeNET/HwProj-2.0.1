import { useCourseDispatch, useCourseState } from './hooks';
import {
    addDraftHomework,
    updateDraftHomework as updateDraftHomeworkAction,
    removeDraftHomework,
    addDraftTask,
    updateDraftTask as updateDraftTaskAction,
    removeDraftTask,
    decrementDraftId,
    setSelectedItem,
    SelectedItem,
} from './slices/courseEditingSlice';

import {
    updateOrInsertHomework,
    deleteHomework,
    updateTask,
    deleteTask,
} from './slices/homeworkSlice';

import { HomeworkViewModel, HomeworkTaskViewModel } from '@/api';
import { useCallback, useMemo } from 'react';

export const useMergedHomeworks = () => {
    const committedHomeworks = useCourseState(state => state.homeworks.items);
    const draftHomeworks = useCourseState(state => state.editing.draftHomeworks);

    return useMemo(() => {
        const newDrafts = draftHomeworks.filter(dh => dh.id! < 0);
        const result: HomeworkViewModel[] = [];

        const mergeTasks = (committed: HomeworkTaskViewModel[] = [], draft: HomeworkTaskViewModel[] = []) => {
            const byId = new Map<number, HomeworkTaskViewModel>();
            for (const task of committed) byId.set(task.id!, task);
            for (const task of draft) byId.set(task.id!, task);
            return Array.from(byId.values());
        };

        for (const committed of committedHomeworks) {
            const draft = draftHomeworks.find(dh => dh.id === committed.id);
            if (!draft) {
                result.push(committed);
                continue;
            }
            
            result.push({
                ...committed,
                ...draft,
                tasks: mergeTasks(committed.tasks, draft.tasks),
            });
        }

        result.push(...newDrafts);
        return result;
    }, [committedHomeworks, draftHomeworks]);
};

export const useEditingSelection = () => {
    const dispatch = useCourseDispatch();
    const selectedItem = useCourseState(state => state.editing.selectedItem);

    const select = useCallback((item: SelectedItem) => {
        dispatch(setSelectedItem(item));
    }, [dispatch]);

    return {selectedItem, select};
};

export const useHomeworkEditing = () => {
    const dispatch = useCourseDispatch();
    const draftIdCounter = useCourseState(state => state.editing.draftIdCounter);

    const addNewHomework = useCallback((courseId: number) => {
        const newId = draftIdCounter;
        const newHomework: HomeworkViewModel = {
            courseId,
            id: newId,
            title: 'Новое задание',
            description: '',
            publicationDate: undefined,
            publicationDateNotSet: false,
            hasDeadline: false,
            deadlineDate: undefined,
            deadlineDateNotSet: false,
            isDeadlineStrict: false,
            isGroupWork: false,
            tasks: [],
            tags: [],
        };
        dispatch(addDraftHomework(newHomework));
        dispatch(decrementDraftId());
        dispatch(setSelectedItem({ isHomework: true, id: newId }));
        return newId;
    }, [dispatch, draftIdCounter]);

    const startEditingHomework = useCallback((hw: HomeworkViewModel) => {
        const copy: HomeworkViewModel = {
            ...hw,
            tasks: hw.tasks ? [...hw.tasks] : [],
        };
        dispatch(addDraftHomework(copy));
        dispatch(setSelectedItem({ isHomework: true, id: hw.id }));
    }, [dispatch]);

    const updateDraftHomework = useCallback((hw: HomeworkViewModel) => {
        dispatch(updateDraftHomeworkAction(hw));
    }, [dispatch]);

    const cancelEditingHomework = useCallback((draftId: number) => {
        dispatch(removeDraftHomework(draftId));
    }, [dispatch]);

    const commitHomework = useCallback((draftId: number, savedHw: HomeworkViewModel) => {
        dispatch(updateOrInsertHomework(savedHw));
        dispatch(removeDraftHomework(draftId));
    }, [dispatch]);

    const commitHomeworkDeletion = useCallback((homeworkId: number) => {
        dispatch(deleteHomework(homeworkId));
        dispatch(removeDraftHomework(homeworkId));
    }, [dispatch]);

    return {
        addNewHomework,
        startEditingHomework,
        updateDraftHomework,
        cancelEditingHomework,
        commitHomework,
        commitHomeworkDeletion,
    };
};

export const useTaskEditing = () => {
    const dispatch = useCourseDispatch();
    const draftIdCounter = useCourseState(state => state.editing.draftIdCounter);
    const draftHomeworks = useCourseState(state => state.editing.draftHomeworks);

    const ensureHomeworkInDrafts = useCallback((homework: HomeworkViewModel) => {
        const existingDraft = draftHomeworks.find(dh => dh.id === homework.id);
        if (!existingDraft) {
            const copy: HomeworkViewModel = {
                ...homework,
                tasks: [],
            };
            dispatch(addDraftHomework(copy));
        }
    }, [draftHomeworks, dispatch]);

    const addNewTask = useCallback((homework: HomeworkViewModel, maxRating?: number, suggestedMaxRating?: number) => {
        ensureHomeworkInDrafts(homework);
        const newId = draftIdCounter;
        const newTask = {
            id: newId,
            homeworkId: homework.id,
            title: 'Новая задача',
            description: '',
            maxRating: maxRating ?? 10,
            suggestedMaxRating,
            isDeferred: homework.isDeferred || false,
            deadlineDateNotSet: true,
            deadlineDate: undefined,
            tags: homework.tags || [],
        } as HomeworkTaskViewModel;
        dispatch(addDraftTask(newTask));
        dispatch(decrementDraftId());
        dispatch(setSelectedItem({ isHomework: false, id: newId }));
        return newId;
    }, [dispatch, draftIdCounter, ensureHomeworkInDrafts]);

    const startEditingTask = useCallback((task: HomeworkTaskViewModel, homework: HomeworkViewModel) => {
        ensureHomeworkInDrafts(homework);
        const copy: HomeworkTaskViewModel = { ...task };
        dispatch(addDraftTask(copy));
        dispatch(setSelectedItem({ isHomework: false, id: task.id }));
    }, [dispatch, ensureHomeworkInDrafts]);

    const updateDraftTask = useCallback((task: HomeworkTaskViewModel) => {
        dispatch(updateDraftTaskAction(task));
    }, [dispatch]);

    const cancelEditingTask = useCallback((taskId: number, homeworkId: number) => {
        dispatch(removeDraftTask({ homeworkId, taskId }));
    }, [dispatch]);

    const commitTask = useCallback((draftId: number, homeworkId: number, savedTask: HomeworkTaskViewModel) => {
        dispatch(updateTask(savedTask));
        dispatch(removeDraftTask({ homeworkId, taskId: draftId }));
    }, [dispatch]);

    const commitTaskDeletion = useCallback((taskId: number, homeworkId: number) => {
        dispatch(deleteTask({ homeworkId, taskId }));
        dispatch(removeDraftTask({ homeworkId, taskId }));
    }, [dispatch]);

    return {
        addNewTask,
        startEditingTask,
        updateDraftTask,
        cancelEditingTask,
        commitTask,
        commitTaskDeletion,
    };
};

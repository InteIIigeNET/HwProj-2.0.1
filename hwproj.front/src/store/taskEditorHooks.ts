import { useCallback } from 'react';
import { useCourseDispatch, useCourseState } from './hooks';
import {
    addDraftHomework,
    addDraftTask,
    updateDraftTask as updateDraftTaskAction,
    removeDraftTask,
    removeDraftHomework,
    decrementDraftId,
    setSelectedItem,
} from './slices/courseEditingSlice';
import { updateTask, deleteTask } from './slices/homeworkSlice';
import {HomeworkViewModel, HomeworkTaskViewModel, CriterionViewModel, PostTaskViewModel } from '@/api';
import ApiSingleton from '@/api/ApiSingleton';

export const useDraftTask = (taskId: number, homeworkId: number) => {
    const draftHw = useCourseState(state =>
        state.editing.draftHomeworks.find(dh => dh.id === homeworkId));
    return draftHw?.tasks?.find(t => t.id === taskId);
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
        const draftHw = draftHomeworks.find(dh => dh.id === homeworkId);
        if (draftHw && (draftHw.tasks || []).filter(t => t.id !== taskId).length === 0) {
            dispatch(removeDraftHomework(homeworkId));
        }
    }, [dispatch, draftHomeworks]);

    const commitTask = useCallback((draftId: number, homeworkId: number, savedTask: HomeworkTaskViewModel) => {
        dispatch(updateTask(savedTask));
        dispatch(removeDraftTask({ homeworkId, taskId: draftId }));
        const draftHw = draftHomeworks.find(dh => dh.id === homeworkId);
        if (draftHw && (draftHw.tasks || []).filter(t => t.id !== draftId).length === 0) {
            dispatch(removeDraftHomework(homeworkId));
        }
    }, [dispatch, draftHomeworks]);

    const commitTaskDeletion = useCallback((taskId: number, homeworkId: number) => {
        dispatch(deleteTask({ homeworkId, taskId }));
        dispatch(removeDraftTask({ homeworkId, taskId }));
    }, [dispatch]);

    const addCriterion = useCallback((task: HomeworkTaskViewModel, criterion: CriterionViewModel) => {
        const next = [...(task.criteria || []), criterion];
        dispatch(updateDraftTaskAction({ ...task, criteria: next }));
    }, [dispatch]);

    const updateCriterion = useCallback((task: HomeworkTaskViewModel, index: number, patch: Partial<CriterionViewModel>) => {
        const criteria = task.criteria || [];
        const next = criteria.map((c, i) => (i === index ? { ...c, ...patch } : c));
        dispatch(updateDraftTaskAction({ ...task, criteria: next }));
    }, [dispatch]);

    const removeCriterion = useCallback((task: HomeworkTaskViewModel, index: number) => {
        const criteria = task.criteria || [];
        const next = criteria.filter((_, i) => i !== index);
        dispatch(updateDraftTaskAction({ ...task, criteria: next }));
    }, [dispatch]);

    const submitTaskEdit = useCallback(async (
        task: HomeworkTaskViewModel,
        homework: HomeworkViewModel,
        isNewTask: boolean,
        updatePayload: PostTaskViewModel
    ) => {
        const updatedTask = isNewTask
            ? await ApiSingleton.tasksApi.tasksAddTask(homework.id!, updatePayload)
            : await ApiSingleton.tasksApi.tasksUpdateTask(+task.id!, updatePayload);
        dispatch(updateTask(updatedTask.value!));
        dispatch(removeDraftTask({ homeworkId: task.homeworkId!, taskId: task.id! }));
        const draftHw = draftHomeworks.find(dh => dh.id === task.homeworkId);
        if (draftHw && (draftHw.tasks || []).filter(t => t.id !== task.id).length === 0) {
            dispatch(removeDraftHomework(task.homeworkId!));
        }
        dispatch(setSelectedItem({ isHomework: false, id: updatedTask.value!.id }));
        return updatedTask;
    }, [dispatch, draftHomeworks]);

    const deleteTaskEdit = useCallback(async (
        task: HomeworkTaskViewModel,
        homework: HomeworkViewModel,
        isNewTask: boolean
    ) => {
        if (!isNewTask) await ApiSingleton.tasksApi.tasksDeleteTask(task.id!);
        dispatch(deleteTask({ homeworkId: task.homeworkId!, taskId: task.id! }));
        dispatch(removeDraftTask({ homeworkId: task.homeworkId!, taskId: task.id! }));
        dispatch(setSelectedItem({ isHomework: true, id: homework.id }));
    }, [dispatch]);

    const cancelTaskEdit = useCallback((task: HomeworkTaskViewModel, homework: HomeworkViewModel, isNewTask: boolean) => {
        dispatch(removeDraftTask({ homeworkId: task.homeworkId!, taskId: task.id! }));
        const draftHw = draftHomeworks.find(dh => dh.id === task.homeworkId);
        if (draftHw && (draftHw.tasks || []).filter(t => t.id !== task.id).length === 0) {
            dispatch(removeDraftHomework(task.homeworkId!));
        }
        if (isNewTask) {
            dispatch(setSelectedItem({ isHomework: true, id: homework.id }));
        } else {
            dispatch(setSelectedItem({ isHomework: false, id: task.id }));
        }
    }, [dispatch, draftHomeworks]);

    const loadTaskForEditing = useCallback((taskId: number) => {
        return ApiSingleton.tasksApi.tasksGetForEditingTask(taskId);
    }, []);

    return {
        addNewTask,
        startEditingTask,
        loadTaskForEditing,
        updateDraftTask,
        cancelEditingTask,
        commitTask,
        commitTaskDeletion,
        addCriterion,
        updateCriterion,
        removeCriterion,
        submitTaskEdit,
        deleteTaskEdit,
        cancelTaskEdit,
    };
};
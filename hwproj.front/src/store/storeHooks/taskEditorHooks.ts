import {useCallback, useMemo} from 'react';
import {useCourseDispatch, useCourseState } from '../hooks';
import {
    addDraftHomework,
    addDraftTask,
    updateDraftTask as updateDraftTaskAction,
    removeDraftTask,
    removeDraftHomework,
    decrementDraftId,
    setSelectedItem,
} from '../slices/courseEditingSlice';
import {updateTask, deleteTask as deleteTaskAction } from '../slices/homeworkSlice';
import {HomeworkViewModel, HomeworkTaskViewModel, CriterionViewModel, PostTaskViewModel, ActionOptions } from '@/api';
import ApiSingleton from '@/api/ApiSingleton';
import {BonusTag, isBonusWork, isTestWork, TestTag} from "@/components/Common/HomeworkTags";
import {useMergedHomeworks} from "@/store/storeHooks/courseEditingHooks";

export const useDraftTask = (taskId: number, homeworkId: number) => {
    const draftHw = useCourseState(state =>
        state.editing.draftHomeworks.find(dh => dh.id === homeworkId));
    return draftHw?.tasks?.find(t => t.id === taskId);
};

const normalizeDraftDate = (value: unknown): Date | undefined => {
    if (value instanceof Date) return value.toISOString() as unknown as Date;
    return value as Date | undefined;
};

const normalizeTaskDraft = (task: HomeworkTaskViewModel): HomeworkTaskViewModel => ({
    ...task,
    publicationDate: normalizeDraftDate(task.publicationDate),
    deadlineDate: normalizeDraftDate(task.deadlineDate),
});

const getTaskEditorState = (
    task: HomeworkTaskViewModel & {
        hasErrors?: boolean;
        suggestedMaxRating?: number;
    },
    homework: HomeworkViewModel,
) => {
    const criteria = task.criteria || [];
    const autoMaxFromCriteria = criteria.length > 0;
    const maxRating = autoMaxFromCriteria
        ? criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0)
        : (task.maxRating ?? 0);
    const isBonusExplicit = (task.tags || []).includes(BonusTag) && !(homework.tags || []).includes(BonusTag);
    const publicationDate = task.publicationDate ?? homework.publicationDate;
    const taskHasErrors = task.hasErrors === true;
    const hasErrors = !task.title || maxRating <= 0 || maxRating > 100 || taskHasErrors;
    const isNewTask = task.id! < 0;
    const isNewHomework = homework.id! < 0;
    const homeworkPublicationDateIsSet = !homework.publicationDateNotSet;
    const taskPublicationDate = task.publicationDateNotSet
        ? undefined
        : (task.publicationDate ? new Date(task.publicationDate) : undefined);
    const taskDeadlineDate = task.deadlineDateNotSet
        ? undefined
        : (task.deadlineDate ? new Date(task.deadlineDate) : undefined);
    const isPublicationDateDisabled = task.isDeferred || !homework.isDeferred;
    const maxRatingLabel = criteria.length > 0
        ? "Критерии"
        : task.suggestedMaxRating === maxRating
            ? "Вычислено"
            : undefined;

    return {
        criteria,
        autoMaxFromCriteria,
        maxRating,
        isBonusExplicit,
        publicationDate,
        taskHasErrors,
        hasErrors,
        isNewTask,
        isNewHomework,
        homeworkPublicationDateIsSet,
        taskPublicationDate,
        taskDeadlineDate,
        isPublicationDateDisabled,
        maxRatingLabel,
    };
};

export const useTaskEditorState = (
    task: HomeworkTaskViewModel & {hasErrors?: boolean;suggestedMaxRating?: number;},
    homework: HomeworkViewModel,
) => useMemo(
    () => getTaskEditorState(task, homework),
    [task, homework],
);

export const useTaskEditing = () => {
    const dispatch = useCourseDispatch();
    const draftIdCounter = useCourseState(state => state.editing.draftIdCounter);
    const draftHomeworks = useCourseState(state => state.editing.draftHomeworks);
    const committedHomeworks = useCourseState(state => state.homeworks.items);
    const mergedHomeworks = useMergedHomeworks();

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

    const getSuggestedTaskRating = useCallback((homework: HomeworkViewModel) => {
        const tags = homework.tags || [];
        const isTest = tags.includes(TestTag);
        const isBonus = tags.includes(BonusTag);
        const counts = new Map<number, number>();

        for (const candidateHomework of mergedHomeworks) {
            const firstTask = candidateHomework.tasks?.[0];
            if (!firstTask || firstTask.id! <= 0) continue;

            const candidateIsTest = isTestWork(firstTask);
            const candidateIsBonus = isBonusWork(firstTask);
            const matchesKind =
                (isTest && candidateIsTest)
                || (isBonus && candidateIsBonus)
                || (!isTest && !isBonus && !candidateIsTest && !candidateIsBonus);

            if (!matchesKind) continue;

            const rating = firstTask.maxRating!;
            counts.set(rating, (counts.get(rating) ?? 0) + 1);
        }

        let suggestedRating: number | undefined = undefined;
        let bestCount = -1;
        for (const [rating, count] of counts.entries()) {
            if (count >= bestCount) {
                suggestedRating = rating;
                bestCount = count;
            }
        }

        return suggestedRating;
    }, [mergedHomeworks]);

    const createTaskDraft = useCallback((homework: HomeworkViewModel) => {
        ensureHomeworkInDrafts(homework);
        const newId = draftIdCounter;
        const suggestedMaxRating = getSuggestedTaskRating(homework);
        const newTask = {
            id: newId,
            homeworkId: homework.id,
            title: 'Новая задача',
            description: '',
            maxRating: suggestedMaxRating ?? 10,
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
    }, [dispatch, draftIdCounter, ensureHomeworkInDrafts, getSuggestedTaskRating]);

    const setTaskDraftFromLoaded = useCallback((task: HomeworkTaskViewModel, homework: HomeworkViewModel) => {
        ensureHomeworkInDrafts(homework);
        const copy: HomeworkTaskViewModel = normalizeTaskDraft({ ...task });
        dispatch(addDraftTask(copy));
        dispatch(setSelectedItem({ isHomework: false, id: task.id }));
    }, [dispatch, ensureHomeworkInDrafts]);

    const updateTaskDraftState = useCallback((task: HomeworkTaskViewModel) => {
        dispatch(updateDraftTaskAction(normalizeTaskDraft(task)));
    }, [dispatch]);

    const discardTaskDraftByIds = useCallback((taskId: number, homeworkId: number) => {
        dispatch(removeDraftTask({ homeworkId, taskId }));
        const draftHw = draftHomeworks.find(dh => dh.id === homeworkId);
        if (draftHw && (draftHw.tasks || []).filter(t => t.id !== taskId).length === 0) {
            dispatch(removeDraftHomework(homeworkId));
        }
    }, [dispatch, draftHomeworks]);

    const commitTaskSave = useCallback((draftId: number, homeworkId: number, savedTask: HomeworkTaskViewModel) => {
        dispatch(updateTask(savedTask));
        dispatch(removeDraftTask({ homeworkId, taskId: draftId }));
        const draftHw = draftHomeworks.find(dh => dh.id === homeworkId);
        if (draftHw && (draftHw.tasks || []).filter(t => t.id !== draftId).length === 0) {
            dispatch(removeDraftHomework(homeworkId));
        }
    }, [dispatch, draftHomeworks]);

    const commitTaskRemoval = useCallback((taskId: number, homeworkId: number) => {
        dispatch(deleteTaskAction({ homeworkId, taskId }));
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

    const persistTask = useCallback(async (
        task: HomeworkTaskViewModel,
        homework: HomeworkViewModel,
        isNewTask: boolean,
        updatePayload: PostTaskViewModel
    ) => {
        const updatedTask = isNewTask
            ? await ApiSingleton.tasksApi.tasksAddTask(homework.id!, updatePayload)
            : await ApiSingleton.tasksApi.tasksUpdateTask(+task.id!, updatePayload);
        commitTaskSave(task.id!, task.homeworkId!, updatedTask.value!);
        dispatch(setSelectedItem({ isHomework: false, id: updatedTask.value!.id }));
        return updatedTask;
    }, [commitTaskSave, dispatch]);

    const removeTask = useCallback(async (
        task: HomeworkTaskViewModel,
        homework: HomeworkViewModel,
        isNewTask: boolean
    ) => {
        if (!isNewTask) await ApiSingleton.tasksApi.tasksDeleteTask(task.id!);
        commitTaskRemoval(task.id!, task.homeworkId!);
        dispatch(setSelectedItem({ isHomework: true, id: homework.id }));
    }, [commitTaskRemoval, dispatch]);

    const discardTaskDraft = useCallback((task: HomeworkTaskViewModel, homework: HomeworkViewModel, isNewTask: boolean) => {
        discardTaskDraftByIds(task.id!, task.homeworkId!);
        if (isNewTask) {
            dispatch(setSelectedItem({ isHomework: true, id: homework.id }));
        } else {
            dispatch(setSelectedItem({ isHomework: false, id: task.id }));
        }
    }, [discardTaskDraftByIds, dispatch]);

    const loadTaskForEditing = useCallback((taskId: number) => {
        return ApiSingleton.tasksApi.tasksGetForEditingTask(taskId);
    }, []);

    const getCurrentHomework = useCallback((homeworkId: number) => {
        return draftHomeworks.find(dh => dh.id === homeworkId)
            ?? committedHomeworks.find(hw => hw.id === homeworkId);
    }, [draftHomeworks, committedHomeworks]);

    const getCurrentTask = useCallback((taskId: number, homeworkId: number) => {
        return draftHomeworks
            .find(dh => dh.id === homeworkId)
            ?.tasks?.find(t => t.id === taskId)
            ?? committedHomeworks
                .find(hw => hw.id === homeworkId)
                ?.tasks?.find(t => t.id === taskId);
    }, [draftHomeworks, committedHomeworks]);

    const buildTaskPayload = useCallback((task: HomeworkTaskViewModel, homework: HomeworkViewModel, editOptions: ActionOptions): PostTaskViewModel => {
        const {criteria, maxRating, isBonusExplicit} = getTaskEditorState(task, homework);

        return {
            title: task.title!,
            description: task.description || '',
            isBonusExplicit,
            maxRating,
            actionOptions: editOptions,
            criteria,
            hasDeadline: task.hasDeadline,
            isDeadlineStrict: task.isDeadlineStrict,
            publicationDate: task.publicationDateNotSet ? undefined : task.publicationDate,
            deadlineDate: task.deadlineDateNotSet ? undefined : task.deadlineDate,
        };
    }, []);

    const startTaskEdit = useCallback(async (taskId: number) => {
        const loaded = await loadTaskForEditing(taskId);
        setTaskDraftFromLoaded(loaded.task!, loaded.homework!);
    }, [loadTaskForEditing, setTaskDraftFromLoaded]);

    const saveTask = useCallback(async (
        taskId: number,
        homeworkId: number,
        editOptions: ActionOptions,
    ) => {
        const task = getCurrentTask(taskId, homeworkId);
        const homework = getCurrentHomework(homeworkId);
        if (!task || !homework) throw new Error(`Task ${taskId} or homework ${homeworkId} not found for saving`);
        const isNewTask = task.id! < 0;
        const body = buildTaskPayload(task, homework, editOptions);
        return persistTask(task, homework, isNewTask, body);
    }, [getCurrentTask, getCurrentHomework, buildTaskPayload, persistTask]);

    const deleteTask = useCallback(async (
        taskId: number,
        homeworkId: number,
    ) => {
        const task = getCurrentTask(taskId, homeworkId);
        const homework = getCurrentHomework(homeworkId);
        if (!task || !homework) throw new Error(`Task ${taskId} or homework ${homeworkId} not found for deletion`);
        const isNewTask = task.id! < 0;
        return removeTask(task, homework, isNewTask);
    }, [getCurrentTask, getCurrentHomework, removeTask]);

    return {
        createTask: createTaskDraft,
        startTaskEdit,
        patchTaskDraft: updateTaskDraftState,
        saveTask,
        deleteTask,
        cancelTaskEdit: (taskId: number, homeworkId: number) => {
            const task = getCurrentTask(taskId, homeworkId);
            const homework = getCurrentHomework(homeworkId);
            if (!task || !homework) throw new Error(`Task ${taskId} or homework ${homeworkId} not found for cancel`);
            discardTaskDraft(task, homework, task.id! < 0);
        },
        addCriterion,
        updateCriterion,
        removeCriterion,
    };
};
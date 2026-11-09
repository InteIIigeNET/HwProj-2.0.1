import {useCallback, useMemo} from 'react';
import Lodash from 'lodash';
import {useCourseDispatch, useCourseState, useCourseStore} from '../hooks';
import {
    ensureHomeworkDraft,
    addDraftTask,
    createNewDraftTask,
    updateDraftTask as updateDraftTaskAction,
    removeDraftTask,
    setSelectedItem,
} from '../slices/courseEditingSlice';
import {updateTask, deleteTask as deleteTaskAction } from '../slices/homeworkSlice';
import {HomeworkViewModel, HomeworkTaskViewModel, CriterionViewModel, PostTaskViewModel, ActionOptions} from '@/api';
import ApiSingleton from '@/api/ApiSingleton';
import {BonusTag, isBonusWork, isTestWork, TestTag} from "@/components/Common/HomeworkTags";
import {buildTaskPayload, isRegularCriterion} from '../taskPayload';
import {getTaskValidation} from '../courseEditingValidation'
import {
    selectDraftHomeworkById,
    selectDraftTaskById,
    selectHomeworkById,
    selectMergedHomeworkById,
} from '../courseSelectors';

export const useDraftTask = (taskId: number, homeworkId: number) =>
    useCourseState(state => selectDraftTaskById(state, homeworkId, taskId));

const getTaskEditorState = (
    task: HomeworkTaskViewModel & {
        hasErrors?: boolean;
        suggestedMaxRating?: number;
    },
    homework: HomeworkViewModel,
) => {
    const {criteria = [], maxRating, isBonusExplicit} = buildTaskPayload(task, homework);
    const autoMaxFromCriteria = criteria.some(isRegularCriterion);
    const publicationDate = task.publicationDate ?? homework.publicationDate;
    const {hasErrors, maxRatingError, datesHasErrors: taskHasErrors} = getTaskValidation(task, homework);
    const isNewTask = task.id! < 0;
    const isNewHomework = homework.id! < 0;
    const homeworkPublicationDateIsSet = !homework.publicationDateNotSet;
    const taskPublicationDate = task.publicationDateNotSet
        ? undefined
        : (task.publicationDate ? new Date(task.publicationDate) : undefined);
    const taskDeadlineDate = task.deadlineDateNotSet
        ? undefined
        : (task.deadlineDate ? new Date(task.deadlineDate) : undefined);
    const isPublicationDateDisabled = !isNewTask && !task.isDeferred;
    const maxRatingLabel = autoMaxFromCriteria
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
        maxRatingError,
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
    const store = useCourseStore();

    const ensureHomeworkInDrafts = useCallback((homework: HomeworkViewModel) => {
        const copy: HomeworkViewModel = {
            ...homework,
            tasks: [],
        };
        dispatch(ensureHomeworkDraft(copy));
    }, [dispatch]);

    const getSuggestedTaskRating = useCallback((homework: HomeworkViewModel, homeworks: HomeworkViewModel[]) => {
        const tags = homework.tags || [];
        const isTest = tags.includes(TestTag);
        const isBonus = tags.includes(BonusTag);

        return Lodash(homeworks
            .map(candidateHomework => candidateHomework.tasks?.[0])
            .filter(task => {
                if (task === undefined) return false;
                const candidateIsTest = isTestWork(task);
                const candidateIsBonus = isBonusWork(task);
                return task.id! > 0 && (
                    (isTest && candidateIsTest)
                    || (isBonus && candidateIsBonus)
                    || (!isTest && !isBonus && !candidateIsTest && !candidateIsBonus)
                );
            }))
            .map(task => task!.maxRating!)
            .groupBy(rating => [rating])
            .entries()
            .sortBy(entry => entry[1].length)
            .last()?.[1][0];
    }, []);

    const createTaskDraft = useCallback((
        homework: HomeworkViewModel,
        homeworks: HomeworkViewModel[],
        options?: {
            title?: string;
            description?: string;
            maxRating?: number;
            suggestedMaxRating?: number;
            selectAfterCreate?: boolean;
        },
    ) => {
        ensureHomeworkInDrafts(homework);
        const newId = store.getState().editing.draftIdCounter;
        const suggestedMaxRating = options?.suggestedMaxRating ?? getSuggestedTaskRating(homework, homeworks);
        dispatch(createNewDraftTask({
            homeworkId: homework.id!,
            title: options?.title ?? 'Новая задача',
            description: options?.description ?? '',
            maxRating: options?.maxRating ?? (suggestedMaxRating || 10),
            suggestedMaxRating,
            isDeferred: homework.isDeferred || false,
            deadlineDateNotSet: true,
            deadlineDate: undefined,
            tags: homework.tags || [],
            selectAfterCreate: options?.selectAfterCreate,
        }));
        return newId;
    }, [dispatch, ensureHomeworkInDrafts, getSuggestedTaskRating, store]);

    const setTaskDraftFromLoaded = useCallback((task: HomeworkTaskViewModel, homework: HomeworkViewModel) => {
        ensureHomeworkInDrafts(homework);
        const {maxRating} = buildTaskPayload(task, homework);
        dispatch(addDraftTask({...task, maxRating}));
        dispatch(setSelectedItem({ isHomework: false, id: task.id }));
    }, [dispatch, ensureHomeworkInDrafts]);

    const updateTaskDraftState = useCallback((task: HomeworkTaskViewModel) => {
        const homework = selectMergedHomeworkById(store.getState(), task.homeworkId!);
        if (!homework) return;
        const {maxRating} = buildTaskPayload(task, homework);
        dispatch(updateDraftTaskAction({...task, maxRating}));
    }, [dispatch, store]);

    const discardTaskDraftByIds = useCallback((taskId: number, homeworkId: number) => {
        dispatch(removeDraftTask({ homeworkId, taskId }));
    }, [dispatch]);

    const commitTaskSave = useCallback((draftId: number, homeworkId: number, savedTask: HomeworkTaskViewModel) => {
        dispatch(updateTask(savedTask));
        dispatch(removeDraftTask({ homeworkId, taskId: draftId }));
    }, [dispatch]);

    const commitTaskRemoval = useCallback((taskId: number, homeworkId: number) => {
        dispatch(deleteTaskAction({ homeworkId, taskId }));
        dispatch(removeDraftTask({ homeworkId, taskId }));
    }, [dispatch]);

    const addCriterion = useCallback((task: HomeworkTaskViewModel, criterion: CriterionViewModel) => {
        const next = [...(task.criteria || []), criterion];
        updateTaskDraftState({ ...task, criteria: next });
    }, [updateTaskDraftState]);

    const updateCriterion = useCallback((task: HomeworkTaskViewModel, index: number, patch: Partial<CriterionViewModel>) => {
        const criteria = task.criteria || [];
        const next = criteria.map((c, i) => (i === index ? { ...c, ...patch } : c));
        updateTaskDraftState({ ...task, criteria: next });
    }, [updateTaskDraftState]);

    const removeCriterion = useCallback((task: HomeworkTaskViewModel, index: number) => {
        const criteria = task.criteria || [];
        const next = criteria.filter((_, i) => i !== index);
        updateTaskDraftState({ ...task, criteria: next });
    }, [updateTaskDraftState]);

    const persistTask = useCallback(async (
        task: HomeworkTaskViewModel,
        homework: HomeworkViewModel,
        isNewTask: boolean,
        updatePayload: PostTaskViewModel
    ) => {
        const {courseId, scopeId} = store.getState().course;
        const updatedTask = isNewTask
            ? await ApiSingleton.tasksApi.tasksAddTask(homework.id!, updatePayload)
            : await ApiSingleton.tasksApi.tasksUpdateTask(+task.id!, updatePayload);
        const current = store.getState().course;
        if (
            courseId == null || scopeId == null
            || current.courseId !== courseId || current.scopeId !== scopeId
        ) return updatedTask;
        commitTaskSave(task.id!, task.homeworkId!, updatedTask.value!);
        dispatch(setSelectedItem({ isHomework: false, id: updatedTask.value!.id }));
        return updatedTask;
    }, [commitTaskSave, dispatch, store]);

    const removeTask = useCallback(async (
        task: HomeworkTaskViewModel,
        homework: HomeworkViewModel,
        isNewTask: boolean
    ) => {
        const {courseId, scopeId} = store.getState().course;
        if (!isNewTask) await ApiSingleton.tasksApi.tasksDeleteTask(task.id!);
        const current = store.getState().course;
        if (
            courseId == null || scopeId == null
            || current.courseId !== courseId || current.scopeId !== scopeId
        ) return;
        commitTaskRemoval(task.id!, task.homeworkId!);
        dispatch(setSelectedItem({ isHomework: true, id: homework.id }));
    }, [commitTaskRemoval, dispatch, store]);

    const discardTaskDraft = useCallback((task: HomeworkTaskViewModel, homework: HomeworkViewModel, isNewTask: boolean) => {
        const draftHomework = selectDraftHomeworkById(store.getState(), task.homeworkId!);
        const remainingTasks = (draftHomework?.tasks || []).filter(t => t.id !== task.id);
        discardTaskDraftByIds(task.id!, task.homeworkId!);
        if (isNewTask) {
            if (homework.id! < 0 && remainingTasks.length > 0) {
                dispatch(setSelectedItem({ isHomework: false, id: remainingTasks[0].id }));
            } else {
                dispatch(setSelectedItem({ isHomework: true, id: homework.id }));
            }
        } else {
            dispatch(setSelectedItem({ isHomework: false, id: task.id }));
        }
    }, [discardTaskDraftByIds, dispatch, store]);

    const loadTaskForEditing = useCallback((taskId: number) => {
        return ApiSingleton.tasksApi.tasksGetForEditingTask(taskId);
    }, []);

    const getCurrentHomework = useCallback((homeworkId: number) => {
        return selectMergedHomeworkById(store.getState(), homeworkId);
    }, [store]);

    const getCurrentTask = useCallback((taskId: number, homeworkId: number) => {
        const state = store.getState();
        return selectDraftTaskById(state, homeworkId, taskId)
            ?? selectHomeworkById(state, homeworkId)?.tasks?.find(task => task.id === taskId);
    }, [store]);

    const startTaskEdit = useCallback(async (taskId: number) => {
        const {courseId, scopeId} = store.getState().course;
        const loaded = await loadTaskForEditing(taskId);
        const current = store.getState().course;
        if (
            courseId == null || scopeId == null
            || current.courseId !== courseId || current.scopeId !== scopeId
        ) return;
        setTaskDraftFromLoaded(loaded.task!, loaded.homework!);
    }, [loadTaskForEditing, setTaskDraftFromLoaded, store]);

    const saveTask = useCallback(async (
        taskId: number,
        homeworkId: number,
        editOptions: ActionOptions,
    ) => {
        const task = getCurrentTask(taskId, homeworkId);
        const homework = getCurrentHomework(homeworkId);
        if (!task || !homework) throw new Error(`Task ${taskId} or homework ${homeworkId} not found for saving`);
        if (getTaskValidation(task, homework).hasErrors) throw new Error('Task contains invalid fields');
        const isNewTask = task.id! < 0;
        const body = buildTaskPayload(task, homework, editOptions);
        return persistTask(task, homework, isNewTask, body);
    }, [getCurrentTask, getCurrentHomework, persistTask]);

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
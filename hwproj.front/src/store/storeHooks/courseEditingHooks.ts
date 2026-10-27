import {useCallback, useEffect, useMemo} from 'react';
import {useCourseDispatch, useCourseState} from '../hooks';
import {setSelectedItem, setSelectionRequest, SelectedItem} from '../slices/courseEditingSlice';
import {HomeworkViewModel} from '@/api';
import {TestTag} from "@/components/Common/HomeworkTags";
import {selectMergedHomeworks} from '../courseSelectors';

export const useMergedHomeworks = () => useCourseState(selectMergedHomeworks);

export const useEditingSelection = () => {
    const dispatch = useCourseDispatch();
    const selectedItem = useCourseState(state => state.editing.selectedItem);

    const select = useCallback((item: SelectedItem) => {
        dispatch(setSelectedItem(item));
    }, [dispatch]);

    return { selectedItem, select };
};

export const useEditingStatus = () => {
    const draftHomeworks = useCourseState(state => state.editing.draftHomeworks);

    const homeworkEditingIds = useMemo(
        () => new Set(draftHomeworks.map(homework => homework.id!)),
        [draftHomeworks]
    );

    const taskEditingIds = useMemo(
        () => new Set(
            draftHomeworks
                .flatMap(homework => homework.tasks ?? [])
                .map(task => task.id!)
        ),
        [draftHomeworks]
    );

    const isHomeworkEditing = useCallback((homeworkId: number) => {
        return homeworkEditingIds.has(homeworkId);
    }, [homeworkEditingIds]);

    const isTaskEditing = useCallback((taskId: number) => {
        return taskEditingIds.has(taskId);
    }, [taskEditingIds]);

    return {
        isHomeworkEditing,
        isTaskEditing,
    };
};

export const useSelectedCourseItemData = (homeworks: HomeworkViewModel[]) => {
    const selectedItem = useCourseState(state => state.editing.selectedItem);

    return useMemo(() => {
        const {id, isHomework} = selectedItem;

        const selectedHomework = isHomework
            ? homeworks.find(homework => homework.id === id)
            : homeworks.find(homework => homework.tasks?.some(task => task.id === id));

        const selectedItemData = isHomework
            ? selectedHomework
            : selectedHomework?.tasks?.find(task => task.id === id);

        return {
            selectedItem,
            selectedHomework,
            selectedItemData,
        };
    }, [homeworks, selectedItem]);
};

export const useVisibleCourseHomeworks = (
    mergedHomeworks: HomeworkViewModel[],
    hideDeferred: boolean,
    showOnlyGroupedTest: string | undefined
) => {
    return useMemo(
        () => mergedHomeworks.slice().reverse().filter(homework => {
            if (hideDeferred) return !homework.isDeferred;
            if (showOnlyGroupedTest !== undefined) {
                return homework.tags!.includes(TestTag) && homework.tags!.includes(showOnlyGroupedTest);
            }
            return true;
        }),
        [mergedHomeworks, hideDeferred, showOnlyGroupedTest]
    );
};

export const useEnsureSelectedHomework = (
    homeworks: HomeworkViewModel[],
    selectedHomeworkId: number | undefined,
    selectedTaskId: number | undefined,
    resetKey: unknown
) => {
    const {selectedItem, select} = useEditingSelection();
    const dispatch = useCourseDispatch();
    const selectionRequest = useCourseState(state => state.editing.selectionRequest);

    useEffect(() => {
        const requestChanged = !selectionRequest || !Object.is(selectionRequest.homeworkId, selectedHomeworkId)
            || !Object.is(selectionRequest.taskId, selectedTaskId);
        if (requestChanged || !selectionRequest?.applied) {
            const requestedItem = selectedHomeworkId != null && homeworks.some(homework => homework.id === selectedHomeworkId)
                ? {isHomework: true, id: selectedHomeworkId}
                : selectedTaskId != null && homeworks.some(homework => homework.tasks?.some(task => task.id === selectedTaskId))
                    ? {isHomework: false, id: selectedTaskId}
                    : undefined;
            const applied = !!requestedItem || (selectedHomeworkId == null && selectedTaskId == null);
            if (requestChanged || applied !== selectionRequest?.applied) {
                dispatch(setSelectionRequest({homeworkId: selectedHomeworkId, taskId: selectedTaskId, applied}));
            }
            if (requestedItem) {
                if (selectedItem.id !== requestedItem.id || selectedItem.isHomework !== requestedItem.isHomework) {
                    select(requestedItem);
                }
                return;
            }
        }

        const currentSelectionExists = selectedItem.isHomework
            ? homeworks.some(homework => homework.id === selectedItem.id)
            : homeworks.some(homework => homework.tasks?.some(task => task.id === selectedItem.id));

        if (currentSelectionExists) {
            return;
        }

        const defaultHomework = homeworks[0];
        if (selectedItem.id !== defaultHomework?.id || !selectedItem.isHomework) {
            select({isHomework: true, id: defaultHomework?.id});
        }
    }, [homeworks, resetKey, select, selectedHomeworkId, selectedTaskId, selectedItem.id, selectedItem.isHomework, dispatch, selectionRequest]);
};
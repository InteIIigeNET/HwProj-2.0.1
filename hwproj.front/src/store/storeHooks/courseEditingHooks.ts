import {useCallback, useEffect, useMemo} from 'react';
import {useCourseDispatch, useCourseState} from '../hooks';
import {setSelectedItem, SelectedItem} from '../slices/courseEditingSlice';
import {HomeworkViewModel, HomeworkTaskViewModel} from '@/api';
import {TestTag} from "@/components/Common/HomeworkTags";

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
    resetKey: unknown
) => {
    const {selectedItem, select} = useEditingSelection();

    useEffect(() => {
        const currentSelectionExists = selectedItem.isHomework
            ? homeworks.some(homework => homework.id === selectedItem.id)
            : homeworks.some(homework => homework.tasks?.some(task => task.id === selectedItem.id));

        if (currentSelectionExists) {
            return;
        }

        const defaultHomeworkIndex = Math.max(
            selectedHomeworkId ? homeworks.findIndex(homework => homework.id === selectedHomeworkId) : 0,
            0
        );
        const defaultHomework = homeworks[defaultHomeworkIndex];
        select({isHomework: true, id: defaultHomework?.id});
    }, [homeworks, resetKey, select, selectedHomeworkId, selectedItem.id, selectedItem.isHomework]);
};
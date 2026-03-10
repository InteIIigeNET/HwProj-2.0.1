import { useCallback, useMemo } from 'react';
import { useCourseDispatch, useCourseState } from './hooks';
import { setSelectedItem, SelectedItem } from './slices/courseEditingSlice';
import { HomeworkViewModel, HomeworkTaskViewModel} from '@/api';

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
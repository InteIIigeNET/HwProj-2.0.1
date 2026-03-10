import { useCallback } from 'react';
import { useCourseDispatch, useCourseState } from './hooks';
import {
    addDraftHomework,
    updateDraftHomework as updateDraftHomeworkAction,
    removeDraftHomework,
    decrementDraftId,
    setSelectedItem,
} from './slices/courseEditingSlice';
import { updateOrInsertHomework, deleteHomework } from './slices/homeworkSlice';
import { HomeworkViewModel, CreateHomeworkViewModel } from '@/api';
import ApiSingleton from '@/api/ApiSingleton';

export const useDraftHomework = (homeworkId: number) =>
    useCourseState(state => state.editing.draftHomeworks.find(dh => dh.id === homeworkId));

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
            tasks: [],
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

    const cancelHomeworkEdit = useCallback((homeworkId: number, isNewHomework: boolean) => {
        if (isNewHomework) {
            dispatch(removeDraftHomework(homeworkId));
            dispatch(setSelectedItem({ isHomework: true, id: undefined }));
        } else {
            dispatch(removeDraftHomework(homeworkId));
            dispatch(setSelectedItem({ isHomework: true, id: homeworkId }));
        }
    }, [dispatch]);

    const loadHomeworkForEditing = useCallback((homeworkId: number) => {
        return ApiSingleton.homeworksApi.homeworksGetForEditingHomework(homeworkId);
    }, []);

    const submitHomeworkApi = useCallback((
        courseId: number,
        homeworkId: number,
        isNewHomework: boolean,
        body: CreateHomeworkViewModel
    ) => {
        return isNewHomework
            ? ApiSingleton.homeworksApi.homeworksAddHomework(courseId, body)
            : ApiSingleton.homeworksApi.homeworksUpdateHomework(homeworkId, body);
    }, []);

    const deleteHomeworkApi = useCallback((homeworkId: number, isNewHomework: boolean) => {
        if (isNewHomework) return Promise.resolve();
        return ApiSingleton.homeworksApi.homeworksDeleteHomework(homeworkId);
    }, []);

    return {
        addNewHomework,
        startEditingHomework,
        updateDraftHomework,
        cancelEditingHomework,
        commitHomework,
        commitHomeworkDeletion,
        cancelHomeworkEdit,
        loadHomeworkForEditing,
        submitHomeworkApi,
        deleteHomeworkApi,
    };
};

export const getHomeworkDeleteMessage = (homeworkName: string, filesInfo: { name?: string }[]): string => {
    let message = `Вы точно хотите удалить задание "${homeworkName}"?`;
    if (filesInfo.length > 0) {
        message += ` Будет также удален файл ${filesInfo[0].name ?? ''}`;
        if (filesInfo.length > 1) {
            message += ` и другие прикрепленные файлы`;
        }
    }
    return message;
};
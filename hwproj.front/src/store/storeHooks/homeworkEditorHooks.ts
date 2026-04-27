import {useCallback, useMemo} from 'react';
import {useCourseDispatch, useCourseState} from '../hooks';
import {
    addDraftHomework,
    updateDraftHomework as updateDraftHomeworkAction,
    removeDraftHomework,
    decrementDraftId,
    setSelectedItem,
} from '../slices/courseEditingSlice';
import {updateOrInsertHomework, deleteHomework} from '../slices/homeworkSlice';
import {HomeworkViewModel, CreateHomeworkViewModel, ActionOptions, PostTaskViewModel} from '@/api';
import ApiSingleton from '@/api/ApiSingleton';
import {BonusTag, isBonusWork, isTestWork, TestTag} from "@/components/Common/HomeworkTags";
import Lodash from "lodash";
import {IFileInfo} from "@/components/Files/IFileInfo";
import {CourseUnitType} from "@/components/Files/CourseUnitType";
import ProcessFilesUtils from "@/components/Utils/ProcessFilesUtils";

type HomeworkFileOptions = {
    initialFilesInfo: IFileInfo[];
    selectedFilesInfo: IFileInfo[];
    onStartProcessing: (
        homeworkId: number,
        courseUnitType: CourseUnitType,
        previouslyExistingFilesCount: number,
        waitingNewFilesCount: number,
        deletingFilesIds: number[]
    ) => void;
    onDone?: () => void;
};

type HomeworkDeleteFileOptions = {
    initialFilesInfo: IFileInfo[];
};

export const useDraftHomework = (homeworkId: number) =>
    useCourseState(state => state.editing.draftHomeworks.find(dh => dh.id === homeworkId));

const normalizeDraftDate = (value: unknown): Date | undefined => {
    if (value instanceof Date) return value.toISOString() as unknown as Date;
    return value as Date | undefined;
};

const normalizeHomeworkDraft = (homework: HomeworkViewModel): HomeworkViewModel => ({
    ...homework,
    publicationDate: normalizeDraftDate(homework.publicationDate),
    deadlineDate: normalizeDraftDate(homework.deadlineDate),
    tasks: homework.tasks?.map(task => ({
        ...task,
        publicationDate: normalizeDraftDate(task.publicationDate),
        deadlineDate: normalizeDraftDate(task.deadlineDate),
    })) ?? [],
});

export const useHomeworkEditorState = (homework: HomeworkViewModel) => {
    const committedHomeworks = useCourseState(state => state.homeworks.items);
    type HomeworkTaskDraft = PostTaskViewModel & { id?: number; hasErrors?: boolean; publicationDate?: Date };
    const isNewHomework = homework.id! < 0;
    const publicationDate = homework.publicationDateNotSet || !homework.publicationDate
        ? undefined
        : new Date(homework.publicationDate);
    const deadlineDate = homework.deadlineDateNotSet || !homework.deadlineDate
        ? undefined
        : new Date(homework.deadlineDate);
    const isPublished = !homework.isDeferred;
    const changedTaskPublicationDates = (homework.tasks || [])
        .filter(task => task.publicationDate != null)
        .map(task => new Date(task.publicationDate!));
    const taskHasErrors = (homework.tasks || []).some(task => (task as HomeworkTaskDraft).hasErrors === true);
    const hasErrors = !homework.title || !!(homework as HomeworkViewModel & { hasErrors?: boolean }).hasErrors;

    const deadlineSuggestion = useMemo(() => {
        if (!isNewHomework || !publicationDate) return undefined;

        const isTest = (homework.tags || []).includes(TestTag);
        const isBonus = (homework.tags || []).includes(BonusTag);
        type DateCandidate = { deadlineDate: Date; daysDiff: number };

        const mapped: DateCandidate[] = committedHomeworks
            .filter(candidate => {
                const candidateIsTest = isTestWork(candidate);
                const candidateIsBonus = isBonusWork(candidate);
                return candidate.id! > 0
                    && candidate.hasDeadline
                    && (
                        (isTest && candidateIsTest)
                        || (isBonus && candidateIsBonus)
                        || (!isTest && !isBonus && !candidateIsTest && !candidateIsBonus)
                    );
            })
            .map(candidate => ({
                deadlineDate: new Date(candidate.deadlineDate!),
                daysDiff: Math.floor(
                    (new Date(candidate.deadlineDate!).getTime() - new Date(candidate.publicationDate!).getTime()) / (1000 * 3600 * 24)
                )
            }));

        const dateCandidate = Lodash(mapped)
            .groupBy(candidate => [candidate.daysDiff, candidate.deadlineDate.getHours(), candidate.deadlineDate.getMinutes()])
            .entries()
            .sortBy((entry: [string, DateCandidate[]]) => entry[1].length)
            .last()?.[1][0];

        if (!dateCandidate) return undefined;

        const suggestedDeadline = new Date(publicationDate);
        suggestedDeadline.setDate(suggestedDeadline.getDate() + dateCandidate.daysDiff);
        suggestedDeadline.setHours(dateCandidate.deadlineDate.getHours(), dateCandidate.deadlineDate.getMinutes(), 0, 0);
        return suggestedDeadline;
    }, [committedHomeworks, homework.tags, isNewHomework, publicationDate]);

    const tagSuggestion = useMemo(() => {
        const title = (homework.title || '').toLowerCase();
        const tags = homework.tags || [];
        if (tags.includes(TestTag)) return undefined;
        return (title.includes("контрольн") || title.includes("проверочн") || title.includes("переписывание") || title.includes("тест"))
            ? TestTag
            : undefined;
    }, [homework.title, homework.tags]);

    return {
        isNewHomework,
        publicationDate,
        deadlineDate,
        isPublished,
        changedTaskPublicationDates,
        taskHasErrors,
        hasErrors,
        deadlineSuggestion,
        tagSuggestion,
    };
};

export const useHomeworkEditing = () => {
    const dispatch = useCourseDispatch();
    const draftIdCounter = useCourseState(state => state.editing.draftIdCounter);
    const draftHomeworks = useCourseState(state => state.editing.draftHomeworks);
    const committedHomeworks = useCourseState(state => state.homeworks.items);

    const createHomeworkDraft = useCallback((courseId: number) => {
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

    const setHomeworkDraftFromLoaded = useCallback((hw: HomeworkViewModel) => {
        const copy: HomeworkViewModel = normalizeHomeworkDraft({
            ...hw,
            tasks: [],
        });
        dispatch(addDraftHomework(copy));
        dispatch(setSelectedItem({ isHomework: true, id: hw.id }));
    }, [dispatch]);

    const updateHomeworkDraftState = useCallback((hw: HomeworkViewModel) => {
        dispatch(updateDraftHomeworkAction(normalizeHomeworkDraft(hw)));
    }, [dispatch]);

    const commitHomeworkSave = useCallback((draftId: number, savedHomework: HomeworkViewModel) => {
        dispatch(updateOrInsertHomework(savedHomework));
        dispatch(removeDraftHomework(draftId));
    }, [dispatch]);

    const commitHomeworkRemoval = useCallback((homeworkId: number) => {
        dispatch(deleteHomework(homeworkId));
        dispatch(removeDraftHomework(homeworkId));
    }, [dispatch]);

    const discardHomeworkDraft = useCallback((homeworkId: number, isNewHomework: boolean) => {
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

    const getCurrentHomework = useCallback((homeworkId: number) => {
        return draftHomeworks.find(dh => dh.id === homeworkId)
            ?? committedHomeworks.find(hw => hw.id === homeworkId);
    }, [draftHomeworks, committedHomeworks]);

    const buildHomeworkPayload = useCallback((homework: HomeworkViewModel, editOptions: ActionOptions): CreateHomeworkViewModel => ({
        title: homework.title!,
        description: homework.description,
        tags: homework.tags || [],
        groupId: homework.groupId,
        hasDeadline: homework.hasDeadline,
        deadlineDate: homework.deadlineDateNotSet || !homework.deadlineDate ? undefined : new Date(homework.deadlineDate),
        isDeadlineStrict: homework.isDeadlineStrict,
        publicationDate: homework.publicationDateNotSet || !homework.publicationDate ? undefined : new Date(homework.publicationDate),
        actionOptions: editOptions,
        tasks: homework.id! < 0 ? (homework.tasks || []).map(t => ({
            title: t.title!,
            description: t.description,
            hasDeadline: t.hasDeadline,
            deadlineDate: t.deadlineDate,
            isDeadlineStrict: t.isDeadlineStrict,
            publicationDate: t.publicationDate,
            maxRating: t.maxRating!,
            criteria: t.criteria || [],
        } as PostTaskViewModel)) : [],
    }), []);

    const processHomeworkFiles = useCallback(async (
        courseId: number,
        courseUnitId: number,
        initialFilesInfo: IFileInfo[],
        selectedFilesInfo: IFileInfo[],
        onStartProcessing: (
            courseUnitId: number,
            courseUnitType: CourseUnitType,
            previouslyExistingFilesCount: number,
            waitingNewFilesCount: number,
            deletingFilesIds: number[]
        ) => void,
        onComplete?: () => void,
    ) => {
        const deletingFileIds = initialFilesInfo
            .filter(initialFile => initialFile.id && !selectedFilesInfo.some(selectedFile => selectedFile.id === initialFile.id))
            .map(fileInfo => fileInfo.id!);
        const newFiles = selectedFilesInfo
            .filter(selectedFile => selectedFile.file && selectedFile.id == undefined)
            .map(fileInfo => fileInfo.file!);

        if (deletingFileIds.length + newFiles.length > 0) {
            await ProcessFilesUtils.processFilesWithErrorsHadling({
                courseId,
                courseUnitType: CourseUnitType.Homework,
                courseUnitId,
                deletingFileIds,
                newFiles,
            });
        }

        onComplete?.();

        if (deletingFileIds.length + newFiles.length > 0) {
            onStartProcessing(
                courseUnitId,
                CourseUnitType.Homework,
                initialFilesInfo.length,
                newFiles.length,
                deletingFileIds,
            );
        }
    }, []);

    const startHomeworkEdit = useCallback(async (homeworkId: number) => {
        const loaded = await loadHomeworkForEditing(homeworkId);
        setHomeworkDraftFromLoaded(loaded);
    }, [loadHomeworkForEditing, setHomeworkDraftFromLoaded]);

    const saveHomework = useCallback(async (
        homeworkId: number,
        editOptions: ActionOptions,
        fileOptions?: HomeworkFileOptions,
    ) => {
        const homework = getCurrentHomework(homeworkId);
        if (!homework) throw new Error(`Homework ${homeworkId} not found for saving`);
        const courseId = homework.courseId!;
        const isNewHomework = homework.id! < 0;
        const body = buildHomeworkPayload(homework, editOptions);
        const updatedHomework = await submitHomeworkApi(courseId, homeworkId, isNewHomework, body);
        const savedHomework = updatedHomework.value!;
        const finalize = () => {
            commitHomeworkSave(homeworkId, savedHomework);
            dispatch(setSelectedItem({isHomework: true, id: savedHomework.id}));
        };

        if (fileOptions) {
            await processHomeworkFiles(
                savedHomework.courseId!,
                savedHomework.id!,
                fileOptions.initialFilesInfo,
                fileOptions.selectedFilesInfo,
                fileOptions.onStartProcessing,
                () => {
                    finalize();
                    fileOptions.onDone?.();
                },
            );
        } else {
            finalize();
        }
        return savedHomework;
    }, [getCurrentHomework, buildHomeworkPayload, submitHomeworkApi, commitHomeworkSave, dispatch, processHomeworkFiles]);

    const deleteHomeworkWithFiles = useCallback(async (
        homeworkId: number,
        fileOptions?: HomeworkDeleteFileOptions,
    ) => {
        const homework = getCurrentHomework(homeworkId);
        if (!homework) throw new Error(`Homework ${homeworkId} not found for deletion`);
        const isNewHomework = homework.id! < 0;
        await deleteHomeworkApi(homeworkId, isNewHomework);
        const finalize = () => {
            commitHomeworkRemoval(homeworkId);
            dispatch(setSelectedItem({isHomework: true, id: undefined}));
        };

        if (fileOptions && fileOptions.initialFilesInfo.length > 0) {
            await ProcessFilesUtils.processFilesWithErrorsHadling({
                courseId: homework.courseId!,
                courseUnitType: CourseUnitType.Homework,
                courseUnitId: homeworkId,
                deletingFileIds: fileOptions.initialFilesInfo.filter(fileInfo => fileInfo.id).map(fileInfo => fileInfo.id!),
                newFiles: []
            });
            finalize();
        } else {
            finalize();
        }
    }, [getCurrentHomework, deleteHomeworkApi, commitHomeworkRemoval, dispatch]);

    return {
        createHomework: createHomeworkDraft,
        startHomeworkEdit,
        patchHomeworkDraft: updateHomeworkDraftState,
        saveHomework,
        deleteHomework: deleteHomeworkWithFiles,
        cancelHomeworkEdit: (homeworkId: number) => discardHomeworkDraft(homeworkId, homeworkId < 0),
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
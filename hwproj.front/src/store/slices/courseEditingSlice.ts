import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {HomeworkTaskViewModel, HomeworkViewModel} from "@/api";
import {serializeDates, type Serialized, type StoredHomework, type StoredTask} from '../courseModels';

export interface SelectedItem {
    isHomework: boolean;
    id: number | undefined;
}

interface SelectionRequest {
    homeworkId: number | undefined;
    taskId: number | undefined;
    applied: boolean;
}

interface CourseEditingState {
    draftHomeworks: StoredHomework[];
    homeworkEditingIds: number[];
    draftIdCounter: number;
    selectedItem: SelectedItem;
    selectionRequest: SelectionRequest | null;
}

interface NewTaskDraft {
    homeworkId: number;
    title: string;
    description: string;
    maxRating: number;
    suggestedMaxRating?: number;
    isDeferred: boolean;
    deadlineDateNotSet: boolean;
    deadlineDate?: Date;
    tags: string[];
    selectAfterCreate?: boolean;
}

const initialState: CourseEditingState = {
    draftHomeworks: [],
    homeworkEditingIds: [],
    draftIdCounter: -1,
    selectedItem: {isHomework: true, id: undefined,},
    selectionRequest: null,
};

const courseEditingSlice = createSlice({
    name: 'editing',
    initialState,
    reducers: {
        createNewHomeworkDraft: (state, action: PayloadAction<{courseId: number; publicationDate: string}>) => {
            const {courseId, publicationDate} = action.payload;
            const newId = state.draftIdCounter;
            state.draftHomeworks.push({
                courseId,
                id: newId,
                title: 'Новое задание',
                description: '',
                publicationDate,
                publicationDateNotSet: false,
                hasDeadline: false,
                deadlineDate: undefined,
                deadlineDateNotSet: false,
                isDeadlineStrict: false,
                isGroupWork: false,
                tasks: [],
                tags: [],
            });
            state.homeworkEditingIds.push(newId);
            state.draftIdCounter -= 1;
            state.selectedItem = {isHomework: true, id: newId};
        },

        putHomeworkDraft: {
            prepare: (homework: HomeworkViewModel) => ({payload: serializeDates(homework)}),
            reducer: (state, action: PayloadAction<StoredHomework>) => {
                const idx = state.draftHomeworks.findIndex(dh => dh.id === action.payload.id);
                if (idx === -1) {
                    state.draftHomeworks.push(action.payload);
                } else {
                    const existingTasks = state.draftHomeworks[idx].tasks;
                    state.draftHomeworks[idx] = {...action.payload, tasks: existingTasks};
                }
                if (!state.homeworkEditingIds.includes(action.payload.id!)) {
                    state.homeworkEditingIds.push(action.payload.id!);
                }
            },
        },

        ensureHomeworkDraft: {
            prepare: (homework: HomeworkViewModel) => ({payload: serializeDates(homework)}),
            reducer: (state, action: PayloadAction<StoredHomework>) => {
                if (!state.draftHomeworks.some(dh => dh.id === action.payload.id)) {
                    state.draftHomeworks.push(action.payload);
                }
            },
        },

        updateDraftHomework: {
            prepare: (homework: HomeworkViewModel) => ({payload: serializeDates(homework)}),
            reducer: (state, action: PayloadAction<StoredHomework>) => {
                const id = state.draftHomeworks.findIndex(dh => dh.id === action.payload.id);
                if (id !== -1) {
                    const existingTasks = state.draftHomeworks[id].tasks;
                    state.draftHomeworks[id] = {...action.payload, tasks: existingTasks};
                    if (!state.homeworkEditingIds.includes(action.payload.id!)) {
                        state.homeworkEditingIds.push(action.payload.id!);
                    }
                }
            },
        },

        removeDraftHomework: (state, action: PayloadAction<number>) => {
            state.draftHomeworks = state.draftHomeworks.filter(dh => dh.id !== action.payload);
            state.homeworkEditingIds = state.homeworkEditingIds.filter(id => id !== action.payload);
        },

        addDraftTask: {
            prepare: (task: HomeworkTaskViewModel) => ({payload: serializeDates(task)}),
            reducer: (state, action: PayloadAction<StoredTask>) => {
                const hw = state.draftHomeworks.find(dh => dh.id === action.payload.homeworkId);
                if (!hw) return;
                if (!hw.tasks) hw.tasks = [];
                const ti = hw.tasks.findIndex(t => t.id === action.payload.id);
                if (ti !== -1) {
                    hw.tasks[ti] = action.payload;
                } else {
                    hw.tasks.push(action.payload);
                }
            },
        },

        updateDraftTask: {
            prepare: (task: HomeworkTaskViewModel) => ({payload: serializeDates(task)}),
            reducer: (state, action: PayloadAction<StoredTask>) => {
                const hw = state.draftHomeworks.find(dh => dh.id === action.payload.homeworkId);
                if (hw && hw.tasks) {
                    const idx = hw.tasks.findIndex(t => t.id === action.payload.id);
                    if (idx !== -1) {
                        hw.tasks[idx] = action.payload;
                    }
                }
            },
        },

        removeDraftTask: (state, action: PayloadAction<{ homeworkId: number; taskId: number }>) => {
            const {homeworkId, taskId} = action.payload;
            const hw = state.draftHomeworks.find(dh => dh.id === homeworkId);
            if (!hw) return;
            hw.tasks = (hw.tasks ?? []).filter(t => t.id !== taskId);
            if (homeworkId > 0 && hw.tasks.length === 0 && !state.homeworkEditingIds.includes(homeworkId)) {
                state.draftHomeworks = state.draftHomeworks.filter(dh => dh.id !== homeworkId);
            }
        },

        createNewDraftTask: {
            prepare: (task: NewTaskDraft) => ({payload: serializeDates(task)}),
            reducer: (state, action: PayloadAction<Serialized<NewTaskDraft>>) => {
                const hw = state.draftHomeworks.find(dh => dh.id === action.payload.homeworkId);
                if (!hw) return;
                const newId = state.draftIdCounter;
                if (!hw.tasks) hw.tasks = [];
                const {homeworkId, selectAfterCreate = true, ...rest} = action.payload;
                hw.tasks.push({
                    ...rest,
                    id: newId,
                    homeworkId,
                    criteria: [],
                });
                state.draftIdCounter -= 1;
                if (selectAfterCreate) {
                    state.selectedItem = {isHomework: false, id: newId};
                }
            },
        },

        setSelectedItem: (state, action: PayloadAction<SelectedItem>) => {
            state.selectedItem = action.payload;
        },

        setSelectionRequest: (state, action: PayloadAction<SelectionRequest>) => {
            state.selectionRequest = action.payload;
        },

        resetEditingState: () => initialState,
    },
});

export const {
    createNewHomeworkDraft,
    putHomeworkDraft,
    ensureHomeworkDraft,
    updateDraftHomework,
    removeDraftHomework,
    addDraftTask,
    updateDraftTask,
    removeDraftTask,
    createNewDraftTask,
    setSelectedItem,
    setSelectionRequest,
    resetEditingState,
} = courseEditingSlice.actions;

export default courseEditingSlice.reducer;
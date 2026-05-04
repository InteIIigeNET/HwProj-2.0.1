import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {HomeworkTaskViewModel, HomeworkViewModel} from "@/api";

export interface SelectedItem {
    isHomework: boolean;
    id: number | undefined;
}

interface CourseEditingState {
    draftHomeworks: HomeworkViewModel[];
    draftIdCounter: number;
    selectedItem: SelectedItem;
}

const initialState: CourseEditingState = {
    draftHomeworks: [],
    draftIdCounter: -1,
    selectedItem: {isHomework: true, id: undefined,},
};

const courseEditingSlice = createSlice({
    name: 'editing',
    initialState,
    reducers: {
        createNewHomeworkDraft: (state, action: PayloadAction<number>) => {
            const courseId = action.payload;
            const newId = state.draftIdCounter;
            const defaultPublicationDate = new Date(Date.now());
            defaultPublicationDate.setHours(0, 0, 0, 0);
            state.draftHomeworks.push({
                courseId,
                id: newId,
                title: 'Новое задание',
                description: '',
                publicationDate: defaultPublicationDate.toISOString() as unknown as Date,
                publicationDateNotSet: false,
                hasDeadline: false,
                deadlineDate: undefined,
                deadlineDateNotSet: false,
                isDeadlineStrict: false,
                isGroupWork: false,
                tasks: [],
                tags: [],
            });
            state.draftIdCounter -= 1;
            state.selectedItem = {isHomework: true, id: newId};
        },

        putHomeworkDraft: (state, action: PayloadAction<HomeworkViewModel>) => {
            const idx = state.draftHomeworks.findIndex(dh => dh.id === action.payload.id);
            if (idx === -1) {
                state.draftHomeworks.push(action.payload);
            } else {
                state.draftHomeworks[idx] = action.payload;
            }
        },

        ensureHomeworkDraft: (state, action: PayloadAction<HomeworkViewModel>) => {
            if (!state.draftHomeworks.some(dh => dh.id === action.payload.id)) {
                state.draftHomeworks.push(action.payload);
            }
        },

        updateDraftHomework: (state, action: PayloadAction<HomeworkViewModel>) => {
            const id = state.draftHomeworks.findIndex(dh => dh.id === action.payload.id);
            if (id !== -1) {
                const existingTasks = state.draftHomeworks[id].tasks;
                state.draftHomeworks[id] = {...action.payload, tasks: existingTasks};
            }
        },

        removeDraftHomework: (state, action: PayloadAction<number>) => {
            state.draftHomeworks = state.draftHomeworks.filter(dh => dh.id !== action.payload);
        },

        addDraftTask: (state, action: PayloadAction<HomeworkTaskViewModel>) => {
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

        updateDraftTask: (state, action: PayloadAction<HomeworkTaskViewModel>) => {
            const hw = state.draftHomeworks.find(dh => dh.id === action.payload.homeworkId);
            if (hw && hw.tasks) {
                const idx = hw.tasks.findIndex(t => t.id === action.payload.id);
                if (idx !== -1) {
                    hw.tasks[idx] = action.payload;
                }
            }
        },

        removeDraftTask: (state, action: PayloadAction<{ homeworkId: number; taskId: number }>) => {
            const hw = state.draftHomeworks.find(dh => dh.id === action.payload.homeworkId);
            if (hw && hw.tasks) {
                hw.tasks = hw.tasks.filter(t => t.id !== action.payload.taskId);
            }
        },

        createNewDraftTask: (state, action: PayloadAction<{
            homeworkId: number;
            title: string;
            description: string;
            maxRating: number;
            suggestedMaxRating?: number;
            isDeferred: boolean;
            deadlineDateNotSet: boolean;
            deadlineDate?: Date;
            tags: string[];
        }>) => {
            const hw = state.draftHomeworks.find(dh => dh.id === action.payload.homeworkId);
            if (!hw) return;
            const newId = state.draftIdCounter;
            if (!hw.tasks) hw.tasks = [];
            const {homeworkId, ...rest} = action.payload;
            hw.tasks.push({
                ...rest,
                id: newId,
                homeworkId,
            } as HomeworkTaskViewModel);
            state.draftIdCounter -= 1;
            state.selectedItem = {isHomework: false, id: newId};
        },

        setSelectedItem: (state, action: PayloadAction<SelectedItem>) => {
            state.selectedItem = action.payload;
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
    resetEditingState,
} = courseEditingSlice.actions;

export default courseEditingSlice.reducer;
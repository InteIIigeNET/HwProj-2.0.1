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
        addDraftHomework: (state, action: PayloadAction<HomeworkViewModel>) => {
            const exists = state.draftHomeworks.some(dh => dh.id === action.payload.id);
            if (!exists) {
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
            if (hw) {
                const exists = hw.tasks?.some(t => t.id === action.payload.id);
                if (!exists) {
                    if (!hw.tasks) hw.tasks = [];
                    hw.tasks.push(action.payload);
                }
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

        decrementDraftId: (state) => {
            state.draftIdCounter -= 1;
        },

        setSelectedItem: (state, action: PayloadAction<SelectedItem>) => {
            state.selectedItem = action.payload;
        },

        resetEditingState: () => initialState,
    },
});

export const {
    addDraftHomework,
    updateDraftHomework,
    removeDraftHomework,
    addDraftTask,
    updateDraftTask,
    removeDraftTask,
    decrementDraftId,
    setSelectedItem,
    resetEditingState,
} = courseEditingSlice.actions;

export default courseEditingSlice.reducer;
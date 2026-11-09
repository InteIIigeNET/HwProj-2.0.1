import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {HomeworkViewModel, HomeworkTaskViewModel} from '@/api';
import {loadCoursePage} from '../courseThunks';
import {serializeDates, type StoredHomework, type StoredTask} from '../courseModels';

interface HomeworkState {
    items: StoredHomework[];
}

const initialState: HomeworkState = {
    items: [],
}

const homeworkSlice = createSlice({
    name: 'homeworks',
    initialState,
    reducers: {
        setHomeworks: {
            prepare: (homeworks: HomeworkViewModel[]) => ({payload: serializeDates(homeworks)}),
            reducer(state, action: PayloadAction<StoredHomework[]>) {
                state.items = action.payload;
            },
        },
        
        deleteHomework(state, action: PayloadAction<number>) {
            state.items = state.items.filter(hw => hw.id !== action.payload);
        },

        updateOrInsertHomework: {
            prepare: (homework: HomeworkViewModel) => ({payload: serializeDates(homework)}),
            reducer(state, action: PayloadAction<StoredHomework>) {
                const index = state.items.findIndex(hw => hw.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                } else {
                    state.items.push(action.payload);
                }
            },
        },

        updateTask: {
            prepare: (task: HomeworkTaskViewModel) => ({payload: serializeDates(task)}),
            reducer(state, action: PayloadAction<StoredTask>) {
                const task = action.payload;
                const homework = state.items.find(hw => hw.id === task.homeworkId);
                if (homework && homework.tasks) {
                    const taskIndex = homework.tasks.findIndex(t => t.id === task.id);
                    if (taskIndex !== -1) {
                        homework.tasks[taskIndex] = task;
                    }
                    else {
                        homework.tasks.push(task);
                    }
                }
            },
        },

        deleteTask(state, action: PayloadAction<{homeworkId: number, taskId: number}>) {
            const homework = state.items.find(hw => hw.id === action.payload.homeworkId);
            if (homework && homework.tasks) {
                homework.tasks = homework.tasks.filter(t => t.id !== action.payload.taskId);
            }
        },
    },
    extraReducers: builder => {
        builder.addCase(loadCoursePage.fulfilled, (state, action) => {
            state.items = action.payload.course.homeworks ?? [];
        });
    },
});

export const {
    setHomeworks,
    updateOrInsertHomework,
    deleteHomework,
    updateTask,
    deleteTask,
} = homeworkSlice.actions;

export default homeworkSlice.reducer;
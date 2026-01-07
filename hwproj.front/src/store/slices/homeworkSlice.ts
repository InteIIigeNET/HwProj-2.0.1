import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {HomeworkViewModel, HomeworkTaskViewModel} from '@/api';

interface HomeworkState {
    homeworks: HomeworkViewModel[];
    isLoading: boolean
}

const initialState: HomeworkState = {
    homeworks: [],
    isLoading: false,
}

const homeworkSlice = createSlice({
    name: 'homework',
    initialState,
    reducers: {
        setHomeworks(state, action: PayloadAction<HomeworkViewModel[]>) {
            state.homeworks = action.payload;
            state.isLoading = false;
        },
        
        deleteHomework(state, action: PayloadAction<number>) {
            state.homeworks = state.homeworks.filter(hw => hw.id !== action.payload);
        },

        updateOrInsertHomework(state, action: PayloadAction<HomeworkViewModel>) {
            const index = state.homeworks.findIndex(hw => hw.id === action.payload.id);
            if (index !== -1) {
                state.homeworks[index] = action.payload;
            } else {
                state.homeworks.push(action.payload);
            }
        },

        updateTask(state, action: PayloadAction<HomeworkTaskViewModel>) {
            const task = action.payload;
            const homework = state.homeworks.find(hw => hw.id === task.homeworkId);
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

        deleteTask(state, action: PayloadAction<{homeworkId: number, taskId: number}>) {
            const homework = state.homeworks.find(hw => hw.id === action.payload.homeworkId);
            if (homework && homework.tasks) {
                homework.tasks = homework.tasks.filter(t => t.id !== action.payload.taskId);
            }
        },

        setHomeworkLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },

        resetHomeworks(state) {
            state.homeworks = [];
            state.isLoading = false;
        },
    },
});

export const {
    setHomeworks,
    updateOrInsertHomework,
    deleteHomework,
    updateTask,
    deleteTask,
    setHomeworkLoading,
    resetHomeworks,
} = homeworkSlice.actions;

export default homeworkSlice.reducer;
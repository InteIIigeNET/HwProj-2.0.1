import {configureStore} from '@reduxjs/toolkit';
import courseReducer from './slices/courseSlice';
import homeworkReducer from './slices/homeworkSlice';
import solutionsReducer from './slices/solutionSlice';
import courseFilesReducer from './slices/courseFileSlice';
import userReducer from './slices/userSlice';
import courseEditingReducer from './slices/courseEditingSlice';
import groupReducer from './slices/groupSlice';

export const store = configureStore({
  reducer: {
    course: courseReducer,
    homeworks: homeworkReducer,
    solutions: solutionsReducer,
    courseFiles: courseFilesReducer,
    user: userReducer,
    editing: courseEditingReducer,
    groups: groupReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
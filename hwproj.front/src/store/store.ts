import {configureStore} from '@reduxjs/toolkit';
import courseReducer from './slices/courseSlice';
import homeworkReducer from './slices/homeworkSlice';
import solutionsReducer from './slices/solutionSlice';
import courseFilesReducer from './slices/courseFileSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    course: courseReducer,
    homeworks: homeworkReducer,
    solutions: solutionsReducer,
    courseFiles: courseFilesReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
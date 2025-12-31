import {configureStore} from '@reduxjs/toolkit';
import courseReducer from './slices/courseSlice';
import homeworkReducer from './slices/homeworkSlice';

export const store = configureStore({
  reducer: {
    course: courseReducer,
    homework: homeworkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
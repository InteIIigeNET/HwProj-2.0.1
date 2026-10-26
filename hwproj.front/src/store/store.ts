import {combineReducers, configureStore, type UnknownAction} from '@reduxjs/toolkit';
import courseReducer from './slices/courseSlice';
import homeworkReducer from './slices/homeworkSlice';
import solutionsReducer from './slices/solutionSlice';
import courseFilesReducer from './slices/courseFileSlice';
import userReducer from './slices/userSlice';
import courseEditingReducer from './slices/courseEditingSlice';
import groupReducer from './slices/groupSlice';
import {loadCoursePage, refreshCourseSolutions} from './courseThunks';

const combinedReducer = combineReducers({
    course: courseReducer,
    homeworks: homeworkReducer,
    solutions: solutionsReducer,
    courseFiles: courseFilesReducer,
    user: userReducer,
    editing: courseEditingReducer,
    groups: groupReducer,
});

export type RootState = ReturnType<typeof combinedReducer>;

export const rootReducer = (state: RootState | undefined, action: UnknownAction): RootState => {
  if (loadCoursePage.pending.match(action)
    && (!action.meta.arg.refresh || state?.course.courseId !== action.meta.arg.courseId)) {
    const initial = combinedReducer(undefined, {type: '@@course/reset'});
    state = {...initial, user: state?.user ?? initial.user};
  }

  if (loadCoursePage.fulfilled.match(action) || loadCoursePage.rejected.match(action)) {
    if (!state || state.course.courseId !== action.meta.arg.courseId
      || state.course.requestId !== action.meta.requestId) {
      return state ?? combinedReducer(undefined, {type: '@@course/init'});
    }
  }

  if (refreshCourseSolutions.pending.match(action) || refreshCourseSolutions.fulfilled.match(action)
    || refreshCourseSolutions.rejected.match(action)) {
    if (!state || state.course.courseId !== action.meta.arg.courseId
      || state.course.scopeId !== action.meta.arg.scopeId) {
      return state ?? combinedReducer(undefined, {type: '@@course/init'});
    }
  }

  return combinedReducer(state, action);
};

export const store = configureStore({reducer: rootReducer});

export type AppDispatch = typeof store.dispatch;
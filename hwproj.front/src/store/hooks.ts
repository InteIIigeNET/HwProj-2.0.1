import {useDispatch, useSelector, useStore} from 'react-redux';
import type {RootState, AppDispatch, store} from './store';

export const useCourseDispatch = useDispatch.withTypes<AppDispatch>();
export const useCourseState = useSelector.withTypes<RootState>();
export const useCourseStore = useStore.withTypes<typeof store>();
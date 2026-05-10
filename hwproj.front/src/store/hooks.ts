import {useDispatch, useSelector} from 'react-redux';
import type {RootState, AppDispatch} from './store';

export const useCourseDispatch = useDispatch.withTypes<AppDispatch>();
export const useCourseState = useSelector.withTypes<RootState>();
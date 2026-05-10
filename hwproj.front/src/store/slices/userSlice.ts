import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type UserRole = "Lecturer" | "Expert" | "Student";

export type UserState = {
    userId: string;
    role: UserRole;
} | null;

const initialState = null as UserState;

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (_state, action: PayloadAction<UserState>) => action.payload,
    },
});

export const {setUser} = userSlice.actions;

export const selectUserId = (state: { user: UserState }) => state.user?.userId ?? null;
export const selectUserRole = (state: { user: UserState }) => state.user?.role ?? null;
export const selectIsLecturer = (state: { user: UserState }) => state.user?.role === "Lecturer";
export const selectIsExpert = (state: { user: UserState }) => state.user?.role === "Expert";
export const selectIsLecturerOrExpert = (state: { user: UserState }) =>
    selectIsLecturer(state) || selectIsExpert(state);
 
export default userSlice.reducer;
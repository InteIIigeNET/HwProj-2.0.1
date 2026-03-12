import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type UserRole = "Lecturer" | "Expert" | "Student" | null;

interface UserState {
    userId: string | null;
    isLecturer: boolean;
    isExpert: boolean;
}

type SetUserPayload = {
    userId: string | null;
    role: UserRole;
}

const initialState: UserState = {
    userId: null,
    isLecturer: false,
    isExpert: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<SetUserPayload>) => {
            const {userId, role} = action.payload;
            state.userId = userId;
            state.isLecturer = role === "Lecturer";
            state.isExpert = role === "Expert";
        },
    },
});

export const {setUser} = userSlice.actions;
 
export default userSlice.reducer;
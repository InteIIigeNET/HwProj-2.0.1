import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type UserRole = "Lecturer" | "Expert" | "Student" | null;

interface UserState {
    userId: string | null;
    role : UserRole;
    isLecturer: boolean;
    isExpert: boolean;
}

type SetUserPayload = {
    userId: string | null;
    role: UserRole;
}

const initialState: UserState = {
    userId: null,
    role: null,
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
            state.role = role;
            state.isLecturer = role === "Lecturer";
            state.isExpert = role === "Expert";
        },
        
        clearUser: (state) => {
            state.userId = null;
            state.role = null;
            state.isLecturer = false;
            state.isExpert = false;
        },
    },
});

export const { setUser, 
    clearUser
 } = userSlice.actions;
 
export default userSlice.reducer;
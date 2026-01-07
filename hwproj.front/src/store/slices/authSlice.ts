import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface AuthState {
    userId: string | null;
    isLecturer: boolean;
    isExpert: boolean;
}

const initialState: AuthState = {
    userId: null,
    isLecturer: false,
    isExpert: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<AuthState>) => {
            state.userId = action.payload.userId;
            state.isLecturer = action.payload.isLecturer;
            state.isExpert = action.payload.isExpert;
        },
        
        clearAuth: (state) => {
            state.userId = null;
            state.isLecturer = false;
            state.isExpert = false;
        },
    },
});

export const { setAuth, 
    clearAuth
 } = authSlice.actions;
 
export default authSlice.reducer;
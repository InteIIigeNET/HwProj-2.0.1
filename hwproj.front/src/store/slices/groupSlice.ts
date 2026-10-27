import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GroupViewModel} from '@/api';
import {loadCoursePage, refreshCourseGroups} from '../courseThunks';

interface GroupState {
    requestId: string | null;
    items: GroupViewModel[];
}

const initialState: GroupState = {
    requestId: null,
    items: [],
};

const groupSlice = createSlice({
    name: 'groups',
    initialState,
    reducers: {
        setGroups(state, action: PayloadAction<GroupViewModel[]>) {
            state.items = action.payload;
        },

        addGroup(state, action: PayloadAction<GroupViewModel>) {
            state.items.push(action.payload);
        },

        updateGroup(state, action: PayloadAction<GroupViewModel>) {
            const group = action.payload;
            const index = state.items.findIndex(item => item.id === group.id);
            if (index !== -1) {
                state.items[index] = group;
            }
        },

        resetGroups(state) {
            state.items = [];
            state.requestId = null;
        },
    },
    extraReducers: builder => {
        builder.addCase(loadCoursePage.pending, (state, action) => {
            state.requestId = action.meta.requestId;
        });
        builder.addCase(loadCoursePage.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            state.items = action.payload.course.groups ?? [];
        });
        builder.addCase(refreshCourseGroups.pending, (state, action) => {
            state.requestId = action.meta.requestId;
        });
        builder.addCase(refreshCourseGroups.fulfilled, (state, action) => {
            if (state.requestId !== action.meta.requestId) return;
            state.items = action.payload;
        });
    },
});

export const {
    setGroups,
    addGroup,
    updateGroup,
    resetGroups,
} = groupSlice.actions;

export default groupSlice.reducer;
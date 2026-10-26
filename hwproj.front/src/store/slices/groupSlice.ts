import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GroupViewModel} from '@/api';
import {loadCoursePage} from '../courseThunks';

interface GroupState {
    items: GroupViewModel[];
}

const initialState: GroupState = {
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
        },
    },
    extraReducers: builder => {
        builder.addCase(loadCoursePage.fulfilled, (state, action) => {
            state.items = action.payload.course.groups ?? [];
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
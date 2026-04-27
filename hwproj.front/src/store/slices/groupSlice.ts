import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {GroupViewModel} from '@/api';

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

        removeGroup(state, action: PayloadAction<number>) {
            state.items = state.items.filter(group => group.id !== action.payload);
        },

        resetGroups(state) {
            state.items = [];
        },
    },
});

export const {
    setGroups,
    addGroup,
    updateGroup,
    removeGroup,
    resetGroups,
} = groupSlice.actions;

export default groupSlice.reducer;
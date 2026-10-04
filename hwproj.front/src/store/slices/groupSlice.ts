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

        resetGroups(state) {
            state.items = [];
        },
    },
});

export const {
    setGroups,
    addGroup,
    updateGroup,
    resetGroups,
} = groupSlice.actions;

export default groupSlice.reducer;
import {createSlice} from '@reduxjs/toolkit';

export const userActiveChat = createSlice({
  name: 'activeChat',
  initialState: {
    activeChat: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
  },
});

export const {setActiveChat} = userActiveChat.actions;

export default userActiveChat.reducer;

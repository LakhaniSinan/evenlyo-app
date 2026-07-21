import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    clearUnreadCount: state => {
      state.unreadCount = 0;
    },
  },
});

export const {setUnreadCount, clearUnreadCount} = notificationSlice.actions;

export default notificationSlice.reducer;

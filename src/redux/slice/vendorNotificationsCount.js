import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  vendorUnreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'vendorNotifications',
  initialState,
  reducers: {
    setVendorUnreadCount: (state, action) => {
      state.vendorUnreadCount = action.payload;
    },
  },
});

export const {setVendorUnreadCount} = notificationSlice.actions;

export default notificationSlice.reducer;

import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  items: [],
  sent: false,
  lastSentOffer: null,
  error: null,
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    addItem(state, action) {
      const newItem = {
        ...action.payload,
        uniqueId:
          action.payload.uniqueId ||
          `${action.payload.id || action.payload._id}-${Date.now()}-${Math.random()}`,
      };

      const existingIndex = state.items.findIndex(
        item =>
          item.uniqueId === newItem.uniqueId ||
          (item.id === newItem.id &&
            item.startDate === newItem.startDate &&
            item.startTime === newItem.startTime),
      );

      if (existingIndex !== -1) {
        state.items[existingIndex] = newItem;
      } else {
        state.items.push(newItem);
      }
    },
    updateItem(state, action) {
      const {itemId, updatedData} = action.payload;
      const idx = state.items.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        state.items[idx] = {...state.items[idx], ...updatedData};
      }
    },
    removeItem(state, action) {
      const key = action.payload;
      state.items = state.items.filter(
        item => item.uniqueId !== key && item.id !== key && item._id !== key,
      );
    },
    resetOffer(state) {
      state.items = [];
      state.sent = false;
      state.lastSentOffer = null;
      state.error = null;
    },
    sendOffer(state, action) {
      state.sent = true;
      state.lastSentOffer = {
        items: [...state.items],
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const {addItem, updateItem, removeItem, resetOffer, sendOffer, clearError} =
  offersSlice.actions;

export default offersSlice.reducer;

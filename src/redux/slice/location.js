// src/redux/slice/location.js
import {createSlice} from '@reduxjs/toolkit';

const locationSlice = createSlice({ 
  name: 'location',
  initialState: {
    coords: null,
    address: null,
    city: '',
    state: '',
  },
  reducers: {
    setLocation: (state, action) => {
      state.coords = action.payload.coords;
      state.address = action.payload.address;
      state.city = action.payload.city || '';
      state.state = action.payload.state || '';
    },
  },
});

export const {setLocation} = locationSlice.actions;
export default locationSlice.reducer;

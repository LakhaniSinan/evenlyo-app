import {createSlice} from '@reduxjs/toolkit';

export const CartSlice = createSlice({
  name: 'Cart',
  initialState: {
    cartData: [],
  },
  reducers: {
    setCartData: (state, action) => {
      state.cartData = action.payload;
    },
  },
});

export const {setCartData} = CartSlice.actions;

export default CartSlice.reducer;

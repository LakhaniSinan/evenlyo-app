import {createSlice} from '@reduxjs/toolkit';

export const Login = createSlice({
  name: 'Login',
  initialState: {
    user: null,
  },
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const {setUserData} = Login.actions;

export default Login.reducer;

import {createSlice} from '@reduxjs/toolkit';

export const Login = createSlice({
  name: 'Login',
  initialState: {
    user: null,
    authFlow: 'onboarding',
  },
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload;
    },

    setAuthFlow: (state, action) => {
      state.authFlow = action.payload;
    },
  },
});

export const {setUserData, setAuthFlow} = Login.actions;

export default Login.reducer;

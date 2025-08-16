import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type AuthState = { token: string | null; user: any | null };

const initialState: AuthState = { token: null, user: null };

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: any }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    signout(state) {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, signout } = slice.actions;
export default slice.reducer;

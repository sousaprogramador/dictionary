import { createSlice, PayloadAction } from '@reduxjs/toolkit';
type User = { id: string; name: string; email?: string } | null;
type AuthState = { token: string | null; user: User };
const initialState: AuthState = { token: null, user: null };
const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    clear(state) {
      state.token = null;
      state.user = null;
    },
  },
});
export const { setCredentials, clear } = slice.actions;
export default slice.reducer;

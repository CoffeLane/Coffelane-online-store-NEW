import { createSlice } from '@reduxjs/toolkit';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    currency: localStorage.getItem('currency') || 'USD', 
  },
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload;
      localStorage.setItem('currency', action.payload); 
    },
  },
});

export const { setCurrency } = settingsSlice.actions;
export default settingsSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ page = 1, size = 5 }, { rejectWithValue }) => {
    try {
      const response = await axios.get("/orders/list", {
        params: { page, size },
      });
      return { ...response.data, page, size };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    count: 0,
    page: 1,
    size: 5,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.results;
        state.count = action.payload.count;
        state.page = action.payload.page;
        state.size = action.payload.size;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ordersSlice.reducer;
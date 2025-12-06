import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../api/axios';

export const fetchAccessories = createAsyncThunk(
  "accessories/fetchAccessories",
  async ({ page = 1, size = 12, ordering = "" } = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      params.append("page", Number(page));
      params.append("size", Number(size));
      if (ordering) params.append("ordering", ordering);

      const response = await api.get(`/accessories?${params.toString()}`);
      // console.log(`Запрос аксессуаров: /accessories?${params.toString()}`);

      return {
        data: response.data.data,
        totalItems: response.data.total_items,
        totalPages: response.data.total_pages,
        currentPage: response.data.current_page,
        hasNextPage: response.data.next_page,
        hasPreviousPage: response.data.previous_page,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Error");
    }
  }
);

export const fetchAccessoryById = createAsyncThunk(
  "accessories/fetchById",
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/accessories/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Error");
    }
  }
);

const accessoriesSlice = createSlice({
  name: "accessories",
  initialState: {
    items: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    selectedAccessory: null,
    loading: false,
    error: null,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccessories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccessories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.hasNextPage = action.payload.hasNextPage;
        state.hasPreviousPage = action.payload.hasPreviousPage;
      })
      .addCase(fetchAccessories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAccessoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccessoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAccessory = action.payload;
      })
      .addCase(fetchAccessoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedAccessory = null;
      });
  },
});

export default accessoriesSlice.reducer;

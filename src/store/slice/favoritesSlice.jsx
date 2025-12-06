import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiWithAuth } from "../api/axios";

// Получение фаворитов
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const api = apiWithAuth();
      const res = await api.get("/favorites");
      return res.data.items
        .map(item => item.product ? { ...item.product, type: 'product' } :
                      item.accessory ? { ...item.accessory, type: 'accessory' } :
                      item.supply ? { ...item.supply, type: 'supply' } : null)
        .filter(Boolean);
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error loading favorites");
    }
  }
);

// Переключение фаворита
export const toggleFavoriteItem = createAsyncThunk(
  "favorites/toggleFavoriteItem",
  async ({ itemType, itemId }, { rejectWithValue, dispatch }) => {
    if (!itemType || !itemId) return rejectWithValue("Item type or ID is missing");
    try {
      const api = apiWithAuth();
      await api.post(`/favorites/${itemType}/${itemId}/toggle/`);
      dispatch(fetchFavorites());
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Error toggling favorite");
    }
  }
);


const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    favorites: [],
    loading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.pending, state => { state.loading = true; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleFavoriteItem.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default favoritesSlice.reducer;

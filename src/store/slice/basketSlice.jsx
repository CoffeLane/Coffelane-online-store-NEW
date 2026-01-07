import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiWithAuth } from "../api/axios";

export const getActiveBasket = createAsyncThunk(
  "basket/getActiveBasket",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiWithAuth.get("/basket/");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const addItemToBasket = createAsyncThunk(
  "basket/addItem",
  async (payload, { rejectWithValue }) => {
    try {
      if (!payload) return rejectWithValue("Empty payload");
      const response = await apiWithAuth.post("/basket/add/", payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateBasketItem = createAsyncThunk(
  "basket/updateItem",
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const response = await apiWithAuth.patch(`/basket/update/${id}/`, { quantity });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteBasketItem = createAsyncThunk(
  "basket/deleteItem",
  async (id, { rejectWithValue }) => {
    try {
      await apiWithAuth.delete(`/basket/delete/basket_item/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const clearBasket = createAsyncThunk(
  "basket/clearBasket",
  async (basketId, { rejectWithValue }) => {
    try {
      if (!basketId) return rejectWithValue("No basket ID provided");
      await apiWithAuth.delete(`/basket/clear/${basketId}/`);
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const basketSlice = createSlice({
  name: "basket",
  initialState: {
    basket: null,
    basketId: null,
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setBasketId: (state, action) => {
      state.basketId = action.payload;
    },
    clearBasketState: (state) => {
      state.basket = null;
      state.basketId = null;
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getActiveBasket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveBasket.fulfilled, (state, action) => {
        state.loading = false;
        state.basket = action.payload;
        state.basketId = action.payload?.id || null;
        state.items = action.payload?.items || [];
      })
      .addCase(getActiveBasket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItemToBasket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToBasket.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          state.basketId = action.payload.id;
        }
        if (action.payload?.items) {
          state.items = action.payload.items;
        }
      })
      .addCase(addItemToBasket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBasketItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBasketItem.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.items) {
          state.items = action.payload.items;
        }
      })
      .addCase(updateBasketItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBasketItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBasketItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteBasketItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearBasket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearBasket.fulfilled, (state) => {
        state.loading = false;
        state.basket = null;
        state.basketId = null;
        state.items = [];
      })
      .addCase(clearBasket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setBasketId, clearBasketState } = basketSlice.actions;
export default basketSlice.reducer;





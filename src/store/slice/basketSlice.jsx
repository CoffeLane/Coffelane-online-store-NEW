import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiWithAuth } from "../api/axios";

// Получить активную корзину
export const getActiveBasket = createAsyncThunk(
  "basket/getActiveBasket",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("access");
      if (!token) {
        return rejectWithValue("No access token");
      }
      const apiAuth = apiWithAuth(token);
      const response = await apiAuth.get("/basket");
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Добавить товар в корзину
export const addItemToBasket = createAsyncThunk(
  "basket/addItem",
  async ({ product_id, supply_id, accessory_id, quantity = 1 }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("access");
      if (!token) {
        return rejectWithValue("No access token");
      }
      const apiAuth = apiWithAuth(token);
      
      const payload = { quantity };
      if (product_id) payload.product_id = product_id;
      if (supply_id) payload.supply_id = supply_id;
      if (accessory_id) payload.accessory_id = accessory_id;

      const response = await apiAuth.post("/basket/add/", payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Обновить товар в корзине
export const updateBasketItem = createAsyncThunk(
  "basket/updateItem",
  async ({ id, quantity }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("access");
      if (!token) {
        return rejectWithValue("No access token");
      }
      const apiAuth = apiWithAuth(token);
      const response = await apiAuth.patch(`/basket/update/${id}/`, { quantity });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Удалить товар из корзины
export const deleteBasketItem = createAsyncThunk(
  "basket/deleteItem",
  async (id, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("access");
      if (!token) {
        return rejectWithValue("No access token");
      }
      const apiAuth = apiWithAuth(token);
      await apiAuth.delete(`/basket/delete/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Очистить корзину
export const clearBasket = createAsyncThunk(
  "basket/clearBasket",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("access");
      if (!token) {
        return rejectWithValue("No access token");
      }
      const apiAuth = apiWithAuth(token);
      await apiAuth.delete("/basket/clear/");
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
        // Обновляем корзину после добавления товара
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




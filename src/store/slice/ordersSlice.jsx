import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiWithAuth } from "../api/axios";
import {
  addItemToBasket,
  getActiveBasket,
  clearBasketState,
  clearBasket,
} from "./basketSlice";

const processOrderResponse = (data, page, size) => ({
  results: data?.results || data?.data || (Array.isArray(data) ? data : []),
  count: data?.count || data?.total_items || (Array.isArray(data) ? data.length : 0),
  total_pages: data?.total_pages || 1,
  page,
  size,
});

// Thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await apiWithAuth.get("/orders/admin-list/", { params: { page, size } });
      return processOrderResponse(response.data, page, size);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async ({ page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await apiWithAuth.get("/orders/user-list/", { params: { page, size } });
      return processOrderResponse(response.data, page, size);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue, dispatch, getState }) => {
    try {
      const { cart } = getState();
      const localItems = Object.values(cart?.items || {});

      try {
        const activeBasket = await dispatch(getActiveBasket()).unwrap();
        if (activeBasket?.id) await dispatch(clearBasket(activeBasket.id)).unwrap();
      } catch (e) {
        console.warn("Cart already empty or error clearing", e);
      }

      for (const item of localItems) {
        const { product, quantity } = item;
        const isAccessory = product?.category || !product?.supplies;
        
        const payload = {
          quantity: Number(quantity || 1),
          ...(isAccessory 
            ? { accessory_id: Number(product.id) } 
            : { product_id: Number(product.id), supply_id: Number(product.supplies?.[0]?.id || product.selectedSupplyId) })
        };

        if (payload.accessory_id || (payload.product_id && payload.supply_id)) {
          await dispatch(addItemToBasket(payload)).unwrap();
        }
      }

      const finalPayload = {
        billing_details: { ...orderData.billing_details },
        customer_data: orderData.customer_data,
        order_notes: orderData.order_notes || "",
        ...(orderData.currency && { currency: orderData.currency }),
        ...(orderData.discount_code?.trim() && { discount_code: orderData.discount_code.trim() })
      };

      const response = await apiWithAuth.post("/orders/create/", finalPayload);
      dispatch(clearBasketState());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiWithAuth.get(`/orders/details/${orderId}/`);
      return response.data;
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
    totalPages: 1,
    loading: false,
    creating: false,
    error: null,
    currentOrder: null,
  },
  reducers: {
    clearCurrentOrder: (state) => { state.currentOrder = null; },
    resetOrdersError: (state) => { state.error = null; },
    clearOrders: (state) => {
      state.orders = [];
      state.count = 0;
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.creating = true; state.error = null; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.creating = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending') && action.type.includes('fetch'),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') && action.type.includes('fetch') && action.payload?.results,
        (state, action) => {
          state.loading = false;
          state.orders = action.payload.results;
          state.count = action.payload.count;
          state.totalPages = action.payload.total_pages;
          state.page = action.payload.page;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.includes('fetch'),
        (state, action) => { state.loading = false; state.error = action.payload; }
      );
  },
});

export const { clearCurrentOrder, resetOrdersError, clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
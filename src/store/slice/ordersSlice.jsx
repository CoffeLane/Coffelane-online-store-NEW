import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiWithAuth } from "../api/axios";
import { addItemToBasket, getActiveBasket, clearBasketState } from "./basketSlice";

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
const processOrderResponse = (data, page, size) => {
  let ordersList = [];
  let totalCount = 0;

  if (data?.results && Array.isArray(data.results)) {
    ordersList = data.results;
    totalCount = data.count || data.total_items || ordersList.length;
  } else if (data?.data && Array.isArray(data.data)) {
    ordersList = data.data;
    totalCount = data.total_items || ordersList.length;
  } else if (Array.isArray(data)) {
    ordersList = data;
    totalCount = data.length;
  }

  return {
    results: ordersList,
    count: totalCount,
    total_pages: data?.total_pages || 1,
    current_page: data?.current_page || page,
    page,
    size
  };
};

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState();
      const cartMap = state.cart?.items || {};
      const localItems = Object.values(cartMap);

      if (localItems.length > 0) {
        for (const item of localItems) {
          const product = item.product;
          const qty = item.quantity || 1;
          const isAccessory = product?.category || !product?.supplies;

          let payload = { quantity: Number(qty) };

          if (isAccessory) {
            payload.accessory_id = Number(product.id);
          } else {
            payload.product_id = Number(product.id);
            payload.supply_id = Number(product.supplies?.[0]?.id || product.selectedSupplyId);
          }

          if (payload.accessory_id || (payload.product_id && payload.supply_id)) {
            try {
              await dispatch(addItemToBasket(payload)).unwrap();
            } catch (e) {
              console.error(`Server error for ${product.name}:`, e);
            }
          } else {
            console.warn("Not enough data to synchronize the product:", product);
          }
        }

        await dispatch(getActiveBasket()).unwrap();
      }

    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`;

      const payload = {
        billing_details: {
          ...orderData.billing_details,
          phone_number: formattedPhone(orderData.billing_details.phone_number)
        },
        customer_data: orderData.customer_data,
        order_notes: orderData.order_notes || "",
        discount_code: orderData.discount_code 
      };

      const response = await apiWithAuth.post("/orders/create/", payload);
      dispatch(clearBasketState());
      return response.data;

    } catch (err) {
      console.error("Final error:", err);
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
    loading: false,
    creating: false,
    error: null,
    currentOrder: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    resetOrdersError: (state) => {
      state.error = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.count = 0;
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
      })
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
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.results;
        state.totalPages = action.payload.total_pages;
        state.count = action.payload.count;
      })
      .addMatcher(
        (action) => [fetchOrders.pending.type, fetchUserOrders.pending.type].includes(action.type),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => [fetchOrders.fulfilled.type, fetchUserOrders.fulfilled.type].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.orders = action.payload.results;
          state.count = action.payload.count;
          state.page = action.payload.page;
        }
      )
      .addMatcher(
        (action) => [fetchOrders.rejected.type, fetchUserOrders.rejected.type].includes(action.type),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

  },
});

export const { clearCurrentOrder, resetOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;
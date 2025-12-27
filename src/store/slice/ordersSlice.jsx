import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiWithAuth } from "../api/axios"; 
import { addItemToBasket, getActiveBasket, clearBasketState } from "./basketSlice";

/**
 * Получение списка заказов
 */
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ page = 1, size = 10 }, { rejectWithValue }) => {
    try {
      const response = await apiWithAuth.get("/orders/list", {
        params: { page, size },
      });

      const data = response.data;
      let ordersList = [];
      let totalCount = 0;

      if (data?.results && Array.isArray(data.results)) {
        ordersList = data.results;
        totalCount = data.count || data.total_items || ordersList.length;
      } else if (Array.isArray(data)) {
        ordersList = data;
        totalCount = data.length;
      } else if (data?.data && Array.isArray(data.data)) {
        ordersList = data.data;
        totalCount = data.total_items || ordersList.length;
      }

      return {
        results: ordersList,
        count: totalCount,
        total_pages: data?.total_pages || 1,
        current_page: data?.current_page || page,
        page,
        size
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/**
 * Создание нового заказа
 */
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      for (const item of orderData.positions) {
        try {
          await dispatch(addItemToBasket({
            product_id: item.product_id,
            supply_id: item.supply_id,
            accessory_id: item.accessory_id,
            quantity: item.quantity
          })).unwrap();
        } catch (addError) {
          dispatch(clearBasketState()); 
          await dispatch(addItemToBasket({
            product_id: item.product_id,
            supply_id: item.supply_id,
            accessory_id: item.accessory_id,
            quantity: item.quantity
          })).unwrap();
        }
      }

      const basketRes = await dispatch(getActiveBasket()).unwrap();
      const basketId = basketRes?.id;
      if (!basketId) throw new Error("Не удалось получить ID корзины");

      const formatPhone = (phone) => {
        const digits = String(phone).replace(/\D/g, "");
        return digits.startsWith("38") ? `+${digits}` : `+38${digits}`;
      };

      const payload = {
        billing_details: {
          ...orderData.billing_details,
          phone_number: formatPhone(orderData.billing_details.phone_number)
        },
        positions: orderData.positions.map(p => ({
          quantity: Number(p.quantity),
          ...(p.accessory_id 
            ? { accessory_id: Number(p.accessory_id) } 
            : { product_id: Number(p.product_id), supply_id: Number(p.supply_id) }
          )
        })),
        customer_data: orderData.customer_data,
        basket_id: Number(basketId)
      };

      const response = await apiWithAuth.post("/orders/create", payload);
      dispatch(clearBasketState());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Ошибка при создании заказа");
    }
  }
);

/**
 * Детали конкретного заказа
 */
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
    }
  },
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
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
      });
  },
});

export const { clearCurrentOrder, resetOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;
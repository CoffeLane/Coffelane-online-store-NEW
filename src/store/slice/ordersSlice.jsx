import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiWithAuth } from "../api/axios";
import api from "../api/axios";
import { clearAuthState, refreshAccessToken } from "./authSlice";

// import { orders as mockOrdersData } from "../../mockData/orders.jsx";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ page = 1, size = 10 }, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("access");
      
      if (!token) {
        return rejectWithValue("Unauthorized");
      }
      const apiAuth = apiWithAuth(token);
      
      try {
        const response = await apiAuth.get("/orders/list", {
          params: { page, size },
        });
        console.log("✅ Orders fetched successfully from API:", response.data);
        console.log("▶ API Response structure:", {
          hasResults: !!response.data?.results,
          resultsLength: response.data?.results?.length,
          totalItems: response.data?.total_items,
          currentPage: response.data?.current_page,
          fullDataKeys: Object.keys(response.data || {}),
          fullData: response.data
        });

        let ordersList = [];
        let count = 0;
        
        if (response.data?.results && Array.isArray(response.data.results)) {

          ordersList = response.data.results;
          count = response.data.count || response.data.total_items || ordersList.length;
        } else if (Array.isArray(response.data)) {

          ordersList = response.data;
          count = response.data.length;
        } else if (response.data?.data && Array.isArray(response.data.data)) {

          ordersList = response.data.data;
          count = response.data.total_items || ordersList.length;
        } else if (response.data?.total_items === 0 || (response.data?.total_items !== undefined && response.data?.total_items > 0)) {


          const possibleFields = ['items', 'orders', 'data', 'list'];
          for (const field of possibleFields) {
            if (Array.isArray(response.data[field])) {
              ordersList = response.data[field];
              count = response.data.total_items || ordersList.length;
              console.log(`▶ Found orders in field: ${field}`);
              break;
            }
          }

          if (response.data?.total_items === 0 && ordersList.length === 0) {
            console.log("▶ No orders found (total_items = 0), returning empty array");
            return { results: [], count: 0, page, size };
          }
        }

        if (ordersList.length > 0) {
          console.log(`✅ Found ${ordersList.length} orders in API response`);
          return { 
            results: ordersList, 
            count: count,
            total_items: response.data?.total_items || count,
            total_pages: response.data?.total_pages || 1,
            current_page: response.data?.current_page || page,
            page, 
            size 
          };
        }

        if (response.data?.total_items === 0 || response.data?.total_items === undefined) {
          // Нет заказов - это нормальная ситуация
          return { results: [], count: 0, total_items: 0, total_pages: 0, current_page: page, page, size };
        }

        if (response.data?.total_items > 0 && ordersList.length === 0) {
          console.warn("⚠️ API says there are orders (total_items > 0) but couldn't find them in response");
          console.warn("⚠️ Full response structure:", JSON.stringify(response.data, null, 2));

          return { results: [], count: response.data.total_items, page, size };
        }

        // Если не удалось найти заказы, возвращаем пустой массив
        return { results: [], count: 0, total_items: 0, total_pages: 0, current_page: page, page, size };
      } catch (apiError) {
        console.error("❌ Error fetching orders from API:", apiError.response?.data || apiError.message);
        // При ошибке API возвращаем пустой массив вместо mock данных
        return { results: [], count: 0, total_items: 0, total_pages: 0, current_page: page, page, size };
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err.response?.data || err.message);
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue, getState }) => {
    const state = getState();
    const token = state.auth?.token || localStorage.getItem("access");
    const apiAuth = apiWithAuth(token);

    try {
      // 1. Получаем ID корзины
      let basketId = state.basket?.basketId;
      if (!basketId) {
        const bRes = await apiAuth.get("/basket").catch(() => null);
        basketId = bRes?.data?.id;
      }

      // 2. Подготовка позиций
      const cleanPositions = orderData.positions.map(p => ({
        quantity: Number(p.quantity),
        ...(p.accessory_id ? { accessory_id: Number(p.accessory_id) } : {
            product_id: Number(p.product_id),
            supply_id: Number(p.supply_id)
        })
      }));

      // 3. ФУНКЦИЯ ФОРМАТИРОВАНИЯ ТЕЛЕФОНА (E.164)
      const formatPhone = (rawPhone) => {
        let digits = String(rawPhone).replace(/\D/g, ""); // Только цифры
        if (digits.startsWith("0") && digits.length === 10) digits = "38" + digits;
        if (digits.startsWith("80") && digits.length === 11) digits = "3" + digits;
        return `+${digits}`;
      };

      // 4. Формируем финальный Payload
      const payload = {
        billing_details: {
          ...orderData.billing_details,
          phone_number: formatPhone(orderData.billing_details.phone_number)
        },
        positions: cleanPositions,
        customer_data: orderData.customer_data,
        basket_id: basketId ? Number(basketId) : null
      };

      console.log("📤 Attempt 1 (with basket_id):", payload);
      const response = await apiAuth.post("/orders/create", payload);
      return response.data;

    } catch (err) {
      const errorData = err.response?.data;
      console.error("❌ Attempt 1 Error:", errorData);

      if (err.response?.status === 401) return rejectWithValue({ requiresLogin: true });
      const errorStr = JSON.stringify(errorData);
      if (errorStr.includes("not found") || errorStr.includes("Basket")) {
        console.log("🔄 Attempt 2: Retrying without basket_id...");
        
        const retryPayload = {
          billing_details: {
            ...orderData.billing_details,
            phone_number: `+${String(orderData.billing_details.phone_number).replace(/\D/g, "")}`
          },
          positions: orderData.positions.map(p => ({
            quantity: Number(p.quantity),
            ...(p.accessory_id ? { accessory_id: Number(p.accessory_id) } : {
                product_id: Number(p.product_id),
                supply_id: Number(p.supply_id)
            })
          })),
          customer_data: orderData.customer_data
        };

        try {
          const retryRes = await apiAuth.post("/orders/create", retryPayload);
          return retryRes.data;
        } catch (retryErr) {
          console.error("❌ Attempt 2 Error:", retryErr.response?.data);
          return rejectWithValue(retryErr.response?.data || "Order failed");
        }
      }

      return rejectWithValue(errorData || "Order creation failed");
    }
  }
);
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      // НЕ передаем токен вручную. 
      // apiWithAuth() сам возьмет свежий из localStorage при каждом вызове.
      const api = apiWithAuth(); 
      
      console.log("🔍 Fetching order details for ID:", orderId);
      
      // Обратите внимание: проверьте эндпоинт на бэкенде. 
      // Обычно это /orders/${orderId}/ или /orders/details/${orderId}/
      const response = await api.get(`/orders/details/${orderId}/`);
      
      console.log("✅ Order details fetched:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Error fetching order details:", err.response?.data || err.message);
      
      // Если бэкенд вернул 404, возможно ID заказа неверный или не принадлежит юзеру
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        console.log("▶ fetchOrders.fulfilled - action.payload:", action.payload);
        console.log("▶ fetchOrders.fulfilled - action.payload.results:", action.payload.results);

        state.orders = action.payload.results || [];
        state.count = action.payload.count || 0;
        state.page = action.payload.page || 1;
        state.size = action.payload.size || 10;
        
        console.log("▶ fetchOrders.fulfilled - state.orders after update:", state.orders);
        console.log("▶ fetchOrders.fulfilled - state.orders length:", state.orders.length);
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.creating = false;
        state.currentOrder = action.payload;

        state.orders = [action.payload, ...state.orders];
        state.count += 1;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentOrder } = ordersSlice.actions;

export default ordersSlice.reducer;
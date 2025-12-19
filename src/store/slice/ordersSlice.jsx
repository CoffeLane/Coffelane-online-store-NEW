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
  async (orderData, { rejectWithValue, getState, dispatch }) => {
    try {
      // Получаем токен
      const state = getState();
      let token = state.auth?.token || localStorage.getItem("access");
      let apiAuth = apiWithAuth(token);

      console.log("📦 Creating order with data:", orderData);
      console.log("🔑 Using token:", token ? "Token present" : "No token");

      // --- 1️⃣ Синхронизируем товары в корзину на сервере ---
      // Бэкенд требует, чтобы корзина существовала на сервере перед созданием заказа
      // Получаем basket_id после синхронизации для передачи в payload
      let basketId = null;
      
      if (orderData.positions && orderData.positions.length > 0) {
        console.log("🛒 Syncing items to basket on server...");
        
        // Получаем или создаем корзину
        try {
          const basketResponse = await apiAuth.get("/basket");
          basketId = basketResponse?.data?.id || null;
          console.log("✅ Basket exists on server, ID:", basketId);
        } catch (basketError) {
          if (basketError.response?.status === 401) {
            console.warn("⚠️ Token expired when getting basket, attempting to refresh...");
            
            const refreshResult = await dispatch(refreshAccessToken());
            
            if (refreshAccessToken.fulfilled.match(refreshResult)) {
              console.log("✅ Token refreshed, retrying basket request...");
              const newToken = refreshResult.payload.access;
              apiAuth = apiWithAuth(newToken);
              token = newToken;
              
              try {
                const basketResponse = await apiAuth.get("/basket");
                basketId = basketResponse?.data?.id || null;
                console.log("✅ Basket exists on server (after refresh), ID:", basketId);
              } catch (retryError) {
                console.warn("⚠️ Error getting basket after token refresh:", retryError.response?.data || retryError.message);
              }
            } else {
              console.warn("⚠️ Failed to refresh token, login required");
              return rejectWithValue({
                error: "Your session has expired. Please log in again.",
                code: "token_not_valid",
                requiresLogin: true,
              });
            }
          } else if (basketError.response?.status === 404) {
            // Корзина не найдена, создадим её при добавлении товаров
            console.log("⚠️ No active basket found, will create one when adding items");
          } else {
            console.warn("⚠️ Error getting basket:", basketError.response?.data || basketError.message);
          }
        }

        // Добавляем товары в корзину на сервере
        for (const position of orderData.positions) {
          const basketItem = {
            quantity: position.quantity || 1,
          };
          
          // Для basket API используем supply_id и accessory_id
          if (position.accessory_id) {
            basketItem.accessory_id = position.accessory_id;
          } else if (position.supply_id) {
            basketItem.supply_id = position.supply_id;
          } else {
            // Пропускаем позиции без supply_id или accessory_id
            console.warn("⚠️ Item skipped, missing supply_id or accessory_id:", position);
            continue;
          }

          try {
            await apiAuth.post("/basket/add/", basketItem);
            console.log("✅ Added item to basket:", basketItem);
          } catch (addError) {
            // Если ошибка 401, пытаемся обновить токен
            if (addError.response?.status === 401) {
              const refreshResult = await dispatch(refreshAccessToken());
              if (refreshAccessToken.fulfilled.match(refreshResult)) {
                const newToken = refreshResult.payload.access;
                apiAuth = apiWithAuth(newToken);
                token = newToken;
                try {
                  await apiAuth.post("/basket/add/", basketItem);
                  console.log("✅ Added item to basket (after refresh):", basketItem);
                } catch (retryError) {
                  console.error("❌ Error adding item to basket after refresh:", retryError.response?.data || retryError.message);
                }
              } else {
                console.error("❌ Error adding item to basket:", addError.response?.data || addError.message);
              }
            } else {
              console.error("❌ Error adding item to basket:", addError.response?.data || addError.message);
            }
          }
        }
        
        // Получаем финальный basket_id после синхронизации
        if (!basketId) {
          try {
            const finalBasketResponse = await apiAuth.get("/basket");
            basketId = finalBasketResponse?.data?.id || null;
            console.log("✅ Final basket ID after sync:", basketId);
          } catch (err) {
            console.error("❌ Error getting final basket ID:", err.response?.data || err.message);
          }
        }
        
        if (!basketId) {
          return rejectWithValue({
            error: "Could not get or create basket. Please try again.",
            message: "Basket is required to create order, but could not be obtained.",
          });
        }
        
        console.log("✅ Basket synchronized on server, basket_id:", basketId);
      }

      // --- 2️⃣ Формируем позиции заказа из orderData.positions ---
      // ВАЖНО: API ожидает поля supply или accessory (БЕЗ _id)
      // Последняя ошибка API: "Each position must have either 'supply' or 'accessory'."
      // ВАЖНО: API принимает ТОЛЬКО ОДНО из этих полей, не несколько одновременно
      const positions = (orderData.positions || [])
        .map(position => {
          const pos = { quantity: position.quantity || 1 };
          
          // API требует либо supply, либо accessory (БЕЗ _id)
          // Передаем ТОЛЬКО ОДНО из полей (приоритет: accessory > supply)
          if (position.accessory_id) {
            // Для аксессуаров: передаем accessory (без _id)
            pos.accessory = position.accessory_id;
          } else if (position.supply_id) {
            // Для продуктов: передаем supply (без _id)
            pos.supply = position.supply_id;
          } else {
            // Если нет ни одного из полей - пропускаем
            console.warn("⚠️ Position skipped: missing supply_id or accessory_id", position);
            return null;
          }
          
          // Дополнительная проверка: убеждаемся, что передается только одно поле
          const fieldCount = [pos.accessory, pos.supply].filter(Boolean).length;
          if (fieldCount !== 1) {
            console.error("❌ Position has multiple fields, this should not happen:", pos);
            return null;
          }
          
          return pos;
        })
        .filter(Boolean);

      if (positions.length === 0) {
        return rejectWithValue({
          message: "Cannot create order: no valid positions found",
          status: 400,
        });
      }

      console.log("📋 Formatted positions for API:", JSON.stringify(positions, null, 2));

      // --- 4️⃣ Формируем payload ---
      const billingDetails = orderData.billing_details || {};
      
      // Удаляем null/undefined/пустые значения из billing_details для optional полей
      // Required поля (first_name, last_name) всегда включаем
      const requiredFields = ['first_name', 'last_name'];
      const cleanBillingDetails = Object.entries(billingDetails).reduce((acc, [key, value]) => {
        // Всегда включаем required поля, даже если они пустые (валидация должна была их проверить)
        if (requiredFields.includes(key)) {
          acc[key] = value;
        } else if (value !== null && value !== undefined && value !== "") {
          // Для optional полей включаем только если есть значение
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const orderPayload = {
        billing_details: cleanBillingDetails,
        positions,
        basket_id: basketId, // Передаем basket_id, хотя бэкенд использует OneToOne связь
        // Примечание: бэкенд может требовать basket_id для валидации, даже если связь OneToOne
      };

      // Не передаем status - сервер устанавливает его автоматически
      // if (orderData.status) {
      //   orderPayload.status = orderData.status;
      // }
      
      if (orderData.order_notes) {
        orderPayload.order_notes = orderData.order_notes;
      }
      // Handle customer_data - can be an object with any string keys
      if (orderData.customer_data) {
        orderPayload.customer_data = orderData.customer_data;
      } else if (orderData.email) {
        // Backward compatibility: if email is passed separately, add it to customer_data
        orderPayload.customer_data = { email: orderData.email };
      }

      console.log("📤 Sending order payload:", JSON.stringify(orderPayload, null, 2));
      console.log("📋 Positions detail:", JSON.stringify(positions, null, 2));
      console.log("🔍 Positions validation:", positions.map(p => ({
        quantity: p.quantity,
        has_accessory: !!p.accessory,
        has_supply: !!p.supply,
        fields_count: [p.accessory, p.supply].filter(Boolean).length
      })));

      // --- 5️⃣ Отправляем заказ ---
      try {
        const response = await apiAuth.post("/orders/create", orderPayload);
        console.log("✅ Order created successfully:", response.data);
        return response.data;
      } catch (orderError) {
        // Если токен истек (401), пытаемся обновить его
        if (orderError.response?.status === 401) {
          console.warn("⚠️ Token expired when creating order, attempting to refresh...");
          
          const refreshResult = await dispatch(refreshAccessToken());
          
          if (refreshAccessToken.fulfilled.match(refreshResult)) {
            // Токен обновлен, повторяем запрос с новым токеном
            console.log("✅ Token refreshed, retrying order creation...");
            const newToken = refreshResult.payload.access;
            const newApiAuth = apiWithAuth(newToken);
            
            // Повторяем запрос с тем же payload (basket_id не требуется)
            const retryResponse = await newApiAuth.post("/orders/create", orderPayload);
            console.log("✅ Order created successfully after token refresh:", retryResponse.data);
            return retryResponse.data;
          } else {
            // Не удалось обновить токен - требуем повторный вход
            console.warn("⚠️ Failed to refresh token, login required");
            return rejectWithValue({
              error: "Your session has expired. Please log in again.",
              code: "token_not_valid",
              requiresLogin: true,
            });
          }
        }
        // Если не 401, пробрасываем ошибку дальше
        throw orderError;
      }
    } catch (err) {
      console.error("❌ Error creating order:", err.response?.data || err.message);
      console.error("❌ Full error response:", JSON.stringify(err.response?.data, null, 2));
      
      // Если это уже обработанная ошибка с requiresLogin, возвращаем её как есть
      if (err.requiresLogin) {
        return rejectWithValue(err);
      }
      
      // Формируем понятное сообщение об ошибке
      let errorMessage = "Failed to create order. Please try again.";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Обрабатываем различные форматы ошибок
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = typeof errorData.message === 'string'
            ? errorData.message
            : JSON.stringify(errorData.message);
        } else if (errorData.status && Array.isArray(errorData.status)) {
          errorMessage = `Status error: ${errorData.status.join(', ')}`;
        } else if (errorData.positions) {
          errorMessage = `Positions errors: ${JSON.stringify(errorData.positions)}`;
        } else if (errorData.billing_details) {
          errorMessage = `Billing details errors: ${JSON.stringify(errorData.billing_details)}`;
        } else {
          // Показываем все ошибки, если они есть
          const errorKeys = Object.keys(errorData);
          if (errorKeys.length > 0) {
            const errors = errorKeys.map(key => {
              const value = errorData[key];
              return `${key}: ${Array.isArray(value) ? value.join(', ') : JSON.stringify(value)}`;
            });
            errorMessage = errors.join('; ');
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return rejectWithValue({
        ...err.response?.data,
        message: errorMessage,
        status: err.response?.status,
      });
    }
  }
);


export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("access");
      const api = apiWithAuth(token);
      
      console.log("🔍 Fetching order details for ID:", orderId);
      const response = await api.get(`/orders/details/${orderId}/`);
      console.log("✅ Order details fetched:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Error fetching order details:", err.response?.data || err.message);
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
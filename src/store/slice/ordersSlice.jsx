import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiWithAuth } from "../api/axios";
import api from "../api/axios";
import { clearAuthState } from "./authSlice";

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
          console.log("▶ No orders in API response (total_items = 0), using mock data for development");
          await new Promise(resolve => setTimeout(resolve, 500));
          return { ...mockOrdersData, page, size };
        }

        if (response.data?.total_items > 0 && ordersList.length === 0) {
          console.warn("⚠️ API says there are orders (total_items > 0) but couldn't find them in response");
          console.warn("⚠️ Full response structure:", JSON.stringify(response.data, null, 2));

          return { results: [], count: response.data.total_items, page, size };
        }

        // console.warn("⚠️ Unexpected API response structure, using mock data for development");
        await new Promise(resolve => setTimeout(resolve, 500));
        return { ...mockOrdersData, page, size };
      } catch (apiError) {

        // console.warn("⚠️ API unavailable, using mock data:", apiError.response?.status || apiError.message);
        console.log("▶ API Error details:", apiError.response?.data || apiError.message);

        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log("✅ Orders fetched successfully (mock):", mockOrdersData);
        console.log("▶ Mock data structure:", {
          hasResults: !!mockOrdersData?.results,
          resultsLength: mockOrdersData?.results?.length,
          count: mockOrdersData?.count
        });
        return { ...mockOrdersData, page, size };
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
      const state = getState();
      let token = state.auth?.token || localStorage.getItem("access");
      let apiAuth = apiWithAuth(token);
      
      console.log("📦 Creating order with data:", orderData);
      console.log("🔑 Using token:", token ? "Token present" : "No token");


      let basketId = orderData.basket_id;
      
      if (!basketId && orderData.items && orderData.items.length > 0) {
        try {
          console.log("🛒 Getting active basket...");

          let basketResponse;
          try {
            basketResponse = await apiAuth.get("/basket");
          } catch (basketError) {

            if (basketError.response?.status === 401) {
              console.warn("⚠️ Token expired when getting basket, attempting to refresh...");
              const refreshToken = localStorage.getItem("refresh");
              
              if (refreshToken) {
                try {
                  const refreshResponse = await api.post("/auth/refresh", {
                    refresh: refreshToken,
                  });
                  
                  const newAccessToken = refreshResponse.data?.access;
                  if (newAccessToken) {
                    console.log("✅ Token refreshed successfully");
                    localStorage.setItem("access", newAccessToken);
                    token = newAccessToken;
                    apiAuth = apiWithAuth(newAccessToken);

                    basketResponse = await apiAuth.get("/basket");
                  } else {
                    throw new Error("No access token in refresh response");
                  }
                } catch (refreshError) {
                  console.error("❌ Token refresh failed:", refreshError.response?.data || refreshError.message);
                  localStorage.removeItem("access");
                  localStorage.removeItem("refresh");
                  dispatch(clearAuthState());
                  return rejectWithValue({
                    error: "Your session has expired. Please log in again.",
                    code: "token_not_valid",
                    requiresLogin: true,
                  });
                }
              } else {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                dispatch(clearAuthState());
                return rejectWithValue({
                  error: "Your session has expired. Please log in again.",
                  code: "token_not_valid",
                  requiresLogin: true,
                });
              }
            } else {
              throw basketError;
            }
          }
          
          if (basketResponse?.data?.id) {
            basketId = basketResponse.data.id;
            console.log(`✅ Found active basket ID: ${basketId}`);

            console.log("🛒 Adding items to basket...");
            for (const item of orderData.items) {
              try {
                const basketItem = {
                  product_id: item.product_id || null,
                  accessory_id: item.accessory_id || null,
                  supply_id: item.supply_id || null,
                  quantity: item.quantity || 1,
                };

                if (!basketItem.product_id) delete basketItem.product_id;
                if (!basketItem.accessory_id) delete basketItem.accessory_id;
                if (!basketItem.supply_id) delete basketItem.supply_id;
                
                await apiAuth.post("/basket/add/", basketItem);
                console.log(`✅ Added item to basket:`, basketItem);
              } catch (addError) {

                if (addError.response?.status === 401) {
                  console.warn("⚠️ Token expired when adding item, attempting to refresh...");
                  const refreshToken = localStorage.getItem("refresh");
                  
                  if (refreshToken) {
                    try {
                      const refreshResponse = await api.post("/auth/refresh", {
                        refresh: refreshToken,
                      });
                      
                      const newAccessToken = refreshResponse.data?.access;
                      if (newAccessToken) {
                        localStorage.setItem("access", newAccessToken);
                        token = newAccessToken;
                        apiAuth = apiWithAuth(newAccessToken);

                        await apiAuth.post("/basket/add/", basketItem);
                        console.log(`✅ Added item to basket after token refresh:`, basketItem);
                      }
                    } catch (refreshError) {
                      console.error("❌ Token refresh failed:", refreshError.response?.data || refreshError.message);
                    }
                  }
                } else {
                  console.warn("⚠️ Could not add item to basket:", addError.response?.data || addError.message);
                }
              }
            }
          } else {

            console.log("⚠️ No active basket found. Trying to add items directly...");

            const firstItem = orderData.items[0];
            const basketItem = {
              product_id: firstItem.product_id || null,
              accessory_id: firstItem.accessory_id || null,
              supply_id: firstItem.supply_id || null,
              quantity: firstItem.quantity || 1,
            };
            
            if (!basketItem.product_id) delete basketItem.product_id;
            if (!basketItem.accessory_id) delete basketItem.accessory_id;
            if (!basketItem.supply_id) delete basketItem.supply_id;
            
            try {
              const addResponse = await apiAuth.post("/basket/add/", basketItem);
              console.log("✅ Item added to basket:", addResponse.data);

              const basketResponse2 = await apiAuth.get("/basket").catch(() => null);
              if (basketResponse2?.data?.id) {
                basketId = basketResponse2.data.id;
                console.log(`✅ Basket created with ID: ${basketId}`);

                for (let i = 1; i < orderData.items.length; i++) {
                  const item = orderData.items[i];
                  const basketItem = {
                    product_id: item.product_id || null,
                    accessory_id: item.accessory_id || null,
                    supply_id: item.supply_id || null,
                    quantity: item.quantity || 1,
                  };
                  
                  if (!basketItem.product_id) delete basketItem.product_id;
                  if (!basketItem.accessory_id) delete basketItem.accessory_id;
                  if (!basketItem.supply_id) delete basketItem.supply_id;
                  
                  await apiAuth.post("/basket/add/", basketItem).catch(() => null);
                }
              }
            } catch (e) {

              if (e.response?.status === 401) {
                console.error("❌ Authentication failed when adding item to basket");
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                dispatch(clearAuthState());
                return rejectWithValue({
                  error: "Your session has expired. Please log in again.",
                  code: "token_not_valid",
                  requiresLogin: true,
                });
              }
              console.error("❌ Error adding item to basket:", e.response?.data || e.message);
            }
          }
        } catch (e) {
          console.error("❌ Error working with basket:", e.response?.data || e.message);

          if (e.response?.status === 401) {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            dispatch(clearAuthState());
            return rejectWithValue({
              error: "Your session has expired. Please log in again.",
              code: "token_not_valid",
              requiresLogin: true,
            });
          }
        }
      }
      
      if (!basketId) {
        console.error("❌ Could not get or create basket. Order creation will fail.");
        return rejectWithValue({
          error: "Could not get or create basket. Please try again.",
          message: "Basket is required to create order, but could not be obtained.",
        });
      }



      const billingDetails = {
        first_name: orderData.first_name,
        last_name: orderData.last_name,
        country: orderData.country || "Ukraine", // Country обязателен!
      };

      if (orderData.phone_number) billingDetails.phone_number = orderData.phone_number;
      if (orderData.street_name) billingDetails.street_name = orderData.street_name;
      if (orderData.region) billingDetails.region = orderData.region;
      if (orderData.state) billingDetails.state = orderData.state;
      if (orderData.zip_code) billingDetails.zip_code = orderData.zip_code;
      if (orderData.apartment_number) billingDetails.apartment_number = orderData.apartment_number;
      if (orderData.company_name) billingDetails.company_name = orderData.company_name;




      const positions = (orderData.items || []).map(item => {
        const position = {
          quantity: item.quantity || 1,
        };

        if (item.supply_id) {
          position.supply_id = item.supply_id;
        }

        else if (item.accessory_id) {
          position.accessory_id = item.accessory_id;
        }

        else if (item.product_id) {
          position.product_id = item.product_id;
        }
        
        return position;
      });
      
      const orderPayload = {
        billing_details: billingDetails,
        positions: positions,
        status: orderData.status || "processing",
      };

      orderPayload.basket_id = basketId;
      console.log("✅ Adding basket_id to order:", basketId);
console.log("🛒 Order positions:", orderPayload.positions);

      if (orderData.email) {
        orderPayload.customer_data = {
          email: orderData.email,
        };
      }
      if (orderData.order_notes) {
        orderPayload.order_notes = orderData.order_notes;
      }
      
      console.log("📤 Sending order payload:", JSON.stringify(orderPayload, null, 2));
      console.log("🛒 Positions count:", orderPayload.positions.length);
      console.log("📋 Billing details:", JSON.stringify(orderPayload.billing_details, null, 2));
      console.log("📋 Basket ID:", orderPayload.basket_id || "NOT SET");
      
      const response = await apiAuth.post("/orders/create", orderPayload);
      console.log("✅ Order created successfully:", response.data);
      console.log("📋 Order ID:", response.data.id);
      console.log("📋 Order details:", JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (err) {

      if (err.response?.status === 401) {
        console.warn("⚠️ Token expired, attempting to refresh...");
        const refreshToken = localStorage.getItem("refresh");
        
        if (refreshToken) {
          try {

            let refreshResponse;
            try {
              console.log("🔄 Trying /auth/token/refresh endpoint...");
              refreshResponse = await api.post("/auth/token/refresh", {
                refresh: refreshToken,
              });
            } catch (e1) {
              try {
                console.log("🔄 Trying /auth/refresh endpoint...");
                refreshResponse = await api.post("/auth/refresh", {
                  refresh: refreshToken,
                });
              } catch (e2) {
                console.error("❌ Both refresh endpoints failed");
                throw e2;
              }
            }
            
            const newAccessToken = refreshResponse.data?.access || refreshResponse.data?.access_token;
            if (newAccessToken) {
              console.log("✅ Token refreshed successfully");
              localStorage.setItem("access", newAccessToken);


              const apiAuth = apiWithAuth(newAccessToken);
              const retryResponse = await apiAuth.post("/orders/create", orderData);
              console.log("✅ Order created successfully after token refresh:", retryResponse.data);
              console.log("📋 Order ID:", retryResponse.data.id);
              console.log("📋 Order details:", JSON.stringify(retryResponse.data, null, 2));
              return retryResponse.data;
            } else {
              console.error("❌ No access token in refresh response:", refreshResponse.data);
            }
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError.response?.data || refreshError.message);
            console.error("❌ Refresh error status:", refreshError.response?.status);
            console.error("❌ Refresh error details:", refreshError.response?.data);
          }
        } else {
          console.warn("⚠️ No refresh token found in localStorage");
        }

        console.error("❌ Authentication failed, clearing auth state");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        dispatch(clearAuthState());
        return rejectWithValue({
          detail: "Your session has expired. Please log in again.",
          code: "token_not_valid",
          requiresLogin: true,
        });
      }
      
      console.error("❌ Error creating order:", err.response?.data || err.message);
      console.error("❌ Error status:", err.response?.status);
      console.error("❌ Full error response:", JSON.stringify(err.response?.data, null, 2));

      let errorMessage = err.message;
      const errorData = err.response?.data;
      
      if (errorData) {

        if (errorData.billing_details) {
          const billingErrors = Object.entries(errorData.billing_details)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          errorMessage = `Billing details errors: ${billingErrors}`;
        } else if (errorData.positions) {
          errorMessage = `Positions errors: ${Array.isArray(errorData.positions) ? errorData.positions.join(', ') : errorData.positions}`;
        } else if (errorData.error) {
          errorMessage = Array.isArray(errorData.error) ? errorData.error.join(', ') : errorData.error;
        } else if (errorData.detail) {
          errorMessage = Array.isArray(errorData.detail) ? errorData.detail.join(', ') : errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {

          errorMessage = JSON.stringify(errorData);
        }
      }
      
      return rejectWithValue({
        ...errorData,
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
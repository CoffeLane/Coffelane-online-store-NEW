import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiWithAuth } from "../api/axios";

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue, getState }) => {

    const state = getState();
    const tokenFromState = state.auth?.token;
    const tokenFromStorage = localStorage.getItem("access");
    const token = tokenFromState || tokenFromStorage;

    if (!token) {

      return [];
    }


    if (state.favorites.loading) {
      // console.log("fetchFavorites already loading, returning current favorites");
      return state.favorites.favorites;
    }

    if (tokenFromState && !tokenFromStorage) {
      localStorage.setItem("access", tokenFromState);
    }

    try {
      const api = apiWithAuth(tokenFromState);
      const res = await api.get("/favorites");

      // console.log("fetchFavorites API response:", res.data);
      // console.log("fetchFavorites items from server:", res.data.items);


      const items = res.data.items || [];

      // console.log("fetchFavorites items count:", items.length);

      if (items.length === 0) {
        // console.log("No favorites on server, returning empty array");
        return [];
      }

      const productsFromStore = state.products?.items || [];
      const accessoriesFromStore = state.accessories?.items || [];

      const productIds = items.filter(item => item.product).map(item => item.product);
      const accessoryIds = items.filter(item => item.accessory).map(item => item.accessory);
      const supplyIds = items.filter(item => item.supply).map(item => item.supply);

      const mappedItems = [];

      productIds.forEach(id => {
        const productFromStore = productsFromStore.find(p => p.id === id);
        if (productFromStore) {
          mappedItems.push({ ...productFromStore, type: 'product' });
        } else {

          mappedItems.push({ id, type: 'product', _needsFetch: true });
        }
      });

      accessoryIds.forEach(id => {
        const accessoryFromStore = accessoriesFromStore.find(a => a.id === id);
        if (accessoryFromStore) {
          mappedItems.push({ ...accessoryFromStore, type: 'accessory' });
        } else {

          mappedItems.push({ id, type: 'accessory', _needsFetch: true });
        }
      });

      supplyIds.forEach(id => {
        mappedItems.push({ id, type: 'supply', _needsFetch: true });
      });

      const needsFetch = mappedItems.filter(item => item._needsFetch);
      if (needsFetch.length > 0) {

        const fetchedItems = [];
        for (const item of needsFetch) {
          try {
            await new Promise(resolve => setTimeout(resolve, 100)); // Задержка 100ms между запросами
            if (item.type === 'product') {
              const res = await api.get(`/products/${item.id}`);
              fetchedItems.push({ ...res.data, type: 'product' });
            } else if (item.type === 'accessory') {
              const res = await api.get(`/accessories/${item.id}`);
              fetchedItems.push({ ...res.data, type: 'accessory' });
            }
          } catch (error) {
            // console.warn(`Failed to fetch ${item.type} ${item.id}:`, error);

          }
        }

        const finalItems = mappedItems.filter(item => !item._needsFetch).concat(fetchedItems);
        return finalItems;
      }

      return mappedItems;
    } catch (error) {

      if (error.response?.status === 401) {

        localStorage.removeItem("access");

        return [];
      }
      return rejectWithValue(error.response?.data?.detail || "Error loading favorites");
    }
  }
);

export const toggleFavoriteItem = createAsyncThunk(
  "favorites/toggleFavoriteItem",
  async ({ itemType, itemId, itemData }, { rejectWithValue, dispatch, getState }) => {
    if (!itemType || !itemId) return rejectWithValue("Item type or ID is missing");

    const state = getState();
    const toggleKey = `${itemType}-${itemId}`;

    // console.log("toggleFavoriteItem called:", { itemType, itemId, toggleKey });

    if (state.favorites.toggling[toggleKey]) {
      // console.log("Toggle already in progress, skipping");
      return rejectWithValue("Toggle already in progress");
    }

    const tokenFromState = state.auth?.token;
    const token = tokenFromState || localStorage.getItem("access");

    if (!token) {
      return rejectWithValue("User not authenticated. Please log in.");
    }

    if (tokenFromState && !localStorage.getItem("access")) {
      localStorage.setItem("access", tokenFromState);
    }

    try {
      const api = apiWithAuth(tokenFromState);
      // console.log("Sending toggle request:", { itemType, itemId });
      const response = await api.post(`/favorites/${itemType}/${itemId}/toggle/`);
      // console.log("Toggle request successful:", response.data);
      return { success: true, itemType, itemId };
    } catch (error) {

      if (error.response?.status === 429) {

        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const api = apiWithAuth(tokenFromState);
          const response = await api.post(`/favorites/${itemType}/${itemId}/toggle/`);
          // console.log("Toggle retry successful:", response.data);

          return { success: true, itemType, itemId };
        } catch (retryError) {
          return rejectWithValue("Too many requests. Please try again later.");
        }
      } else if (error.response?.status === 401) {

        localStorage.removeItem("access");
        return rejectWithValue("User not authenticated. Please log in.");
      }
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
    toggling: {},
  },
  reducers: {
    clearFavorites: (state) => {
      state.favorites = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFavorites.pending, state => { state.loading = true; })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        // console.log("fetchFavorites.fulfilled - received:", action.payload.length, "items");
        // console.log("fetchFavorites.fulfilled - items:", action.payload);
        state.favorites = action.payload;
        // console.log("fetchFavorites.fulfilled - state.favorites now has:", state.favorites.length, "items");
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleFavoriteItem.pending, (state, action) => {

        const { itemType, itemId } = action.meta.arg;
        const toggleKey = `${itemType}-${itemId}`;
        state.toggling[toggleKey] = true;

        const existingIndex = state.favorites.findIndex(item =>
          item.id == itemId || String(item.id) === String(itemId)
        );
        // console.log("toggleFavoriteItem.pending:", { itemType, itemId, existingIndex, currentFavorites: state.favorites.length });
        if (existingIndex >= 0) {

          state.favorites = state.favorites.filter(item =>
            item.id != itemId && String(item.id) !== String(itemId)
          );
          // console.log("Removed from favorites, new length:", state.favorites.length);
        } else {


          const { itemData } = action.meta.arg;
          if (itemData) {

            state.favorites.push({ ...itemData, type: itemType });
            // console.log("Added to favorites optimistically, new length:", state.favorites.length);
          } else {

            // console.log("Item not in favorites, no itemData provided, will be added after fetchFavorites");
          }
        }
      })
      .addCase(toggleFavoriteItem.fulfilled, (state, action) => {

        const { itemType, itemId } = action.meta.arg;
        const toggleKey = `${itemType}-${itemId}`;
        delete state.toggling[toggleKey];


        // console.log("toggleFavoriteItem.fulfilled:", { itemType, itemId, favoritesCount: state.favorites.length });
      })
      .addCase(toggleFavoriteItem.rejected, (state, action) => {

        const { itemType, itemId } = action.meta.arg;
        const toggleKey = `${itemType}-${itemId}`;
        delete state.toggling[toggleKey];

        // console.log("toggleFavoriteItem.rejected:", action.payload);
        state.error = action.payload;


        const existingIndex = state.favorites.findIndex(item =>
          item.id == itemId || String(item.id) === String(itemId)
        );
        if (existingIndex === -1) {



        }
      });
  }
});

export const { clearFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

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
      return state.favorites.favorites;
    }

    if (tokenFromState && !tokenFromStorage) {
      localStorage.setItem("access", tokenFromState);
    }

    try {
      // Используем apiWithAuth напрямую - интерцептор автоматически добавит токен
      const res = await apiWithAuth.get("/favorites");
      const items = res.data.items || [];

      if (items.length === 0) {
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
            await new Promise(resolve => setTimeout(resolve, 100)); 
            if (item.type === 'product') {
              const res = await apiWithAuth.get(`/products/${item.id}`);
              fetchedItems.push({ ...res.data, type: 'product' });
            } else if (item.type === 'accessory') {
              const res = await apiWithAuth.get(`/accessories/${item.id}`);
              fetchedItems.push({ ...res.data, type: 'accessory' });
            }
          } catch (error) {
            console.warn(`Failed to fetch ${item.type} ${item.id}:`, error);

          }
        }

        const finalItems = mappedItems.filter(item => !item._needsFetch).concat(fetchedItems);
        return finalItems;
      }

      return mappedItems;
    } catch (error) {
      // Интерцептор автоматически обработает 401 и попытается обновить токен
      // Если токен не может быть обновлен, интерцептор отклонит запрос
      // Здесь просто возвращаем пустой массив или ошибку
      if (error.response?.status === 401) {
        // Если после попытки рефреша все еще 401, значит сессия истекла
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

    if (state.favorites.toggling[toggleKey]) {
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
      // Используем apiWithAuth напрямую - интерцептор автоматически добавит токен
      const response = await apiWithAuth.post(`/favorites/${itemType}/${itemId}/toggle/`);
      return { success: true, itemType, itemId };
    } catch (error) {

      if (error.response?.status === 429) {

        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const response = await apiWithAuth.post(`/favorites/${itemType}/${itemId}/toggle/`);

          return { success: true, itemType, itemId };
        } catch (retryError) {
          return rejectWithValue("Too many requests. Please try again later.");
        }
      } else if (error.response?.status === 401) {
        // Интерцептор уже попытался обновить токен
        // Если все еще 401, значит сессия истекла
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
        state.favorites = action.payload;
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
        if (existingIndex >= 0) {
          state.favorites = state.favorites.filter(item =>
            item.id != itemId && String(item.id) !== String(itemId)
          );
        } else {
          const { itemData } = action.meta.arg;
          if (itemData) {
            state.favorites.push({ ...itemData, type: itemType });
          } else {
            console.log("Item not in favorites, no itemData provided, will be added after fetchFavorites");
          }
        }
      })
      .addCase(toggleFavoriteItem.fulfilled, (state, action) => {
        const { itemType, itemId } = action.meta.arg;
        const toggleKey = `${itemType}-${itemId}`;
        delete state.toggling[toggleKey];
      })
      .addCase(toggleFavoriteItem.rejected, (state, action) => {

        const { itemType, itemId } = action.meta.arg;
        const toggleKey = `${itemType}-${itemId}`;
        delete state.toggling[toggleKey];
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

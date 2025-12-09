import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const searchProducts = createAsyncThunk(
  'search/searchProducts',
  async (query, thunkAPI) => {
    try {
      if (!query || !query.trim()) {
        return { data: [], totalItems: 0 };
      }

      const searchQuery = query.trim().toLowerCase();

      const response = await api.get('/products', {
        params: {
          page: 1,
          size: 100,
        }
      });

    //   console.log('Products response:', response.data);

      let allProducts = response.data.data || [];

      const filteredProducts = allProducts.filter(product => {
        const name = product.name?.toLowerCase() || '';
        const brand = product.brand?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const sort = product.sort?.toLowerCase() || '';
        
        return name.includes(searchQuery) || 
               brand.includes(searchQuery) || 
               description.includes(searchQuery) ||
               sort.includes(searchQuery);
      });


      return {
        data: filteredProducts,
        totalItems: filteredProducts.length,
      };

    } catch (error) {
      return thunkAPI.rejectWithValue({
        message: error.response?.data?.message || 'Search failed',
        data: []
      });
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: [],
    totalItems: 0,
    loading: false,
    error: null,
    query: '',
  },
  reducers: {
    clearSearch: (state) => {
      state.results = [];
      state.totalItems = 0;
      state.query = '';
      state.error = null;
      state.loading = false;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.data;
        state.totalItems = action.payload.totalItems;
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Search failed';
        state.results = [];
        state.totalItems = 0;
      });
  },
});

export const { clearSearch, setQuery } = searchSlice.actions;
export default searchSlice.reducer;
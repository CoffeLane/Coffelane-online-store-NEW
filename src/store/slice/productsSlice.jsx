import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';
// import products from '../../mockData/products.jsx';

// // Thunk для работы с моками
// export const fetchProducts = createAsyncThunk(
//   'products/fetchProducts',
//   async ({ page = 1, limit = 9 } = {}, thunkAPI) => {
//     const startIndex = (page - 1) * limit;
//     const endIndex = startIndex + limit;
//     const currentItems = products.slice(startIndex, endIndex);

//     return {
//       data: currentItems,
//       totalItems: products.length,
//       totalPages: Math.ceil(products.length / limit),
//       currentPage: page,
//     };
//   }
// );


export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ filters = {} } = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      params.append("page", 1);
      params.append("size", 12);

      if (filters.brand && filters.brand !== "Brand") params.append("brand", filters.brand);
      if (filters.priceRange) {
        params.append("min_price", filters.priceRange[0]);
        params.append("max_price", filters.priceRange[1]);
      }
      if (filters.sort === "lowToHigh") params.append("ordering", "price");
      if (filters.sort === "highToLow") params.append("ordering", "-price");

      const firstResponse = await api.get(`/products?${params.toString()}`);
      let allProducts = firstResponse.data.data;
      const totalPages = firstResponse.data.total_pages;

      if (totalPages > 1) {
        const requests = [];
        for (let p = 2; p <= totalPages; p++) {
          params.set("page", p);
          requests.push(api.get(`/products?${params.toString()}`));
        }
        const responses = await Promise.all(requests);
        responses.forEach((res, index) => {
          allProducts = allProducts.concat(res.data.data);
        });
      }

      // Roast filter
      if (filters.roast && filters.roast.length) {
        allProducts = allProducts.filter(p => filters.roast.includes(p.roast));
      }

      // Caffeine filter
      if (filters.caffeine && filters.caffeine.length) {
        allProducts = allProducts.filter(p => filters.caffeine.includes(p.caffeine_type));
      }

      // Bean filter
      if (filters.bean && filters.bean.length) {allProducts = allProducts.filter(p => 
        filters.bean.some(f => p.sort?.toLowerCase().includes(f.toLowerCase())));
      }

      // Grind filter
      if (filters.grind && filters.grind.length) {
        console.log("Applying grind filter:", filters.grind);
        allProducts = allProducts.filter(p => {
          const servingTypes = p.supplies.map(s => s.serving_type);
          return filters.grind.some(g => servingTypes.includes(g));
        });
      }

      // Price filter
      if (filters.priceRange) {
        allProducts = allProducts.filter(p => {
          const price = parseFloat(p.supplies[0]?.price || 0);
          return price >= filters.priceRange[0] && price <= filters.priceRange[1];
        });
      }

      if (filters.sort === "lowToHigh" || filters.sort === "highToLow") {
        allProducts = allProducts.sort((a, b) => {
          const aPrice = parseFloat(a.supplies[0]?.price || 0);
          const bPrice = parseFloat(b.supplies[0]?.price || 0);
          return filters.sort === "lowToHigh" ? aPrice - bPrice : bPrice - aPrice;
        });
      }

      return {
        data: allProducts,
        totalItems: allProducts.length,
        totalPages: Math.ceil(allProducts.length / 12),
        currentPage: 1,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return thunkAPI.rejectWithValue(error.response?.data || "Error");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    selectedProduct: null,
    loading: false,
    error: null,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.hasNextPage = action.payload.hasNextPage;
        state.hasPreviousPage = action.payload.hasPreviousPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.selectedProduct = null;
      });
  },
});

export default productsSlice.reducer;
import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import api from "../api/axios";

export const searchProducts = createAsyncThunk("search/searchProducts", async (query, thunkAPI) => {
 try {
  if (!query || !query.trim()) {
   return {data: [], totalItems: 0};
  }

  const searchQuery = query.trim().toLowerCase();

  const response = await api.get("/products", {
   params: {
    page: 1,
    size: 100,
   },
  });

  //   console.log('Products response:', response.data);

  let allProducts = response.data.data || [];

  const filteredProducts = allProducts.filter((product) => {
   const name = product.name?.toLowerCase() || "";
   const brand = product.brand?.toLowerCase() || "";
   const description = product.description?.toLowerCase() || "";
   const sort = product.sort?.toLowerCase() || "";

   return (
    name.includes(searchQuery) ||
    brand.includes(searchQuery) ||
    description.includes(searchQuery) ||
    sort.includes(searchQuery)
   );
  });

  return {
   data: filteredProducts,
   totalItems: filteredProducts.length,
  };
 } catch (error) {
  return thunkAPI.rejectWithValue({
   message: error.response?.data?.message || "Search failed",
   data: [],
  });
 }
});
export const searchAccessories = createAsyncThunk("search/searchAccessories", async (query, thunkAPI) => {
 try {
  if (!query || !query.trim()) {
   return {data: [], totalItems: 0};
  }

  const searchQuery = query.trim().toLowerCase();

  const response = await api.get("/accessories", {
   params: {
    page: 1,
    size: 100,
   },
  });

  let allAccessories = response.data.data || [];

  const filteredAccessories = allAccessories.filter((accessory) => {
   const name = accessory.name?.toLowerCase() || "";
   const brand = accessory.brand?.toLowerCase() || "";
   const description = accessory.description?.toLowerCase() || "";
   const category = accessory.category?.toLowerCase() || "";

   return (
    name.includes(searchQuery) ||
    brand.includes(searchQuery) ||
    description.includes(searchQuery) ||
    category.includes(searchQuery)
   );
  });

  return {
   data: filteredAccessories,
   totalItems: filteredAccessories.length,
  };
 } catch (error) {
  return thunkAPI.rejectWithValue({
   message: error.response?.data?.message || "Accessories search failed",
   data: [],
  });
 }
});

export const searchAll = createAsyncThunk("search/searchAll", async (query, thunkAPI) => {
 try {
  if (!query || !query.trim()) {
   return {
    products: [],
    accessories: [],
    totalItems: 0,
   };
  }

  const searchQuery = query.trim().toLowerCase();

  // Паралельні запити
  const [productsResponse, accessoriesResponse] = await Promise.all([
   api.get("/products", {params: {page: 1, size: 100}}),
   api.get("/accessories", {params: {page: 1, size: 100}}),
  ]);

  let allProducts = productsResponse.data.data || [];
  let allAccessories = accessoriesResponse.data.data || [];

  // Фільтрація продуктів
  const filteredProducts = allProducts.filter((product) => {
   const name = product.name?.toLowerCase() || "";
   const brand = product.brand?.toLowerCase() || "";
   const description = product.description?.toLowerCase() || "";
   const sort = product.sort?.toLowerCase() || "";

   return (
    name.includes(searchQuery) ||
    brand.includes(searchQuery) ||
    description.includes(searchQuery) ||
    sort.includes(searchQuery)
   );
  });

  // Фільтрація аксесуарів
  const filteredAccessories = allAccessories.filter((accessory) => {
   const name = accessory.name?.toLowerCase() || "";
   const brand = accessory.brand?.toLowerCase() || "";
   const description = accessory.description?.toLowerCase() || "";
   const category = accessory.category?.toLowerCase() || "";

   return (
    name.includes(searchQuery) ||
    brand.includes(searchQuery) ||
    description.includes(searchQuery) ||
    category.includes(searchQuery)
   );
  });

  return {
   products: filteredProducts,
   accessories: filteredAccessories,
   totalItems: filteredProducts.length + filteredAccessories.length,
  };
 } catch (error) {
  return thunkAPI.rejectWithValue({
   message: error.response?.data?.message || "Search failed",
   products: [],
   accessories: [],
  });
 }
});

const searchSlice = createSlice({
 name: "search",
 initialState: {
  results: [],
  products: [],
  accessories: [],
  totalItems: 0,
  loading: false,
  error: null,
  query: "",
 },
 reducers: {
  clearSearch: (state) => {
   state.results = [];
   state.products = [];
   state.accessories = [];
   state.totalItems = 0;
   state.query = "";
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
    state.products = action.payload.data;
    state.totalItems = action.payload.totalItems;
    state.error = null;
   })
   .addCase(searchProducts.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload?.message || "Search failed";
    state.results = [];
    state.products = [];
    state.totalItems = 0;
   })

   .addCase(searchAccessories.pending, (state) => {
    state.loading = true;
    state.error = null;
   })
   .addCase(searchAccessories.fulfilled, (state, action) => {
    state.loading = false;
    state.results = action.payload.data;
    state.accessories = action.payload.data;
    state.totalItems = action.payload.totalItems;
    state.error = null;
   })
   .addCase(searchAccessories.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload?.message || "Accessories search failed";
    state.results = [];
    state.accessories = [];
    state.totalItems = 0;
   })

   .addCase(searchAll.pending, (state) => {
    state.loading = true;
    state.error = null;
   })
   .addCase(searchAll.fulfilled, (state, action) => {
    state.loading = false;
    state.products = action.payload.products;
    state.accessories = action.payload.accessories;
    state.results = [...action.payload.products, ...action.payload.accessories];
    state.totalItems = action.payload.totalItems;
    state.error = null;
   })
   .addCase(searchAll.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload?.message || "Search failed";
    state.results = [];
    state.products = [];
    state.accessories = [];
    state.totalItems = 0;
   });
 },
});

export const {clearSearch, setQuery} = searchSlice.actions;
export default searchSlice.reducer;

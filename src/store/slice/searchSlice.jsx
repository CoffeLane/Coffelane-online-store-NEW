import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import api from "../api/axios";

const filterItems = (items, query, extraFields = []) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return items.filter((item) => {
    
    const fieldsToSearch = [
      item.name, 
      item.brand, 
      item.title, 
      ...extraFields.map(f => item[f])
    ].filter(Boolean); 

    return fieldsToSearch.some(fieldValue => {
      const words = fieldValue.toLowerCase().split(/\s+/); 
      return words.some(word => word.startsWith(q)); 
    });
  });
};


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

    // console.log('Products response:', response.data);

  const allProducts = response.data.data || [];

  const filtered = filterItems(allProducts, query, ["sort"]);

  return {
   data: filtered,
   totalItems: filtered.length,
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

  // const searchQuery = query.trim().toLowerCase();

  const response = await api.get("/accessories", {
   params: {
    page: 1,
    size: 100,
   },
  });

  const allAccessories = response.data.data || [];
  const filtered = filterItems(allAccessories, query, ["category"]);

  return {
   data: filtered,
   totalItems: filtered.length,
  };
 } catch (error) {
  return thunkAPI.rejectWithValue({
   message: error.response?.data?.message || "Accessories search failed",
   data: [],
  });
 }
});

export const searchAll = createAsyncThunk(
  "search/searchAll",
  async (query, thunkAPI) => {
    try {
      if (!query?.trim()) return { products: [], accessories: [], totalItems: 0 };

      const [pRes, aRes] = await Promise.all([
        api.get("/products", { params: { page: 1, size: 100 } }),
        api.get("/accessories", { params: { page: 1, size: 100 } }),
      ]);

      const getArray = (res) => {
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.data?.data)) return res.data.data;
        if (Array.isArray(res.data?.products)) return res.data.products;
        return [];
      };

      const products = getArray(pRes);
      const accessories = getArray(aRes);

      const filteredProducts = filterItems(products, query, ["sort"]);
      const filteredAccessories = filterItems(accessories, query, ["category"]);

      return {
        products: filteredProducts,
        accessories: filteredAccessories,
        totalItems: filteredProducts.length + filteredAccessories.length,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: "Search failed" });
    }
  }
);

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

import { createSlice, createSelector } from "@reduxjs/toolkit";
import { getPrice, getProductPrice } from "../../components/utils/priceUtils.jsx";

const initialState = {
  items: {},          // { [key]: { product, quantity } }
  orderCompleted: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      if (!product) return;

      const supplies = product.supplies || [];
      const supply =
        supplies.find((s) => s.id === product.selectedSupplyId) || supplies[0];

      const productWithPrice = supply
        ? { ...product, price: Number(supply.price) || 0, selectedSupplyId: supply.id }
        : { ...product, price: Number(product.price) || 0 };

      const newKey = supply ? `${product.id}-${supply.id}` : `${product.id}`;

      if (state.items[newKey]) {
        state.items[newKey].quantity += quantity;
        state.items[newKey].product = productWithPrice;
      } else {
        state.items[newKey] = { product: productWithPrice, quantity };
      }

      state.items = { ...state.items };
      state.orderCompleted = false;
    },

    decrementQuantity: (state, action) => {
      const key = action.payload;
      if (!state.items[key]) return;

      if (state.items[key].quantity > 1) {
        state.items[key].quantity -= 1;
      } else {
        delete state.items[key];
      }
    },

    removeFromCart: (state, action) => {
      delete state.items[action.payload];
    },

    clearCart: (state) => {
      state.items = {};
    },

    completeOrder: (state) => {
      state.items = {};
      state.orderCompleted = true;
    },

    resetOrderStatus: (state) => {
      state.orderCompleted = false;
    },
  },
});

export const selectCartItems = createSelector(
  (state) => state.cart.items || {},
  (items) => Object.entries(items)
);

export const selectCartCount = createSelector(
  selectCartItems,
  (items) => items.reduce((sum, [, item]) => sum + (item?.quantity || 0), 0)
);

export const selectCartTotal = createSelector(
  (state) => state.cart.items || {},
  (state) => state.settings.currency,
  (items, currency) =>
    Object.entries(items).reduce((sum, [, item]) => {
      const product = item?.product || {};
      const quantity = item?.quantity || 0;
      const supplies = product.supplies || [];
      const selectedSupply = supplies.find((s) => s.id === product.selectedSupplyId);
      const unitPrice = selectedSupply
        ? getPrice(selectedSupply, currency)
        : getProductPrice(product, currency);
      return sum + unitPrice * quantity;
    }, 0)
);

export const { addToCart, decrementQuantity, removeFromCart, clearCart, completeOrder, resetOrderStatus} = cartSlice.actions;

export default cartSlice.reducer;

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import productsReducer from './slice/productsSlice';
import cartReducer from './slice/cartSlice';
import profileReducer from "./slice/profileSlice";
import authReducer from './slice/authSlice';
import ordersReducer from './slice/ordersSlice';
import accessoriesReducer from './slice/accessoriesSlice';
import favoritesReducer from "./slice/favoritesSlice";
import searchReducer from './slice/searchSlice';
import basketReducer from './slice/basketSlice';

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'token', 'profile', 'isAdmin'],
};
const cartPersistConfig = { key: 'cart', storage };
const productsPersistConfig = { key: 'products', storage };
const favoritesPersistConfig = { key: 'favorites', storage };

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    profile: profileReducer,
    orders: ordersReducer,
    accessories: accessoriesReducer,
    favorites: persistReducer(favoritesPersistConfig, favoritesReducer),
    cart: persistReducer(cartPersistConfig, cartReducer),
    products: persistReducer(productsPersistConfig, productsReducer),
    search: searchReducer,
    basket: basketReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);


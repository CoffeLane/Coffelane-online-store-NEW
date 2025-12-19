import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { fetchProfile, setAdminMode, refreshAccessToken, tokenRefreshedFromInterceptor } from './store/slice/authSlice.jsx';
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header/index.jsx';
import Footer from './components/Footer/index.jsx';
import Layout from './components/Layout/Layout.jsx';
import CoffeePage from './pages/CatalogCoffeePage.jsx';
import AccessoriesPage from './pages/AccessoriesPage.jsx';
import AccessoriesCardPage from './pages/AccessoriesCardPage.jsx';
import OurStoryPage from './pages/OurStoryPage.jsx';
import FavouritePage from './pages/FavouritePage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import ScrollToTop from './components/ScrollToTop/ScrollToTop.jsx';
import ProductCardPage from './pages/ProductCardPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderSuccessfulPage from './pages/OrderSuccessfulPage.jsx';
import AdminLayout from './admin/AdminLayout/AdminLayout.jsx';
import AdminRoute from './admin/AdminLayout/AdminRoute.jsx';
import Dashboard from './admin/Pages/Dashboard.jsx';
import Products from './admin/Pages/Products.jsx';
import ProductAdd from './admin/Pages/ProductAdd.jsx';
import ProductEdit from './admin/Pages/ProductEdit.jsx';
import Orders from './admin/Pages/Orders.jsx';
import MyAccount from './admin/Pages/MyAccountAdmin.jsx';
import LoginModalWrapper from './components/Modal/LoginModalWrapper.jsx';


const ADMIN_EMAILS = [
  'admin@coffeelane.com',
  'admin@example.com',
];


function App() {
  const dispatch = useDispatch();
  const { user, token, loading, tokenInvalid, isAdmin, email } = useSelector(state => state.auth);

  useEffect(() => {
    const handleTokenRefreshed = (event) => {
      const { access } = event.detail;
      dispatch(tokenRefreshedFromInterceptor({ access }));
    };

    window.addEventListener('tokenRefreshed', handleTokenRefreshed);
    return () => window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
  }, [dispatch]);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("access");

    if (token && !tokenFromStorage) {
      localStorage.setItem("access", token);
    }
  }, [token]);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("access");
    const currentToken = token || tokenFromStorage;
    if (currentToken && !user && !loading) {
      dispatch(fetchProfile());
    }
  }, [dispatch, token, user, loading]);

 
  useEffect(() => {
    if (user) {
      const userEmail = email || user.email;
      const isAdminEmail = userEmail ? ADMIN_EMAILS.some(adminEmail => 
        userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()
      ) : false;
      const isAdminRole = user.role === 'admin' || user.role === 'Administrator';
      
      if ((isAdminEmail || isAdminRole) && !isAdmin) {
        dispatch(setAdminMode(true));
      }
    }
  }, [user, email, isAdmin, dispatch]);

  useEffect(() => {
    if (!user || !token) return;

    const refreshInterval = setInterval(() => {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        dispatch(refreshAccessToken());
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user, token, dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={
          <>
            <Header />
            <HomePage />
            <Footer />
          </>
        } />

        <Route element={<Layout />}>
          <Route path="/coffee" element={<CoffeePage />} />
          <Route path="/coffee/product/:id" element={<ProductCardPage />} />
          <Route path="/checkout" element={<CheckoutPage/>} />
          <Route path="/order_successful" element={<OrderSuccessfulPage />} />
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/accessories/product/:id" element={<AccessoriesCardPage />} />
          <Route path="/ourStory" element={<OurStoryPage />} />
          <Route path="/favourite" element={<FavouritePage />} />
          <Route path="/account" element={<Navigate to="/account/personal-info" replace />} />
          <Route path="/account/:tab" element={<AccountPage />} />
          <Route path="recovery_password/:token" element={<LoginModalWrapper />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<ProductAdd />} />
          <Route path="products/edit/:id" element={<ProductEdit />} />
          <Route path="orders" element={<Orders />} />
          <Route path="account" element={<MyAccount />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

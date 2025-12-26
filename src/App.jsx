import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

// Список админских email (должен совпадать с authSlice)
const ADMIN_EMAILS = [
  'admin@coffeelane.com',
  'admin@example.com',
  // Добавьте сюда другие админские email
];

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
import { setTokens, fetchProfile, refreshAccessToken, setAdminMode } from "./store/slice/authSlice";

function App() {
  const dispatch = useDispatch();
  // Достаем error из стора
  const { user, token, loading, error, isAdmin, email } = useSelector(state => state.auth);

  useEffect(() => {
    const handleRefreshed = (e) => {
      const { access, refresh } = e.detail;
      dispatch(setTokens({ access, refresh }));
    };
    window.addEventListener('tokenRefreshed', handleRefreshed);
    return () => window.removeEventListener('tokenRefreshed', handleRefreshed);
  }, [dispatch]);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("access"); // или логика через getCleanToken
    const currentToken = token || tokenFromStorage;

    // ИСПРАВЛЕНО: Добавлено условие !error
    if (currentToken && !user && !loading && !error) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user, loading, token, error]);
  
  // 3. ПРОВЕРКА РОЛИ АДМИНА
  useEffect(() => {
    if (user && !isAdmin) {
      const userEmail = email || user.email;
      const isAdminEmail = userEmail ? ADMIN_EMAILS.some(e => userEmail.toLowerCase() === e.toLowerCase()) : false;
      const isAdminRole = user.role === 'admin';

      if (isAdminEmail || isAdminRole) {
        dispatch(setAdminMode(true));
      }
    }
  }, [user, isAdmin, dispatch]);

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
          <Route path="/checkout" element={<CheckoutPage />} />
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

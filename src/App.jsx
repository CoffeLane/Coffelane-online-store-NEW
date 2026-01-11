import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
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
import ScrollToTopButton from './components/ScrollToTopButton/ScrollToTopButton.jsx';
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
import OrderEdit from './admin/Pages/OrderEdit.jsx';
import MyAccount from './admin/Pages/MyAccountAdmin.jsx';
import LoginModalWrapper from './components/Modal/LoginModalWrapper.jsx';
import { tokenRefreshedFromInterceptor, fetchProfile, setAdminMode, clearAuthState } from "./store/slice/authSlice";
import { jwtDecode } from "jwt-decode";



const ADMIN_EMAILS = [
  'admin@coffeelane.com',
  'admin@example.com',
];


function App() {

  const dispatch = useDispatch();
  const { user, token, loading, error, isAdmin, email } = useSelector(state => state.auth);

  useEffect(() => {
    const logoutFlag = sessionStorage.getItem("logoutFlag");
    if (logoutFlag === "true") {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("persist:auth");
      localStorage.removeItem("persist:cart");
      localStorage.removeItem("persist:favorites");
      localStorage.removeItem("persist:products");
      localStorage.removeItem("persist:basket");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("avatarUploaded");
      sessionStorage.removeItem("logoutFlag");
      dispatch(clearAuthState());
    }

    const checkRefreshTokenValidity = () => {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        return;
      }

      try {
        const cleanToken = refreshToken.replace(/^"+|"+$/g, '');
        const decoded = jwtDecode(cleanToken);
        const expirationTime = decoded.exp * 1000;
        const timeUntilExpiration = expirationTime - Date.now();
        const daysLeft = Math.floor(timeUntilExpiration / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((timeUntilExpiration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (timeUntilExpiration <= 0) {
          console.error(`Refresh token истек! Истек: ${new Date(expirationTime).toLocaleString()}`);
          console.error(`You need to log in again.`);
        } else {
        //   console.log(`✅ Refresh token валиден еще ${daysLeft} дней, ${hoursLeft} часов`);
        //   console.log(`✅ Истекает: ${new Date(expirationTime).toLocaleString()}`);
        }
      } catch (error) {
        console.warn("Unable to verify refresh token expiration date.:", error);
      }
    };

    checkRefreshTokenValidity();

    const handleRefreshed = (e) => {
      const { access, refresh } = e.detail;
      dispatch(tokenRefreshedFromInterceptor({ access, refresh }));
    };
    const handleTokenExpired = () => {
      dispatch(clearAuthState());
    };
    window.addEventListener('tokenRefreshed', handleRefreshed);
    window.addEventListener('tokenExpired', handleTokenExpired);
    return () => {
      window.removeEventListener('tokenRefreshed', handleRefreshed);
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, [dispatch]);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("access");
    const currentToken = token || tokenFromStorage;
    if (currentToken && !user && !loading && !error) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user, token, loading, error]);


  useEffect(() => {
    if (user) {
      const userEmail = email || user.email;
      if (!userEmail) return;

      const isAdminEmail = ADMIN_EMAILS.some(e => userEmail.toLowerCase() === e.toLowerCase());
      const isAdminRole = user.role === 'admin';
      const shouldBeAdmin = isAdminEmail || isAdminRole;

      if (shouldBeAdmin !== isAdmin) {
        dispatch(setAdminMode(shouldBeAdmin));
      }
    }
  }, [user, isAdmin, email, dispatch]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={
          <>
            <Header />
            <HomePage />
            <Footer />
            <ScrollToTopButton />
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
          <Route path="orders/edit/:id" element={<OrderEdit />} />
          <Route path="account" element={<MyAccount />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

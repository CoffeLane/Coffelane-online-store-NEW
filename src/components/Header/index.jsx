import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import debounce from "lodash/debounce";
import {
  Box, IconButton, Typography, Badge, Tooltip, Alert, Drawer,
  Button, Container, InputBase, Fade
} from "@mui/material";
import {
  Menu as MenuIcon, Close as CloseIcon, 
  AdminPanelSettings as SettingsIcon,
  FavoriteBorderOutlined as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import logo from "../../assets/images/header/logo.svg";
import accountIcon from "../../assets/icons/account.svg";
import cartIcon from "../../assets/icons/shopping-cart.svg";
import TopLine from "../TopLine";
import Navbar from "../Navbar";
import { CurrencySwitcher } from "../CurrencySwitcher.jsx";
import SearchDropdown from "../SearchDropdown";
import LoginModal from "../../components/Modal/LoginModal.jsx";
import BasketModal from "../../components/Modal/BasketModal.jsx";
import EmptyCartModal from "../../components/Modal/EmptyCartModal.jsx";
import { selectCartCount, selectCartItems, addToCart, decrementQuantity, removeFromCart } from "../../store/slice/cartSlice.jsx";
import { searchAll, clearSearch } from "../../store/slice/searchSlice.jsx";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Coffee", path: "/coffee" },
  { label: "Accessories", path: "/accessories" },
  { label: "Our Story", path: "/ourStory" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- States ---
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [, setModalParams] = useState({ initialScreen: null, recoveryToken: null });

  // --- Selectors ---
  const { user, isAdmin } = useSelector((state) => state.auth);
  const { results, loading } = useSelector((state) => state.search);
  const cartCount = useSelector(selectCartCount);
  const cartItems = useSelector(selectCartItems);
  const orderCompleted = useSelector((state) => state.cart.orderCompleted);
  const favoritesCount = useSelector((state) => state.favorites.favorites?.length || 0);

  // --- Logic: Cart Data Preparation ---
  const basketItems = useMemo(() => cartItems.map(([key, item]) => ({
    id: key,
    name: item.product?.name || "Unknown Product",
    price: Number(item.product?.price) || 0,
    qty: item.quantity || 1,
    img: item.product?.photos_url?.[0]?.url || item.product?.image || null,
    product: item.product
  })), [cartItems]);

  // --- Handlers ---
  const handleAccountClick = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    navigate(isAdmin ? "/admin/account" : "/account/personal-info");
  };

  const debouncedSearchRef = useRef(
    debounce((val) => dispatch(searchAll(val)), 300)
  );

  useEffect(() => {
    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    val.trim() ? debouncedSearchRef.current(val) : dispatch(clearSearch());
  };

  const closeSearch = () => {
    setShowSearch(false);
    setSearchInput("");
    dispatch(clearSearch());
  };

  const handleQtyChange = (id, newQty) => {
    const item = cartItems.find(([key]) => key === id)?.[1];
    if (!item) return;

    if (newQty <= 0) {
      dispatch(removeFromCart(id));
    } else {
      const diff = newQty - item.quantity;
      diff < 0 
        ? Array.from({ length: Math.abs(diff) }).forEach(() => dispatch(decrementQuantity(id)))
        : dispatch(addToCart({ product: item.product, quantity: diff }));
    }
  };

  // --- Effects ---
  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    if (params.login === "true") {
      setModalParams({ initialScreen: params.screen, recoveryToken: params.token });
      setIsLoginModalOpen(true);
      setSearchParams({});
    }
    if (params.message === "password-reset-success" || params.error === "invalid-recovery-link") {
      setAlert({
        show: true,
        type: params.error ? "error" : "success",
        message: params.error ? "Invalid recovery link." : "Password reset successfully!"
      });
      setSearchParams({});
      const timer = setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  // --- Shared Styles ---
  const iconBtnStyle = { color: "#3E3027", p: { xs: 0.5, md: 1 } };

  return (
    <Box component="header" sx={{ flexGrow: 1, position: "relative" }}>
      <TopLine />
      
      {/* Global Alerts */}
      <Fade in={alert.show}>
        <Alert 
          severity={alert.type || "info"} 
          onClose={() => setAlert({ ...alert, show: false })}
          sx={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, width: "auto" }}
        >
          {alert.message}
        </Alert>
      </Fade>

      {/* Main Header Bar */}
      <Box sx={{ backgroundColor: "#EAD9C9", height: { xs: "60px", md: "83px" }, display: "flex", alignItems: "center" }}>
        <Container maxWidth="xl" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          {/* Mobile Menu Toggle */}
          <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ ...iconBtnStyle, display: { md: "none" } }}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Link to="/" style={{ display: "flex" }}>
            <Box component="img" src={logo} alt="Logo" sx={{ width: { xs: "100px", md: "144px" }, height: "auto" }} />
          </Link>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Navbar />
          </Box>

          {/* Actions Group */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 2 } }}>
            <IconButton onClick={() => setShowSearch(true)} sx={iconBtnStyle}>
              <Box component="img" src={cartIcon} alt="" sx={{ width: 24, display: 'none' }} /> {/* Placeholder logic */}
              <SearchIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
            </IconButton>

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <CurrencySwitcher />
            </Box>

            <IconButton onClick={() => user ? navigate("/favourite") : setIsLoginModalOpen(true)} sx={iconBtnStyle}>
              <Badge badgeContent={favoritesCount} color="error" sx={{ "& .MuiBadge-badge": { bgcolor: "#16675C" } }}>
                {favoritesCount > 0 ? <FavoriteIcon sx={{ color: "red" }} /> : <FavoriteBorderIcon />}
              </Badge>
            </IconButton>

            <IconButton onClick={handleAccountClick} sx={iconBtnStyle}>
              <Box component="img" src={accountIcon} sx={{ width: { xs: 20, md: 24 } }} alt="Account" />
            </IconButton>

            {!orderCompleted && (
              <IconButton onClick={() => setIsCartModalOpen(true)} sx={iconBtnStyle}>
                <Badge badgeContent={cartCount} sx={{ "& .MuiBadge-badge": { bgcolor: "#16675C", color: "white" } }}>
                  <Box component="img" src={cartIcon} sx={{ width: { xs: 20, md: 24 } }} alt="Cart" />
                </Badge>
              </IconButton>
            )}

            {user && isAdmin && (
              <Tooltip title="Admin Panel">
                <IconButton onClick={() => navigate("/admin")} sx={{ color: "#16675C" }}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Container>
      </Box>

      {/* --- Overlay Search --- */}
      {showSearch && (
        <Box 
          sx={{ position: "fixed", inset: 0, zIndex: 3000, bgcolor: "rgba(0,0,0,0.7)", pt: 4, px: 2 }}
          onClick={closeSearch}
        >
          <Box 
            sx={{ maxWidth: "800px", mx: "auto", bgcolor: "white", borderRadius: 2, overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, borderBottom: "1px solid #eee" }}>
              <SearchIcon color="action" />
              <InputBase
                autoFocus
                fullWidth
                placeholder="Search products..."
                value={searchInput}
                onChange={handleSearchChange}
                sx={{ fontSize: "1.1rem" }}
              />
              <IconButton onClick={closeSearch} size="small"><CloseIcon /></IconButton>
            </Box>
            <SearchDropdown results={results} loading={loading} query={searchInput} onClose={closeSearch} />
          </Box>
        </Box>
      )}

      {/* --- Mobile Drawer --- */}
      <Drawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 280, bgcolor: "#EAD9C9", height: "100%", p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
            <img src={logo} alt="Logo" width="120" />
            <IconButton onClick={() => setMobileMenuOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.path}
                component={NavLink}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                sx={{ 
                  justifyContent: "flex-start", color: "#3E3027", textTransform: "none", fontSize: 16,
                  "&.active": { color: "#B88A6E", fontWeight: 700 }
                }}
              >
                {link.label}
              </Button>
            ))}
            <hr style={{ border: "0.5px solid #dcc9b9", margin: "10px 0" }} />
            <Button onClick={handleAccountClick} sx={{ justifyContent: "flex-start", color: "#3E3027", textTransform: "none" }}>
              Account
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* --- Modals --- */}
      <LoginModal open={isLoginModalOpen} handleClose={() => setIsLoginModalOpen(false)} returnPath={location.pathname} />
      
      {basketItems.length > 0 ? (
        <BasketModal 
          open={isCartModalOpen} 
          onClose={() => setIsCartModalOpen(false)} 
          items={basketItems}
          onChangeQty={handleQtyChange}
          onRemove={(id) => dispatch(removeFromCart(id))}
          onCheckout={() => navigate("/checkout")}
        />
      ) : (
        <EmptyCartModal open={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} />
      )}
    </Box>
  );
};

export default Header;
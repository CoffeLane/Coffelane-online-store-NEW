import React, { useEffect, useState } from 'react';
import logo from '../../assets/images/header/logo.svg';
import { Box, Button, Grid, Tooltip, IconButton, Alert } from '@mui/material';
import account from '../../assets/icons/account.svg';
import ShoppingCart from '../../assets/icons/shopping-cart.svg';
import Search from '../../assets/icons/search-icon.svg';
import TopLine from '../TopLine/index.jsx';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/index.jsx';
import LoginModal from "../../components/Modal/LoginModal.jsx";
import BasketModal from "../../components/Modal/BasketModal.jsx";
import EmptyCartModal from "../../components/Modal/EmptyCartModal.jsx";

import { useSelector, useDispatch } from "react-redux";
import { selectCartCount, selectCartItems, addToCart, decrementQuantity, removeFromCart } from "../../store/slice/cartSlice.jsx";
import SettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { searchProducts, clearSearch, setQuery } from "../../store/slice/searchSlice.jsx";
import SearchDropdown from "../SearchDropdown/index.jsx";


function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [messageType, setMessageType] = useState('');
    const [modalParams, setModalParams] = useState({ initialScreen: null, recoveryToken: null });
    const [returnPath, setReturnPath] = useState(null); // Сохраняем путь, откуда открыли модалку
    const cartCount = useSelector(selectCartCount);
    const cartItems = useSelector(selectCartItems);
    const orderCompleted = useSelector((state) => state.cart.orderCompleted);

    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const { results, loading } = useSelector(state => state.search);

    const user = useSelector((state) => state.auth.user);
    const isAdmin = useSelector((state) => state.auth.isAdmin);
    // console.log("Header - user:", useSelector((state) => state.auth.user));
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchInput.trim()) {
                // console.log(' Dispatching search for:', searchInput);
                dispatch(searchProducts(searchInput));
                setShowSearchDropdown(true);
            } else {
                dispatch(clearSearch());
                setShowSearchDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchInput, dispatch]);


    useEffect(() => {
        // console.log("Header updated:", { user });
    }, [user])

    const handleAccountClick = () => {
        if (user) {
            // Если пользователь админ, ведем на админскую страницу аккаунта
            if (isAdmin) {
                navigate('/admin/account');
            } else {
                navigate('/account/personal-info');
            }
        } else {
            setReturnPath(location.pathname);
            setIsLoginModalOpen(true);
        }
    };

    const handleOpenLoginModal = () => {
        setIsLoginModalOpen(true);
    }
    const handleCloseLoginModal = () => {
        setIsLoginModalOpen(false);

        setModalParams({ initialScreen: null, recoveryToken: null });

        setReturnPath(null);
    };

    const handleOpenCartModal = () => {
        setIsCartModalOpen(true);
    };

    const handleCloseCartModal = () => {
        setIsCartModalOpen(false);
    };

    const basketItems = cartItems.map(([key, item]) => {
        const product = item.product;
        const photoUrl = product?.photos_url?.[0]?.url || product?.image || "";
        return {
            id: key,
            name: product?.name || "Unknown Product",
            price: Number(product?.price) || 0,
            qty: item.quantity || 1,
            img: photoUrl,
        };
    });

    const handleChangeQty = (id, newQty) => {
        if (newQty <= 0) {
            dispatch(removeFromCart(id));
        } else {
            const currentItem = cartItems.find(([key]) => key === id);
            if (currentItem) {
                const [, item] = currentItem;
                const currentQty = item.quantity;
                const diff = newQty - currentQty;
                
                if (diff < 0) {

                    for (let i = 0; i < Math.abs(diff); i++) {
                        dispatch(decrementQuantity(id));
                    }
                } else if (diff > 0) {

                    dispatch(addToCart({
                        product: item.product,
                        quantity: diff,
                    }));
                }
            }
        }
    };

    const handleRemoveItem = (id) => {
        dispatch(removeFromCart(id));
    };

    const handleCheckout = () => {
        navigate("/checkout");
    };

    useEffect(() => {
        const loginParam = searchParams.get('login');
        const messageParam = searchParams.get('message');
        const errorParam = searchParams.get('error');
        const screenParam = searchParams.get('screen');
        const tokenParam = searchParams.get('token');

        if (loginParam === 'true') {
            const decodedToken = tokenParam ? decodeURIComponent(tokenParam) : null;
            setModalParams({
                initialScreen: screenParam,
                recoveryToken: decodedToken
            });
            setIsLoginModalOpen(true);
            setSearchParams({});
        }

        if (messageParam === 'password-reset-success') {
            setMessageType('success');
            setShowSuccessMessage(true);

            setSearchParams({});

            setTimeout(() => setShowSuccessMessage(false), 5000);
        }

        if (errorParam === 'invalid-recovery-link') {
            setMessageType('error');
            setShowSuccessMessage(true);
            setSearchParams({});
            setTimeout(() => setShowSuccessMessage(false), 5000);
        }
    }, [searchParams, setSearchParams]);

    const favoriteItems = useSelector(state => state.favorites.favorites); // массив избранных
    const favoritesCount = favoriteItems ? favoriteItems.length : 0;
    const hasFavorites = favoritesCount > 0;

    // console.log("Header - favoriteItems:", favoriteItems);
    // console.log("Header - favoritesCount:", favoritesCount);

    const goToFavorites = () => {
        if (user) {
            navigate('/favourite');
        } else {
            setReturnPath(location.pathname);
            setIsLoginModalOpen(true);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/coffee?search=${encodeURIComponent(searchInput)}`);
            setShowSearchDropdown(false);
            setSearchInput('');
        }
    };

    const handleCloseSearch = () => {
        setShowSearchDropdown(false);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <TopLine />

            {}
            {showSuccessMessage && (
                <Alert severity={messageType}
                    sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: '300px' }} onClose={() => setShowSuccessMessage(false)} >
                    {messageType === 'success'
                        ? 'Password reset successfully! You can now log in.'
                        : 'Invalid recovery link. Please try again or contact support.'}
                </Alert>
            )}

            <Grid container alignItems="center" justifyContent="space-between" sx={{ height: '83px', backgroundColor: '#EAD9C9', padding: '0 48px' }}>
                <Link to="/">
                    <Box component="img" src={logo} alt="Coffee Lane logo"
                        sx={{ width: '144px', height: '35px', cursor: 'pointer' }} />
                </Link>
                <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Navbar />
                </Grid>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Box sx={{ position: 'relative' }}>
                        <form onSubmit={handleSearchSubmit}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: 'rgba(255,255,255,0.5)',
                                    borderRadius: '8px',
                                    px: 2,
                                    py: 0.5,
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onFocus={() => searchInput.trim() && setShowSearchDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowSearchDropdown(false), 300)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        outline: 'none',
                                        width: '200px',
                                        fontSize: '14px',
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disableRipple
                                    sx={{
                                        minWidth: 0,
                                        padding: 0,
                                        ml: 1,
                                    }}
                                >
                                    <Box component="img" src={Search} alt="search-icon"
                                        sx={{ width: '20px', height: '20px' }} />
                                </Button>
                            </Box>
                        </form>

                        {showSearchDropdown && (
                            <SearchDropdown
                                results={results}
                                loading={loading}
                                query={searchInput}
                                onClose={handleCloseSearch}
                            />
                        )}
                    </Box>
                    {/* <Button disableRipple sx={{ minWidth: 0, padding: 0, backgroundColor: "transparent", border: "none", "&:hover, &:focus, &:active": { backgroundColor: "#EAD9C9", } }}>
                        <Box component="img" src={Search} alt="search-icon"
                            sx={{ width: '24px', height: '24px', cursor: 'pointer', }} />
                    </Button> */}

                    <Button onClick={goToFavorites} disableRipple sx={{ cursor: 'pointer', minWidth: 0, padding: 0, backgroundColor: "transparent", border: "none", position: "relative" }}>
                        {hasFavorites ? (
                            <FavoriteIcon sx={{ color: 'red', fontSize: 24 }} />
                        ) : (
                            <FavoriteBorderOutlinedIcon sx={{ color: '#3E3027', fontSize: 24 }} />
                        )}
                        {favoritesCount > 0 && (
                            <Box sx={{ position: "absolute", top: -14, right: -9, bgcolor: "#16675C", color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "500", }} >
                                {favoritesCount}
                            </Box>
                        )}
                    </Button>

                    <Button onClick={handleAccountClick} disableRipple sx={{ minWidth: 0, padding: 0, backgroundColor: "transparent", border: "none", "&:hover, &:focus, &:active": { backgroundColor: "#EAD9C9", } }}>
                        <Box component="img" src={account} alt="User account"
                            sx={{  width: '24px', height: '24px', cursor: 'pointer', }} />
                    </Button>

                    {!orderCompleted && (
                        <Button 
                            onClick={handleOpenCartModal}
                            disableRipple 
                            sx={{ minWidth: 0, padding: 0, backgroundColor: "transparent", border: "none", "&:hover, &:focus, &:active": { backgroundColor: "#EAD9C9", }, position: "relative", }}
                        >
                            <Box component="img" src={ShoppingCart} alt="Shopping cart"
                                sx={{ width: '24px', height: '24px', cursor: 'pointer', }} />
                            {cartCount > 0 && (
                                <Box sx={{ position: "absolute", top: -14, right: -9, bgcolor: "#16675C", color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "500", }} >
                                    {cartCount}
                                </Box>
                            )}
                        </Button>
                    )}
                    {user && (isAdmin || user?.role === 'admin') && (
                        <Tooltip title="Admin panel">
                            <IconButton
                                color="inherit"
                                onClick={() => navigate('/admin')}
                                aria-label="Admin panel"
                                sx={{
                                    color: '#16675C',
                                }}
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Grid>

            <LoginModal
                open={isLoginModalOpen}
                handleClose={handleCloseLoginModal}
                returnPath={returnPath}
            />

            {basketItems.length > 0 ? (
                <BasketModal
                    open={isCartModalOpen}
                    onClose={handleCloseCartModal}
                    items={basketItems}
                    onChangeQty={handleChangeQty}
                    onRemove={handleRemoveItem}
                    onCheckout={handleCheckout}
                />
            ) : (
                <EmptyCartModal
                    open={isCartModalOpen}
                    onClose={handleCloseCartModal}
                />
            )}
        </Box>

    );
}

export default Header;
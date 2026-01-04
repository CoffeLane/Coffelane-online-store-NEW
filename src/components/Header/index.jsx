import React, { useEffect, useState } from 'react';
import logo from '../../assets/images/header/logo.svg';
import { Box, Button, Grid, Tooltip, IconButton, Alert, Drawer, useMediaQuery, useTheme } from '@mui/material';
import account from '../../assets/icons/account.svg';
import ShoppingCart from '../../assets/icons/shopping-cart.svg';
import Search from '../../assets/icons/search-icon.svg';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TopLine from '../TopLine/index.jsx';
import { Link, useNavigate, useSearchParams, useLocation, NavLink as RouterNavLink } from 'react-router-dom';
import Navbar from '../Navbar/index.jsx';
import LoginModal from "../../components/Modal/LoginModal.jsx";
import BasketModal from "../../components/Modal/BasketModal.jsx";
import EmptyCartModal from "../../components/Modal/EmptyCartModal.jsx";
import { useSelector, useDispatch } from "react-redux";
import { selectCartCount, selectCartItems, addToCart, decrementQuantity, removeFromCart } from "../../store/slice/cartSlice.jsx";
import SettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { searchAll, clearSearch, setQuery } from "../../store/slice/searchSlice.jsx";
import SearchDropdown from "../SearchDropdown/index.jsx";
import { CurrencySwitcher } from "../CurrencySwitcher.jsx";


function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [messageType, setMessageType] = useState('');
    const [modalParams, setModalParams] = useState({ initialScreen: null, recoveryToken: null });
    const [returnPath, setReturnPath] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
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
                dispatch(searchAll(searchInput));
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
            if (isAdmin) {
                if (location.pathname !== '/admin/account') {
                    navigate('/admin/account');
                }
            } else {
                if (!location.pathname.startsWith('/account')) {
                    navigate('/account/personal-info');
                }
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

    const favoriteItems = useSelector(state => state.favorites.favorites);
    const favoritesCount = favoriteItems ? favoriteItems.length : 0;
    const hasFavorites = favoritesCount > 0;

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

            { }
            {showSuccessMessage && (
                <Alert severity={messageType}
                    sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, minWidth: { xs: '90%', sm: '300px' }, maxWidth: '90vw' }} onClose={() => setShowSuccessMessage(false)} >
                    {messageType === 'success'
                        ? 'Password reset successfully! You can now log in.'
                        : 'Invalid recovery link. Please try again or contact support.'}
                </Alert>
            )}

            {isMobile ? (
                // Mobail
                <Box sx={{ backgroundColor: '#EAD9C9', px: 2, py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
                        <IconButton
                            onClick={() => setMobileMenuOpen(true)}
                            sx={{ color: '#3E3027' }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Link to="/">
                            <Box component="img" src={logo} alt="Coffee Lane logo"
                                sx={{ width: { xs: '100px', sm: '120px' }, height: 'auto', cursor: 'pointer' }} />
                        </Link>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                            <IconButton
                                onClick={() => setShowMobileSearch(!showMobileSearch)}
                                sx={{ color: '#3E3027', p: { xs: 0.5, sm: 1 } }}
                            >
                                <Box component="img" src={Search} alt="search-icon"
                                    sx={{ width: '20px', height: '20px' }} />
                            </IconButton>
                            <Box sx={{ px: { xs: 0, sm: 1 }, py: { xs: 0.5, sm: 1 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <CurrencySwitcher />
                            </Box>
                            <Button onClick={goToFavorites} disableRipple sx={{ minWidth: 0, p: { xs: 0.25, sm: 0.5 }, position: "relative" }}>
                                {hasFavorites ? (
                                    <FavoriteIcon sx={{ color: 'red', fontSize: 20 }} />
                                ) : (
                                    <FavoriteBorderOutlinedIcon sx={{ color: '#3E3027', fontSize: 20 }} />
                                )}
                                {favoritesCount > 0 && (
                                    <Box sx={{ position: "absolute", top: -8, right: -6, bgcolor: "#16675C", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "500", }} >
                                        {favoritesCount}
                                    </Box>
                                )}
                            </Button>
                            <IconButton
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAccountClick();
                                }}
                                sx={{ color: '#3E3027', p: { xs: 0.25, sm: 0.5 }, zIndex: 1 }}
                                aria-label="Account"
                            >
                                <Box component="img" src={account} alt="User account"
                                    sx={{ width: '20px', height: '20px', pointerEvents: 'none' }} />
                            </IconButton>
                            {!orderCompleted && (
                                <Button onClick={handleOpenCartModal} disableRipple sx={{ minWidth: 0, p: { xs: 0.25, sm: 0.5 }, position: "relative" }}>
                                    <Box component="img" src={ShoppingCart} alt="Shopping cart"
                                        sx={{ width: '20px', height: '20px' }} />
                                    {cartCount > 0 && (
                                        <Box sx={{ position: "absolute", top: -8, right: -6, bgcolor: "#16675C", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "500", }} >
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
                                            p: { xs: 0.25, sm: 0.5 },
                                        }}
                                    >
                                        <SettingsIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>

                    {showMobileSearch && (
                        <Box sx={{ mt: 1, mb: 1 }}>
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
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            outline: 'none',
                                            flex: 1,
                                            fontSize: '14px',
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        disableRipple
                                        sx={{ minWidth: 0, padding: 0, ml: 1 }}
                                    >
                                        <Box component="img" src={Search} alt="search-icon"
                                            sx={{ width: '18px', height: '18px' }} />
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
                    )}

                    <Drawer
                        anchor="left"
                        open={mobileMenuOpen}
                        onClose={() => setMobileMenuOpen(false)}
                        sx={{
                            '& .MuiDrawer-paper': {
                                width: '280px',
                                backgroundColor: '#EAD9C9',
                                pt: 2,
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
                            <Box component="img" src={logo} alt="Coffee Lane logo"
                                sx={{ width: '120px', height: 'auto' }} />
                            <IconButton onClick={() => setMobileMenuOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2 }}>
                            <Button
                                component={RouterNavLink}
                                to="/"
                                onClick={() => setMobileMenuOpen(false)}
                                sx={{
                                    color: '#3E3027',
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 500,
                                    '&.active': { color: '#B88A6E' },
                                    '&:hover': { color: '#B88A6E' },
                                    transition: 'color 0.3s',
                                    borderRadius: 0,
                                    py: 1.5
                                }}
                            >
                                Home
                            </Button>
                            <Button
                                component={RouterNavLink}
                                to="/coffee"
                                onClick={() => setMobileMenuOpen(false)}
                                sx={{
                                    color: '#3E3027',
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 500,
                                    '&.active': { color: '#B88A6E' },
                                    '&:hover': { color: '#B88A6E' },
                                    transition: 'color 0.3s',
                                    borderRadius: 0,
                                    py: 1.5
                                }}
                            >
                                Coffee
                            </Button>
                            <Button
                                component={RouterNavLink}
                                to="/accessories"
                                onClick={() => setMobileMenuOpen(false)}
                                sx={{
                                    color: '#3E3027',
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 500,
                                    '&.active': { color: '#B88A6E' },
                                    '&:hover': { color: '#B88A6E' },
                                    transition: 'color 0.3s',
                                    borderRadius: 0,
                                    py: 1.5
                                }}
                            >
                                Accessories
                            </Button>
                            <Button
                                component={RouterNavLink}
                                to="/ourStory"
                                onClick={() => setMobileMenuOpen(false)}
                                sx={{
                                    color: '#3E3027',
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    fontSize: '16px',
                                    fontFamily: 'Montserrat, sans-serif',
                                    fontWeight: 500,
                                    '&.active': { color: '#B88A6E' },
                                    '&:hover': { color: '#B88A6E' },
                                    transition: 'color 0.3s',
                                    borderRadius: 0,
                                    py: 1.5
                                }}
                            >
                                Our Story
                            </Button>
                            <Button
                                onClick={() => { handleAccountClick(); setMobileMenuOpen(false); }}
                                sx={{ color: '#3E3027', justifyContent: 'flex-start', textTransform: 'none', fontSize: '16px', mt: 2 }}
                            >
                                Account
                            </Button>
                            {user && (isAdmin || user?.role === 'admin') && (
                                <Button
                                    onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}
                                    sx={{ color: '#16675C', justifyContent: 'flex-start', textTransform: 'none', fontSize: '16px' }}
                                >
                                    Admin Panel
                                </Button>
                            )}
                        </Box>
                    </Drawer>
                </Box>
            ) : (
                <Grid container alignItems="center" justifyContent="space-between" sx={{ height: '83px', backgroundColor: '#EAD9C9', padding: { xs: '0 16px', sm: '0 32px', md: '0 48px' } }}>
                    <Link to="/">
                        <Box component="img" src={logo} alt="Coffee Lane logo"
                            sx={{ width: '144px', height: '35px', cursor: 'pointer' }} />
                    </Link>
                    <Grid sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Navbar />
                    </Grid>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 2 } }}>
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
                        <CurrencySwitcher />
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

                        <IconButton
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAccountClick();
                            }}
                            sx={{ color: '#3E3027', minWidth: 0, padding: 0, backgroundColor: "transparent", "&:hover, &:focus, &:active": { backgroundColor: "#EAD9C9", } }}
                            aria-label="Account"
                        >
                            <Box component="img" src={account} alt="User account"
                                sx={{ width: '24px', height: '24px', pointerEvents: 'none' }} />
                        </IconButton>

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
            )}

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
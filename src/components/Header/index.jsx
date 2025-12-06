import React, { useEffect, useState } from 'react';
import logo from '../../assets/images/header/logo.svg';
import { Box, Button, Grid, Tooltip, IconButton, Alert } from '@mui/material';
import account from '../../assets/icons/account.svg';
import ShoppingCart from '../../assets/icons/shopping-cart.svg';
import Search from '../../assets/icons/search-icon.svg';
import TopLine from '../TopLine/index.jsx';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../Navbar/index.jsx';
import LoginModal from "../../components/Modal/LoginModal.jsx";

import { useSelector } from "react-redux";
import { selectCartCount } from "../../store/slice/cartSlice.jsx";
import SettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';


function Header() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    // const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [messageType, setMessageType] = useState('');
    const [modalParams, setModalParams] = useState({ initialScreen: null, recoveryToken: null });
    const cartCount = useSelector(selectCartCount);
    const orderCompleted = useSelector((state) => state.cart.orderCompleted);
    // const user = useSelector(state => state.auth.user);
    const user = useSelector((state) => state.auth.user);

    
console.log("Header - user:", useSelector((state) => state.auth.user));
//  return <div>{user ? `Hi, ${user.first_name}` : "Not logged in"}</div>;

useEffect(() => {
    console.log("Header updated:", { user });
}, [user])

 
const handleAccountClick = () => {

  if (user) {
    navigate('/account/personal-info');
  } else {
    setIsLoginModalOpen(true);
  }
};

    const handleOpenLoginModal = () => {
        setIsLoginModalOpen(true);
    }
    const handleCloseLoginModal = () => {
        setIsLoginModalOpen(false);
        // Clear modal parameters when modal is closed
        setModalParams({ initialScreen: null, recoveryToken: null });
    };

    // const handleOpenCartModal = () => {
    //     setIsCartModalOpen(true);
    // }
    // useEffect(() => {
    // }, [isCartModalOpen]);

    // const handleCloseCartModal = () => {
    //     setIsCartModalOpen(false);
    // };

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
            // Clean up URL parameters
            setSearchParams({});
            // Hide success message after 5 seconds
            setTimeout(() => setShowSuccessMessage(false), 5000);
        }

        if (errorParam === 'invalid-recovery-link') {
            setMessageType('error');
            setShowSuccessMessage(true);
            setSearchParams({});
            setTimeout(() => setShowSuccessMessage(false), 5000);
        }
    }, [searchParams, setSearchParams]);

    const favoriteItems = useSelector(state => state.favorites.items); // массив избранных

    const hasFavorites = favoriteItems && favoriteItems.length > 0;

    const goToFavorites = () => {
        navigate('/favourite');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <TopLine />

            {/* Success/Error Messages */}
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
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button disableRipple sx={{ minWidth: 0, padding: 0, backgroundColor: "transparent", border: "none", "&:hover, &:focus, &:active": { backgroundColor: "#EAD9C9", } }}>
                        <Box component="img" src={Search} alt="search-icon"
                            sx={{ width: '24px', height: '24px', cursor: 'pointer', }} />
                    </Button>

                    <Button onClick={goToFavorites} disableRipple sx={{ marginLeft: '32px', cursor: 'pointer', minWidth: 0, padding: 0, backgroundColor: "transparent", border: "none",}}>
                        {hasFavorites ? (
                            <FavoriteIcon sx={{ color: 'red', fontSize: 24 }} />
                        ) : (
                            <FavoriteBorderOutlinedIcon sx={{ color: '#3E3027', fontSize: 24 }} />
                        )}
                    </Button>

                    <Button onClick={handleAccountClick} disableRipple sx={{ minWidth: 0, padding: 0, backgroundColor: "transparent", border: "none", "&:hover, &:focus, &:active": { backgroundColor: "#EAD9C9", } }}>
                        <Box component="img" src={account} alt="User account"
                            sx={{ marginLeft: '32px', width: '24px', height: '24px', cursor: 'pointer', }} />
                    </Button>

                    {!orderCompleted && (
                        <Button  disableRipple sx={{ minWidth: 0, padding: 0, backgroundColor: "transparent", border: "none", "&:hover, &:focus, &:active": { backgroundColor: "#EAD9C9", }, position: "relative", }}>
                            <Box component="img" src={ShoppingCart} alt="Shopping cart"
                                sx={{ marginLeft: '32px', width: '24px', height: '24px', cursor: 'pointer', }} />
                            {cartCount > 0 && (
                                <Box sx={{ position: "absolute", top: -14, right: -9, bgcolor: "#16675C", color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: "500", }} >
                                    {cartCount}
                                </Box>
                            )}
                        </Button>
                    )}
                    {user?.role === 'admin' && (
                        <Tooltip title="Admin panel">
                            <IconButton
                                color="inherit"
                                onClick={() => navigate('/admin')}
                                aria-label="Admin panel"
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
            />

            {/* <CartModal open={isCartModalOpen} onClose={handleCloseCartModal} /> */}
        </Box>

    );
}

export default Header;
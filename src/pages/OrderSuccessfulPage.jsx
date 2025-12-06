import React from "react";
import { Box, Typography, Button } from '@mui/material';
import { titlePage, h5 } from "../styles/typographyStyles.jsx";
import order from "../assets/images/order/order.png";
import { useLocation } from "react-router-dom";
import { btnCart, btnStyles } from "../styles/btnStyles.jsx";
import { useNavigate } from "react-router-dom";

export default function OrderSuccessfulPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderNumber, email } = location.state || {};

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', textAlign: 'center', px: 2 }}>
            <Typography sx={{ ...titlePage }}>Thank you! Your order has been placed successfully</Typography>
            <Box sx={{ display: 'flex' }}>
                <Typography sx={{ ...h5, mt: 2 }}>Order</Typography>
                <Typography sx={{ ...h5, mt: 2, fontWeight: 700, ml: 2, mr: 2}}> #{orderNumber}</Typography>
                <Typography sx={{ ...h5, mt: 2 }}> has been confirmed. We’ve sent a confirmation email to</Typography>
                <Typography sx={{ ...h5, mt: 2, fontWeight: 700, ml: 2, }}>{email}.</Typography>
            </Box>

            <Box component="img" src={order} alt="order" sx={{ width: '440px', height: '440px', mt: 4 }} />
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button sx={{ ...btnStyles, textTransform: 'none' }} 
                // onClick={() => navigate('/account/orders-history')}
                >
                    <Typography >View Order</Typography>
                </Button>
                <Button sx={{ ...btnCart, }} onClick={() => navigate('/coffee')}>
                    <Typography >Continue Shopping</Typography>
                </Button>
            </Box>
        </Box>
    );
}
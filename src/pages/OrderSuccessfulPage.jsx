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
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: { xs: 'auto', md: '100vh' },
            py: { xs: 4, md: 0 },
            flexDirection: 'column', 
            textAlign: 'center', 
            px: { xs: 2, sm: 3, md: 2 } 
        }}>
            <Typography sx={{ 
                ...titlePage, 
                fontSize: { xs: '20px', sm: '24px', md: '32px' },
                mb: { xs: 2, md: 0 },
                px: { xs: 1, md: 0 }
            }}>
                Thank you! Your order has been placed successfully
            </Typography>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                mt: { xs: 2, md: 2 },
                gap: { xs: 0, sm: 0.5 },
                px: { xs: 2, md: 0 }
            }}>
                <Typography sx={{ ...h5, mt: { xs: 1, md: 2 }, fontSize: { xs: '14px', md: '16px' } }}>
                    Order
                </Typography>
                <Typography sx={{ ...h5, mt: { xs: 1, md: 2 }, fontWeight: 700, ml: { xs: 0, sm: 2 }, mr: { xs: 0, sm: 2 }, fontSize: { xs: '14px', md: '16px' }}}>
                    #{orderNumber}
                </Typography>
                <Typography sx={{ ...h5, mt: { xs: 1, md: 2 }, fontSize: { xs: '14px', md: '16px' } }}>
                    has been confirmed. We've sent a confirmation email to
                </Typography>
                <Typography sx={{ ...h5, mt: { xs: 1, md: 2 }, fontWeight: 700, ml: { xs: 0, sm: 2 }, fontSize: { xs: '14px', md: '16px' }, wordBreak: 'break-word' }}>
                    {email}.
                </Typography>
            </Box>

            <Box component="img" src={order} alt="order" sx={{ 
                width: { xs: '280px', sm: '350px', md: '440px' }, 
                height: { xs: '280px', sm: '350px', md: '440px' }, 
                mt: { xs: 3, md: 4 },
                maxWidth: '100%'
            }} />
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 }, 
                mt: { xs: 3, md: 4 },
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: '300px', sm: 'none' },
                px: { xs: 2, md: 0 }
            }}>
                <Button sx={{ 
                    ...btnStyles, 
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' },
                    fontSize: { xs: '12px', md: '14px' },
                    py: { xs: 1, md: 1.5 }
                }}>
                    <Typography sx={{ fontSize: { xs: '12px', md: '14px' } }}>View Order</Typography>
                </Button>
                <Button sx={{ 
                    ...btnCart,
                    width: { xs: '100%', sm: 'auto' },
                    fontSize: { xs: '12px', md: '14px' },
                    py: { xs: 1, md: 1.5 }
                }} onClick={() => navigate('/coffee')}>
                    <Typography sx={{ fontSize: { xs: '12px', md: '14px' } }}>Continue Shopping</Typography>
                </Button>
            </Box>
        </Box>
    );
}
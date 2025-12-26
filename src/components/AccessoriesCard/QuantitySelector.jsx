import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { h5 } from "../../styles/typographyStyles.jsx";

export default function QuantitySelector({ quantity, onIncrement, onDecrement }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, md: 1 } }}>
            <Typography sx={{ ...h5, fontSize: { xs: '14px', md: '18px' } }}>Quantity</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 } }}>
                <IconButton 
                    onClick={onDecrement} 
                    sx={{ 
                        backgroundColor: '#3E3027', 
                        color: '#fff', 
                        "&:hover": {backgroundColor: '#3E3027'}, 
                        "&:active": {backgroundColor: '#3E3027'}, 
                        "&:focus": {backgroundColor: '#3E3027'},  
                        width: { xs: 32, md: 40 }, 
                        height: { xs: 32, md: 40 }
                    }}
                >
                    <RemoveIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                </IconButton>
                <Typography sx={{ ...h5, fontSize: { xs: '16px', md: '18px' }, minWidth: { xs: '24px', md: '32px' }, textAlign: 'center' }}>
                    {quantity}
                </Typography>
                <IconButton 
                    onClick={onIncrement} 
                    sx={{ 
                        backgroundColor: '#3E3027', 
                        color: '#fff',
                        "&:hover": {backgroundColor: '#3E3027'}, 
                        "&:active": {backgroundColor: '#3E3027'}, 
                        "&:focus": {backgroundColor: '#3E3027'}, 
                        width: { xs: 32, md: 40 }, 
                        height: { xs: 32, md: 40 }
                    }}
                >
                    <AddIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                </IconButton>
            </Box>
        </Box>
    );
}

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { h5 } from "../../styles/typographyStyles.jsx";

export default function QuantitySelector({ quantity, onIncrement, onDecrement }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, }}>
            <Typography sx={{ ...h5 }}>Quantity</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={onDecrement} sx={{ backgroundColor: '#3E3027', color: '#fff', "&:hover": {backgroundColor: '#3E3027'}, "&:active": {backgroundColor: '#3E3027'}, "&:focus": {backgroundColor: '#3E3027'},  width: 24, height: 24}}>
                    <RemoveIcon />
                </IconButton>
                <Typography sx={{ ...h5 }}>{quantity}</Typography>
                <IconButton onClick={onIncrement} sx={{ backgroundColor: '#3E3027', color: '#fff',"&:hover": {backgroundColor: '#3E3027'}, "&:active": {backgroundColor: '#3E3027'}, "&:focus": {backgroundColor: '#3E3027'}, width: 24, height: 24 }}>
                    <AddIcon />
                </IconButton>
            </Box>
        </Box>
    );
}

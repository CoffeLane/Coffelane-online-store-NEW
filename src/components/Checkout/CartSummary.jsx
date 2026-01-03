import React, { useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CoffeeIcon from '@mui/icons-material/Coffee'; 
import { useSelector } from "react-redux";
import { getPrice, getProductPrice, formatPrice } from "../utils/priceUtils.jsx";

const SummaryImage = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <Box sx={{ 
        width: { xs: "80px", md: "100px" }, 
        height: { xs: "80px", md: "100px" }, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        bgcolor: "#F9F9F9", 
        borderRadius: "8px",
        border: "1px solid #EEE",
        flexShrink: 0
      }}>
        <CoffeeIcon sx={{ color: "#16675C", fontSize: { xs: 30, md: 40 }, opacity: 0.3 }} />
      </Box>
    );
  }

  return (
    <Box 
      component="img" 
      src={src} 
      alt={alt} 
      onError={() => setHasError(true)}
      sx={{ 
        width: { xs: "80px", md: "100px" }, 
        height: { xs: "80px", md: "100px" }, 
        objectFit: "contain",
        flexShrink: 0 
      }}
    />
  );
};

export default function CartSummary({ items, handleRemove, handleQuantityChange, icondelete }) {
  const currency = useSelector((state) => state.settings.currency);

  return (
    <Box sx={{ flex: 1, backgroundColor: "#fff", p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      {items.map(([key, cartItem]) => {
        const { product, quantity } = cartItem;
        const supplies = product.supplies || [];
        const selectedSupply = supplies.find((s) => s.id === product.selectedSupplyId);
        const price = selectedSupply ? getPrice(selectedSupply, currency) : getProductPrice(product, currency);
        const weight = selectedSupply?.weight ?? null;
        const imageUrl = product.photos_url?.[0]?.url || product.img;

        return (
          <Box key={key} sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: "space-between", mb: 2, p: { xs: 1, md: 2 }, borderBottom: "1px solid #E0E0E0", gap: { xs: 2, sm: 0 } }}>
            <SummaryImage src={imageUrl} alt={product.name} />
            <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, ml: { xs: 0, sm: 4, md: 6 }, gap: { xs: 1, md: 2 }, width: { xs: '100%', sm: 'auto' } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <Typography sx={{ fontSize: { xs: '14px', md: '16px' }, fontWeight: 500 }}>{product.name}</Typography>
                  {weight && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                      {weight}
                    </Typography>
                  )}
                </Box>
                <IconButton onClick={() => handleRemove(key)} color="error" sx={{ p: { xs: 0.5, md: 1 } }}>
                  <Box component="img" src={icondelete} alt="icondelete" sx={{ width: { xs: 18, md: 24 }, height: { xs: 18, md: 24 } }} />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: { xs: 1, md: 2 }, width: '100%' }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton onClick={() => handleQuantityChange(key, -1, cartItem)} sx={{ backgroundColor: "#3E3027", color: "#fff", width: { xs: 24, md: 28 }, height: { xs: 24, md: 28 }, "&:hover": {backgroundColor: '#3E3027', opacity: 0.9} }}>
                    <RemoveIcon sx={{ fontSize: { xs: 14, md: 18 } }} />
                  </IconButton>
                  <Typography sx={{ fontSize: { xs: '14px', md: '16px' }, minWidth: { xs: 20, md: 24 }, textAlign: 'center' }}>{quantity}</Typography>
                  <IconButton onClick={() => handleQuantityChange(key, 1, cartItem)} sx={{ backgroundColor: '#3E3027', color: '#fff',"&:hover": {backgroundColor: '#3E3027', opacity: 0.9}, width: { xs: 24, md: 28 }, height: { xs: 24, md: 28 } }} >
                    <AddIcon sx={{ fontSize: { xs: 14, md: 18 } }} />
                  </IconButton>
                </Box>
                <Typography sx={{ fontSize: { xs: '14px', md: '16px' }, fontWeight: 600 }}>{formatPrice(price * quantity, currency)}</Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
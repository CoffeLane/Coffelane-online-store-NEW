import React, { useState } from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box } from "@mui/material";
import CoffeeIcon from '@mui/icons-material/Coffee';
import { h4, h7 } from "../../styles/typographyStyles.jsx";
import { btnCart, btnInCart } from "../../styles/btnStyles.jsx";
import favorite from "../../assets/icons/favorite.svg";
import favoriteActive from "../../assets/icons/favorite-active.svg";
import incart from "../../assets/icons/incart.svg";
import shopping from "../../assets/icons/shopping.svg";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItems, addToCart } from "../../store/slice/cartSlice.jsx";
import ClampText from "../ClampText.jsx";


const ProductImage = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <Box sx={{ 
        width: "100%", 
        height: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        bgcolor: "#f5f5f5",
        borderRadius: "12px"
      }}>
        <CoffeeIcon sx={{ color: "#ccc", fontSize: 50 }} />
      </Box>
    );
  }

  return (
    <CardMedia
      component="img"
      image={src}
      alt={alt}
      onError={() => setError(true)}
      sx={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
};

export default function CoffeeCardData({ products, favorites, onToggleFavorite, isRecommended = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartEntries = useSelector(selectCartItems);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 2, md: 3 }, justifyContent: "center", width: "100%",}}>
      {products.map((item) => {
        const itemId = String(item.id);
        const supply = item.supplies?.[0] || null;
        const isOutOfStock = !supply || Number(supply.quantity) <= 0;
        const cartKey = supply ? `${item.id}-${supply.id}` : `${item.id}-default`;
        const isInCart = cartEntries.some(([key]) => key === cartKey);
        const mainPhoto = item.photos_url?.[0]?.url;

        return (
          <Card key={cartKey} sx={{
            width: isRecommended ? { xs: "100%", sm: "280px", md: "300px" } : { xs: "100%", sm: "280px", md: "300px" },
            maxWidth: isRecommended ? "360px" : "none",
            minHeight: { xs: '360px', md: '480px' },
            display: "flex", 
            flexDirection: "column", 
            borderRadius: "24px", 
            p: 2, 
            boxShadow: 2,
            opacity: isOutOfStock ? 0.7 : 1,
          }}>
            {/* ИЗОБРАЖЕНИЕ С ОБРАБОТКОЙ ОШИБКИ */}
            <Box sx={{ position: "relative", width: "100%", height: { xs: 160, md: 250 }, mb: 1 }}>
              <ProductImage src={mainPhoto} alt={item.name} />
              
              <Box 
                component="img" 
                src={favorites?.[itemId] ? favoriteActive : favorite}
                sx={{ 
                  position: "absolute", 
                  top: 0, 
                  right: 0, 
                  width: 28, 
                  height: 28, 
                  cursor: "pointer", 
                  zIndex: 5,
                  p: 0.5
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Чтобы не срабатывал переход на товар
                  onToggleFavorite(item);
                }} 
              />
            </Box>

            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: '0 !important' }}>
              <Typography 
                onClick={() => navigate(`/coffee/product/${item.id}`)} 
                sx={{ 
                  ...h4, 
                  cursor: "pointer", 
                  fontSize: { xs: '15px', md: '18px' }, 
                  mb: 1,
                  '&:hover': { color: '#16675C' }
                }}
              >
                {item.name}
              </Typography>
              
              <ClampText lines={2} sx={{ ...h7, opacity: 0.7, mb: 2 }}>
                {item.description}
              </ClampText>
              
              <Box sx={{ mt: 'auto' }}>
                <Typography sx={{ color: "#16675C", fontWeight: 700, textAlign: "right", mb: 1 }}>
                  ${supply ? Number(supply.price).toFixed(2) : "0.00"}
                </Typography>
                
                <Button 
                  variant="contained" 
                  fullWidth 
                  disabled={isOutOfStock}
                  onClick={() => dispatch(addToCart({ 
                    product: { ...item, price: supply?.price, selectedSupplyId: supply?.id }, 
                    quantity: 1 
                  }))}
                  sx={{ ...(isInCart ? btnInCart : btnCart), py: 1 }}
                  endIcon={<Box component="img" src={isInCart ? incart : shopping} sx={{ width: 20 }} />}
                >
                  {isOutOfStock ? "Sold Out" : (isInCart ? "In cart" : "Add to bag")}
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
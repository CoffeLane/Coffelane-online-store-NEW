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
import { getPrice, formatPrice } from "../utils/priceUtils.jsx";


const ProductImage = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <Box sx={{  width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",  bgcolor: "#f5f5f5", borderRadius: "12px"}}>
        <CoffeeIcon sx={{ color: "#ccc", fontSize: 50 }} />
      </Box>
    );
  }

  return (
    <CardMedia component="img" image={src} alt={alt} onError={() => setError(true)} sx={{ width: "100%", height: "100%", objectFit: "contain" }}/>
  );
};

export default function CoffeeCardData({ products, favorites, onToggleFavorite, isRecommended = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartEntries = useSelector(selectCartItems);
  const currency = useSelector((state) => state.settings.currency);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 2, md: 3 }, justifyContent: "center", width: "100%" }}>
      {products.map((item, index) => {
        const itemId = String(item.id);
        const supply = item.supplies?.[0] || null;
        const isOutOfStock = !supply || Number(supply.quantity) <= 0;
        const cartKey = supply ? `${item.id}-${supply.id}` : `${item.id}-default`;
        const isInCart = cartEntries.some(([key]) => key === cartKey);
        
        // Извлекаем фото из разных вариантов структуры данных
        let mainPhoto = null;
        
        // Проверяем photos_url
        if (item.photos_url && Array.isArray(item.photos_url) && item.photos_url.length > 0) {
          const firstPhoto = item.photos_url[0];
          if (typeof firstPhoto === 'string') {
            mainPhoto = firstPhoto;
          } else if (firstPhoto && typeof firstPhoto === 'object') {
            mainPhoto = firstPhoto.url || firstPhoto.photo || firstPhoto.photo_url || firstPhoto.image_url || null;
          }
        }
        
        // Если не нашли в photos_url, проверяем product_photos
        if (!mainPhoto && item.product_photos && Array.isArray(item.product_photos) && item.product_photos.length > 0) {
          const firstPhoto = item.product_photos[0];
          if (firstPhoto && typeof firstPhoto === 'object') {
            if (firstPhoto.photo) {
              if (typeof firstPhoto.photo === 'string') {
                mainPhoto = firstPhoto.photo;
              } else if (firstPhoto.photo && typeof firstPhoto.photo === 'object') {
                mainPhoto = firstPhoto.photo.url || firstPhoto.photo.photo_url || firstPhoto.photo.image_url || null;
              }
            } else {
              mainPhoto = firstPhoto.url || firstPhoto.photo || firstPhoto.photo_url || firstPhoto.image_url || null;
            }
          } else if (typeof firstPhoto === 'string') {
            mainPhoto = firstPhoto;
          }
        }
        
        // Если URL относительный, добавляем базовый URL
        if (mainPhoto && typeof mainPhoto === 'string' && !mainPhoto.startsWith('http') && !mainPhoto.startsWith('blob:')) {
          const baseUrl = 'https://onlinestore-928b.onrender.com';
          mainPhoto = mainPhoto.startsWith('/') ? `${baseUrl}${mainPhoto}` : `${baseUrl}/${mainPhoto}`;
        }

        return (
          <Card key={cartKey} sx={{ width: isRecommended ? { xs: "100%", sm: "280px", md: "300px" } : { xs: "100%", sm: "280px", md: "300px" }, maxWidth: isRecommended ? "360px" : "none", minHeight: { xs: '360px', md: '480px' }, display: "flex",  flexDirection: "column",  borderRadius: "24px", p: 2,  boxShadow: 2,}}>
            <Box sx={{ position: "relative", width: "100%", height: { xs: 160, md: 250 }, mb: 1 }}>
              <ProductImage src={mainPhoto} alt={item.name} />
              <Box  component="img"  src={favorites?.[itemId] ? favoriteActive : favorite}
                sx={{ position: "absolute", top: 0, right: 0, width: 28, height: 28, cursor: "pointer", zIndex: 5, p: 0.5}}
                onClick={(e) => {
                  e.stopPropagation(); 
                  onToggleFavorite(item);
                }} 
              />
            </Box>

            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: '0 !important' }}>
              <Typography 
                onClick={() => navigate(`/coffee/product/${item.id}`)} 
                sx={{ ...h4, cursor: "pointer", fontSize: { xs: '15px', md: '18px' }, mb: 1, '&:hover': { color: '#16675C' }}}>
                {item.name}
              </Typography>
              
              <ClampText lines={2} sx={{ ...h7, opacity: 0.7, mb: 2 }}>
                {item.description}
              </ClampText>
              
              <Box sx={{ mt: 'auto' }}>
                <Typography sx={{ color: "#16675C", fontWeight: 700, textAlign: "right", mb: 1 }}>
                  {supply ? formatPrice(getPrice(supply, currency), currency) : formatPrice(0, currency)}
                </Typography>
                
                <Button variant="contained" fullWidth disabled={isOutOfStock}
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
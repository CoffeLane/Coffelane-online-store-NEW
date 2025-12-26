import React from "react";
import { Card, CardContent, CardMedia, Typography, Button, Box, useMediaQuery, useTheme } from "@mui/material"; 
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

const ProductImage = ({ item, isMobile }) => {
  const [hasError, setHasError] = React.useState(false);
  const imageUrl = item.photos_url?.[0]?.url;

  if (!imageUrl || hasError) {
    return (
      <Box sx={{ 
        width: "100%", height: "100%", 
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", 
        bgcolor: "#F9F9F9", borderRadius: "16px", gap: 1,
        border: "1px solid #EEE"
      }}>
        <CoffeeIcon sx={{ color: "#16675C", fontSize: isMobile ? 40 : 60, opacity: 0.4 }} />
        <Typography sx={{ fontSize: '12px', color: '#999', fontWeight: 600 }}>No Image</Typography>
      </Box>
    );
  }

  return (
    <CardMedia
      component="img"
      image={imageUrl}
      alt={item.name}
      onError={() => setHasError(true)}
      sx={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
};

export default function CoffeeCardData({ products, favorites, onToggleFavorite }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const cartEntries = useSelector(selectCartItems);

  const handleAddToCart = (item, supply) => {
    dispatch(
      addToCart({
        product: { 
            ...item, 
            price: Number(supply.price || 0), 
            selectedSupplyId: supply.id 
        },
        quantity: 1,
      })
    );
  };

  if (!products || products.length === 0) return <Typography>No products found</Typography>;

  return (
    <Box sx={{ display: "flex", gap: { xs: 2, md: 3 }, flexWrap: "wrap", justifyContent: { xs: 'stretch', md: 'flex-start' }, px: { xs: 2, md: 0 } }}>
      {products.map((item) => {
        const itemId = String(item.id);
        const supply = item.supplies?.[0] || null;
        const isOutOfStock = !supply || Number(supply.quantity) <= 0;
        const cartKey = supply ? `${item.id}-${supply.id}` : `${item.id}-default`;
        const isInCart = cartEntries.some(([key]) => key === cartKey);
        const price = supply ? Number(supply.price) : 0;
        const isFavorite = favorites?.[itemId];

        return (
          <Card
            key={cartKey}
            sx={{ 
              width: { xs: '100%', sm: '240px', md: 300 }, 
              height: { xs: 'auto', md: 480 }, 
              display: "flex", flexDirection: "column", 
              borderRadius: "24px", p: { xs: 1.5, md: 2 }, boxShadow: 2,
              opacity: isOutOfStock ? 0.7 : 1,
              filter: isOutOfStock ? 'grayscale(0.6)' : 'none'
            }}
          >
            <Box sx={{ position: "relative", width: "100%", height: { xs: 200, sm: 180, md: 250 }, mb: { xs: 1, md: 2 } }}>
              <ProductImage item={item} isMobile={isMobile} />
              <Box
                component="img"
                src={isFavorite ? favoriteActive : favorite}
                alt="favorite"
                sx={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, cursor: "pointer", zIndex: 10 }}
                onClick={() => onToggleFavorite(item)}
              />
            </Box>

            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: '8px !important' }}>
              <Box sx={{ height: { xs: 60, md: 88 }, overflow: "hidden" }}>
                <Typography
                  sx={{ ...h4, mb: 1, cursor: "pointer", fontSize: { xs: '14px', md: '18px' } }}
                  onClick={() => navigate(`/coffee/product/${item.id}`)}
                >
                  {item.name || "Unnamed Coffee"}
                </Typography>
                <ClampText lines={1} sx={{ ...h7, fontSize: { xs: '10px', md: '12px' } }}>
                  {item.description}
                </ClampText>
              </Box>

              <Typography sx={{ mt: 'auto', color: isOutOfStock ? "#999" : "#16675C", fontSize: 16, fontWeight: 700, textAlign: "right", mb: 1 }}>
                {isOutOfStock ? "SOLD OUT" : `$${price.toFixed(2)}`}
              </Typography>

              <Button
                variant="contained"
                disabled={isOutOfStock}
                onClick={() => !isOutOfStock && handleAddToCart(item, supply)}
                sx={{ 
                  ...(isInCart ? btnInCart : btnCart),
                  "&.Mui-disabled": {
                    bgcolor: "#e0e0e0 !important",
                    color: "#999 !important"
                  }
                }}
                endIcon={!isOutOfStock && (
                  <Box component="img" src={isInCart ? incart : shopping} sx={{ width: 24, height: 24 }} />
                )}
              >
                {isOutOfStock ? "Out of Stock" : (isInCart ? "In cart" : "Add to bag")}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
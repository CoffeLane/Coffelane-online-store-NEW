import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
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


export default function CoffeeCardData({ products, favorites, onToggleFavorite  }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartEntries = useSelector(selectCartItems);

  const handleAddToCart = (item) => {
    const selectedSupply = item.supplies?.[0] || { id: "default", price: item.price || 0 };
    const key = `${item.id}-${selectedSupply.id}`;
    dispatch(
      addToCart({
        product: { ...item, price: Number(selectedSupply.price || item.price || 0), selectedSupplyId: selectedSupply.id },
        quantity: 1,
      })
    );
  };

  if (!products || products.length === 0) return <Typography>No products found</Typography>;

  return (
    <Box sx={{ display: "flex", gap: { xs: 2, md: 3 }, flexWrap: "wrap", justifyContent: { xs: 'stretch', md: 'flex-start' }, px: { xs: 2, md: 0 } }}>
      {products.map((item) => {
        const itemId = String(item.id);
        const selectedSupply = item.supplies?.[0] || { id: "default", price: item.price || 0 };
        const cartKey = `${item.id}-${selectedSupply.id}`;
        const isInCart = cartEntries.some(([key]) => key === cartKey);
        const price = Number(selectedSupply.price || item.price || 0);
        const isFavorite = favorites?.[itemId];

        return (
          <Card
            key={cartKey}
            sx={{ 
              width: { xs: '100%', sm: '240px', md: 300 }, 
              height: { xs: 'auto', md: 480 }, 
              minHeight: { xs: 380, md: 480 },
              display: "flex", 
              flexDirection: "column", 
              borderRadius: "24px", 
              p: { xs: 1.5, md: 2 }, 
              boxShadow: 2,
              mx: { xs: 'auto', md: 0 }
            }}
          >
            <Box sx={{ position: "relative", width: "100%", height: { xs: 200, sm: 180, md: 250 }, mb: { xs: 1, md: 2 } }}>
              {item.photos_url?.[0]?.url ? (
                <CardMedia
                  component="img"
                  image={item.photos_url[0].url}
                  alt={item.name}
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f0f0f0", color: "#888", fontSize: { xs: '10px', md: '14px' } }}>
                  No image
                </Box>
              )}
              <Box
                component="img"
                src={isFavorite ? favoriteActive : favorite}
                alt="favorite"
                sx={{ position: "absolute", top: { xs: 8, md: 16 }, right: { xs: 8, md: 16 }, width: { xs: 24, md: 32 }, height: { xs: 24, md: 32 }, cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item);
                }}
              />
            </Box>
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: { xs: '8px !important', md: '16px' } }}>
              <Box sx={{ height: { xs: 60, md: 88 }, overflow: "hidden", mb: { xs: 0.5, md: 1 } }}>
                <Typography
                  sx={{ ...h4, mb: { xs: 0.5, md: 1 }, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", fontSize: { xs: '14px', md: '18px' } }}
                  onClick={() => navigate(`/coffee/product/${item.id}`)}
                >
                  {item.name || "No name"}
                </Typography>
                <ClampText lines={2} sx={{ ...h7, mb: 1, wordBreak: "break-word", overflowWrap: "anywhere", fontSize: { xs: '10px', md: '12px' } }}>
                  {item.description || "No description"}
                </ClampText>
              </Box>
              <Typography sx={{ mt: { xs: 0.5, md: 1 }, color: "#16675C", fontSize: { xs: 12, md: 14 }, fontWeight: 700, textAlign: "right", mb: { xs: 0.5, md: 1 } }}>
                ${price.toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleAddToCart(item)}
                sx={{ 
                  ...(isInCart ? btnInCart : btnCart), 
                  fontSize: { xs: '10px', md: '14px' },
                  py: { xs: 0.5, md: 1 },
                  '& .MuiButton-endIcon': {
                    marginLeft: { xs: 0.5, md: 1 }
                  }
                }}
                endIcon={
                  <Box component="img" src={isInCart ? incart : shopping} alt="" sx={{ width: { xs: 18, md: 24 }, height: { xs: 18, md: 24 } }} />
                }
              >
                {isInCart ? "In cart" : "Add to bag"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}


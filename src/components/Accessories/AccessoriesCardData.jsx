import React from "react";
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

export default function AccessoriesCardData({ products, favorites, onToggleFavorite, isRecommended = false }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartEntries = useSelector(selectCartItems);

    return (
        <Box sx={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: { xs: 2, md: 3 }, 
            justifyContent: "center",
            width: "100%"
        }}>
            {products.map(item => {
                const itemId = String(item.id);
                const isInCart = cartEntries.some(([key]) => key === itemId);
                const isOutOfStock = (item.quantity !== undefined ? Number(item.quantity) : 0) <= 0;

                return (
                    <Card key={itemId} sx={{ 
                        width: isRecommended 
                            ? { xs: "100%", sm: "280px", md: "300px" } 
                            : { xs: "100%", sm: "280px", md: "300px" },
                        maxWidth: isRecommended ? "350px" : "none",
                        minHeight: { xs: '340px', md: '480px' }, 
                        display: "flex", 
                        flexDirection: "column", 
                        borderRadius: "24px", 
                        p: { xs: 1.5, md: 2 }, 
                        boxShadow: 2,
                        opacity: isOutOfStock ? 0.7 : 1,
                    }}>
                        {/* Изображение */}
                        <Box sx={{ position: "relative", width: "100%", height: { xs: 200, md: 300 }, mb: 1,  }}>
                            {item.photos_url?.[0]?.url ? (
                                <CardMedia component="img" image={item.photos_url[0].url} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            ) : (
                                <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#eee", borderRadius: "12px" }}>
                                    <CoffeeIcon sx={{ color: "#ccc", fontSize: 40 }} />
                                </Box>
                            )}
                            <Box
                                component="img"
                                src={favorites?.[itemId] ? favoriteActive : favorite}
                                sx={{ position: "absolute", top: 4, right: 4, width: 28, height: 28, cursor: "pointer", zIndex: 2 }}
                                onClick={() => onToggleFavorite(item)}
                            />
                        </Box>

                        {/* Контент */}
                        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: '0 !important' }}>
                            <Box sx={{ my: 1 }}>
                                <Typography 
                                    onClick={() => navigate(`/accessories/product/${item.id}`)}
                                    sx={{ ...h4, mb: 2, cursor: "pointer", fontSize: { xs: '14px', md: '24px' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.2 }}
                                >
                                    {item.name}
                                </Typography>
                                <ClampText lines={2} sx={{ ...h7, fontSize: { xs: '14px', md: '14px' }}}>
                                    {item.description}
                                </ClampText>
                            </Box>
                            
                            <Box sx={{ mt: 'auto' }}>
                                <Typography sx={{ color: isOutOfStock ? "#999" : "#16675C", fontSize: { xs: 16, md: 18 }, fontWeight: 700, textAlign: "right", mb: 1 }}>
                                    {isOutOfStock ? "SOLD OUT" : `$${Number(item.price || 0).toFixed(2)}`}
                                </Typography>
                                <Button 
                                    variant="contained" fullWidth disabled={isOutOfStock}
                                    onClick={() => !isOutOfStock && dispatch(addToCart({ product: item, quantity: 1 }))}
                                    sx={{ ...(isInCart ? btnInCart : btnCart), fontSize: { xs: '11px', md: '14px' }, py: 1 }}
                                    endIcon={!isOutOfStock && <Box component="img" src={isInCart ? incart : shopping} sx={{ width: 20, height: 20 }} />}
                                >
                                    {isOutOfStock ? "Sold" : (isInCart ? "In cart" : "Add to bag")}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Box>
    );
}
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

export default function AccessoriesCardData({ products, favorites, onToggleFavorite }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartEntries = useSelector(selectCartItems);

    if (!products || products.length === 0) return <Typography>No accessories found</Typography>;

    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center", p: 2 }}>
            {products.map(item => {
                const itemId = String(item.id);
                const isInCart = cartEntries.some(([key]) => key === itemId);
                const qty = item.quantity !== undefined ? Number(item.quantity) : 0;
                const isOutOfStock = qty <= 0;

                return (
                    <Card key={itemId} sx={{ 
                        width: 300, height: 480, display: "flex", flexDirection: "column", 
                        borderRadius: "24px", p: 2, boxShadow: 2,
                        opacity: isOutOfStock ? 0.7 : 1,
                        filter: isOutOfStock ? 'grayscale(0.5)' : 'none'
                    }}>
                        <Box sx={{ position: "relative", width: "100%", height: 250, mb: 2 }}>
                            {item.photos_url?.[0]?.url ? (
                                <CardMedia component="img" image={item.photos_url[0].url} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            ) : (
                                <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#eee", borderRadius: "12px" }}>
                                    <CoffeeIcon sx={{ color: "#ccc", fontSize: 50 }} />
                                </Box>
                            )}
                            <Box
                                component="img"
                                src={favorites?.[itemId] ? favoriteActive : favorite}
                                sx={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, cursor: "pointer", zIndex: 2 }}
                                onClick={() => onToggleFavorite(item)}
                            />
                        </Box>

                        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: '8px !important' }}>
                            <Typography 
                                sx={{ ...h4, mb: 1, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} 
                                onClick={() => navigate(`/accessories/product/${item.id}`)}
                            >
                                {item.name || "No name"}
                            </Typography>
                            
                            <ClampText lines={1} sx={{ ...h7, mb: 1 }}>
                                {item.description || "No description"}
                            </ClampText>
                            
                            <Typography sx={{ mt: 'auto', color: isOutOfStock ? "#999" : "#16675C", fontSize: 18, fontWeight: 700, textAlign: "right", mb: 1 }}>
                                {isOutOfStock ? "SOLD OUT" : `$${Number(item.price || 0).toFixed(2)}`}
                            </Typography>
                            
                            <Button 
                                variant="contained" 
                                disabled={isOutOfStock}
                                onClick={() => !isOutOfStock && dispatch(addToCart({ product: item, quantity: 1 }))}
                                sx={{
                                    ...(isInCart ? btnInCart : btnCart),
                                    ...(isOutOfStock && { 
                                        backgroundColor: "#e0e0e0 !important", 
                                        color: "#aaa !important",
                                        boxShadow: "none" 
                                    })
                                }}
                                endIcon={!isOutOfStock && (
                                    <Box 
                                        component="img" 
                                        src={isInCart ? incart : shopping} 
                                        sx={{ width: 24, height: 24 }} 
                                    />
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
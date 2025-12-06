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

export default function AccessoriesCardData({ products, favorites, onToggleFavorite  }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartEntries = useSelector(selectCartItems);

    const handleAddToCart = (item) =>
        dispatch(addToCart({ product: { ...item, price: Number(item.price) || 0 }, quantity: 1 }));

    if (!products || products.length === 0) return <Typography>No accessories found</Typography>;

    return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
            {products.map(item => {
                const itemId = String(item.id);
                const cartKey = `${item.id}`;
                const isInCart = cartEntries.some(([key]) => key === cartKey);
                const price = Number(item.price) || 0;

                return (
                    <Card key={cartKey} sx={{ width: 300, height: 480, display: "flex", flexDirection: "column", borderRadius: 2, p: 2, boxShadow: 2 }}>
                        <Box sx={{ position: "relative", width: "100%", height: 250, mb: 2 }}>
                            {item.photos_url?.[0]?.url ? (
                                <CardMedia component="img" image={item.photos_url[0].url} alt={item.name} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            ) : (
                                <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f0f0f0", color: "#888" }}>
                                    No image
                                </Box>
                            )}
                            <Box
                                component="img"
                                src={favorites?.[itemId] ? favoriteActive : favorite}
                                alt="favorite"
                                sx={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(item);
                                }}
                            />
                        </Box>
                        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                            <Box sx={{ height: 88, overflow: "hidden" }}>
                                <Typography sx={{ ...h4, mb: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }} onClick={() => navigate(`/accessories/product/${item.id}`)}>
                                    {item.name || "No name"}
                                </Typography>
                                <ClampText lines={2} sx={{ ...h7, mb: 1, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                                    {item.description || "No description"}
                                </ClampText>
                            </Box>
                            <Typography sx={{ mt: 1, color: "#16675C", fontSize: 14, fontWeight: 700, textAlign: "right", mb: 1 }}>
                                ${price.toFixed(2)}
                            </Typography>
                            <Button variant="contained" onClick={() => handleAddToCart(item)} sx={isInCart ? btnInCart : btnCart}
                                endIcon={<Box component="img" src={isInCart ? incart : shopping} alt="" sx={{ width: 24, height: 24, ml: 1 }} />}
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


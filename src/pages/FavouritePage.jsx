import React, { useEffect, useMemo, useRef, useState } from "react";
import { Grid, Box, Typography, CircularProgress, Card, CardContent, CardMedia, Button, IconButton, Snackbar, Tooltip } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ShareIcon from "@mui/icons-material/Share";
import { h5, h4, h7 } from "../styles/typographyStyles.jsx";
import { btnCart, btnInCart } from "../styles/btnStyles.jsx";
import favorite from "../assets/icons/favorite.svg";
import favoriteActive from "../assets/icons/favorite-active.svg";
import incart from "../assets/icons/incart.svg";
import shopping from "../assets/icons/shopping.svg";
import { fetchFavorites, toggleFavoriteItem } from "../store/slice/favoritesSlice.jsx";
import { selectCartItems, addToCart } from "../store/slice/cartSlice.jsx";
import ClampText from "../components/ClampText.jsx";

export default function FavouritePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { favorites, loading } = useSelector(state => state.favorites);
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const cartEntries = useSelector(selectCartItems);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");


  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    const accessToken = token || localStorage.getItem("access");
    if (accessToken && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      dispatch(fetchFavorites());
    }

    if (!accessToken) {
      hasLoadedRef.current = false;
    }
  }, [dispatch, token]);

  const allFavorites = useMemo(() => {
    if (favorites.length === 0) return [];
    const shuffled = [...favorites].sort((a, b) => {
      const keyA = `${a.type || 'unknown'}-${a.id}`;
      const keyB = `${b.type || 'unknown'}-${b.id}`;

      let hashA = 0;
      let hashB = 0;
      for (let i = 0; i < keyA.length; i++) {
        hashA = ((hashA << 5) - hashA) + keyA.charCodeAt(i);
        hashA = hashA & hashA;
      }
      for (let i = 0; i < keyB.length; i++) {
        hashB = ((hashB << 5) - hashB) + keyB.charCodeAt(i);
        hashB = hashB & hashB;
      }
      return hashA - hashB;
    });
    
    return shuffled;
  }, [favorites]);

  const favoritesMap = useMemo(() => 
    favorites.reduce((acc, item) => ({ ...acc, [String(item.id)]: true }), {}),
    [favorites]
  );

  const handleToggleFavorite = (item) => {
    const itemType = item.type || (item.sku ? "product" : "accessory");
    dispatch(toggleFavoriteItem({ itemType, itemId: item.id, itemData: item }));
  };

  const handleAddToCart = (item) => {
    if (item.type === 'product') {
      const selectedSupply = item.supplies?.[0] || { id: "default", price: item.price || 0 };
      dispatch(
        addToCart({
          product: { ...item, price: Number(selectedSupply.price || item.price || 0), selectedSupplyId: selectedSupply.id },
          quantity: 1,
        })
      );
    } else {
      dispatch(addToCart({ product: { ...item, price: Number(item.price) || 0 }, quantity: 1 }));
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin + "/favourite";
    const shareText = `Check out my favorite products from Coffee Lane! ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Favorite Products",
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          // console.error("Error sharing:", error);
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbarMessage("Link copied to clipboard!");
      setSnackbarOpen(true);
    } catch (error) {
      // console.error("Failed to copy:", error);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setSnackbarMessage("Link copied to clipboard!");
        setSnackbarOpen(true);
      } catch (err) {
        // console.error("Fallback copy failed:", err);
        setSnackbarMessage("Failed to copy link");
        setSnackbarOpen(true);
      }
      document.body.removeChild(textArea);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container sx={{ p: 4 }}>
      <Grid size={12}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#3E3027", fontFamily: "Kefa", fontWeight: 400, fontSize: "40px", mb: 1 }}>
            Favourite products
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 4 }}>
            <Tooltip title="Share favorites list">
              <IconButton onClick={handleShare} sx={{ color: "#16675C", "&:hover": { backgroundColor: "rgba(22, 103, 92, 0.1)"}}}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Typography sx={{ ...h5 }}>
              Share a link to the list of your favorite products with friends!
            </Typography>
          </Box>
        </Box>

        {allFavorites.length > 0 && (
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
            {allFavorites.map((item) => {
              const itemId = String(item.id);
              const isFavorite = favoritesMap?.[itemId];

              const isProduct = item.type === 'product';
              const selectedSupply = isProduct ? (item.supplies?.[0] || { id: "default", price: item.price || 0 }) : null;
              const cartKey = isProduct ? `${item.id}-${selectedSupply.id}` : `${item.id}`;
              const isInCart = cartEntries.some(([key]) => key === cartKey);
              const price = isProduct 
                ? Number(selectedSupply.price || item.price || 0)
                : Number(item.price) || 0;
              const productPath = isProduct 
                ? `/coffee/product/${item.id}`
                : `/accessories/product/${item.id}`;

              return (
                <Card
                  key={cartKey}
                  sx={{ width: 300, height: 480, display: "flex", flexDirection: "column", borderRadius: "24px", p: 2, boxShadow: 2 }}
                >
                  <Box sx={{ position: "relative", width: "100%", height: 250, mb: 2 }}>
                    {item.photos_url?.[0]?.url ? (
                      <CardMedia
                        component="img"
                        image={item.photos_url[0].url}
                        alt={item.name}
                        sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f0f0f0", color: "#888" }}>
                        No image
                      </Box>
                    )}
                    <Box
                      component="img"
                      src={isFavorite ? favoriteActive : favorite}
                      alt="favorite"
                      sx={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item);
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ height: 88, overflow: "hidden" }}>
                      <Typography
                        sx={{ ...h4, mb: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}
                        onClick={() => navigate(productPath)}
                      >
                        {item.name || "No name"}
                      </Typography>
                      <ClampText lines={2} sx={{ ...h7, mb: 1, wordBreak: "break-word", overflowWrap: "anywhere" }}>
                        {item.description || "No description"}
                      </ClampText>
                    </Box>
                    <Typography sx={{ mt: 1, color: "#16675C", fontSize: 14, fontWeight: 700, textAlign: "right", mb: 1 }}>
                      ${price.toFixed(2)}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleAddToCart(item)}
                      sx={isInCart ? btnInCart : btnCart}
                      endIcon={
                        <Box component="img" src={isInCart ? incart : shopping} alt="" sx={{ width: 24, height: 24, ml: 1 }} />
                      }
                    >
                      {isInCart ? "In cart" : "Add to bag"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {/* {!user && !token && (
          <Typography sx={{ textAlign: "center", mt: 4 }}>
            Please log in to view your favorite products
          </Typography>
        )} */}
        {user && allFavorites.length === 0 && (
          <Typography sx={{ textAlign: "center", mt: 4 }}>No favorites found</Typography>
        )}
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Grid>
  );
}


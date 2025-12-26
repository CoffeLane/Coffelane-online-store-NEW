import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, CircularProgress, Card, CardContent, CardMedia, Button, IconButton, Snackbar, Tooltip } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { h5, h4, h7 } from "../styles/typographyStyles.jsx";
import { btnCart, btnInCart } from "../styles/btnStyles.jsx";
import favorite from "../assets/icons/favorite.svg";
import favoriteActive from "../assets/icons/favorite-active.svg";
import incart from "../assets/icons/incart.svg";
import shopping from "../assets/icons/shopping.svg";
import { fetchFavorites, toggleFavoriteItem } from "../store/slice/favoritesSlice.jsx";
import { selectCartItems, addToCart } from "../store/slice/cartSlice.jsx";
import ClampText from "../components/ClampText.jsx";
import LoginModal from "../components/Modal/LoginModal.jsx";

export default function FavouritePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { favorites, loading } = useSelector(state => state.favorites);
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const cartEntries = useSelector(selectCartItems);
  const [loginOpen, setLoginOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const hasLoadedRef = useRef(false);
  const modalOpenedRef = useRef(false);

 
  useEffect(() => {
    if (!token || !user) {
      if (!token && !modalOpenedRef.current) {
        modalOpenedRef.current = true;
        setLoginOpen(true);
      }
      return;
    }

    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      dispatch(fetchFavorites());
    }
  }, [token, user, dispatch]);

  const favoritesMap = useMemo(() => {
    return favorites.reduce((acc, item) => {
      acc[String(item.id)] = true;
      return acc;
    }, {});
  }, [favorites]);

 const allFavorites = useMemo(() => {
    if (favorites.length === 0) return [];
    const shuffled = [...favorites].sort((a, b) => {
      const keyA = `${a.type || "unknown"}-${a.id}`;
      const keyB = `${b.type || "unknown"}-${b.id}`;

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

  const handleToggleFavorite = (item) => {
    if (!token) {
      setLoginOpen(true);
      return;
    }

    const itemType = item.type || (item.sku ? "product" : "accessory");
    dispatch(toggleFavoriteItem({ itemType, itemId: item.id, itemData: item }));
  };

  const handleAddToCart = (item) => {
    if (item.type === "product") {
      const selectedSupply = item.supplies?.[0] || { id: "default", price: item.price || 0 };

      dispatch(
        addToCart({
          product: {
            ...item,
            price: Number(selectedSupply.price || item.price || 0),
            selectedSupplyId: selectedSupply.id,
          },
          quantity: 1,
        })
      );
    } else {
      dispatch(
        addToCart({
          product: { ...item, price: Number(item.price) || 0 },
          quantity: 1,
        })
      );
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin + "/favourite";

    try {
      await navigator.share({
        title: "My Favorite Products",
        url: shareUrl,
      });
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setSnackbarMessage("Link copied to clipboard!");
      setSnackbarOpen(true);
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
    <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 4, md: 4 } }}>
      {user && (
        <Box>
          <Typography sx={{ color: "#3E3027", fontFamily: "Kefa", fontWeight: 400, fontSize: { xs: "24px", sm: "32px", md: "40px" }, mb: 1, textAlign: "center" }}>
            Favourite products
          </Typography>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "center" }, gap: 1, mb: 4, flexWrap: "wrap" }}>
              <Tooltip title="Share favorites list">
                <IconButton
                  onClick={handleShare}
                  sx={{ color: "#16675C", "&:hover": { backgroundColor: "rgba(22, 103, 92, 0.1)" } }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>

              <Typography sx={{ ...h5, fontSize: { xs: "14px", md: "18px" } }}>
                Share a link to the list of your favorite products with friends!
              </Typography>
            </Box>
          </Box>
        )}

        {user && allFavorites.length > 0 && (
          <Box sx={{ display: "flex", gap: { xs: 2, md: 3 }, flexWrap: "wrap", justifyContent: { xs: "center", md: "center" } }}>
            {allFavorites.map((item) => {
              const itemId = String(item.id);
              const isFavorite = favoritesMap[itemId];

              const isProduct = item.type === "product";
              const selectedSupply = isProduct ? item.supplies?.[0] || { id: "default", price: item.price || 0 } : null;
              const cartKey = isProduct ? `${item.id}-${selectedSupply.id}` : `${item.id}`;
              const isInCart = cartEntries.some(([key]) => key === cartKey);
              const price = isProduct
                ? Number(selectedSupply.price || item.price || 0)
                : Number(item.price) || 0;

              const productPath = isProduct
                ? `/coffee/product/${item.id}`
                : `/accessories/product/${item.id}`;

              return (
                <Card key={cartKey} sx={{ width: { xs: "100%", sm: 280, md: 300 }, maxWidth: { xs: "100%", sm: 280, md: 300 }, height: { xs: "auto", md: 480 }, minHeight: { xs: 420, md: 480 }, display: "flex", flexDirection: "column", borderRadius: { xs: "16px", md: "24px" }, p: { xs: 1.5, md: 2 }, boxShadow: 2}}>
                  <Box sx={{ position: "relative", width: "100%", height: { xs: 200, md: 250 }, mb: { xs: 1.5, md: 2 } }}>
                    {item.photos_url?.[0]?.url ? (
                      <CardMedia component="img" image={item.photos_url[0].url} alt={item.name} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f0f0f0", color: "#888" }} >
                        No image
                      </Box>
                    )}

                    <Box component="img" src={isFavorite ? favoriteActive : favorite} alt="favorite"
                      sx={{ position: "absolute", top: { xs: 8, md: 16 }, right: { xs: 8, md: 16 }, width: { xs: 24, md: 32 }, height: { xs: 24, md: 32 }, cursor: "pointer"}}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item);
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: { xs: "8px !important", md: "16px !important" }, "&:last-child": { pb: { xs: 1, md: 2 } } }}>
                    <Box sx={{ height: { xs: 70, md: 88 }, overflow: "hidden", mb: { xs: 0.5, md: 1 } }}>
                      <Typography sx={{ ...h4, mb: { xs: 0.5, md: 1 }, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer", fontSize: { xs: "16px", md: "20px" }}}
                        onClick={() => navigate(productPath)}
                      >
                        {item.name || "No name"}
                      </Typography>

                      <ClampText lines={2} sx={{ ...h7, mb: { xs: 0.5, md: 1 }, wordBreak: "break-word", fontSize: { xs: "12px", md: "14px" } }}>
                        {item.description || "No description"}
                      </ClampText>
                    </Box>

                    <Typography sx={{ mt: { xs: 0.5, md: 1 }, color: "#16675C", fontSize: { xs: 16, md: 18 }, fontWeight: 700, textAlign: "right", mb: { xs: 0.5, md: 1 } }}>
                      ${price.toFixed(2)}
                    </Typography>

                    <Button variant="contained" onClick={() => handleAddToCart(item)} sx={{ ...(isInCart ? btnInCart : btnCart), fontSize: { xs: "12px", md: "14px" }, py: { xs: 1, md: 1.25 }, mt: "auto" }}
                      endIcon={<Box component="img" src={isInCart ? incart : shopping} alt="" sx={{ width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 }, ml: { xs: 0.5, md: 1 } }} />}>
                      {isInCart ? "In cart" : "Add to bag"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {user && allFavorites.length === 0 && (
          <Typography sx={{ textAlign: "center", mt: 4 }}>No favorites found</Typography>
        )}
      <LoginModal open={loginOpen} handleClose={() => setLoginOpen(false)} />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

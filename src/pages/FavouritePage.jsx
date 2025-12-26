import React, { useEffect, useMemo, useRef, useState } from "react";
import { 
  Box, Typography, CircularProgress, Card, CardContent, 
  CardMedia, Button, IconButton, Snackbar, Tooltip, useMediaQuery, useTheme 
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import CoffeeIcon from '@mui/icons-material/Coffee'; 
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

// Вспомогательный компонент для изображений с обработкой ошибок (как в CoffeeCardData)
const FavoriteProductImage = ({ item, isMobile }) => {
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

export default function FavouritePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { favorites, loading } = useSelector(state => state.favorites);
  const token = useSelector(state => state.auth.token);
  const user = useSelector(state => state.auth.user);
  const cartEntries = useSelector(selectCartItems);
  
  const [loginOpen, setLoginOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const hasLoadedRef = useRef(false);
  const modalOpenedRef = useRef(false);

  // Загрузка данных и проверка авторизации
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

  // Мапа для быстрой проверки состояния "избранное"
  const favoritesMap = useMemo(() => {
    return favorites.reduce((acc, item) => {
      acc[String(item.id)] = true;
      return acc;
    }, {});
  }, [favorites]);

  // Список всех избранных с защитой от пустых данных
  const allFavorites = useMemo(() => {
    if (!favorites || favorites.length === 0) return [];
    return [...favorites];
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
    const isProduct = item.type === "product";
    const supply = isProduct ? item.supplies?.[0] : null;
    
    dispatch(addToCart({
      product: {
        ...item,
        price: isProduct ? Number(supply?.price || 0) : Number(item.price || 0),
        selectedSupplyId: supply?.id || null,
      },
      quantity: 1,
    }));
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin + "/favourite";
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Favorite Products", url: shareUrl });
      } else {
        throw new Error("Share not supported");
      }
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      setSnackbarMessage("Link copied to clipboard!");
      setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#16675C" }} />
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

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: { xs: "flex-start", md: "center" }, gap: 1, mb: 4, flexWrap: "nowrap" }}>
            <Tooltip title="Share favorites list">
              <IconButton onClick={handleShare} sx={{ color: "#16675C", "&:hover": { backgroundColor: "rgba(22, 103, 92, 0.1)" } }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Typography sx={{ ...h5, fontSize: { xs: "14px", md: "18px" } }}>
              Share a link to the list of your favorite products with friends!
            </Typography>
          </Box>
        </Box>
      )}

      {user && allFavorites.length > 0 ? (
        <Box sx={{ display: "flex", gap: { xs: 2, md: 3 }, flexWrap: "wrap", justifyContent: "center" }}>
          {allFavorites.map((item) => {
            const isProduct = item.type === "product";
            const supply = isProduct ? item.supplies?.[0] : null;
            const cartKey = isProduct ? `${item.id}-${supply?.id || 'default'}` : `${item.id}`;
            const isInCart = cartEntries.some(([key]) => key === cartKey);
            const price = isProduct ? Number(supply?.price || 0) : Number(item.price || 0);

            return (
              <Card key={cartKey} sx={{ 
                width: { xs: "100%", sm: 280, md: 300 }, 
                height: { xs: "auto", md: 480 }, 
                display: "flex", flexDirection: "column", 
                borderRadius: "24px", p: { xs: 1.5, md: 2 }, boxShadow: 2 
              }}>
                {/* Изображение */}
                <Box sx={{ position: "relative", width: "100%", height: { xs: 200, md: 250 }, mb: { xs: 1.5, md: 2 } }}>
                  <FavoriteProductImage item={item} isMobile={isMobile} />
                  
                  <Box 
                    component="img" 
                    src={favoritesMap[String(item.id)] ? favoriteActive : favorite} 
                    alt="favorite"
                    sx={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, cursor: "pointer", zIndex: 10 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item);
                    }}
                  />
                </Box>

                {/* Контент */}
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: '8px !important' }}>
                  <Box sx={{ height: { xs: 70, md: 88 }, overflow: "hidden" }}>
                    <Typography 
                      sx={{ ...h4, mb: 1, cursor: "pointer", fontSize: { xs: "16px", md: "18px" }, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      onClick={() => navigate(isProduct ? `/coffee/product/${item.id}` : `/accessories/product/${item.id}`)}
                    >
                      {item.name || "Unnamed"}
                    </Typography>
                    <ClampText lines={2} sx={{ ...h7, fontSize: { xs: "12px", md: "14px" } }}>
                      {item.description}
                    </ClampText>
                  </Box>

                  <Typography sx={{ mt: 'auto', color: "#16675C", fontSize: 18, fontWeight: 700, textAlign: "right", mb: 1 }}>
                    ${price.toFixed(2)}
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => handleAddToCart(item)}
                    sx={{ 
                      ...(isInCart ? btnInCart : btnCart),
                      fontSize: { xs: "12px", md: "14px" },
                      py: 1
                    }}
                    endIcon={<Box component="img" src={isInCart ? incart : shopping} sx={{ width: 22, height: 22 }} />}
                  >
                    {isInCart ? "In cart" : "Add to bag"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        !loading && user && (
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <CoffeeIcon sx={{ fontSize: 80, color: "#EEE", mb: 2 }} />
            <Typography sx={{ color: "#999", fontSize: "18px" }}>Your favorites list is empty</Typography>
          </Box>
        )
      )}

      {/* Модалки и уведомления */}
      <LoginModal open={loginOpen} handleClose={() => setLoginOpen(false)} />
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Box sx={{ 
          bgcolor: "#16675C", 
          color: "#fff", 
          px: 3, py: 1, 
          borderRadius: "20px", 
          boxShadow: 3,
          fontSize: "14px"
        }}>
          {snackbarMessage}
        </Box>
      </Snackbar>
    </Box>
  );
}
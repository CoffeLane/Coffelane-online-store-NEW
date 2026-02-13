import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";
import CoffeeIcon from "@mui/icons-material/Coffee";
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
import { getProductPrice, formatPrice } from "../utils/priceUtils.jsx";
import { buildImageUrl } from "../../components/utils/helpers.js";

export default function AccessoriesCardData({
  products,
  favorites,
  onToggleFavorite,
  isRecommended = false,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartEntries = useSelector(selectCartItems);
  const currency = useSelector((state) => state.settings.currency);
  const getPhotoUrl = (item) => {
    const photos =
      (item.accessory_photos?.length ? item.accessory_photos : null) ||
      (item.photos_url?.length ? item.photos_url : null) ||
      (item.product_photos?.length ? item.product_photos : null);

    let path = null;

    if (photos && photos[0]) {
      const p = photos[0];
      path = p?.photo || p?.url || (typeof p === "string" ? p : null);
    } else {
      path = item.image || item.photo || item.img;
    }
    return path;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: { xs: 2, md: 3 },
        justifyContent: "center",
        width: "100%",
      }}
    >
      {products.map((item) => {
        const itemId = String(item.id);
        const isInCart = cartEntries.some(([key]) => key === itemId);
        const isOutOfStock =
          (item.quantity !== undefined ? Number(item.quantity) : 0) <= 0;
        const finalImageUrl =
          item.displayImage || buildImageUrl(getPhotoUrl(item));

        return (
          <Card
            key={itemId}
            sx={{
              width: { xs: "100%", sm: "280px", md: "300px" },
              maxWidth: isRecommended ? "350px" : "none",
              minHeight: { xs: "340px", md: "480px" },
              display: "flex",
              flexDirection: "column",
              borderRadius: "24px",
              p: { xs: 1.5, md: 2 },
              boxShadow: 2,
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: 200, md: 300 },
                mb: 1,
                bgcolor: "#f5f5f5",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 0,
                }}
              >
                <CoffeeIcon sx={{ color: "#ccc", fontSize: 40 }} />
              </Box>

              {finalImageUrl && (
                <CardMedia
                  component="img"
                  key={finalImageUrl}
                  image={finalImageUrl}
                  alt={item.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    position: "relative",
                    zIndex: 1,
                    bgcolor: "#fff",
                  }}
                />
              )}

              <Box
                component="img"
                src={favorites?.[itemId] ? favoriteActive : favorite}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  zIndex: 2,
                }}
                onClick={() => onToggleFavorite(item)}
              />
            </Box>

            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                p: "0 !important",
              }}
            >
              <Typography
                onClick={() => navigate(`/accessories/product/${item.id}`)}
                sx={{
                  ...h4,
                  cursor: "pointer",
                  fontSize: { xs: "15px", md: "18px" },
                  mb: 1,
                  "&:hover": { color: "#16675C" },
                }}
              >
                {item.name}
              </Typography>

              <ClampText lines={2} sx={{ ...h7, opacity: 0.7, mb: 2 }}>
                {item.description}
              </ClampText>

              <Box sx={{ mt: "auto" }}>
                <Typography
                  sx={{
                    color: "#16675C",
                    fontWeight: 700,
                    textAlign: "right",
                    mb: 1,
                  }}
                >
                  {formatPrice(getProductPrice(item, currency), currency)}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={isOutOfStock}
                  onClick={() =>
                    !isOutOfStock &&
                    dispatch(addToCart({ product: item, quantity: 1 }))
                  }
                  sx={{
                    ...(isInCart ? btnInCart : btnCart),
                    fontSize: { xs: "11px", md: "14px" },
                    py: 1,
                  }}
                  endIcon={
                    !isOutOfStock && (
                      <Box
                        component="img"
                        src={isInCart ? incart : shopping}
                        sx={{ width: 20, height: 20 }}
                      />
                    )
                  }
                >
                  {isOutOfStock
                    ? "Sold Out"
                    : isInCart
                      ? "In cart"
                      : "Add to bag"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

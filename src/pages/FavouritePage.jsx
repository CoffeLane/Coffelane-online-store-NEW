import React, { useEffect } from "react";
import { Grid, Box, Typography, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import CoffeeCardData from "../components/Coffe/CoffeeCardData.jsx";
import AccessoriesCardData from "../components/Accessories/AccessoriesCardData.jsx";
import { h5 } from "../styles/typographyStyles.jsx";
import { fetchFavorites, toggleFavoriteItem } from "../store/slice/favoritesSlice.jsx";

export default function FavouritePage() {
  const dispatch = useDispatch();
  const { favorites, loading } = useSelector(state => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const favoriteProducts = favorites.filter(item => item.sku || item.price);
  const favoriteAccessories = favorites.filter(item => !item.sku && item.price);

  const handleToggleFavorite = (item) => {
    const itemType = item.sku ? "product" : "accessory";
    dispatch(toggleFavoriteItem({ itemType, itemId: item.id }));
  };

  return (
    <Grid container sx={{ p: 4 }}>
      <Grid size={12}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#3E3027", fontFamily: "Kefa", fontWeight: 400, fontSize: "40px", mb: 1 }}>
            Favourite products
          </Typography>
          <Typography sx={{ ...h5, mb: 4 }}>
            Share a link to the list of your favorite products with friends!
          </Typography>
        </Box>

        {favoriteProducts.length > 0 && (
          <CoffeeCardData
            products={favoriteProducts}
            favorites={favorites.reduce((acc, item) => ({ ...acc, [item.id]: true }), {})}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {favoriteAccessories.length > 0 && (
          <AccessoriesCardData
            products={accessories}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {favoriteProducts.length === 0 && favoriteAccessories.length === 0 && (
          <Typography>No favorites found</Typography>
        )}
      </Grid>
    </Grid>
  );
}





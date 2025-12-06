import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { h3 } from '../../styles/typographyStyles.jsx';
import AccessoriesCardData from '../../components/Accessories/AccessoriesCardData.jsx'
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavoriteItem, fetchFavorites } from '../../store/slice/favoritesSlice.jsx';

export default function RecommendedAccessories({ products }) {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const accessToken = token || localStorage.getItem("access");
    if (accessToken) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, token]);

  const handleToggleFavorite = (item) => {
    dispatch(toggleFavoriteItem({ itemType: "accessory", itemId: item.id, itemData: item }));
  };

  const favoritesMap = useMemo(() => 
    favorites.reduce((acc, item) => ({ ...acc, [String(item.id)]: true }), {}),
    [favorites]
  );

  if (!products || products.length === 0) return null;

  return (
    <Box>
      <Typography sx={{ ...h3, textAlign: 'center', mb: 4 }}>
        You also might like
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <AccessoriesCardData 
          products={products} 
          favorites={favoritesMap}
          onToggleFavorite={handleToggleFavorite}
        />
      </Box>
    </Box>
  )
}
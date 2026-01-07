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
    if (token || localStorage.getItem("access")) dispatch(fetchFavorites());
  }, [dispatch, token]);

  const favoritesMap = useMemo(() =>
    favorites.reduce((acc, item) => ({ ...acc, [String(item.id)]: true }), {}), [favorites]
  );

  if (!products || products.length === 0) return null;

  return (
    <Box sx={{ mt: { xs: 6, md: 10 }, px: { xs: 1, md: 0 } }}>
      <Typography sx={{ ...h3, textAlign: 'center', mb: { xs: 4, md: 4 }, fontSize: { xs: '24px', md: '32px' } }}>
        You also might like
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <AccessoriesCardData
          products={products}
          favorites={favoritesMap}
          onToggleFavorite={(item) => dispatch(toggleFavoriteItem({ itemType: "accessory", itemId: item.id, itemData: item }))}
          isRecommended={true}
        />
      </Box>
    </Box>
  )
}
import React, { useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { h3 } from '../../styles/typographyStyles.jsx';
import CoffeeCardData from '../../components/Coffe/CoffeeCardData.jsx'
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavoriteItem, fetchFavorites } from '../../store/slice/favoritesSlice.jsx';

export default function RecommendedProducts({ products }) {
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
    const itemType = item.sku ? "product" : "accessory";

    dispatch(toggleFavoriteItem({ itemType, itemId: item.id, itemData: item }));
  };

  const favoritesMap = useMemo(() => 
    favorites.reduce((acc, item) => ({ ...acc, [String(item.id)]: true }), {}),
    [favorites]
  );

  if (!products || products.length === 0) return null;

  return (
    <Box sx={{ px: { xs: 1, md: 0 } }}>
      <Typography sx={{ 
        ...h3, 
        textAlign: 'center', 
        mb: { xs: 2, md: 4 },
        fontSize: { xs: '24px', md: '32px' }
      }}>
        You also might like
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        flexWrap: 'wrap', 
        gap: { xs: 2, md: 3 }, 
        mb: { xs: 2, md: 4 }
      }}>
        <CoffeeCardData 
          products={products} 
          favorites={favoritesMap}
          onToggleFavorite={handleToggleFavorite}
        />
      </Box>
    </Box>
  )
}
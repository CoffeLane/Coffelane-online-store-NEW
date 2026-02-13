import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Box, Grid, CircularProgress } from "@mui/material";
import { fetchAccessoryById } from "../store/slice/accessoriesSlice.jsx";
import AccessoriesInfo from "../components/AccessoriesCard/AccessoriesInfo.jsx";
import AddToCartButtons from "../components/AccessoriesCard/AddToCartButtons.jsx";
import AccessoriesImageSlider from "../components/AccessoriesCard/AccessoriesImageSlider.jsx";
import RecommendedAccessories from "../components/AccessoriesCard/RecommendedAccessories.jsx";
import { buildImageUrl } from "../components/utils/helpers.js";

export default function AccessoriesCardPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items, selectedAccessory, loading } = useSelector((state) => state.accessories);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchAccessoryById(id));
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, dispatch]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!selectedAccessory) return <Box sx={{ py: 10, textAlign: 'center' }}>Not found</Box>;

  const recommended = items.filter((p) => String(p.id) !== String(id)).slice(0, 3);

  const getPhotosForSlider = (accessory) => {
  // 1. Собираем массив из всех возможных источников
  const rawPhotos = 
    (accessory.accessory_photos?.length ? accessory.accessory_photos : null) || 
    (accessory.photos_url?.length ? accessory.photos_url : null) || 
    (accessory.product_photos?.length ? accessory.product_photos : null);

  if (rawPhotos) {
    // Преобразуем массив объектов или строк в массив полных URL
    return rawPhotos.map(p => {
      const path = p?.photo || p?.url || (typeof p === "string" ? p : null);
      return buildImageUrl(path);
    }).filter(Boolean); // Убираем пустые значения
  }

  // 2. Если массивов нет, пробуем одиночные поля
  const singlePath = accessory.cover || accessory.image || accessory.photo;
  return singlePath ? [buildImageUrl(singlePath)] : [];
};

  return (
    <Box sx={{ width: "100%", pb: 10 }}>
      <Grid container sx={{ 
        px: { xs: 2, md: 6 }, py: { xs: 4, md: 8 }, 
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "center", gap: { xs: 4, md: 10 }
      }}>
        <Box sx={{ width: { xs: "100%", md: "400px" }, display: "flex", justifyContent: "center" }}>
          <AccessoriesImageSlider  
           photos={getPhotosForSlider(selectedAccessory)}
            productName={selectedAccessory.name}
          />
        </Box>

        <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: 500 } }}>
          <AccessoriesInfo 
            product={selectedAccessory} quantity={quantity} 
            onIncrement={() => setQuantity(q => q + 1)} 
            onDecrement={() => setQuantity(q => q > 1 ? q - 1 : 1)}
          />
          <Box sx={{ mt: 4 }}>
            <AddToCartButtons product={selectedAccessory} quantity={quantity}/>
          </Box>
        </Box>
      </Grid>

      <RecommendedAccessories products={recommended} />
    </Box>
  );
}

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Box, Grid } from "@mui/material";
import { fetchAccessoryById } from "../store/slice/accessoriesSlice.jsx";
import AccessoriesInfo from "../components/AccessoriesCard/AccessoriesInfo.jsx";
import AddToCartButtons from "../components/AccessoriesCard/AddToCartButtons.jsx";
import AccessoriesImageSlider from "../components/AccessoriesCard/AccessoriesImageSlider.jsx";
import RecommendedAccessories from "../components/AccessoriesCard/RecommendedAccessories.jsx";

export default function AccessoriesCardPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { items, selectedAccessory, loading } = useSelector((state) => state.accessories );


  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchAccessoryById(id));
  }, [id, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (!selectedAccessory) return <div>Accessoryes not found</div>;

  const recommended = items.filter((p) => p.id !== selectedAccessory.id).slice(0, 3);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <Box sx={{ width: "100%" }}>
      <Grid 
        container 
        sx={{ 
          px: { xs: 1, md: 4 }, 
          py: { xs: 2, md: 4 }, 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-evenly", 
          gap: { xs: 2, md: 3 }, 
          mt: { xs: 2, md: 4 }
        }}
      >
        <Box sx={{ width: { xs: "100%", md: "auto" } }}>
          <AccessoriesImageSlider photos={selectedAccessory.photos_url} productName={selectedAccessory.name}/>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, maxWidth: { xs: "100%", md: 600 }, width: { xs: "100%", md: "auto" } }} >
          <AccessoriesInfo product={selectedAccessory} quantity={quantity} onIncrement={handleIncrement} onDecrement={handleDecrement}/>
          <AddToCartButtons product={selectedAccessory} quantity={quantity}/>
        </Box>
      </Grid>

      <Box sx={{ px: { xs: 1, md: 4 }, py: { xs: 2, md: 4 } }}>
        <RecommendedAccessories products={recommended} />
      </Box>
    </Box>
  );
}

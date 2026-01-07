import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Box, Grid, CircularProgress } from "@mui/material";
import { fetchProductById } from "../store/slice/productsSlice.jsx";
import ProductInfo from "../components/ProductCard/ProductInfo.jsx";
import AddToCartButtons from "../components/ProductCard/AddToCartButtons.jsx";
import ProductImageSlider from "../components/ProductCard/ProductImageSlider.jsx";
import ProductAccordion from "../components/ProductCard/ProductAccordion.jsx";
import RecommendedProducts from "../components/ProductCard/RecommendedProducts.jsx";

export default function ProductCardPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items, selectedProduct, loading } = useSelector((state) => state.products);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSupplyId, setSelectedSupplyId] = useState(null);

  useEffect(() => {
    dispatch(fetchProductById(id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, dispatch]);

  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setSelectedSupplyId(selectedProduct.supplies?.[0]?.id || null);
    }
  }, [selectedProduct]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#A4795B' }}/></Box>;
  if (!selectedProduct) return <Box sx={{ py: 10, textAlign: 'center' }}>Product not found</Box>;

  const recommended = items.filter((p) => String(p.id) !== String(id)).slice(0, 3);

  return (
    <Box sx={{ width: "100%", pb: 8 }}>
      <Grid container sx={{ 
        px: { xs: 2, md: 6 }, py: { xs: 2, md: 6 },
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "center", md: "flex-start" },
        justifyContent: "center",
        gap: { xs: 4, md: 8 }
      }}>

        <Box sx={{ width: { xs: "100%", md: "450px" }, display: 'flex', justifyContent: 'center' }}>
          <ProductImageSlider 
            photos={
              (selectedProduct.photos_url && selectedProduct.photos_url.length > 0) 
                ? selectedProduct.photos_url 
                : (selectedProduct.product_photos && selectedProduct.product_photos.length > 0)
                  ? selectedProduct.product_photos
                  : []
            } 
            productName={selectedProduct.name} 
          />
        </Box>

        <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: 550 }, width: "100%" }}>
          <ProductInfo 
            product={selectedProduct} 
            quantity={quantity} 
            onIncrement={() => setQuantity(q => q + 1)} 
            onDecrement={() => setQuantity(q => q > 1 ? q - 1 : 1)} 
            selectedSupplyId={selectedSupplyId} 
            setSelectedSupplyId={setSelectedSupplyId} 
          />
          <Box sx={{ mt: 3 }}>
            <AddToCartButtons product={selectedProduct} quantity={quantity} selectedSupplyId={selectedSupplyId} />
          </Box>
        </Box>
      </Grid>

      <Box sx={{ px: { xs: 2, md: 6 }, mt: 4 }}>
        <ProductAccordion product={selectedProduct} />
        <RecommendedProducts products={recommended} />
      </Box>
    </Box>
  );
}

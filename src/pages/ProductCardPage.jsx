import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Box, Grid } from "@mui/material";
import { fetchProductById } from "../store/slice/productsSlice.jsx";
import ProductInfo from "../components/ProductCard/ProductInfo.jsx";
import AddToCartButtons from "../components/ProductCard/AddToCartButtons.jsx";
import ProductImageSlider from "../components/ProductCard/ProductImageSlider.jsx";
import ProductAccordion from "../components/ProductCard/ProductAccordion.jsx";
import RecommendedProducts from "../components/ProductCard/RecommendedProducts.jsx";

export default function ProductCardPage() {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { items, selectedProduct, loading } = useSelector(
        (state) => state.products
    );
console.log("🔍 [PRODUCT] Items:", items);

    const [quantity, setQuantity] = useState(1);
    const [selectedSupplyId, setSelectedSupplyId] = useState(null);

    useEffect(() => {
        dispatch(fetchProductById(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (selectedProduct) {
            setQuantity(1);
            setSelectedSupplyId(selectedProduct.supplies?.[0]?.id || null);
        }
    }, [selectedProduct]);

    if (loading) return <div>Loading...</div>;
    if (!selectedProduct) return <div>Product not found</div>;

    const recommended = items
        .filter((p) => p.id !== selectedProduct.id)
        .slice(0, 3);
    const handleIncrement = () => setQuantity((prev) => prev + 1);
    const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    return (
        <Box sx={{ width: "100%" }}>
            <Grid container sx={{ 
                px: { xs: 1, sm: 2, md: 4 }, 
                py: { xs: 2, md: 4 }, 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-evenly', 
                gap: { xs: 2, md: 3 }, 
                mt: { xs: 2, md: 4 } 
            }}>
                <Box sx={{ width: { xs: '100%', md: 'auto' }, order: { xs: 1, md: 0 } }}>
                    <ProductImageSlider photos={selectedProduct.photos_url} productName={selectedProduct.name} />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", flex: 1, maxWidth: { xs: '100%', md: 600 }, order: { xs: 2, md: 0 } }}>
                    <ProductInfo product={selectedProduct} quantity={quantity} onIncrement={handleIncrement} onDecrement={handleDecrement} selectedSupplyId={selectedSupplyId} setSelectedSupplyId={setSelectedSupplyId} />
                    <AddToCartButtons product={selectedProduct} quantity={quantity} selectedSupplyId={selectedSupplyId} />
                </Box>
            </Grid>

            <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, md: 4 } }}>
                <ProductAccordion product={selectedProduct} />
            </Box>

            <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, md: 4 } }}>
                <RecommendedProducts products={recommended} />
            </Box>
        </Box>
    );
}


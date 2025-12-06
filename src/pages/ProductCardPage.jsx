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
    // console.log('Product',selectedProduct)
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
            <Grid container sx={{ px: 4, py: 4, display: 'flex', justifyContent: 'space-evenly', gap: 3, mt: 4 }}>
                <Box>
                    <ProductImageSlider photos={selectedProduct.photos_url} productName={selectedProduct.name} />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", flex: 1, maxWidth: 600, }}>
                    <ProductInfo product={selectedProduct} quantity={quantity} onIncrement={handleIncrement} onDecrement={handleDecrement} selectedSupplyId={selectedSupplyId} setSelectedSupplyId={setSelectedSupplyId} />
                    <AddToCartButtons product={selectedProduct} quantity={quantity} selectedSupplyId={selectedSupplyId} />
                </Box>
            </Grid>

            <Box sx={{ px: 4, py: 4 }}>
                <ProductAccordion product={selectedProduct} />
            </Box>

            <Box sx={{ px: 4, py: 4 }}>
                <RecommendedProducts products={recommended} />
            </Box>
        </Box>
    );
}



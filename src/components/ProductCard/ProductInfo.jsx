import React from "react";
import { Box, Typography } from "@mui/material";
import WeightSelector from "./WeightSelector";
import QuantitySelector from "./QuantitySelector";
import { h3, h6 } from "../../styles/typographyStyles.jsx";
import { useSelector } from "react-redux";

export default function ProductInfo({ quantity, onIncrement, onDecrement, selectedSupplyId, setSelectedSupplyId, }) {

    const product = useSelector((state) => state.products.selectedProduct);

    if (!product) return null;

    const selectedSupply = product.supplies?.find((s) => s.id === selectedSupplyId);
    const price = selectedSupply ? Number(selectedSupply.price) : Number(product.price);
    const total = price * quantity;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 }, flex: 1, maxWidth: { xs: '100%', md: 700 }, px: { xs: 2, md: 0 } }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 } }}>
                <Typography sx={{ ...h3, mb: { xs: 1, md: 2 }, fontSize: { xs: '24px', md: '32px' } }}>
                    {product.name || "No name"}
                </Typography>
                <Typography sx={{ ...h6, mb: { xs: 2, md: 3 }, fontSize: { xs: '14px', md: '18px' } }}>
                    {product.description || "No description"}
                </Typography>

                {selectedSupplyId && (
                    <>
                        <WeightSelector
                            product={product}
                            selectedSupplyId={selectedSupplyId}
                            setSelectedSupplyId={setSelectedSupplyId}
                        />

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: { xs: 2, md: 3 }, flexWrap: { xs: "wrap", md: "nowrap" }, gap: { xs: 2, md: 0 } }}>
                            <QuantitySelector
                                quantity={quantity}
                                onIncrement={onIncrement}
                                onDecrement={onDecrement}
                            />
                            <Typography sx={{ ...h3, color: "#A4795B", fontSize: { xs: '24px', md: '32px' } }}>
                                ${total.toFixed(2)}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </Box >
    );
};
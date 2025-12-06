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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, maxWidth: 700 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ ...h3, mb: 2 }}>{product.name || "No name"}</Typography>
                <Typography sx={{ ...h6, mb: 3 }}>{product.description || "No description"}</Typography>

                {selectedSupplyId && (
                    <>
                        <WeightSelector
                            product={product}
                            selectedSupplyId={selectedSupplyId}
                            setSelectedSupplyId={setSelectedSupplyId}
                        />

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
                            <QuantitySelector
                                quantity={quantity}
                                onIncrement={onIncrement}
                                onDecrement={onDecrement}
                            />
                            <Typography sx={{ ...h3, color: "#A4795B" }}>
                                ${total.toFixed(2)}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </Box >
    );
};
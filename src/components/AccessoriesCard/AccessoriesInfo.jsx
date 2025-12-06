import React from "react";
import { Box, Typography } from "@mui/material";
import QuantitySelector from "./QuantitySelector";
import { h3, h6 } from "../../styles/typographyStyles.jsx";

export default function AccessoriesInfo({ product, quantity, onIncrement, onDecrement, }) {

  if (!product) return null;

  const price = Number(product.price || 0);
  const total = price * quantity;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, maxWidth: 700 }}>
      <Typography sx={{ ...h3, mb: 2 }}>{product.name || "No name"}</Typography>
      <Typography sx={{ ...h6, mb: 3 }}>{product.description || "No description"}</Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
        <QuantitySelector quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
        <Typography sx={{ ...h3, color: "#A4795B" }}>
          ${total.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
}

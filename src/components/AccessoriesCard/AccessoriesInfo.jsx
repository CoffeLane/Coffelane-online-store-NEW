import React from "react";
import { Box, Typography } from "@mui/material";
import QuantitySelector from "./QuantitySelector";
import { h3, h6 } from "../../styles/typographyStyles.jsx";
import { useSelector } from "react-redux";
import { getProductPrice, formatPrice } from "../utils/priceUtils.jsx";

export default function AccessoriesInfo({ product, quantity, onIncrement, onDecrement, }) {

  const currency = useSelector((state) => state.settings.currency);

  if (!product) return null;

  const price = getProductPrice(product, currency);
  const total = price * quantity;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, md: 2 }, flex: 1, maxWidth: { xs: "100%", md: 700 }, px: { xs: 2, md: 0 } }}>
      <Typography sx={{ ...h3, mb: { xs: 1, md: 2 }, fontSize: { xs: '24px', md: '32px' } }}>
        {product.name || "No name"}
      </Typography>
      <Typography sx={{ ...h6, mb: { xs: 2, md: 3 }, fontSize: { xs: '14px', md: '18px' } }}>
        {product.description || "No description"}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: { xs: 2, md: 3 }, flexWrap: { xs: "wrap", md: "nowrap" }, gap: { xs: 2, md: 0 } }}>
        <QuantitySelector quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
        <Typography sx={{ ...h3, color: "#A4795B", fontSize: { xs: '24px', md: '32px' } }}>
          {formatPrice(total, currency)}
        </Typography>
      </Box>
    </Box>
  );
}

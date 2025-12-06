import React from "react";
import { Box, Typography } from "@mui/material";
import { h5, h6 } from "../../styles/typographyStyles.jsx";

export default function WeightSelector({ product, selectedSupplyId, setSelectedSupplyId }) {
  if (!product?.supplies?.length || selectedSupplyId === null) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography sx={{ ...h5, mb: 1 }}>Total weight:</Typography>
      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        {product.supplies.map((supply) => (
          <Typography key={supply.id} sx={{ ...h6, border: selectedSupplyId === supply.id ? "3px solid #3E3027" : "1px solid #3E3027", borderRadius: "8px", p: 1, cursor: "pointer" }} onClick={() => { setSelectedSupplyId(supply.id) }}>
            {supply.weight}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}


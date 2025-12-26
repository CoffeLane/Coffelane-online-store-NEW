import React from "react";
import { Box, Typography } from "@mui/material";
import { h5, h6 } from "../../styles/typographyStyles.jsx";

export default function WeightSelector({ product, selectedSupplyId, setSelectedSupplyId }) {
  if (!product?.supplies?.length || selectedSupplyId === null) return null;

  return (
    <Box sx={{ mt: { xs: 1.5, md: 2 } }}>
      <Typography sx={{ ...h5, mb: { xs: 0.5, md: 1 }, fontSize: { xs: '14px', md: '18px' } }}>Total weight:</Typography>
      <Box sx={{ mt: { xs: 1.5, md: 2 }, display: "flex", gap: { xs: 0.75, md: 1 }, flexWrap: "wrap" }}>
        {product.supplies.map((supply) => (
          <Typography 
            key={supply.id} 
            sx={{ 
              ...h6, 
              border: selectedSupplyId === supply.id ? "3px solid #3E3027" : "1px solid #3E3027", 
              borderRadius: { xs: "6px", md: "8px" }, 
              p: { xs: 0.75, md: 1 }, 
              cursor: "pointer",
              fontSize: { xs: '14px', md: '18px' },
              minWidth: { xs: '50px', md: '60px' },
              textAlign: 'center'
            }} 
            onClick={() => { setSelectedSupplyId(supply.id) }}
          >
            {supply.weight}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}


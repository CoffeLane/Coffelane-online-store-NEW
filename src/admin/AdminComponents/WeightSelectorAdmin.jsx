import React from "react";
import { Box, Typography } from "@mui/material";
import { h6 } from "../../styles/typographyStyles.jsx";

const weights = ["250g", "500g", "1kg"];

export default function WeightSelectorAdmin({ weight, setWeight }) {
  return (
    <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
      {weights.map((item) => (
        <Typography
          key={item}
          onClick={() => setWeight(item)}
          sx={{
            ...h6,
            border: weight === item ? "2px solid #3E3027" : "1px solid #3E3027",
            borderRadius: "8px",
            px: 2,
            py: 1,
            cursor: "pointer",
            userSelect: "none",
            transition: "0.2s"
          }}
        >
          {item}
        </Typography>
      ))}
    </Box>
  );
}

import React from "react";
import { Box, Typography } from "@mui/material";
import { h6 } from "../../styles/typographyStyles.jsx";

const weights = ["250g", "500g", "1kg"];

export default function WeightSelectorAdmin({ weight, setWeight }) {
  const normalizeWeight = (w) => {
    if (!w) return null;
    const num = parseFloat(w.toString().replace(/g/gi, "").trim());
    return isNaN(num) ? null : num;
  };

  const isWeightSelected = (item) => {
    if (!weight) return false;
    const itemNum = normalizeWeight(item);
    const weightNum = normalizeWeight(weight);
    if (itemNum === null || weightNum === null) return false;
    return itemNum === weightNum;
  };

  const isLoadedFromBackend = () => {
    if (!weight) return false;
    return weight.toString().includes(".");
  };

  return (
    <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
      {weights.map((item) => {
        const isSelected = isWeightSelected(item);
        const isFromBackend = isLoadedFromBackend() && isSelected;
        
        return (
          <Typography
            key={item}
            onClick={() => setWeight(item)}
            sx={{
              ...h6,
              border: isFromBackend 
                ? "2px solid #000" 
                : isSelected 
                  ? "2px solid #3E3027" 
                  : "1px solid #3E3027",
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
        );
      })}
    </Box>
  );
}

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
    const weightStr = weight.toString().trim();
    const weightNum = normalizeWeight(weight);
    if (weightNum === null) return false;
    
    // Проверяем, что вес соответствует одному из вариантов (250, 500, 1000)
    const isValidWeight = weightNum === 250 || weightNum === 500 || weightNum === 1000;
    if (!isValidWeight) return false;
    
    // Если вес не в формате "250g", "500g", "1kg", значит он загружен с бэкенда
    // (пользователь выбирает в формате "250g", а бэкенд возвращает число или строку без "g")
    return !weightStr.toLowerCase().endsWith('g') && !weightStr.toLowerCase().endsWith('kg');
  };

  return (
    <Box
      sx={{
        mt: 1,
        display: "flex",
        gap: 1,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
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
              transition: "0.2s",
            }}
          >
            {item}
          </Typography>
        );
      })}
    </Box>
  );
}

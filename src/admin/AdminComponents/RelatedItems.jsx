import React from "react";
import { Card, Typography, Box, Button } from "@mui/material";
import { btnBorderStyles } from "../../styles/btnStyles";
import { h6, h4 } from "../../styles/typographyStyles.jsx";

export default function RelatedItems({ onAddItems }) {
  return (
    <Card sx={{ p: 3, borderRadius: "24px", my: 3 }}>
      <Typography  sx={h4}>Related items</Typography>
       <Typography sx={{ ...h6 }} mb={1}>
        Add related items to this product
      </Typography>

      <Box>
        <Button
          variant="outlined"
          fullWidth
          sx={{
            mt: 2,
            borderRadius: "20px",
            textTransform: "none",
            ...btnBorderStyles,
          }}
          onClick={onAddItems}
        >
          Add items
        </Button>
      </Box>
    </Card>
  );
}

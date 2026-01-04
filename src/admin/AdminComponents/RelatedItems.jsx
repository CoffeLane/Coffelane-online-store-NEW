import React from "react";
import { Card, Typography, Box, Button } from "@mui/material";
import {btnBorderStyles} from "../../styles/btnStyles";


export default function RelatedItems({ onAddItems }) {
 
  return (
    <Card sx={{ p: 3, borderRadius: "24px" }}>
      <Typography variant="h6">Related items</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Add related items to this product
      </Typography>

      <Box>
        <Button variant="outlined" fullWidth sx={{ mt: 2, borderRadius: "20px", textTransform: "none", ...btnBorderStyles }} onClick={onAddItems}>
          Add items
        </Button>
      </Box>
    </Card>
  );
}
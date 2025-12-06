import React from "react";
import { Box, Button } from "@mui/material";
import {  btnCart, btnStyles } from "../../styles/btnStyles";

export default function BottomButtons({ isProductReady, onSave }) {
  return (
    <Box display="flex" gap={2}>
      <Button variant="outlined" fullWidth disabled={!isProductReady} sx={{ ...btnStyles, textTransform: "none", backgroundColor: !isProductReady ? "#E0E0E0" : btnStyles.backgroundColor, color: !isProductReady ? "#9E9E9E" : btnStyles.color, borderColor: !isProductReady ? "#BDBDBD" : btnStyles.borderColor}}>
        Preview
      </Button>
      <Button variant="contained" fullWidth disabled={!isProductReady} onClick={onSave} sx={{ ...btnCart, backgroundColor: !isProductReady ? "#BDBDBD" : btnCart.backgroundColor, "&:hover": { backgroundColor: !isProductReady ? "#BDBDBD" : btnCart["&:hover"].backgroundColor }}}>
        Publish
      </Button>
    </Box>
  );
}


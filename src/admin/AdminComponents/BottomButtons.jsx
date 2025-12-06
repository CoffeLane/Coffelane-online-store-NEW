import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import {  btnCart, btnStyles } from "../../styles/btnStyles";

export default function BottomButtons({ isProductReady, onSave, loading = false }) {
  return (
    <Box display="flex" gap={2}>
      <Button variant="outlined" fullWidth disabled={!isProductReady || loading} sx={{ ...btnStyles, textTransform: "none", backgroundColor: !isProductReady ? "#E0E0E0" : btnStyles.backgroundColor, color: !isProductReady ? "#9E9E9E" : btnStyles.color, borderColor: !isProductReady ? "#BDBDBD" : btnStyles.borderColor}}>
        Preview
      </Button>
      <Button 
        variant="contained" 
        fullWidth 
        disabled={!isProductReady || loading} 
        onClick={onSave} 
        sx={{ 
          ...btnCart, 
          backgroundColor: (!isProductReady || loading) ? "#BDBDBD" : btnCart.backgroundColor, 
          "&:hover": { 
            backgroundColor: (!isProductReady || loading) ? "#BDBDBD" : (btnCart["&:hover"]?.backgroundColor || btnCart.backgroundColor)
          }
        }}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : "Publish"}
      </Button>
    </Box>
  );
}


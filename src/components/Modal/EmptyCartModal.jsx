import React from "react";
import { Drawer, Box, Typography, IconButton, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import emptyCartImage from "../../assets/images/cart/empty-cart.png";
import { h3, h4, h5 } from "../../styles/typographyStyles.jsx";

export default function EmptyCartModal({ open, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ "& .MuiDrawer-paper": { width: { xs: "100%", sm: 400, md: 480 }, boxSizing: "border-box", borderRadius: { xs: 0, sm: "40px 0 0 0" }, } }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", }}>
          <Typography sx={{ ...h3 }}>Shopping cart</Typography>
          {isMobile && (
            <IconButton onClick={onClose} size="small" aria-label="close" sx={{ position: "absolute", top: 8, right: 8, color: "#3E3027", }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <Box component="img" src={emptyCartImage} alt="Empty cart" sx={{ maxWidth: "300px", width: "100%", height: "auto", objectFit: "contain", mb: 3 }} />
          <Typography sx={{ ...h4, mb: 2, }}>Oops! Your cart is still empty.</Typography>
          <Typography sx={{ ...h5 }}>But our coffee is already waiting — take a look at the catalog!</Typography>
        </Box>
      </Box>
    </Drawer>
  );
}


import React, { useState } from "react"; 
import { Drawer, IconButton, Button, Box, Typography, Divider, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CoffeeIcon from '@mui/icons-material/Coffee'; 
import deleteIcon from "../../assets/icons/delete-icon.svg";
import { btnCart } from "../../styles/btnStyles.jsx";
import { h3, h5 } from "../../styles/typographyStyles.jsx";
import { useSelector } from "react-redux";
import { formatPrice } from "../utils/priceUtils.jsx";

const CartItemImage = ({ src, alt, isMobile }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <Box sx={{ 
        width: { xs: 80, md: 120 }, 
        height: { xs: 80, md: 120 }, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        bgcolor: "#f9f9f9", 
        borderRadius: "12px",
        border: "1px solid #eee",
        flexShrink: 0
      }}>
        <CoffeeIcon sx={{ color: "#16675C", fontSize: isMobile ? 30 : 40, opacity: 0.3 }} />
      </Box>
    );
  }

  return (
    <Box 
      component="img" 
      src={src} 
      alt={alt} 
      onError={() => setHasError(true)}
      sx={{ 
        width: { xs: 80, md: 120 }, 
        height: { xs: 80, md: 120 }, 
        objectFit: "contain", 
        borderRadius: 1,
        flexShrink: 0 
      }}
    />
  );
};

export default function BasketModal({
  open,
  onClose,
  items = [],
  onChangeQty = () => { },
  onRemove = () => { },
  onCheckout = () => { },
  discount = 0,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const currency = useSelector((state) => state.settings.currency);
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const total = subtotal - discount;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ "& .MuiDrawer-paper": { width: { xs: "100%", sm: 400, md: 480 }, boxSizing: "border-box", borderTopLeftRadius: { xs: 0, sm: "40px" }, } }} >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 2, md: 3 }, position: "relative" }}>
          <Typography sx={{ ...h3, fontSize: { xs: '20px', md: '24px' } }}>Shopping cart</Typography>
          {isMobile && (
            <IconButton onClick={onClose} sx={{ position: "absolute", top: 8, right: 8, color: "#3E3027" }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ flex: 1, overflow: "auto", px: { xs: 1, md: 2 } }}>
          <Box>
            {items.map((item, index) => (
              <Box key={item.id}>
                <Box sx={{ display: "flex", gap: { xs: 1, md: 2 }, py: { xs: 2, md: 3 }, position: "relative" }}>
                  <CartItemImage src={item.img} alt={item.name} isMobile={isMobile} />
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography sx={{ ...h5, pr: 2, fontSize: { xs: '14px', md: '16px' } }}>
                        {item.name}
                      </Typography>
                      <IconButton onClick={() => onRemove(item.id)} aria-label="remove" size="small" sx={{ padding: 0.5, "&:hover": { opacity: 0.7 }, }} >
                        <Box component="img" src={deleteIcon} alt="delete" sx={{ width: { xs: 16, md: 20 }, height: { xs: 16, md: 20 } }} />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                          onClick={() => onChangeQty(item.id, Math.max(1, item.qty - 1))}
                          aria-label="decrement"
                          sx={{
                            backgroundColor: "#3E3027",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#3E3027", opacity: 0.9 },
                            width: { xs: 20, md: 24 },
                            height: { xs: 20, md: 24 },
                            padding: 0,
                          }}
                        >
                          <RemoveIcon sx={{ fontSize: { xs: 14, md: 16 } }} />
                        </IconButton>

                        <Typography sx={{ ...h5, minWidth: { xs: 20, md: 24 }, textAlign: "center", fontSize: { xs: '14px', md: '16px' } }}>
                          {item.qty}
                        </Typography>

                        <IconButton
                          onClick={() => onChangeQty(item.id, item.qty + 1)}
                          aria-label="increment"
                          sx={{
                            backgroundColor: "#3E3027",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#3E3027", opacity: 0.9 },
                            width: { xs: 20, md: 24 },
                            height: { xs: 20, md: 24 },
                            padding: 0,
                          }}
                        >
                          <AddIcon sx={{ fontSize: { xs: 14, md: 16 } }} />
                        </IconButton>
                      </Box>

                      <Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>{formatPrice(item.price * item.qty, currency)}</Typography>
                    </Box>
                  </Box>
                </Box>
                {index < items.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: "divider", p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Subtotal</Typography>
              <Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>{formatPrice(subtotal, currency)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Discount</Typography>
              <Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>-{formatPrice(discount, currency)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>Total</Typography>
              <Typography sx={{ ...h5, fontSize: { xs: '14px', md: '16px' } }}>{formatPrice(total, currency)}</Typography>
            </Box>
          </Box>

          <Button fullWidth onClick={() => { onCheckout(); onClose(); }} disabled={items.length === 0} sx={{ ...btnCart, fontSize: { xs: '12px', md: '14px' }, py: { xs: 1, md: 1.5 } }}>
            PLACE ON ORDER
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
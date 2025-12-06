import React from "react";
import { Drawer, IconButton, Button, Box, Typography, Divider} from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import deleteIcon from "../../assets/icons/delete-icon.svg";
import { btnCart } from "../../styles/btnStyles.jsx";
import {h3, h5} from "../../styles/typographyStyles.jsx"

export default function BasketModal({
  open,
  onClose,
  items = [],
  onChangeQty = () => {},
  onRemove = () => {},
  onCheckout = () => {},
  discount = 0, 
}) {
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const total = subtotal - discount;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ "& .MuiDrawer-paper": { width: { xs: "100%", sm: 400, md: 480 }, boxSizing: "border-box", borderTopLeftRadius: "20px", }}} >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 3, position: "relative" }}>
          <Typography sx={{...h3 }}>Shopping cart</Typography>
          {/* <IconButton 
            onClick={onClose} 
            size="small" 
            aria-label="close"
            sx={{ position: "absolute", right: 16 }}
          >
            <CloseIcon />
          </IconButton> */}
        </Box>

        <Box sx={{ flex: 1, overflow: "auto", px: 2 }}>
          <Box>
            {items.map((item, index) => (
              <Box key={item.id}>
                <Box sx={{ display: "flex", gap: 2, py: 3, position: "relative" }}>
                  <Box component="img" src={item.img} alt={item.name} sx={{ width: 120, height: 120, objectFit: "contain", borderRadius: 1, }}/>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography sx={{...h5, pr: 2 }}>
                        {item.name}
                      </Typography>
                      <IconButton onClick={() => onRemove(item.id)} aria-label="remove" size="small" sx={{  padding: 0.5,"&:hover": { opacity: 0.7 }, }} >
                        <Box component="img" src={deleteIcon} alt="delete" sx={{ width: 20, height: 20 }} />
                      </IconButton>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center"}}>
                        <IconButton
                          onClick={() => onChangeQty(item.id, Math.max(1, item.qty - 1))}
                          aria-label="decrement"
                          sx={{
                            backgroundColor: "#3E3027",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#3E3027", opacity: 0.9 },
                            width: 24,
                            height: 24,
                            padding: 0,
                          }}
                        >
                          <RemoveIcon sx={{ fontSize: 16 }} />
                        </IconButton>

                        <Typography  sx={{...h5, minWidth: 24, textAlign: "center" }}>
                          {item.qty}
                        </Typography>

                        <IconButton
                          onClick={() => onChangeQty(item.id, item.qty + 1)}
                          aria-label="increment"
                          sx={{
                            backgroundColor: "#3E3027",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#3E3027", opacity: 0.9 },
                            width: 24,
                            height: 24,
                            padding: 0,
                          }}
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>

                      <Typography sx={{...h5 }}>${(item.price * item.qty).toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>
                {index < items.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: "divider", p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{...h5}}>Subtotal</Typography>
              <Typography sx={{...h5}}>${subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{...h5}}>Discount</Typography>
              <Typography sx={{...h5}}>-${discount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{...h5}}>Total</Typography>
             <Typography sx={{...h5}}>${total.toFixed(2)}</Typography>
            </Box>
          </Box>

          <Button fullWidth onClick={() => { onCheckout(); onClose(); }} disabled={items.length === 0} sx={btnCart}>
            PLACE ON ORDER
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

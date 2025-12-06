import { Box, Typography, IconButton } from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

export default function CartSummary({ items, handleRemove, handleQuantityChange, icondelete }) {

  return (
    <Box sx={{ flex: 1, backgroundColor: "#fff", p: 3, borderRadius: 2 }}>
      {items.map(([key, cartItem]) => {
        const { product, quantity } = cartItem;
        const supplies = product.supplies || [];
        const selectedSupply = supplies.find((s) => s.id === product.selectedSupplyId);
        const price = Number(selectedSupply?.price ?? product.price ?? 0);
        const weight = selectedSupply?.weight ?? null;

        return (
          <Box key={key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, p: 2, borderBottom: "1px solid #E0E0E0", }}>
            <Box component="img" src={product.photos_url?.[0]?.url} alt={product.name} sx={{ width: "100px", height: "auto", objectFit: "contain" }}/>
            <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, ml: 6, gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography>{product.name}</Typography>
                  {weight && (
                    <Typography variant="body2" color="text.secondary">
                      {weight}
                    </Typography>
                  )}
                </Box>
                <IconButton onClick={() => handleRemove(key)} color="error">
                  <Box component="img" src={icondelete} alt="icondelete" />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2,}}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton onClick={() => handleQuantityChange(key, -1, cartItem)} sx={{ backgroundColor: "#3E3027", color: "#fff", width: 24, height: 24, "&:hover": {backgroundColor: '#3E3027'}, "&:active": {backgroundColor: '#3E3027'}, "&:focus": {backgroundColor: '#3E3027'}, }}>
                    <RemoveIcon />
                  </IconButton>
                  <Typography>{quantity}</Typography>
                  <IconButton onClick={() => handleQuantityChange(key, 1, cartItem)} sx={{ backgroundColor: '#3E3027', color: '#fff',"&:hover": {backgroundColor: '#3E3027'}, "&:active": {backgroundColor: '#3E3027'}, "&:focus": {backgroundColor: '#3E3027'}, width: 24, height: 24 }} >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Typography>${(price * quantity).toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

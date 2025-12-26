import { Box, Typography, IconButton } from "@mui/material";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

export default function CartSummary({ items, handleRemove, handleQuantityChange, icondelete }) {

  return (
    <Box sx={{ flex: 1, backgroundColor: "#fff", p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      {items.map(([key, cartItem]) => {
        const { product, quantity } = cartItem;
        const supplies = product.supplies || [];
        const selectedSupply = supplies.find((s) => s.id === product.selectedSupplyId);
        const price = Number(selectedSupply?.price ?? product.price ?? 0);
        const weight = selectedSupply?.weight ?? null;

        return (
          <Box key={key} sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: "space-between", mb: 2, p: { xs: 1, md: 2 }, borderBottom: "1px solid #E0E0E0", gap: { xs: 2, sm: 0 } }}>
            <Box component="img" src={product.photos_url?.[0]?.url} alt={product.name} sx={{ width: { xs: "80px", md: "100px" }, height: "auto", objectFit: "contain" }}/>
            <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, ml: { xs: 0, sm: 6 }, gap: { xs: 1, md: 2 }, width: { xs: '100%', sm: 'auto' } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <Typography sx={{ fontSize: { xs: '14px', md: '16px' } }}>{product.name}</Typography>
                  {weight && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                      {weight}
                    </Typography>
                  )}
                </Box>
                <IconButton onClick={() => handleRemove(key)} color="error" sx={{ p: { xs: 0.5, md: 1 } }}>
                  <Box component="img" src={icondelete} alt="icondelete" sx={{ width: { xs: 18, md: 24 }, height: { xs: 18, md: 24 } }} />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: { xs: 1, md: 2 }, width: '100%' }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton onClick={() => handleQuantityChange(key, -1, cartItem)} sx={{ backgroundColor: "#3E3027", color: "#fff", width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 }, "&:hover": {backgroundColor: '#3E3027'}, "&:active": {backgroundColor: '#3E3027'}, "&:focus": {backgroundColor: '#3E3027'}, }}>
                    <RemoveIcon sx={{ fontSize: { xs: 14, md: 18 } }} />
                  </IconButton>
                  <Typography sx={{ fontSize: { xs: '14px', md: '16px' }, minWidth: { xs: 20, md: 24 }, textAlign: 'center' }}>{quantity}</Typography>
                  <IconButton onClick={() => handleQuantityChange(key, 1, cartItem)} sx={{ backgroundColor: '#3E3027', color: '#fff',"&:hover": {backgroundColor: '#3E3027'}, "&:active": {backgroundColor: '#3E3027'}, "&:focus": {backgroundColor: '#3E3027'}, width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 } }} >
                    <AddIcon sx={{ fontSize: { xs: 14, md: 18 } }} />
                  </IconButton>
                </Box>
                <Typography sx={{ fontSize: { xs: '14px', md: '16px' }, fontWeight: 600 }}>${(price * quantity).toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

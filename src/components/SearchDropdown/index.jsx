import React from "react";
import {Box, Typography, CircularProgress, Alert} from "@mui/material";
import {Link} from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {useSelector} from "react-redux";
import {getPrice, getProductPrice, formatPrice} from "../utils/priceUtils.jsx";

import KitchenIcon from '@mui/icons-material/Kitchen';

const SearchDropdown = ({results, loading, query, onClose, error}) => {
  const currency = useSelector((state) => state.settings.currency);
  const products = useSelector((state) => state.search.products || []);
  const accessories = useSelector((state) => state.search.accessories || []);
  const totalResults = products.length + accessories.length;

 if (loading) {
  return (
   <Box
    sx={{
     position: "absolute",
     top: "100%",
     left: 0,
     right: 0,
     mt: 1,
     bgcolor: "white",
     borderRadius: "8px",
     boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
     p: 2,
     zIndex: 1000,
     textAlign: "center",
     minWidth: "300px",
    }}
   >
    <CircularProgress size={24} />
    <Typography
     variant="caption"
     sx={{display: "block", mt: 1, color: "#666"}}
    >
     Searching...
    </Typography>
   </Box>
  );
 }

 if (error) {
  return (
   <Box
    sx={{
     position: "absolute",
     top: "100%",
     left: 0,
     right: 0,
     mt: 1,
     bgcolor: "white",
     borderRadius: "8px",
     boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
     p: 2,
     zIndex: 1000,
     minWidth: "300px",
    }}
   >
    <Box sx={{display: "flex", alignItems: "center", gap: 1, color: "#d32f2f"}}>
     <ErrorOutlineIcon fontSize="small" />
     <Typography variant="body2">{error}</Typography>
    </Box>
   </Box>
  );
 }

 if (!query || !query.trim()) {
  return null;
 }

 if (results.length === 0) {
  return (
   <Box
    sx={{
     position: "absolute",
     top: "100%",
     left: 0,
     right: 0,
     mt: 1,
     bgcolor: "white",
     borderRadius: "8px",
     boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
     p: 2,
     zIndex: 1000,
     textAlign: "center",
     minWidth: "300px",
    }}
   >
    <Typography
     variant="body2"
     sx={{color: "#666"}}
    >
     No products found for "{query}"
    </Typography>
   </Box>
  );
 }

 return (
  <Box
   sx={{
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    mt: 1,
    bgcolor: "white",
    borderRadius: "8px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    maxHeight: "500px",
    overflowY: "auto",
    zIndex: 1000,
    minWidth: "350px",
   }}
   >
     {products.length > 0 && (
       <>
         <Box sx={{ 
            px: 2, 
            py: 1.5, 
            bgcolor: '#f8f8f8',
            borderBottom: '1px solid #e0e0e0',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}>
     <Typography
      variant="subtitle2"
           sx={{ px: 2, pt: 1.5, pb: 0.5, fontWeight: 600, color: "#666" }}>
      Products ({products.length})
         </Typography>
         </Box>
     
   {products.slice(0, 8).map((product) => {
const imageUrl = product.photos_url?.[0]?.url || product.photos_url?.[0] || '';    const supply = product.supplies?.[0];
    const price = supply ? getPrice(supply, currency) : getProductPrice(product, currency);
    const productUrl = `/coffee/product/${product.id}`;

    return (
     <Link
      key={product.id}
      to={productUrl}
      style={{textDecoration: "none"}}
      onClick={onClose}
     >
      <Box
       sx={{
        display: "flex",
        alignItems: "center",
        p: 1.5,
        gap: 1.5,
        cursor: "pointer",
       
        "&:last-child": {
         borderBottom: "none",
            },
         transition: 'all 0.2s',
                    borderBottom: '1px solid #f5f5f5',
                    '&:hover': {
                      bgcolor: '#f8f8f8',
                      transform: 'translateX(4px)',
                    },
       }}
      >
       <Box
        component="img"
        src={imageUrl}
        alt={product.name}
        onError={(e) => {
         e.target.src = "https://via.placeholder.com/50?text=No+Image";
        }}
        sx={{
         width: 50,
         height: 50,
         objectFit: "cover",
         borderRadius: "6px",
         flexShrink: 0,
         bgcolor: "#f5f5f5",
        }}
       />

       {/* Info */}
       <Box sx={{flex: 1, minWidth: 0}}>
        <Typography
         variant="body2"
         sx={{
          fontWeight: 500,
          color: "#232323",
          mb: 0.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
         }}
        >
         {product.name}
        </Typography>
        <Typography
         variant="caption"
         sx={{
          color: "#16675C",
          fontWeight: 600,
          fontSize: "14px",
         }}
        >
         {formatPrice(price, currency)}
        </Typography>
       </Box>
      </Box>
     </Link>
    );
   })}
         </>
   )}

     
   {accessories.length > 0 && (
     <>
        <Box sx={{ 
            px: 2, 
            py: 1.5, 
            bgcolor: '#f8f8f8',
            borderBottom: '1px solid #e0e0e0',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            mt: products.length > 0 ? 1 : 0,
          }}>
     <Typography
      variant="subtitle2"
      sx={{px: 2, pt: 1.5, pb: 0.5, fontWeight: 600, color: "#666"}}
     >
      Accessories ({accessories.length})
           </Typography>
        </Box>
     {accessories.slice(0, 4).map((accessory) => {

       const price = getProductPrice(accessory, currency);
      const productUrl = `/accessories/product/${accessory.id}`;

      return (
       <Link
        key={`acc-${accessory.id}`}
        to={productUrl}
        style={{textDecoration: "none"}}
        onClick={onClose}
       >
        <Box
         sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          gap: 1.5,
          cursor: 'pointer',
          transition: 'all 0.2s',
            '&:hover': {
             bgcolor: '#f8f8f8',
             transform: 'translateX(4px)',
            },
          }}
        >
        <Box
           sx={{
             width: 50,
              height: 50,
              borderRadius: '8px',
              display: 'grid', placeItems: 'center',
              bgcolor: '#E8F5E9',
              border: '1px solid #e0e0e0',
              }}
         >
          <KitchenIcon sx={{ color: '#16675C', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        </Box>
        <Box sx={{flex: 1, minWidth: 0}}>
          <Typography
           variant="body2"
           sx={{
              fontWeight: 500,
              color: '#232323',
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
           {accessory.name}
              </Typography>
                 {accessory.category && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#666',
                          fontSize: '12px',
                          display: 'block',
                          mb: 0.3,
                        }}
                      >
                        {accessory.category}
                      </Typography>
                    )}
          <Typography
           variant="caption"
           sx={{
            color: '#16675C',
            fontWeight: 600,
            fontSize: '14px'
           }}
          >
           {formatPrice(price, currency)}
          </Typography>
         </Box>
        </Box>
       </Link>
      );
     })}
    </>
     )}
     

   {totalResults > 8  && (
    <Box
     sx={{
      borderTop: "1px solid #e3e3e3",
      p: 1.5,
      textAlign: "center",
      bgcolor: "#fafafa",
     }}
    >
     <Link
      to={`/coffee?search=${encodeURIComponent(query)}`}
      style={{textDecoration: "none"}}
      onClick={onClose}
     >
      <Typography
       variant="body2"
       sx={{
        color: "#16675C",
        fontWeight: 600,
        "&:hover": {
         textDecoration: "underline",
        },
       }}
      >
       See all {results.length} results →
      </Typography>
     </Link>
    </Box>
   )}
  </Box>
 );
};

export default SearchDropdown;

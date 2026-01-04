// import React from "react";
// import { Card, CardContent, CardMedia, Typography, Button, Box } from "@mui/material";
// import CoffeeIcon from '@mui/icons-material/Coffee';
// import { h4, h7 } from "../../styles/typographyStyles.jsx";
// import { btnCart, btnInCart } from "../../styles/btnStyles.jsx";
// import favorite from "../../assets/icons/favorite.svg";
// import favoriteActive from "../../assets/icons/favorite-active.svg";
// import incart from "../../assets/icons/incart.svg"; 
// import shopping from "../../assets/icons/shopping.svg";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { selectCartItems, addToCart } from "../../store/slice/cartSlice.jsx";
// import ClampText from "../ClampText.jsx";
// import { getProductPrice, formatPrice } from "../utils/priceUtils.jsx";

// export default function AccessoriesCardData({ products, favorites, onToggleFavorite, isRecommended = false }) {
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const cartEntries = useSelector(selectCartItems);
//     const currency = useSelector((state) => state.settings.currency);

//     return (
//         <Box sx={{ 
//             display: "flex", 
//             flexWrap: "wrap", 
//             gap: { xs: 2, md: 3 }, 
//             justifyContent: "center",
//             width: "100%"
//         }}>
//             {products.map(item => {
//                 const itemId = String(item.id);
//                 const isInCart = cartEntries.some(([key]) => key === itemId);
//                 const isOutOfStock = (item.quantity !== undefined ? Number(item.quantity) : 0) <= 0;

//                 return (
//                     <Card key={itemId} sx={{ 
//                         width: isRecommended 
//                             ? { xs: "100%", sm: "280px", md: "300px" } 
//                             : { xs: "100%", sm: "280px", md: "300px" },
//                         maxWidth: isRecommended ? "350px" : "none",
//                         minHeight: { xs: '340px', md: '480px' }, 
//                         display: "flex", 
//                         flexDirection: "column", 
//                         borderRadius: "24px", 
//                         p: { xs: 1.5, md: 2 }, 
//                         boxShadow: 2,
//                         opacity: isOutOfStock ? 0.7 : 1,
//                     }}>
//                         <Box sx={{ position: "relative", width: "100%", height: { xs: 200, md: 300 }, mb: 1,  }}>
//                             {(() => {
//                                 // Обрабатываем разные форматы данных от API
//                                 let photoUrl = null;
                                
//                                 // Пробуем photos_url (старый формат)
//                                 if (item.photos_url && Array.isArray(item.photos_url) && item.photos_url.length > 0) {
//                                     const firstPhoto = item.photos_url[0];
//                                     photoUrl = firstPhoto?.url || firstPhoto?.photo || firstPhoto;
//                                 }
//                                 // Пробуем accessory_photos (новый формат)
//                                 else if (item.accessory_photos && Array.isArray(item.accessory_photos) && item.accessory_photos.length > 0) {
//                                     const firstPhoto = item.accessory_photos[0];
//                                     photoUrl = firstPhoto?.url || firstPhoto?.photo || firstPhoto;
//                                 }
                                
//                                 // Если URL относительный, добавляем базовый URL
//                                 if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http')) {
//                                     photoUrl = `https://onlinestore-928b.onrender.com${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
//                                 }
                                
//                                 return photoUrl ? (
//                                     <CardMedia component="img" image={photoUrl} sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
//                                 ) : (
//                                     <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#eee", borderRadius: "12px" }}>
//                                         <CoffeeIcon sx={{ color: "#ccc", fontSize: 40 }} />
//                                     </Box>
//                                 );
//                             })()}
//                             <Box
//                                 component="img"
//                                 src={favorites?.[itemId] ? favoriteActive : favorite}
//                                 sx={{ position: "absolute", top: 4, right: 4, width: 28, height: 28, cursor: "pointer", zIndex: 2 }}
//                                 onClick={() => onToggleFavorite(item)}
//                             />
//                         </Box>
//                         <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: '0 !important' }}>
//                             <Box sx={{ my: 1 }}>
//                                 <Typography 
//                                     onClick={() => navigate(`/accessories/product/${item.id}`)}
//                                     sx={{ ...h4, mb: 2, cursor: "pointer", fontSize: { xs: '14px', md: '24px' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.2 }}
//                                 >
//                                     {item.name}
//                                 </Typography>
//                                 <ClampText lines={2} sx={{ ...h7, fontSize: { xs: '14px', md: '14px' }}}>
//                                     {item.description}
//                                 </ClampText>
//                             </Box>
                            
//                             <Box sx={{ mt: 'auto' }}>
//                                 <Typography sx={{ color: isOutOfStock ? "#999" : "#16675C", fontSize: { xs: 16, md: 18 }, fontWeight: 700, textAlign: "right", mb: 1 }}>
//                                     {isOutOfStock ? "SOLD OUT" : formatPrice(getProductPrice(item, currency), currency)}
//                                 </Typography>
//                                 <Button 
//                                     variant="contained" fullWidth disabled={isOutOfStock}
//                                     onClick={() => !isOutOfStock && dispatch(addToCart({ product: item, quantity: 1 }))}
//                                     sx={{ ...(isInCart ? btnInCart : btnCart), fontSize: { xs: '11px', md: '14px' }, py: 1 }}
//                                     endIcon={!isOutOfStock && <Box component="img" src={isInCart ? incart : shopping} sx={{ width: 20, height: 20 }} />}
//                                 >
//                                     {isOutOfStock ? "Sold" : (isInCart ? "In cart" : "Add to bag")}
//                                 </Button>
//                             </Box>
//                         </CardContent>
//                     </Card>
//                 );
//             })}
//         </Box>
//     );
// }

import React from "react";
import {Card, CardContent, CardMedia, Typography, Button, Box,} from "@mui/material";
import CoffeeIcon from "@mui/icons-material/Coffee";
import { h4, h7 } from "../../styles/typographyStyles.jsx";
import { btnCart, btnInCart } from "../../styles/btnStyles.jsx";
import favorite from "../../assets/icons/favorite.svg";
import favoriteActive from "../../assets/icons/favorite-active.svg";
import incart from "../../assets/icons/incart.svg";
import shopping from "../../assets/icons/shopping.svg";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectCartItems, addToCart} from "../../store/slice/cartSlice.jsx";
import ClampText from "../ClampText.jsx";
import { getProductPrice, formatPrice} from "../utils/priceUtils.jsx";

export default function AccessoriesCardData({ products, favorites, onToggleFavorite, isRecommended = false}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartEntries = useSelector(selectCartItems);
  const currency = useSelector((state) => state.settings.currency);

  const getPhotoUrl = (item) => {
    let url = null;

    if (Array.isArray(item.photos_url) && item.photos_url.length) {
      const p = item.photos_url[0];
      url = p?.url || p?.photo || p;
    } else if (
      Array.isArray(item.accessory_photos) &&
      item.accessory_photos.length
    ) {
      const p = item.accessory_photos[0];
      url = p?.url || p?.photo || p;
    }

    if (url && typeof url === "string" && !url.startsWith("http")) {
      return `https://onlinestore-928b.onrender.com${
        url.startsWith("/") ? "" : "/"
      }${url}`;
    }

    return url;
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 2, md: 3 }, justifyContent: "center", width: "100%", }} >
      {products.map((item) => {
        const itemId = String(item.id);
        const isInCart = cartEntries.some(([key]) => key === itemId);
        const isOutOfStock =
          (item.quantity !== undefined ? Number(item.quantity) : 0) <= 0;
        const photoUrl = getPhotoUrl(item);

        return (
          <Card key={itemId} sx={{ width: { xs: "100%", sm: "280px", md: "300px" }, maxWidth: isRecommended ? "350px" : "none", minHeight: { xs: "340px", md: "480px" }, display: "flex", flexDirection: "column", borderRadius: "24px", p: { xs: 1.5, md: 2 }, boxShadow: 2, opacity: isOutOfStock ? 0.7 : 1, }}>
            {/* IMAGE */}
            <Box sx={{ position: "relative", width: "100%", height: { xs: 200, md: 300 }, mb: 1,}}>
              {photoUrl && (
                <CardMedia component="img" image={photoUrl}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                  }}
                  sx={{ width: "100%", height: "100%", objectFit: "contain", }}/>
              )}

              {/* COFFEE FALLBACK */}
              <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#eee", borderRadius: "12px", zIndex: 0,}}>
                <CoffeeIcon sx={{ color: "#ccc", fontSize: 40 }} />
              </Box>

              {/* FAVORITE */}
              <Box component="img" src={favorites?.[itemId] ? favoriteActive : favorite}
                sx={{ position: "absolute", top: 4, right: 4, width: 28, height: 28, cursor: "pointer", zIndex: 2,}}
                onClick={() => onToggleFavorite(item)}
              />
            </Box>

            {/* CONTENT */}
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: "0 !important",}}>
              <Box sx={{ my: 1 }}>
                <Typography onClick={() => navigate(`/accessories/product/${item.id}`) }
                  sx={{ ...h4, mb: 2, cursor: "pointer", fontSize: { xs: "14px", md: "24px" }, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.2,}}>
                  {item.name}
                </Typography>

                <ClampText lines={2} sx={{ ...h7, fontSize: { xs: "14px", md: "14px" } }}>
                  {item.description}
                </ClampText>
              </Box>

              <Box sx={{ mt: "auto" }}>
                <Typography sx={{ color: isOutOfStock ? "#999" : "#16675C", fontSize: { xs: 16, md: 18 }, fontWeight: 700, textAlign: "right", mb: 1,}}>
                  {isOutOfStock ? "SOLD OUT" : formatPrice( getProductPrice(item, currency), currency)}
                </Typography>

                <Button variant="contained" fullWidth disabled={isOutOfStock}
                  onClick={() => !isOutOfStock && dispatch(addToCart({ product: item, quantity: 1 }))}
                  sx={{...(isInCart ? btnInCart : btnCart), fontSize: { xs: "11px", md: "14px" }, py: 1,}}
                  endIcon={!isOutOfStock && (
                      <Box component="img" src={isInCart ? incart : shopping} sx={{ width: 20, height: 20 }} />
                    )}>
                  {isOutOfStock ? "Sold" : isInCart ? "In cart" : "Add to bag"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

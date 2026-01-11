import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Collapse, Box, Typography, CircularProgress, Alert, useTheme, useMediaQuery } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CoffeeIcon from '@mui/icons-material/Coffee';
import { btnCart, btnInCart } from "../../styles/btnStyles.jsx";
import { h4, h5, h6 } from "../../styles/typographyStyles.jsx";
import { fetchUserOrders } from "../../store/slice/ordersSlice.jsx";
import deliveredImg from "../../assets/images/status/delivered.png";
import deliveringImg from "../../assets/images/status/delivering.png";
import cancelledImg from "../../assets/images/status/cancelled.png";
import { useNavigate } from "react-router-dom";
import { default as api } from "../../store/api/axios.js";
import PaginationControl from "../PaginationControl/PaginationControl.jsx";

const ordersPerPage = 10;

export default function OrderHistory() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [photoCache, setPhotoCache] = useState(new Map()); 
  const [imageErrors, setImageErrors] = useState({});
  const [page, setPage] = useState(1); 


  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      dispatch(fetchUserOrders({ page: 1, size: 30 }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const loadPhotos = async () => {
      const productIds = new Set();
      const accessoryIds = new Set();

      orders.forEach(order => {
        (order.positions || []).forEach(position => {
          if (position.product?.id) {
            productIds.add(position.product.id);
          }
          if (position.accessory?.id) {
            accessoryIds.add(position.accessory.id);
          }
        });
      });

      setPhotoCache(prevCache => {
        const photoPromises = [];

        productIds.forEach(productId => {
          if (!prevCache.has(`product-${productId}`)) {
            photoPromises.push(
              api.get(`/products/${productId}`)
                .then(response => {
                  const product = response.data;
                  let photoUrl = null;

                  if (product.photos_url && Array.isArray(product.photos_url) && product.photos_url.length > 0) {
                    const firstPhoto = product.photos_url[0];
                    photoUrl = firstPhoto?.url || firstPhoto?.photo || (typeof firstPhoto === 'string' ? firstPhoto : null);
                  } else if (product.product_photos && Array.isArray(product.product_photos) && product.product_photos.length > 0) {
                    const firstPhoto = product.product_photos[0];
                    if (firstPhoto.photo) {
                      photoUrl = typeof firstPhoto.photo === 'string' ? firstPhoto.photo : (firstPhoto.photo.url || firstPhoto.photo.photo_url);
                    } else {
                      photoUrl = firstPhoto?.url || firstPhoto?.photo || null;
                    }
                  }

                  if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http') && !photoUrl.startsWith('blob:')) {
                    const baseUrl = 'https://onlinestore-928b.onrender.com';
                    photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
                  }

                  return { key: `product-${productId}`, photoUrl: photoUrl || null };
                })
                .catch(err => {
                  console.warn(`Failed to load photo for product ${productId}:`, err);
                  return { key: `product-${productId}`, photoUrl: null };
                })
            );
          }
        });

        accessoryIds.forEach(accessoryId => {
          if (!prevCache.has(`accessory-${accessoryId}`)) {
            photoPromises.push(
              api.get(`/accessories/${accessoryId}`)
                .then(response => {
                  const accessory = response.data;
                  let photoUrl = null;

                  if (accessory.photos_url && Array.isArray(accessory.photos_url) && accessory.photos_url.length > 0) {
                    const firstPhoto = accessory.photos_url[0];
                    photoUrl = firstPhoto?.url || firstPhoto?.photo || (typeof firstPhoto === 'string' ? firstPhoto : null);
                  } else if (accessory.accessory_photos && Array.isArray(accessory.accessory_photos) && accessory.accessory_photos.length > 0) {
                    const firstPhoto = accessory.accessory_photos[0];
                    photoUrl = firstPhoto?.url || firstPhoto?.photo || (typeof firstPhoto === 'string' ? firstPhoto : null);
                  }

                  if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http') && !photoUrl.startsWith('blob:')) {
                    const baseUrl = 'https://onlinestore-928b.onrender.com';
                    photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
                  }

                  return { key: `accessory-${accessoryId}`, photoUrl: photoUrl || null };
                })
                .catch(err => {
                  console.warn(`Failed to load photo for accessory ${accessoryId}:`, err);
                  return { key: `accessory-${accessoryId}`, photoUrl: null };
                })
            );
          }
        });

        if (photoPromises.length > 0) {
          Promise.all(photoPromises).then(results => {
            setPhotoCache(currentCache => {
              const newCache = new Map(currentCache);
              results.forEach(({ key, photoUrl }) => {
                newCache.set(key, photoUrl);
              });
              return newCache;
            });
          });
        }

        return prevCache;
      });
    };

    loadPhotos();
  }, [orders]);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.openOrderId) {
      setOpenOrderId(location.state.openOrderId);
      setTimeout(() => {
        const element = document.getElementById(`order-${location.state.openOrderId}`);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.state]);

  const toggleOrder = (id) => {
    setOpenOrderId(openOrderId === id ? null : id);
  };

  const statusImages = {
    processing: deliveringImg,
    delivered: deliveredImg,
    shipping: deliveringImg,
    preparing: deliveringImg,
    in_transit: deliveringImg,
    cancelled: cancelledImg,
    canceled: cancelledImg,
  };

  const statusLabels = {
    processing: "Processing",
    delivered: "Delivered",
    delivering: "Delivered",
    in_transit: "Delivered",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  const statusColors = {
    processing: "#f5c407",
    delivered: "#46d95b",
    delivering: "#46d95b",
    in_transit: "#46d95b",
    cancelled: "#FD8888",
    canceled: "#FD8888",
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{typeof error === 'string' ? error : 'Failed to load orders.'}</Alert>;
  }

  const ordersList = Array.isArray(orders) ? [...orders].sort((a, b) => b.id - a.id) : [];
  
  // Вычисляем пагинацию
  const totalPages = Math.ceil(ordersList.length / ordersPerPage);
  const startIndex = (page - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = ordersList.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setPage(value);
    // Прокручиваем в начало списка при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (ordersList.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: 500, gap: 2, textAlign: "center", px: 2, justifyContent: 'center' }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 80, color: "#E0E0E0" }} />
        <Typography sx={{ ...h4 }}>You haven't placed any orders yet</Typography>
        <Typography sx={{ ...h6, color: "gray", mb: 2 }}>When you make your first purchase, your history will appear here</Typography>
        <Button sx={{ ...btnCart, width: '250px' }} onClick={() => navigate('/coffee')}>
          Start Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: isMobile ? 1 : 0 }}>
      {paginatedOrders.map(order => {
        const totalAmount =
          order.order_amount && !isNaN(Number(order.order_amount))
            ? Number(order.order_amount).toFixed(2)
            : Array.isArray(order.positions)
              ? order.positions.reduce((sum, p) => {
                const unitPrice =
                  Number(
                    p.price ??
                    p.product?.price ??
                    p.accessory?.price ??
                    p.product?.total_price ??
                    0
                  );
                return sum + unitPrice * (p.quantity || 1);
              }, 0).toFixed(2)
              : "0.00";

        return (
          <Box key={order.id} id={`order-${order.id}`} sx={{ border: "1px solid #E0E0E0", borderRadius: isMobile ? "16px" : "24px", p: isMobile ? 2 : 3 }}>
            <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: isMobile ? 2 : 0}}>
              <Box sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, auto)", gap: isMobile ? 2 : 4, flexGrow: 1}}>
                <Box>
                  <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>Order number</Typography>
                  <Typography sx={{ fontWeight: 600 }}>№ {order.id}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>Date placed</Typography>
                  <Typography>{new Date(order.created_at).toLocaleDateString()}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>Total Amount</Typography>
                  <Typography sx={{ fontWeight: 600 }}>${order.order_amount || totalAmount}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>Status</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box component="img" src={statusImages[order.status?.toLowerCase()] || deliveringImg} sx={{ width: 20, height: 20 }} />
                    <Typography sx={{ fontSize: "0.9rem", textTransform: "capitalize", color: statusColors[order.status?.toLowerCase()] || "inherit" }}>
                      {statusLabels[order.status?.toLowerCase()] || order.status}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Button fullWidth={isMobile} sx={openOrderId === order.id ? { ...btnInCart, mt: isMobile ? 1 : 0 } : { ...btnCart, mt: isMobile ? 1 : 0 }} onClick={() => toggleOrder(order.id)}>
                {openOrderId === order.id ? "Hide details" : "View order"}
              </Button>
            </Box>

            <Collapse in={openOrderId === order.id} timeout="auto" unmountOnExit>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3, pt: 2, borderTop: "1px solid #E0E0E0" }}>
                {order.positions?.map((pos, index) => {
                  const item = pos.product || pos.accessory;
                  const qty = pos.quantity || 1;
                  const unitPrice = Number(pos.price ?? item?.price ?? item?.total_price ?? 0);
                  const displayPrice = (unitPrice * qty).toFixed(2);
                  let photoUrl = null;
                  if (pos.product?.id) {
                    photoUrl = photoCache.get(`product-${pos.product.id}`);
                  } else if (pos.accessory?.id) {
                    photoUrl = photoCache.get(`accessory-${pos.accessory.id}`);
                  }

                  if (!photoUrl && item) {
                    if (item.photos_url && Array.isArray(item.photos_url) && item.photos_url.length > 0) {
                      const firstPhoto = item.photos_url[0];
                      photoUrl = firstPhoto?.url || firstPhoto?.photo || (typeof firstPhoto === 'string' ? firstPhoto : null);
                    } else if (item.product_photos && Array.isArray(item.product_photos) && item.product_photos.length > 0) {
                      const firstPhoto = item.product_photos[0];
                      photoUrl = firstPhoto?.url || firstPhoto?.photo || null;
                    } else if (item.accessory_photos && Array.isArray(item.accessory_photos) && item.accessory_photos.length > 0) {
                      const firstPhoto = item.accessory_photos[0];
                      photoUrl = firstPhoto?.url || firstPhoto?.photo || null;
                    }
                  }

                  if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http') && !photoUrl.startsWith('blob:')) {
                    const baseUrl = 'https://onlinestore-928b.onrender.com';
                    photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
                  }

                  const imageKey = `${order.id}-${index}`;
                  const hasImageError = imageErrors[imageKey];

                  return (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: isMobile ? 2 : 3 }}>
                      <Box sx={{ width: isMobile ? 50 : 60, height: isMobile ? 50 : 60, flexShrink: 0, borderRadius: "12px", backgroundColor: "#F5F5F5", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                        {photoUrl && !hasImageError ? (
                          <Box component="img" src={photoUrl} onError={() => setImageErrors(prev => ({ ...prev, [imageKey]: true }))} sx={{ width: "100%", height: "100%", objectFit: "contain" }}/>
                        ) : (
                          <CoffeeIcon sx={{ color: "#CCC", fontSize: isMobile ? 25 : 30 }} />
                        )}
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontSize: isMobile ? "0.9rem" : "1.1rem", fontWeight: 600, lineHeight: 1.2 }}>
                          {item?.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "gray" }}>
                          Quantity: {qty}
                        </Typography>
                      </Box>

                      <Typography sx={{ fontWeight: 600, color: "#16675C" }}>
                        ${displayPrice}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        );
      })}
      
      {totalPages > 1 && (
        <PaginationControl 
          page={page} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
    </Box>
  );
}


import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Collapse,
  Box,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CoffeeIcon from "@mui/icons-material/Coffee";

import { btnCart, btnInCart } from "../../styles/btnStyles.jsx";
import { h4, h5, h6 } from "../../styles/typographyStyles.jsx";
import { fetchUserOrders } from "../../store/slice/ordersSlice.jsx";
import { default as api } from "../../store/api/axios.js";
import { buildImageUrl } from "../utils/helpers.js";
import { formatPrice } from "../utils/priceUtils.jsx";
import PaginationControl from "../PaginationControl/PaginationControl.jsx";

import deliveredImg from "../../assets/images/status/delivered.png";
import deliveringImg from "../../assets/images/status/delivering.png";
import cancelledImg from "../../assets/images/status/cancelled.png";

const ORDERS_PER_PAGE = 5;

export default function OrderHistory() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { orders, loading, error } = useSelector((state) => state.orders);
  
  const [openOrderId, setOpenOrderId] = useState(null);
  const [photoCache, setPhotoCache] = useState(new Map());
  const [imageErrors, setImageErrors] = useState({});
  const [page, setPage] = useState(1);

  const statusConfig = {
    processing: { img: deliveringImg, label: "Processing", color: "#f5c407" },
    preparing: { img: deliveringImg, label: "Preparing", color: "#FF9800" },
    shipping: { img: deliveringImg, label: "Shipping", color: "#2196F3" },
    in_transit: { img: deliveringImg, label: "In Transit", color: "#00BCD4" },
    delivered: { img: deliveredImg, label: "Delivered", color: "#46d95b" },
    delivering: { img: deliveredImg, label: "Delivered", color: "#46d95b" },
    cancelled: { img: cancelledImg, label: "Cancelled", color: "#FD8888" },
    canceled: { img: cancelledImg, label: "Cancelled", color: "#FD8888" },
    default: { img: deliveringImg, label: "Processing", color: "#f5c407" }
  };
  
  useEffect(() => {
    dispatch(fetchUserOrders({ page: 1, size: 30 }));
  }, [dispatch]);

  useEffect(() => {
    if (!orders?.length) return;
    const loadMissingPhotos = async () => {
      const itemsToFetch = [];
      orders.forEach(order => {
        order.positions?.forEach(pos => {
          const item = pos.product || pos.accessory;
          const type = pos.product ? 'product' : 'accessory';
          if (item?.id && !photoCache.has(`${type}-${item.id}`)) {
            itemsToFetch.push({ id: item.id, type });
          }
        });
      });
      if (itemsToFetch.length === 0) return;
      const results = await Promise.allSettled(
        itemsToFetch.map(async ({ id, type }) => {
          const endpoint = type === 'product' ? `/products/${id}` : `/accessories/${id}`;
          const { data } = await api.get(endpoint);
          const rawPath = data.photos_url?.[0]?.url || 
                          data.photos_url?.[0]?.photo || 
                          data.product_photos?.[0]?.photo ||
                          data.accessory_photos?.[0]?.photo ||
                          (typeof data.photos_url?.[0] === "string" ? data.photos_url[0] : null);
          return { key: `${type}-${id}`, url: buildImageUrl(rawPath) };
        })
      );
      setPhotoCache(prev => {
        const next = new Map(prev);
        results.forEach(res => {
          if (res.status === 'fulfilled') next.set(res.value.key, res.value.url);
        });
        return next;
      });
    };
    loadMissingPhotos();
  }, [orders]);

  const ordersList = useMemo(() => 
    Array.isArray(orders) ? [...orders].sort((a, b) => b.id - a.id) : [], 
  [orders]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * ORDERS_PER_PAGE;
    return ordersList.slice(start, start + ORDERS_PER_PAGE);
  }, [ordersList, page]);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress sx={{ color: "#A4795B" }} />
    </Box>
  );

 if (ordersList.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: 500,
          gap: 2,
          textAlign: "center",
          px: 2,
          justifyContent: "center",
        }}
      >
        <ShoppingBagOutlinedIcon sx={{ fontSize: 80, color: "#E0E0E0" }} />
        <Typography sx={{ ...h4 }}>
          You haven't placed any orders yet
        </Typography>
        <Typography sx={{ ...h6, color: "gray", mb: 2 }}>
          When you make your first purchase, your history will appear here
        </Typography>
        <Button
          sx={{ ...btnCart, width: "250px" }}
          onClick={() => navigate("/coffee")}
        >
          Start Shopping
        </Button>
      </Box>
    );
  }


  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: isMobile ? 1 : 0 }}>
      {paginatedOrders.map((order) => {
        const status = statusConfig[order.status?.toLowerCase()] || statusConfig.default;
        // Берем order_amount из вашего JSON (там 30)
        const totalAmount = Number(order.order_amount) || 0;

        return (
          <Box key={order.id} sx={{ border: "1px solid #E0E0E0", borderRadius: isMobile ? "16px" : "24px", p: isMobile ? 2 : 3 }}>
            <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: isMobile ? 2 : 0 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, auto)", gap: isMobile ? 2 : 4, flexGrow: 1 }}>
                <OrderHeaderItem label="Order number" value={`№ ${order.id}`} isBold />
                <OrderHeaderItem label="Date placed" value={new Date(order.created_at).toLocaleDateString()} />
                <OrderHeaderItem label="Total Amount" value={formatPrice(totalAmount, order.currency || "USD")} isBold />
                <Box>
                  <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>Status</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box component="img" src={status.img} sx={{ width: 20, height: 20 }} />
                    <Typography sx={{ fontSize: "0.9rem", color: status.color, fontWeight: 500 }}>{status.label}</Typography>
                  </Box>
                </Box>
              </Box>
              <Button
                sx={openOrderId === order.id ? btnInCart : btnCart}
                onClick={() => setOpenOrderId(openOrderId === order.id ? null : order.id)}
              >
                {openOrderId === order.id ? "Hide details" : "View order"}
              </Button>
            </Box>

            <Collapse in={openOrderId === order.id} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #E0E0E0", display: "flex", flexDirection: "column", gap: 2 }}>
                {order.positions?.map((pos, idx) => {
                  const item = pos.product || pos.accessory;
                  const type = pos.product ? 'product' : 'accessory';
                  const photoUrl = photoCache.get(`${type}-${item?.id}`);
                  const imageKey = `${order.id}-${idx}`;
                  
                  // ТЕПЕРЬ БЕРЕМ QUANTITY ИЗ ОБЪЕКТА ТОВАРА (как в вашем JSON)
                  const finalQuantity = Number(item?.quantity) || Number(pos.quantity) || 1;
                  
                  // БЕРЕМ ТOTAL_PRICE ИЗ ОБЪЕКТА ТОВАРА
                  const posTotalPrice = Number(item?.total_price) || 
                                       Number(pos.total_price) || 
                                       (Number(item?.price || 0) * finalQuantity);

                  return (
                    <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Box sx={{ width: 60, height: 60, borderRadius: "12px", bgcolor: "#F5F5F5", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                        {photoUrl && !imageErrors[imageKey] ? (
                          <img 
                            src={photoUrl} 
                            style={{ width: "100%", height: "100%", objectFit: "contain" }} 
                            onError={() => setImageErrors(prev => ({ ...prev, [imageKey]: true }))}
                          />
                        ) : <CoffeeIcon sx={{ color: "#CCC" }} />}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>{item?.name}</Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "gray" }}>Quantity: {finalQuantity}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600, color: "#16675C" }}>
                        {formatPrice(posTotalPrice, order.currency || "USD")}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        );
      })}
      <PaginationControl
        count={Math.ceil(ordersList.length / ORDERS_PER_PAGE)}
        page={page}
        onChange={(e, value) => setPage(value)}
        sx={{ display: "flex", justifyContent: "center", mt: 3 }}
      />
    </Box>
  );
}

function OrderHeaderItem({ label, value, isBold }) {
  return (
    <Box>
      <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>{label}</Typography>
      <Typography sx={{ fontWeight: isBold ? 600 : 400 }}>{value}</Typography>
    </Box>
  );
}

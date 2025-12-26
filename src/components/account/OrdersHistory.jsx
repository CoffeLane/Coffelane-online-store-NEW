import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Collapse, Box, Typography, CircularProgress, Alert, useTheme, useMediaQuery } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import CoffeeIcon from '@mui/icons-material/Coffee';
import { btnCart, btnInCart } from "../../styles/btnStyles.jsx";
import { h4, h5, h6 } from "../../styles/typographyStyles.jsx";
import { fetchOrders } from "../../store/slice/ordersSlice.jsx";
import deliveredImg from "../../assets/images/status/delivered.png";
import deliveringImg from "../../assets/images/status/delivering.png";
import cancelledImg from "../../assets/images/status/cancelled.png";

export default function OrderHistory() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Проверка на мобилку
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [openOrderId, setOpenOrderId] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, size: 10 }));
  }, [dispatch]);

  const toggleOrder = (id) => {
    setOpenOrderId(openOrderId === id ? null : id);
  };

  const statusImages = {
    processing: deliveringImg,
    delivered: deliveredImg,
    delivering: deliveringImg,
    cancelled: cancelledImg,
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

  // Берем данные из data (согласно логам API)
  const ordersList = orders?.data || (Array.isArray(orders) ? orders : []);

  if (ordersList.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: 500, gap: 2, textAlign: "center", px: 2 }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 80, color: "#E0E0E0" }} />
        <Typography sx={{ ...h4 }}>You haven't placed any orders yet</Typography>
        <Typography sx={{ ...h6, color: "gray" }}>When you make your first purchase, your history will appear here</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: isMobile ? 1 : 0 }}>
      {ordersList.map(order => {
        const totalAmount = order.positions?.reduce((sum, p) => sum + (p.product?.total_price || p.accessory?.total_price || 0), 0).toFixed(2);

        return (
          <Box key={order.id} sx={{ border: "1px solid #E0E0E0", borderRadius: isMobile ? "16px" : "24px", p: isMobile ? 2 : 3 }}>
            {/* ШАПКА ЗАКАЗА */}
            <Box sx={{ 
              display: "flex", 
              flexDirection: isMobile ? "column" : "row", 
              justifyContent: "space-between", 
              gap: isMobile ? 2 : 0 
            }}>
              
              {/* Сетка с данными (2 колонки на мобилке, 4 в ряд на десктопе) */}
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, auto)", 
                gap: isMobile ? 2 : 4,
                flexGrow: 1
              }}>
                <Box>
                  <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>Order number</Typography>
                  <Typography sx={{ fontWeight: 600 }}>№{order.id}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>Date placed</Typography>
                  <Typography>{new Date(order.billing_details?.created_at).toLocaleDateString()}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>Total Amount</Typography>
                  <Typography sx={{ fontWeight: 600 }}>${totalAmount}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ ...h5, fontSize: "0.8rem", color: "gray" }}>Status</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box component="img" src={statusImages[order.status?.toLowerCase()] || deliveringImg} sx={{ width: 20, height: 20 }} />
                    <Typography sx={{ fontSize: "0.9rem", textTransform: "capitalize" }}>{order.status}</Typography>
                  </Box>
                </Box>
              </Box>

              <Button
                fullWidth={isMobile}
                sx={openOrderId === order.id ? { ...btnInCart, mt: isMobile ? 1 : 0 } : { ...btnCart, mt: isMobile ? 1 : 0 }}
                onClick={() => toggleOrder(order.id)}
              >
                {openOrderId === order.id ? "Hide details" : "View order"}
              </Button>
            </Box>

            {/* ДЕТАЛИ ЗАКАЗА (ТОВАРЫ) */}
            <Collapse in={openOrderId === order.id} timeout="auto" unmountOnExit>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3, pt: 2, borderTop: "1px solid #E0E0E0" }}>
                {order.positions?.map((pos, index) => {
                  const item = pos.product || pos.accessory;
                  return (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: isMobile ? 2 : 3 }}>
                      {/* Картинка или заглушка */}
                      <Box sx={{
                        width: isMobile ? 60 : 80,
                        height: isMobile ? 60 : 80,
                        flexShrink: 0,
                        borderRadius: "12px",
                        backgroundColor: "#F5F5F5",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden"
                      }}>
                        {item?.photos_url?.[0]?.url ? (
                          <Box component="img" src={item.photos_url[0].url} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <CoffeeIcon sx={{ color: "#CCC", fontSize: isMobile ? 30 : 40 }} />
                        )}
                      </Box>

                      {/* Описание товара */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ fontSize: isMobile ? "0.9rem" : "1.1rem", fontWeight: 600, lineHeight: 1.2 }}>
                          {item?.name}
                        </Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "gray", mt: 0.5 }}>
                          Qty: {pos.quantity}
                        </Typography>
                      </Box>

                      {/* Цена */}
                      <Typography sx={{ fontWeight: 600, color: "#16675C", fontSize: isMobile ? "0.9rem" : "1rem" }}>
                        ${(item?.total_price || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
}
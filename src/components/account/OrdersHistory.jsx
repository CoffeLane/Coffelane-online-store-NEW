import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Collapse, Box, Typography, CircularProgress, Alert } from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { btnCart, btnInCart } from "../../styles/btnStyles.jsx";
import { h4, h5, h6 } from "../../styles/typographyStyles.jsx";
import { fetchOrders } from "../../store/slice/ordersSlice.jsx";
import deliveredImg from "../../assets/images/status/delivered.png";
import deliveringImg from "../../assets/images/status/delivering.png";
import cancelledImg from "../../assets/images/status/cancelled.png";
import CoffeeIcon from '@mui/icons-material/Coffee';

export default function OrderHistory() {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [openOrderId, setOpenOrderId] = useState(null);

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, size: 10 }));
  }, [dispatch]);

  const toggleOrder = (id) => {
    setOpenOrderId(openOrderId === id ? null : id);
  };

  // Соответствие статусов картинкам (учитываем нижний регистр из API)
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
    return (
      <Alert severity="error">
        {typeof error === 'string' ? error : 'Failed to load orders.'}
      </Alert>
    );
  }

  if (error?.code === "token_not_valid") {
    return (
      <Alert severity="warning" action={
        <Button color="inherit" size="small" onClick={() => navigate('/login')}>
          Login
        </Button>
      }>
        Your session has expired. Please log in again to see your history.
      </Alert>
    );
  }

  // В логах видно, что массив заказов лежит либо напрямую в orders, либо в orders.results
  const ordersList = Array.isArray(orders) ? orders : (orders?.results || []);

  if (ordersList.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: 500, gap: 2 }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 100, mb: 1, color: "#E0E0E0" }} />
        <Typography sx={{ ...h4, textAlign: "center", mb: 1 }}>
          You haven't placed any orders yet
        </Typography>
        <Typography sx={{ ...h6, textAlign: "center", maxWidth: 400 }}>
          When you make your first purchase, your order history will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {ordersList.map(order => {
        // Считаем общую сумму, если ее нет в корне объекта
        const totalAmount = order.positions?.reduce((sum, p) => sum + (p.product?.total_price || p.accessory?.total_price || 0), 0).toFixed(2);

        return (
          <Box key={order.id} sx={{ border: "1px solid #E0E0E0", borderRadius: "24px", p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ ...h5 }}>Order number</Typography>
                <Typography>№{order.id}</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ ...h5 }}>Date placed</Typography>
                <Typography>{new Date(order.billing_details?.created_at).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ ...h5 }}>Total Amount</Typography>
                <Typography>${totalAmount}</Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography sx={{ ...h5 }}>Status</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box component="img"
                    src={statusImages[order.status?.toLowerCase()] || deliveringImg}
                    alt={order.status}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography sx={{ textTransform: "capitalize" }}>{order.status}</Typography>
                </Box>
              </Box>

              <Button
                sx={openOrderId === order.id ? { ...btnInCart } : { ...btnCart }}
                onClick={() => toggleOrder(order.id)}
              >
                {openOrderId === order.id ? "Hide details" : "View order"}
              </Button>
            </Box>

            <Collapse in={openOrderId === order.id} timeout="auto" unmountOnExit>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                {order.positions?.map((pos, index) => {
                  const item = pos.product || pos.accessory;
                  return (
                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 3, p: 2, borderTop: "1px solid #E0E0E0" }}>
                      {/* Если в объекте товара есть поле image или photo, подставьте его сюда */}

                      <Box sx={{
                        width: 80, height: 80, borderRadius: "12px",
                        backgroundColor: "#F5F5F5", display: "flex",
                        justifyContent: "center", alignItems: "center"
                      }}>
                        {item?.photos_url?.[0]?.url ? (
                          <Box component="img" src={item.photos_url[0].url} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <CoffeeIcon sx={{ color: "#CCC" }} />
                        )}
                      </Box>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{ ...h5, fontWeight: 600 }}>{item?.name}</Typography>
                        <Typography sx={{ ...h6, color: "gray" }}>Quantity: {pos.quantity}</Typography>
                      </Box>
                      <Typography sx={{ ...h5, color: "#16675C" }}>
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

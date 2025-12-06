import React, { useState, useEffect } from "react";
import { Button, Collapse, Box, Typography } from "@mui/material";
import { btnCart, btnInCart } from "../../styles/btnStyles.jsx";
import { h4, h5, h6 } from "../../styles/typographyStyles.jsx";
import { orders } from "../../mockData/orders.jsx";
import deliveredImg from "../../assets/images/status/delivered.png";
import deliveringImg from "../../assets/images/status/delivering.png";
import cancelledImg from "../../assets/images/status/cancelled.png";

export default function OrderHistory() {
  const [openOrderId, setOpenOrderId] = useState(null);


  const toggleOrder = (id) => {
    setOpenOrderId(openOrderId === id ? null : id);
  };

  const statusImages = {
    Delivered: deliveredImg,
    Delivering: deliveringImg,
    Cancelled: cancelledImg,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {orders?.results?.map(order => (
        <Box key={order.id} sx={{ border: "1px solid #E0E0E0", borderRadius: "24px", p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography sx={{ ...h5 }}>Order number</Typography>
              <Typography>{order.id}</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography sx={{ ...h5 }}>Date placed</Typography>
              <Typography>{order.date}</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography sx={{ ...h5 }}>Total Amount </Typography>
              <Typography>${order.total}</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography sx={{ ...h5 }}>Status </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box component="img" src={statusImages[order.status]} alt={order.status} sx={{ width: 24, height: 24 }} />
                <Typography>{order.status}</Typography>
              </Box>
            </Box>

            <Button sx={openOrderId === order.id ? { ...btnInCart } : { ...btnCart }} onClick={() => toggleOrder(order.id)}>
              {openOrderId === order.id ? "Hide details" : "View order"}
            </Button>
          </Box>

          <Collapse in={openOrderId === order.id} timeout="auto" unmountOnExit>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {order.positions.map((item, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 3, p: 2, borderTop: "1px solid #E0E0E0", }}>
                  <Box component="img" src={item.photos_url?.[0]?.url} alt={item.name} sx={{ width: 120, height: 120, borderRadius: 2, objectFit: "cover" }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ ...h4 }}>{item.name}</Typography>
                    <Typography sx={{ ...h6 }}>{item.description}</Typography>
                  </Box>
                  <Typography sx={{ ...h5, color: "#16675C" }}>${(item.price * item.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      ))}

    </Box>
  );
}




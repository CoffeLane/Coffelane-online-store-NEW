import React from 'react';
import { Box, Typography, Divider, Avatar, Chip, Stack } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; 
import { h6, h3, h4, h5, h7 } from "../../styles/typographyStyles.jsx";


export default function OrderDetails({ order }) {
  if (!order) return null;

  const { originalOrder } = order;

  return (
    <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Typography mb={2} sx={{ ...h3 }}>Order #{order.ID}</Typography>
      
      <Stack direction="row" spacing={1} mb={2} alignItems="center" justifyContent="space-between">
        <Chip 
          label={order.status.toUpperCase()}
          sx={{
            ...h6,
            bgcolor: 
              order.status === 'processing' ? '#FFE47A' : 
              order.status === 'delivered' ? '#7AF48C' : '#E0E0E0',
            color: '#3E3027',
            fontWeight: 'bold'
          }}
        />
        <Typography sx={{ ...h6, color: '#666' }}>{order.date}</Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {/* Блок Клієнта */}
      <Stack spacing={1} alignItems="center" mb={2} bgcolor={'#F9F9F9'} p={2} borderRadius={2}>
        <Avatar 
          src={order.customerPhoto} 
          sx={{ width: 80, height: 80, bgcolor: '#3E3027', fontSize: '2rem' }}
        >
          {/* Якщо src порожній, покаже ініціал або іконку */}
          {order.customer ? order.customer.charAt(0).toUpperCase() : <AccountCircleIcon sx={{ fontSize: 40 }} />}
        </Avatar>
        <Typography sx={{ ...h4, textAlign: 'center' }}>{order.customer}</Typography>
        <Typography sx={{ ...h7, color: '#999' }}>ID: {order.customerId}</Typography>

        {/* Блок Адреси */}
        <Box sx={{ mt: 2, width: '100%', borderTop: '1px solid #E0E0E0', pt: 2 }}>
          <Typography sx={{ ...h7, fontWeight: 'bold', mb: 0.5, display: 'block' }}>Shipping Address:</Typography>
          <Typography sx={{ ...h7, color: '#555', lineHeight: 1.4 }}>
            {originalOrder.street_name}, {originalOrder.apartment_number}<br />
            {originalOrder.city || originalOrder.state}, {originalOrder.zip_code}<br />
            {originalOrder.country}
          </Typography>
          <Typography sx={{ ...h7, mt: 1, color: '#3E3027', fontWeight: '500' }}>
            📞 {originalOrder.phone_number}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Typography sx={{ ...h4 }} mb={3}>Order items ({order.items})</Typography>

      <Stack spacing={3}>
        {order.itemsList.map((item, idx) => (
          <Stack key={idx} direction="row" spacing={2} alignItems="center">
            <Box 
              component="img" 
              src={item.image} 
              alt={item.name} 
              sx={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 2, bgcolor: '#f5f5f5' }} 
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ ...h5, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ ...h6, color: '#777' }}>{item.quantity} pcs</Typography>
                <Typography sx={{ ...h6, fontWeight: 'bold' }}>${item.price.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ ...h4 }}>Total Amount:</Typography>
        <Typography sx={{ ...h4, color: '#3E3027', fontSize: '1.5rem' }}>${Number(order.total).toFixed(2)}</Typography>
      </Box>
    </Box>
  );
}

import React, { useState } from 'react';
import { Box, Typography, Divider, Avatar, Chip, Stack, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CoffeeIcon from '@mui/icons-material/Coffee';
import CloseIcon from '@mui/icons-material/Close';
import { h6, h3, h4, h5, h7 } from "../../styles/typographyStyles.jsx";


export default function OrderDetails({ order, onClose }) {
  if (!order) return null;

  const { originalOrder } = order;
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (itemIndex) => {
    setImageErrors(prev => ({ ...prev, [itemIndex]: true }));
  };

  return (
    <Box sx={{ p: 3, borderRadius: 3, bgcolor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative' }}>
      {onClose && (
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#666', '&:hover': { backgroundColor: '#f5f5f5', color: '#333'}}}>
          <CloseIcon />
        </IconButton>
      )}
      <Typography mb={2} sx={{ ...h3 }}>Order #{order.ID}</Typography>
      
      <Stack direction="row" spacing={1} mb={2} alignItems="center" justifyContent="space-between">
        <Chip label={order.status}
          sx={{
            ...h6,
            bgcolor: 
              order.status === 'Delivered' ? '#46d95b' :
              order.status === 'Processing' ? '#f5c407' :
              order.status === 'Cancelled' ? '#FD8888' : '#E0E0E0',
            color: '#3E3027',
            fontWeight: 'bold',
            fontSize: '14px',
            textTransform: 'none'
          }}
        />
        <Typography sx={{ ...h6, color: '#666' }}>{order.date}</Typography>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1} alignItems="center" mb={2} bgcolor={'#F9F9F9'} p={2} borderRadius={2}>
        <Avatar src={order.customerPhoto} sx={{ width: 80, height: 80, bgcolor: '#3E3027', fontSize: '2rem' }}>
          {order.customer ? order.customer.charAt(0).toUpperCase() : <AccountCircleIcon sx={{ fontSize: 40 }} />}
        </Avatar>
        <Typography sx={{ ...h4, textAlign: 'center' }}>{order.customer}</Typography>
        <Typography sx={{ ...h7, color: '#999' }}>ID: {order.customerId}</Typography>

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

      <Typography sx={{ ...h3, fontSize: '1.5rem', fontWeight: 'bold' }} mb={3}>Order items ({order.items})</Typography>

      <Stack spacing={4}>
        {order.itemsList.map((item, idx) => (
          <Stack key={idx} direction="row" spacing={3} alignItems="center">
            {item.image && !imageErrors[idx] && !item.image.includes('placeholder') ? (
              <Box  component="img" src={item.image} alt={item.name} onError={() => handleImageError(idx)} sx={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 2, bgcolor: '#f5f5f5' }} />
            ) : (
              <Box sx={{ width: 80, height: 80, borderRadius: 2, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
                <CoffeeIcon sx={{ fontSize: 40, color: '#ccc' }} />
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ ...h4, mb: 1, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ ...h5, color: '#777', fontSize: '1rem' }}>{item.quantity} pcs</Typography>
                <Typography sx={{ ...h5, fontWeight: 'bold', fontSize: '1rem' }}>${item.price.toFixed(2)}</Typography>
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

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, FormControl, Select, MenuItem, CircularProgress, Alert, Stack, Divider, Paper, Grid, Card, CardContent, Avatar } from '@mui/material';
import CoffeeIcon from '@mui/icons-material/Coffee';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { apiWithAuth, default as api } from '../../store/api/axios.js';
import { fetchOrders } from '../../store/slice/ordersSlice.jsx';
import AdminBreadcrumbs from '../AdminBreadcrumbs/AdminBreadcrumbs.jsx';
import { h3, h4, h5, h6, h7 } from "../../styles/typographyStyles.jsx";

export default function OrderEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [photoCache, setPhotoCache] = useState(new Map()); 

  const [status, setStatus] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');
        
        let orderData = null;
        if (orders && orders.length > 0) {
          orderData = orders.find(o => o.id === Number(id));
        }
        
        if (!orderData) {
          const listResponse = await apiWithAuth.get('/orders/admin-list/', { params: { page: 1, size: 100 } });
          const allOrders = listResponse.data?.data || listResponse.data?.results || [];
          orderData = allOrders.find(o => o.id === Number(id));
          
          if (!orderData) {
            throw new Error('Order not found');
          }
        }
        
        setOrder(orderData);

        let orderStatus = (orderData.status || '').toLowerCase();
        if (orderStatus === 'delivering') {
          orderStatus = 'in_transit';
        }

        setStatus(orderStatus);
        setOrderNotes(orderData.order_notes || '');
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, orders, dispatch]);

  useEffect(() => {
    if (!order || !order.positions || order.positions.length === 0) return;

    const loadPhotos = async () => {
      const productIds = new Set();
      const accessoryIds = new Set();

      order.positions.forEach(position => {
        if (position.product?.id) {
          productIds.add(position.product.id);
        }
        if (position.accessory?.id) {
          accessoryIds.add(position.accessory.id);
        }
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
                    photoUrl = firstPhoto?.url || firstPhoto?.photo || null;
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
            setPhotoCache(prev => {
              const newCache = new Map(prev);
              results.forEach(({ key, photoUrl }) => {
                if (photoUrl) {
                  newCache.set(key, photoUrl);
                }
              });
              return newCache;
            });
          });
        }
        
        return prevCache;
      });
    };

    loadPhotos();
  }, [order]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess(false);

      const updateData = {
        status: status,
        order_notes: orderNotes,
      };

      console.log('📤 Updating order:', { id, updateData });
      console.log('📋 Current order status:', order?.status);
      console.log('📋 New status value:', status);
      console.log('📋 Order notes:', orderNotes);
      console.log('📋 Update data being sent:', JSON.stringify(updateData));

      const response = await apiWithAuth.patch(`/orders/update/${id}/`, updateData);
      console.log('✅ Order updated successfully:', response.data);

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/orders');
      }, 1500);
    } catch (err) {
      console.error('Error updating order:', err);
      const errorDetails = err.response?.data;
      console.error('Error details:', errorDetails);
      
      if (errorDetails?.status && Array.isArray(errorDetails.status)) {
        console.error('Status validation errors:', errorDetails.status);
        errorDetails.status.forEach((msg, index) => {
          console.error(`  Status error ${index}:`, msg);
        });
      }
      
      let errorMessage = 'Failed to update order';
      if (errorDetails) {
        if (errorDetails.detail) {
          errorMessage = errorDetails.detail;
        } else if (errorDetails.message) {
          errorMessage = errorDetails.message;
        } else if (errorDetails.status && Array.isArray(errorDetails.status)) {
          errorMessage = errorDetails.status[0] || 'Invalid status value';
          console.error('Status error message:', errorMessage);
        } else if (typeof errorDetails === 'string') {
          errorMessage = errorDetails;
        } else {
          errorMessage = JSON.stringify(errorDetails);
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => navigate('/admin/orders')}>Back to Orders</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <AdminBreadcrumbs />
      
      <Typography sx={{ ...h3, mb: 3 }}>Edit Order #{order?.id || id}</Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Order updated successfully! Redirecting...
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {order && (
        <Paper sx={{ p: 3, borderRadius: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
          <Stack spacing={3}>
            <Box>
              <Typography sx={{ ...h5, mb: 3, fontWeight: 600, color: '#3E3027' }}>Order Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: '16px', 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #F0F0F0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar sx={{ 
                          bgcolor: '#EAD9C9', 
                          width: 40, 
                          height: 40, 
                          mr: 1.5,
                          color: '#3E3027'
                        }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography sx={{ ...h7, color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Customer
                          </Typography>
                          <Typography sx={{ ...h6, fontWeight: 400, color: '#3E3027', mt: 0.5 }}>
                            {order.first_name} {order.last_name}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: '16px', 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #F0F0F0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar sx={{ 
                          bgcolor: '#EAD9C9', 
                          width: 40, 
                          height: 40, 
                          mr: 1.5,
                          color: '#3E3027'
                        }}>
                          <CalendarTodayIcon />
                        </Avatar>
                        <Box>
                          <Typography sx={{ ...h7, color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Date
                          </Typography>
                          <Typography sx={{ ...h6, fontWeight: 400, color: '#3E3027', mt: 0.5 }}>
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            }) : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: '16px', 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #F0F0F0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar sx={{ 
                          bgcolor: '#EAD9C9', 
                          width: 40, 
                          height: 40, 
                          mr: 1.5,
                          color: '#3E3027'
                        }}>
                          <PhoneIcon />
                        </Avatar>
                        <Box>
                          <Typography sx={{ ...h7, color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Phone
                          </Typography>
                          <Typography sx={{ ...h6, fontWeight: 400, color: '#3E3027', mt: 0.5 }}>
                            {order.phone_number || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%', 
                    borderRadius: '16px', 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #F0F0F0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Avatar sx={{ 
                          bgcolor: '#EAD9C9', 
                          width: 40, 
                          height: 40, 
                          mr: 1.5,
                          color: '#3E3027'
                        }}>
                          <LocationOnIcon />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ ...h7, color: '#999', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5 }}>
                            Shipping Address
                          </Typography>
                          <Typography sx={{ ...h6, fontWeight: 400, color: '#3E3027', mt: 0.5, wordBreak: 'break-word' }}>
                            {order.street_name}{order.apartment_number ? `, ${order.apartment_number}` : ''}
                            {order.city || order.state ? `, ${order.city || order.state}` : ''}
                            {order.zip_code ? ` ${order.zip_code}` : ''}
                            {order.country ? `, ${order.country}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              {order.positions && order.positions.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ ...h7, color: '#666' }}>Order Items ({order.positions.length})</Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      px: 2,
                      py: 1,
                      borderRadius: '12px',
                      bgcolor: '#F9F9F9',
                      border: '1px solid #E0E0E0'
                    }}>
                      <Typography sx={{ 
                        ...h7, 
                        color: '#999', 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Total:
                      </Typography>
                      <Typography sx={{ 
                        ...h6, 
                        fontWeight: 600, 
                        color: '#16675C',
                        fontSize: '1rem'
                      }}>
                        ${Number(order.order_amount || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {order.positions.map((position, idx) => {
                        const itemData = position.product || position.accessory || {};
                        const itemName = itemData.name || position.product?.name || position.accessory?.name || 'Unknown item';
                        
                        const quantity = Number(
                          position.product?.quantity || 
                          position.accessory?.quantity || 
                          position.quantity || 
                          1
                        );
                        
                        const totalPrice = Number(
                          position.product?.total_price || 
                          position.accessory?.total_price || 
                          0
                        );
                        
                        const price = quantity > 0 && totalPrice > 0
                          ? Number((totalPrice / quantity).toFixed(2))
                          : Number(
                              position.product?.price || 
                              position.accessory?.price || 
                              position.price || 
                              0
                            );
                        
                        let photoUrl = null;
                        
                        if (position.product?.id) {
                          photoUrl = photoCache.get(`product-${position.product.id}`);
                        } else if (position.accessory?.id) {
                          photoUrl = photoCache.get(`accessory-${position.accessory.id}`);
                        }
                        
                        if (!photoUrl) {
                          const itemData = position.product || position.accessory || {};
                          if (itemData.photos_url && Array.isArray(itemData.photos_url) && itemData.photos_url.length > 0) {
                            const firstPhoto = itemData.photos_url[0];
                            photoUrl = firstPhoto?.url || firstPhoto?.photo || (typeof firstPhoto === 'string' ? firstPhoto : null);
                          } else if (itemData.product_photos && Array.isArray(itemData.product_photos) && itemData.product_photos.length > 0) {
                            const firstPhoto = itemData.product_photos[0];
                            photoUrl = firstPhoto?.url || firstPhoto?.photo || null;
                          } else if (itemData.accessory_photos && Array.isArray(itemData.accessory_photos) && itemData.accessory_photos.length > 0) {
                            const firstPhoto = itemData.accessory_photos[0];
                            photoUrl = firstPhoto?.url || firstPhoto?.photo || null;
                          }
                        }
                      
                        if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http') && !photoUrl.startsWith('blob:')) {
                          const baseUrl = 'https://onlinestore-928b.onrender.com';
                          photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
                        }
                        
                        const hasImage = photoUrl && !imageErrors[idx] && !photoUrl.includes('placeholder');
                        
                        return (
                          <Box 
                            key={idx} 
                            sx={{ 
                              p: 1.5, 
                              bgcolor: '#f9f9f9', 
                              borderRadius: '8px',
                              border: '1px solid #e0e0e0',
                              display: 'flex',
                              gap: 2,
                              alignItems: 'center'
                            }}
                          >
                            {hasImage ? (
                              <Box 
                                component="img" 
                                src={photoUrl} 
                                alt={itemName}
                                onError={() => setImageErrors(prev => ({ ...prev, [idx]: true }))}
                                sx={{ 
                                  width: 60, 
                                  height: 60, 
                                  objectFit: 'contain', 
                                  borderRadius: '8px', 
                                  bgcolor: '#f5f5f5' 
                                }} 
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: '8px',
                                  backgroundColor: '#f5f5f5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <CoffeeIcon sx={{ fontSize: 30, color: '#ccc' }} />
                              </Box>
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ ...h6, mb: 0.5, fontSize: '0.95rem' }}>
                                {itemName}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                <Typography sx={{ ...h7, color: '#777', fontSize: '0.875rem' }}>
                                  {quantity || 0} pcs × ${(price || 0).toFixed(2)}
                                </Typography>
                                <Typography sx={{ ...h6, color: '#16675C', fontWeight: 600, fontSize: '0.95rem' }}>
                                  ${(totalPrice || 0).toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                  </Stack>
                </Box>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ ...h5, mb: 2, fontWeight: 600 }}>Status</Typography>
              <FormControl fullWidth>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#A4795B',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#A4795B',
                    },
                  }}
                >
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ ...h5, mb: 2, fontWeight: 600 }}>Order Notes</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add notes about this order..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#A4795B',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#A4795B',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/orders')}
                disabled={saving}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#666',
                  borderColor: '#e0e0e0',
                  '&:hover': {
                    borderColor: '#d0d0d0',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  backgroundColor: '#A4795B',
                  '&:hover': {
                    backgroundColor: '#8d6a4f',
                  },
                  '&:disabled': {
                    backgroundColor: '#d4c4b5',
                  },
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}


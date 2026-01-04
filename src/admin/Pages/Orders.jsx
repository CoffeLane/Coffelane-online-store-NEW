import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Search from '../../components/Search/index.jsx';
import { h5 } from "../../styles/typographyStyles.jsx";
import ProductsTableOrders from '../AdminComponents/ProductsTableOrders.jsx';
import AdminBreadcrumbs from '../AdminBreadcrumbs/AdminBreadcrumbs.jsx';
import OrderDetails from '../AdminComponents/OrderDetails.jsx';
import { fetchOrders } from '../../store/slice/ordersSlice.jsx';
import { apiWithAuth, default as api } from '../../store/api/axios.js';

// Константи для зображень
const PRODUCT_PLACEHOLDER = 'https://via.placeholder.com/150?text=No+Product';

export default function Orders() {
  const dispatch = useDispatch();

  // Отримуємо дані з Redux
  const { orders, loading, error, count } = useSelector((state) => state.orders);

  const [page, setPage] = useState(1);
  const rowsPerPage = 20;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [photoCache, setPhotoCache] = useState(new Map()); // Кэш для фото продуктов/аксессуаров

  // Завантаження замовлень
  useEffect(() => {
    // Додаємо ordering=-id щоб нові були зверху (якщо бекенд підтримує)
    dispatch(fetchOrders({ page, size: rowsPerPage, ordering: '-id' }));
  }, [dispatch, page]);

  // Загрузка фото для всех продуктов/аксессуаров в заказах
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const loadPhotos = async () => {
      // Собираем все уникальные ID продуктов и аксессуаров
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

      // Проверяем, какие фото уже загружены
      setPhotoCache(prevCache => {
        const photoPromises = [];
        
        // Загружаем фото продуктов
        productIds.forEach(productId => {
          if (!prevCache.has(`product-${productId}`)) {
            photoPromises.push(
              api.get(`/products/${productId}`)
                .then(response => {
                  const product = response.data;
                  let photoUrl = null;
                  
                  // Извлекаем фото из различных полей
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
                  
                  // Если URL относительный, добавляем базовый URL
                  if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http') && !photoUrl.startsWith('blob:')) {
                    const baseUrl = 'https://onlinestore-928b.onrender.com';
                    photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
                  }
                  
                  return { key: `product-${productId}`, photoUrl: photoUrl || PRODUCT_PLACEHOLDER };
                })
                .catch(err => {
                  console.warn(`Failed to load photo for product ${productId}:`, err);
                  return { key: `product-${productId}`, photoUrl: PRODUCT_PLACEHOLDER };
                })
            );
          }
        });

        // Загружаем фото аксессуаров
        accessoryIds.forEach(accessoryId => {
          if (!prevCache.has(`accessory-${accessoryId}`)) {
            photoPromises.push(
              api.get(`/accessories/${accessoryId}`)
                .then(response => {
                  const accessory = response.data;
                  let photoUrl = null;
                  
                  // Извлекаем фото из различных полей
                  if (accessory.photos_url && Array.isArray(accessory.photos_url) && accessory.photos_url.length > 0) {
                    const firstPhoto = accessory.photos_url[0];
                    photoUrl = firstPhoto?.url || firstPhoto?.photo || (typeof firstPhoto === 'string' ? firstPhoto : null);
                  } else if (accessory.accessory_photos && Array.isArray(accessory.accessory_photos) && accessory.accessory_photos.length > 0) {
                    const firstPhoto = accessory.accessory_photos[0];
                    photoUrl = firstPhoto?.url || firstPhoto?.photo || (typeof firstPhoto === 'string' ? firstPhoto : null);
                  }
                  
                  // Если URL относительный, добавляем базовый URL
                  if (photoUrl && typeof photoUrl === 'string' && !photoUrl.startsWith('http') && !photoUrl.startsWith('blob:')) {
                    const baseUrl = 'https://onlinestore-928b.onrender.com';
                    photoUrl = photoUrl.startsWith('/') ? `${baseUrl}${photoUrl}` : `${baseUrl}/${photoUrl}`;
                  }
                  
                  return { key: `accessory-${accessoryId}`, photoUrl: photoUrl || PRODUCT_PLACEHOLDER };
                })
                .catch(err => {
                  console.warn(`Failed to load photo for accessory ${accessoryId}:`, err);
                  return { key: `accessory-${accessoryId}`, photoUrl: PRODUCT_PLACEHOLDER };
                })
            );
          }
        });

        // Ждем загрузки всех фото и обновляем кэш
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
        
        return prevCache; // Возвращаем текущий кэш без изменений
      });
    };

    loadPhotos();
  }, [orders]);

  // Трансформація даних під формат таблиці та деталей
  const transformedOrders = (orders || [])
    .slice() // Створюємо копію для безпечного сортування на фронті, якщо бекенд не відсортував
    .sort((a, b) => b.id - a.id) 
    .map((order) => {
      
      // 1. Форматування дати
      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) 
          ? 'N/A' 
          : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
      };

      // 2. Ім'я клієнта (беремо з кореня об'єкта згідно з твоїм JSON)
      const customerName = order.first_name && order.last_name
        ? `${order.first_name} ${order.last_name}`
        : `Customer #${order.customer || 'N/A'}`;

      // 3. Список товарів (itemsList)
      const itemsList = (order.positions || []).map((position) => {
        const itemData = position.product || position.accessory || {};
        
        // Получаем фото из кэша или используем placeholder
        let photoUrl = PRODUCT_PLACEHOLDER;
        
        if (position.product?.id) {
          const cacheKey = `product-${position.product.id}`;
          photoUrl = photoCache.get(cacheKey) || PRODUCT_PLACEHOLDER;
        } else if (position.accessory?.id) {
          const cacheKey = `accessory-${position.accessory.id}`;
          photoUrl = photoCache.get(cacheKey) || PRODUCT_PLACEHOLDER;
        }

        return {
          name: itemData.name || 'Unknown Product',
          quantity: position.quantity || 1,
          price: Number(itemData.price || position.price || 0),
          image: photoUrl,
        };
      });

      // 4. Загальна кількість одиниць товару
      const totalItemsCount = itemsList.reduce((sum, item) => sum + (item.quantity || 0), 0);

      // Маппинг статусов для отображения
      const statusLabels = {
        processing: 'Processing',
        delivered: 'Delivered',
        delivering: 'Delivered',
        in_transit: 'Delivered',
        cancelled: 'Cancelled',
        canceled: 'Cancelled',
      };
      
      const orderStatus = (order.status || '').toLowerCase();
      const displayStatus = statusLabels[orderStatus] || (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending');

      return {
        id: order.id,
        ID: String(order.id),
        status: displayStatus,
        date: formatDate(order.created_at),
        customer: customerName,
        customerPhoto: order.customer_data?.avatar || null, // Передаємо null, якщо немає фото (OrderDetails обробить це)
        customerId: String(order.customer || 'N/A'),
        itemsList: itemsList,
        total: order.order_amount || 0,
        items: totalItemsCount,
        originalOrder: order, // Зберігаємо все замовлення для OrderDetails (адреса, телефон тощо)
      };
    });

  const totalPages = Math.ceil((count || 0) / rowsPerPage);

  const handlePageChange = (e, newPage) => {
    setPage(newPage);
    setSelectedOrder(null); 
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  // Стан завантаження
  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Стан помилки
  if (error && orders.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: '#c62828', mb: 2 }}>
          Error loading orders: {error?.detail || error?.message || 'Unknown error'}
        </Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', lg: 'row' }, 
      width: '100%', 
      gap: { xs: 2, md: 3 }, 
      my: { xs: 2, md: 3 } 
    }}>
      {/* Ліва частина: Таблиця */}
      <Box sx={{ 
        flex: selectedOrder ? { xs: 'none', lg: '2 1 0%' } : '1 1 100%', 
        display: 'flex', 
        flexDirection: 'column', 
        minWidth: 0, 
        transition: 'flex 0.3s ease', 
        width: { xs: '100%', lg: 'auto' } 
      }}>
        <Box mb={3} sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: { xs: 2, sm: 0 } 
        }}>
          <AdminBreadcrumbs />
          <Box display="flex" gap={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Search />
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ProductsTableOrders
            products={transformedOrders}
            h5={h5}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            variant="admin"
            onRowClick={handleSelectOrder}
            selectedOrderId={selectedOrder?.id}
          />
        </Box>
      </Box>

      {/* Права частина: Деталі замовлення */}
      {selectedOrder && (
        <Box sx={{ 
          width: { xs: '100%', lg: 400 }, 
          minWidth: { xs: '100%', lg: 350 }, 
          maxWidth: { xs: '100%', lg: 450 }, 
          display: 'flex', 
          flexDirection: 'column'
        }}>
          <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        </Box>
      )}
    </Box>
  );
}

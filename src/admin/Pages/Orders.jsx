import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Search from '../../components/Search/index.jsx';
import { h5 } from "../../styles/typographyStyles.jsx";
import ProductsTableOrders from '../AdminComponents/ProductsTableOrders.jsx';
import AdminBreadcrumbs from '../AdminBreadcrumbs/AdminBreadcrumbs.jsx';
import OrderDetails from '../AdminComponents/OrderDetails.jsx';
import { fetchOrders } from '../../store/slice/ordersSlice.jsx';

// Константи для зображень
const PRODUCT_PLACEHOLDER = 'https://via.placeholder.com/150?text=No+Product';

export default function Orders() {
  const dispatch = useDispatch();

  // Отримуємо дані з Redux
  const { orders, loading, error, count } = useSelector((state) => state.orders);

  const [page, setPage] = useState(1);
  const rowsPerPage = 20;
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Завантаження замовлень
  useEffect(() => {
    // Додаємо ordering=-id щоб нові були зверху (якщо бекенд підтримує)
    dispatch(fetchOrders({ page, size: rowsPerPage, ordering: '-id' }));
  }, [dispatch, page]);

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
        
        // Пошук фото товару (не використовуємо тут userAvatar!)
        const photoUrl = itemData.photos_url?.[0]?.url || 
                         itemData.product_photos?.[0]?.url ||
                         itemData.accessory_photos?.[0]?.url ||
                         PRODUCT_PLACEHOLDER;

        return {
          name: itemData.name || 'Unknown Product',
          quantity: position.quantity || 1,
          price: Number(itemData.price || position.price || 0),
          image: photoUrl,
        };
      });

      // 4. Загальна кількість одиниць товару
      const totalItemsCount = itemsList.reduce((sum, item) => sum + (item.quantity || 0), 0);

      return {
        id: order.id,
        ID: String(order.id),
        status: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending',
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
          <OrderDetails order={selectedOrder} />
        </Box>
      )}
    </Box>
  );
}

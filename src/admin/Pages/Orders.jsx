import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Search from '../../components/Search/index.jsx';
import { h5 } from "../../styles/typographyStyles.jsx";
import ProductsTableOrders from '../AdminComponents/ProductsTableOrders.jsx';
import AdminBreadcrumbs from '../AdminBreadcrumbs/AdminBreadcrumbs.jsx';
import OrderDetails from '../AdminComponents/OrderDetails.jsx';
import { fetchOrders } from '../../store/slice/ordersSlice.jsx';
import userAvatar from '../../assets/admin/user-avatar.jpg';

export default function Orders() {
  const dispatch = useDispatch();
  const { orders, loading, error, count, page: currentPage } = useSelector((state) => state.orders);
  
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Загружаем заказы при монтировании и при изменении страницы
  useEffect(() => {
    dispatch(fetchOrders({ page, size: rowsPerPage }));
  }, [dispatch, page]);

  // Преобразуем данные из API в формат, который ожидают компоненты
  const transformedOrders = orders.map((order) => {
    // Форматируем дату
    const formatDate = (dateString) => {
      if (!dateString) {
        console.log("⚠️ No date string provided for order:", order.id);
        return 'N/A';
      }
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.log("⚠️ Invalid date string:", dateString, "for order:", order.id);
          return dateString; // Возвращаем исходную строку, если дата невалидна
        }
        return date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      } catch (e) {
        console.error("❌ Error formatting date:", e, "for order:", order.id, "dateString:", dateString);
        return dateString || 'N/A';
      }
    };
    
    // Логируем структуру заказа для отладки (только для первого заказа)
    if (orders.indexOf(order) === 0) {
      console.log("📦 First order structure:", {
        id: order.id,
        billing_details: order.billing_details,
        created_at: order.created_at,
        total: order.total,
        total_price: order.total_price,
        positions: order.positions?.length || 0
      });
    }

    // Получаем имя клиента из billing_details или customer_data
    const customerName = order.billing_details?.first_name && order.billing_details?.last_name
      ? `${order.billing_details.first_name} ${order.billing_details.last_name}`
      : order.customer_data?.email?.split('@')[0] || 'Customer';

    // Получаем ID клиента
    const customerId = order.customer_data?.id || order.user_id || 'N/A';

    // Преобразуем позиции заказа в itemsList
    const itemsList = (order.positions || []).map((position) => {
      const product = position.product || position.accessory || {};
      const photoUrl = product.photos_url?.[0]?.url || 
                      product.product_photos?.[0]?.url ||
                      product.accessory_photos?.[0]?.url ||
                      null;
      
      // Получаем цену из product/accessory или position
      const itemPrice = product.total_price || 
                       product.price || 
                       position.total_price || 
                       position.price || 
                       0;
      
      return {
        name: product.name || position.name || 'Unknown Product',
        quantity: position.quantity || 1,
        price: Number(itemPrice) || 0,
        image: photoUrl || userAvatar,
      };
    });

    // Подсчитываем общее количество товаров
    const totalItems = itemsList.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Рассчитываем общую сумму из позиций (как в OrdersHistory)
    const calculatedTotal = (order.positions || []).reduce((sum, p) => {
      const price = p.product?.total_price || 
                   p.accessory?.total_price || 
                   p.product?.price ||
                   p.accessory?.price ||
                   p.total_price || 
                   p.price || 
                   0;
      return sum + (price * (p.quantity || 1));
    }, 0);

    // Получаем дату из billing_details.created_at (как в OrdersHistory) или других полей
    const orderDate = order.billing_details?.created_at ||
                     order.created_at || 
                     order.date || 
                     order.order_date || 
                     order.created || 
                     order.updated_at ||
                     order.timestamp ||
                     order.created_date;
    
    return {
      id: order.id,
      ID: order.id || order.order_id || 'N/A',
      status: order.status || 'Pending',
      date: formatDate(orderDate),
      customer: customerName,
      customerPhoto: order.customer_data?.avatar || userAvatar,
      customerId: String(customerId),
      itemsList: itemsList,
      total: order.total || order.total_price || calculatedTotal || 0,
      items: totalItems,
      // Сохраняем оригинальные данные для деталей
      originalOrder: order,
    };
  });

  const totalPages = Math.ceil((count || 0) / rowsPerPage);

  const handlePageChange = (e, newPage) => {
    setPage(newPage);
    setSelectedOrder(null); // Сбрасываем выбранный заказ при смене страницы
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && orders.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: '#c62828', mb: 2 }}>
          Error loading orders: {error?.detail || error?.message || 'Unknown error'}
        </Typography>
        <Typography sx={{ color: '#666' }}>
          Please try refreshing the page or contact support if the problem persists.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, width: '100%', gap: { xs: 2, md: 3 }, my: { xs: 2, md: 3 } }}>

      <Box sx={{ flex: selectedOrder ? { xs: 'none', lg: '2 1 0%' } : '1 1 100%', display: 'flex', flexDirection: 'column', minWidth: 0, transition: 'flex 0.3s ease', width: { xs: '100%', lg: 'auto' } }}>
        <Box mb={3} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 2, sm: 0 } }}>
          <AdminBreadcrumbs />
          <Box display="flex" gap={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Search />
            </Box>
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

      {selectedOrder && (
        <Box sx={{ 
          width: { xs: '100%', lg: 400 }, 
          minWidth: { xs: '100%', lg: 300 }, 
          maxWidth: { xs: '100%', lg: 400 }, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 2, md: 3 } 
        }}>
          <OrderDetails order={selectedOrder} />
        </Box>
      )}
    </Box>
  );
}

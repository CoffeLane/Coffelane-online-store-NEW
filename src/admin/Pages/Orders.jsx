import React, { useState } from 'react';
import { Box } from '@mui/material';
import Search from '../../components/Search/index.jsx';
import { h5 } from "../../styles/typographyStyles.jsx";
import ProductsTableOrders from '../AdminComponents/ProductsTableOrders.jsx';
import AdminBreadcrumbs from '../AdminBreadcrumbs/AdminBreadcrumbs.jsx';
import OrderDetails from '../AdminComponents/OrderDetails.jsx';
import image1 from '../../assets/images/coffe/image_1.png';
import image2 from '../../assets/images/coffe/image_2.png';
import userAvatar from '../../assets/admin/user-avatar.jpg';

const productsData = [
  {
    id: 1,
    ID: 131313,
    status: 'Delivered',
    date: '01.09.2025',
    customer: 'Alex Johnson',
    customerPhoto: userAvatar,
    customerId: '12345678',
    itemsList: [
      { name: 'Instant coffee Jacobs Barista Editions Americano', quantity: 1, price: 10.5, image: image1 },
      { name: 'Instant coffee Lavazza Oro', quantity: 1, price: 12.5, image: image2 },
      { name: 'Instant coffee Jacobs Vaniglia', quantity: 1, price: 20, image: image1 },
    ],
    total: 48.5,
    items: 3,
  },
  {
    id: 2,
    ID: 131314,
    status: 'Pending',
    date: '03.09.2025',
    customer: 'Anna Brown',
    customerPhoto: userAvatar,
    customerId: '87654321',
    itemsList: [
      { name: 'Instant coffee Nescafe Classic', quantity: 2, price: 8.5, image: image2 },
    ],
    total: 17,
    items: 2,
  },
  {
    id: 3,
    ID: 131315,
    status: 'Cancelled',
    date: '04.09.2025',
    customer: 'John Smith',
    customerPhoto: userAvatar,
    customerId: '65432198',
    itemsList: [
      { name: 'Instant coffee Tchibo Exclusive', quantity: 1, price: 9.5, image: image1 },
    ],
    total: 9.5,
    items: 1,
  },
  {
    id: 4,
    ID: 131314,
    status: 'Delivered',
    date: '01.09.2025',
    customer: 'Alex Johnson',
    customerPhoto: userAvatar,
    customerId: '12345678',
    itemsList: [
      { name: 'Instant coffee Jacobs Barista Editions Americano', quantity: 1, price: 10.5, image: image1 },
      { name: 'Instant coffee Lavazza Oro', quantity: 1, price: 12.5, image: image2 },
      { name: 'Instant coffee Jacobs Vaniglia', quantity: 1, price: 20, image: image1 },
    ],
    total: 48.5,
    items: 3,
  },
  {
    id: 5,
    ID: 131315,
    status: 'Pending',
    date: '03.09.2025',
    customer: 'Anna Brown',
    customerPhoto: userAvatar,
    customerId: '87654321',
    itemsList: [
      { name: 'Instant coffee Nescafe Classic', quantity: 2, price: 8.5, image: image2 },
    ],
    total: 17,
    items: 2,
  },
  {
    id: 6,
    ID: 131316,
    status: 'Cancelled',
    date: '04.09.2025',
    customer: 'John Smith',
    customerPhoto: userAvatar,
    customerId: '65432198',
    itemsList: [
      { name: 'Instant coffee Tchibo Exclusive', quantity: 1, price: 9.5, image: image1 },
    ],
    total: 9.5,
    items: 1,
  },
];

export default function Orders() {
  const [products] = useState(productsData);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(products.length / rowsPerPage);

  const handlePageChange = (e, newPage) => setPage(newPage);

  const paginatedProducts = products.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', gap: 3, my: 3, }}>

      <Box sx={{ flex: selectedOrder ? '2 1 0%' : '1 1 100%', display: 'flex', flexDirection: 'column', minWidth: 0, transition: 'flex 0.3s ease' }}>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <AdminBreadcrumbs />
          <Box display="flex" gap={2}>
            <Search />
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, }}>
          <ProductsTableOrders
            products={paginatedProducts}
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
        <Box sx={{ width: 400, minWidth: 300, maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <OrderDetails order={selectedOrder} />
        </Box>
      )}
    </Box>
  );
}

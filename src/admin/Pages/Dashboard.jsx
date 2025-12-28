import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { h3, h5, h7 } from '../../styles/typographyStyles.jsx';
import exportIcon from '../../assets/admin/export.svg';
import { btnCart } from "../../styles/btnStyles.jsx";
import RevenueChart from '../AdminComponents/Dashboard/RevenueChart.jsx';
import dashboard1 from '../../assets/admin/dashboard1.svg';
import dashboard2 from '../../assets/admin/dashboard2.svg';
import dashboard3 from '../../assets/admin/dashboard3.svg';
import ProductsTable from '../AdminComponents/Dashboard/ProductsTable.jsx';
import { checkboxStyles } from '../../styles/inputStyles.jsx';
import api from '../../store/api/axios.js';

const salesCards = [
  { title: 'Total Sales', value: '$1k', diff: '+8% from yesterday', color: '#ffe5e9', icon: dashboard1 },
  { title: 'Total Order', value: '300', diff: '+5% from yesterday', color: '#e5ffe9', icon: dashboard2 },
  { title: 'New Customers', value: '8', diff: '0.5% from yesterday', color: '#efe5ff', icon: dashboard3 },
];

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('Category');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const productsRes = await api.get('/products');
      const accessoriesRes = await api.get('/accessories');

      const combined = [
        ...productsRes.data.data.map(p => ({ ...p, type: 'product' })),
        ...accessoriesRes.data.data.map(a => ({ ...a, type: 'accessory' })),
      ];

      setProducts(combined);
    } catch (error) {
      // console.error('Error loading products:', error);
    }
  };

  const adminProducts = products.map(item => ({
    id: item.id,
    image: item.photos_url?.[0]?.url || item.accessory_photos?.[0]?.url || null,
    name: item.name,
    category: item.brand || item.category || 'Other',
    price: item.supplies?.[0]?.price || item.price || 0,
    stock: item.supplies?.[0]?.quantity || item.quantity || 0,
    status: (item.supplies?.[0]?.quantity || item.quantity || 0) > 0 ? 'Active' : 'Out of stock',
    type: item.type
  }));

  const rowsPerPage = 5;
  const totalPages = Math.ceil(adminProducts.length / rowsPerPage);

  const paginatedProducts = adminProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const allSelected = selectedIds.length === paginatedProducts.length;

  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? paginatedProducts.map(p => p.id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Box sx={{ width: '100%', my: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 2, my: { xs: 2, md: 4 } }}>
        <Typography sx={{ ...h3, fontSize: { xs: '16px', md: '32px' } }}>Dashboard</Typography>
        <Button sx={{ ...btnCart, gap: 1, display: 'flex', alignItems: 'center', fontSize: { xs: '12px', md: '14px' }, py: { xs: 0.75, md: 1 }, flexShrink: 0 }}>
          <Box component="img" src={exportIcon} sx={{ width: { xs: 20, md: 24 }, height: { xs: 20, md: 24 } }} />
          Export
        </Button>
      </Box>

      <Box mb={4} sx={{ backgroundColor: '#fff', borderRadius: '24px', p: { xs: 1.5, md: 2 } }}>
        <Typography sx={{ ...h5, fontSize: { xs: '16px', md: '18px' } }}>Today's Sales</Typography>
        <Typography sx={{ ...h7, color: '#999', mb: 2, fontSize: { xs: '12px', md: '14px' } }}>Sales Summary</Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 2 } }}>
          {salesCards.map((c) => (
            <Paper
              key={c.title}
              sx={{
                flex: 1,
                p: { xs: 1.5, md: 2 },
                backgroundColor: c.color,
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1.5, md: 2 }
              }}
            >
              <Box component="img" src={c.icon} sx={{ width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }} />
              <Box>
                <Typography variant="h6" sx={{ fontSize: { xs: '18px', md: '24px' } }}>{c.value}</Typography>
                <Typography variant="subtitle1" sx={{ fontSize: { xs: '14px', md: '16px' } }}>{c.title}</Typography>
                <Typography variant="caption" color="primary" sx={{ fontSize: { xs: '11px', md: '12px' } }}>
                  {c.diff}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      <RevenueChart />

      {}
      <ProductsTable
        products={paginatedProducts}
        selectedIds={selectedIds}
        handleSelectAll={handleSelectAll}
        handleSelectOne={handleSelectOne}
        allSelected={allSelected}
        h5={h5}
        checkboxStyles={checkboxStyles}
        page={page}
        totalPages={totalPages}
        onPageChange={(e, newPage) => setPage(newPage)}
        variant="admin"
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />
    </Box>
  );
}


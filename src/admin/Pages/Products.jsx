import React, { useEffect, useState } from 'react';
import { Box, Divider, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Search from '../../components/Search/index.jsx';
import { h5 } from "../../styles/typographyStyles.jsx";
import { btnCart, btnAdminCheck } from "../../styles/btnStyles.jsx";
import AdminBreadcrumbs from '../AdminBreadcrumbs/AdminBreadcrumbs.jsx';
import { checkboxStyles } from '../../styles/inputStyles.jsx';
import hideIcon from '../../assets/admin/hide.svg';
import deleteIcon from '../../assets/admin/delete.svg';
import ProductsTable from '../AdminComponents/Dashboard/ProductsTable.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../../store/api/axios.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('Category');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAllProducts(page);
  }, [page]);

  const fetchAllProducts = async (pageNumber = 1) => {
    try {
      const productsRes = await api.get('/products', { params: { page: pageNumber } });
      const accessoriesRes = await api.get('/accessories');

      const combined = [
        ...productsRes.data.data.map(p => ({ ...p, type: 'product' })),
        ...accessoriesRes.data.data.map(a => ({ ...a, type: 'accessory' })),
      ];
      setProducts(combined);
      setTotalPages(productsRes.data.total_pages);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error loading products/accessories:', error);
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

  const filteredProducts = adminProducts;
  const allSelected = selectedIds.length === filteredProducts.length;

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedIds.map(id =>
          api.delete(`/products/${id}/deletion`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      fetchAllProducts(page);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleHideSelected = async () => {
    try {
      await Promise.all(
        selectedIds.map(id =>
          api.patch(`/products/product/${id}`, { status: 'Hidden' }, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          })
        )
      );
      fetchAllProducts(page);
    } catch (error) {
      console.error('Hiding error:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 4, mb: 3 }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <AdminBreadcrumbs />

        {selectedIds.length > 0 && (
          <Box display="flex" alignItems="center" gap={1}>
            <Divider orientation="vertical" flexItem sx={{ mr: 1, bgcolor: '#999', width: '1px' }} />

            <Button sx={{ ...btnAdminCheck, display: 'flex', alignItems: 'center', gap: 1 }} onClick={handleDeleteSelected}>
              <Box component="img" src={deleteIcon} sx={{ width: 20, height: 20 }} />
              Delete items
            </Button>

            <Button sx={{ ...btnAdminCheck, display: 'flex', alignItems: 'center', gap: 1 }} onClick={handleHideSelected}>
              <Box component="img" src={hideIcon} sx={{ width: 20, height: 20 }} />
              Hide items
            </Button>
          </Box>
        )}

        <Box display="flex" gap={2}>
          <Search />
          <Button variant="contained" onClick={() => navigate('add')} startIcon={<AddIcon />} sx={{ ...btnCart }}>
            Add new product
          </Button>
        </Box>
      </Box>

      <ProductsTable
        products={adminProducts}
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







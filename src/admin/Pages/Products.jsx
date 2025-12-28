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
import { apiWithAuth } from '../../store/api/axios.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('Category');

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllProducts(page);
  }, [page]);

  // Сбрасываем страницу при изменении категории и загружаем все продукты для фильтрации
  useEffect(() => {
    setPage(1);
    if (categoryFilter !== 'Category') {
      // При выборе категории загружаем все продукты для корректной фильтрации
      fetchAllProductsForFilter();
    }
  }, [categoryFilter]);

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
// console.error('Error loading products/accessories:', error);
    }
  };

  // Загружаем все продукты для фильтрации по категориям
  const fetchAllProductsForFilter = async () => {
    try {
      // Загружаем первую страницу для получения total_pages
      const firstPageRes = await api.get('/products', { params: { page: 1 } });
      const totalPages = firstPageRes.data.total_pages;
      
      // Загружаем все страницы параллельно
      const allPagesPromises = [];
      for (let p = 1; p <= totalPages; p++) {
        allPagesPromises.push(api.get('/products', { params: { page: p } }));
      }
      
      const allPagesRes = await Promise.all(allPagesPromises);
      const allProducts = allPagesRes.flatMap(res => res.data.data.map(p => ({ ...p, type: 'product' })));
      
      // Загружаем аксессуары
      const accessoriesRes = await api.get('/accessories');
      const allAccessories = accessoriesRes.data.data.map(a => ({ ...a, type: 'accessory' }));
      
      const combined = [...allProducts, ...allAccessories];
      setProducts(combined);
      setTotalPages(1); // После фильтрации пагинация будет на клиенте
      setSelectedIds([]);
    } catch (error) {
      // console.error('Error loading all products for filter:', error);
    }
  };

  const adminProducts = products.map(item => {
    // Обрабатываем фото для продуктов и аксессуаров
    let imageUrl = null;
    if (item.photos_url && Array.isArray(item.photos_url) && item.photos_url.length > 0) {
      imageUrl = item.photos_url[0]?.url || item.photos_url[0];
    } else if (item.accessory_photos && Array.isArray(item.accessory_photos) && item.accessory_photos.length > 0) {
      imageUrl = item.accessory_photos[0]?.url || item.accessory_photos[0];
    } else if (item.product_photos && Array.isArray(item.product_photos) && item.product_photos.length > 0) {
      imageUrl = item.product_photos[0]?.url || item.product_photos[0];
    }
    
    return {
      id: item.id,
      image: imageUrl,
      name: item.name,
      category: item.brand || item.category || 'Other',
      price: item.supplies?.[0]?.price || item.price || 0,
      stock: item.supplies?.[0]?.quantity || item.quantity || 0,
      status: (item.supplies?.[0]?.quantity || item.quantity || 0) > 0 ? 'Active' : 'Out of stock',
      type: item.type
    };
  });

  const allSelected = selectedIds.length === adminProducts.length;

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
          apiWithAuth.delete(`/products/${id}/deletion`)
        )
      );
      fetchAllProducts(page);
    } catch (error) {
      // console.error('Error deleting:', error);
    }
  };

  const handleHideSelected = async () => {
    try {
      await Promise.all(
        selectedIds.map(id =>
          apiWithAuth.patch(`/products/product/${id}`, { status: 'Hidden' })
        )
      );
      fetchAllProducts(page);
    } catch (error) {
      // console.error('Hiding error:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 3 } }}>
      <Box mb={3} sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: { xs: 2, md: 0 } }}>
        <AdminBreadcrumbs />

        {selectedIds.length > 0 && (
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            <Divider orientation="vertical" flexItem sx={{ mr: 1, bgcolor: '#999', width: '1px', display: { xs: 'none', md: 'block' } }} />

            <Button sx={{ ...btnAdminCheck, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '12px', md: '14px' }, py: { xs: 0.5, md: 1 } }} onClick={handleDeleteSelected}>
              <Box component="img" src={deleteIcon} sx={{ width: { xs: 16, md: 20 }, height: { xs: 16, md: 20 } }} />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Delete items</Box>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Delete</Box>
            </Button>

            <Button sx={{ ...btnAdminCheck, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '12px', md: '14px' }, py: { xs: 0.5, md: 1 } }} onClick={handleHideSelected}>
              <Box component="img" src={hideIcon} sx={{ width: { xs: 16, md: 20 }, height: { xs: 16, md: 20 } }} />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Hide items</Box>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Hide</Box>
            </Button>
          </Box>
        )}

        <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Search />
          </Box>
          <Button variant="contained" onClick={() => navigate('add')} startIcon={<AddIcon />} sx={{ ...btnCart, fontSize: { xs: '12px', md: '14px' }, py: { xs: 0.75, md: 1 }, width: { xs: '100%', sm: 'auto' } }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Add new product</Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Add product</Box>
          </Button>
        </Box>
      </Box>

      <ProductsTable
        onRefresh={fetchAllProducts}
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


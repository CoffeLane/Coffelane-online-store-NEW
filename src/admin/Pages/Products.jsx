import React, { useEffect, useState, useMemo } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../store/api/axios.js';
import { apiWithAuth } from '../../store/api/axios.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('Category');
  
  // Обработчик обновления продукта (для локального обновления статуса)
  const handleProductUpdated = (productId, updates) => {
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, ...updates } : p
      )
    );
    console.log("✅ Product updated locally:", productId, updates);
  };

  const navigate = useNavigate();
  const location = useLocation();

  // Обновляем список продуктов при монтировании и при изменении страницы
  useEffect(() => {
    fetchAllProducts(page);
  }, [page]);

  // Обновляем список продуктов, если пришли с флагом refresh
  useEffect(() => {
    if (location.state?.refresh) {
      // Увеличиваем задержку, чтобы дать время серверу обработать фото
      // Фото могут обрабатываться асинхронно на сервере, особенно для новых продуктов
      const timer = setTimeout(() => {
        fetchAllProducts(page);
        // Очищаем state, чтобы не обновлять при каждом рендере
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000); // Увеличено до 5 секунд, чтобы дать время серверу обработать и сохранить фото
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Прокручиваем в начало таблицы при изменении страницы (без анимации, чтобы избежать дергания)
  useEffect(() => {
    const tableTop = document.getElementById('products-table-top');
    if (tableTop) {
      tableTop.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
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
      // Используем apiWithAuth для получения полных данных включая status и visible
      const productsRes = await apiWithAuth.get('/products', { params: { page: pageNumber } }).catch(() => {
        // Если авторизованный запрос не работает, используем обычный
        return api.get('/products', { params: { page: pageNumber } });
      });
      const accessoriesRes = await api.get('/accessories');

      const combined = [
        ...productsRes.data.data.map(p => ({ ...p, type: 'product' })),
        ...accessoriesRes.data.data.map(a => ({ ...a, type: 'accessory' })),
      ];
      
      // Логируем данные для отладки (продукт с ID 8)
      const hiddenProduct = combined.find(p => p.id === 8);
      if (hiddenProduct) {
        console.log("🔍 Product 8 data after refresh:", {
          id: hiddenProduct.id,
          name: hiddenProduct.name,
          status: hiddenProduct.status,
          visible: hiddenProduct.visible,
          hasStatus: 'status' in hiddenProduct,
          hasVisible: 'visible' in hiddenProduct
        });
      }
      
      setProducts(combined);
      setTotalPages(productsRes.data.total_pages);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Загружаем все продукты для фильтрации по категориям
  const fetchAllProductsForFilter = async () => {
    try {
      // Используем apiWithAuth для получения полных данных включая status и visible
      const firstPageRes = await apiWithAuth.get('/products', { params: { page: 1 } }).catch(() => {
        return api.get('/products', { params: { page: 1 } });
      });
      const totalPages = firstPageRes.data.total_pages;
      
      const allPagesPromises = [];
      for (let p = 1; p <= totalPages; p++) {
        allPagesPromises.push(
          apiWithAuth.get('/products', { params: { page: p } }).catch(() => {
            return api.get('/products', { params: { page: p } });
          })
        );
      }
      
      const allPagesRes = await Promise.all(allPagesPromises);
      const allProducts = allPagesRes.flatMap(res => res.data.data.map(p => ({ ...p, type: 'product' })));
      
      const accessoriesRes = await api.get('/accessories');
      const allAccessories = accessoriesRes.data.data.map(a => ({ ...a, type: 'accessory' }));
      
      const combined = [...allProducts, ...allAccessories];
      setProducts(combined);
      setTotalPages(1);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error fetching products for filter:", error);
    }
  };

  const adminProducts = products.map(item => {
    // Обрабатываем фото для продуктов и аксессуаров
    let imageUrl = null;
    
    // Проверяем разные варианты структуры фото
    // Приоритет: photos_url > product_photos > accessory_photos
    if (item.photos_url && Array.isArray(item.photos_url) && item.photos_url.length > 0) {
      const firstPhoto = item.photos_url[0];
      if (typeof firstPhoto === 'string') {
        imageUrl = firstPhoto;
      } else if (firstPhoto && typeof firstPhoto === 'object') {
        imageUrl = firstPhoto.url || firstPhoto.photo || firstPhoto.photo_url || firstPhoto.image_url || null;
      }
    } else if (item.product_photos && Array.isArray(item.product_photos) && item.product_photos.length > 0) {
      const firstPhoto = item.product_photos[0];
      if (firstPhoto && typeof firstPhoto === 'object') {
        if (firstPhoto.photo) {
          if (typeof firstPhoto.photo === 'string') {
            imageUrl = firstPhoto.photo;
          } else if (firstPhoto.photo && typeof firstPhoto.photo === 'object') {
            imageUrl = firstPhoto.photo.url || firstPhoto.photo.photo_url || firstPhoto.photo.image_url || null;
          }
        } else {
          imageUrl = firstPhoto.url || firstPhoto.photo || firstPhoto.photo_url || firstPhoto.image_url || null;
        }
      } else if (typeof firstPhoto === 'string') {
        imageUrl = firstPhoto;
      }
    } else if (item.accessory_photos && Array.isArray(item.accessory_photos) && item.accessory_photos.length > 0) {
      const firstPhoto = item.accessory_photos[0];
      if (typeof firstPhoto === 'string') {
        imageUrl = firstPhoto;
      } else if (firstPhoto && typeof firstPhoto === 'object') {
        imageUrl = firstPhoto.url || firstPhoto.photo || firstPhoto.photo_url || firstPhoto.image_url || null;
      }
    }
    
    // Если URL относительный, добавляем базовый URL
    if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('http')) {
      imageUrl = `https://onlinestore-928b.onrender.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    
    
    const stockQuantity = item.supplies?.[0]?.quantity || item.quantity || 0;
    let productStatus = 'Active';
    
    // Логируем данные для продукта с ID 8
    if (item.id === 8) {
      console.log("🔍 Product 8 in adminProducts:", {
        id: item.id,
        status: item.status,
        visible: item.visible,
        hasStatus: 'status' in item,
        hasVisible: 'visible' in item,
        stockQuantity
      });
    }
    
    if (item.status) {
      productStatus = item.status;
    } else if (item.visible === false || item.visible === 'false' || item.visible === 0) {
      productStatus = 'Hidden';
    } else if (stockQuantity === 0) {
      productStatus = 'Out of stock';
    } else if (stockQuantity > 0) {
      productStatus = 'Active';
    }
    
    // Логируем вычисленный статус для продукта с ID 8
    if (item.id === 8) {
      console.log("🔍 Product 8 computed status:", productStatus);
    }
    
    return {
      id: item.id,
      image: imageUrl,
      name: item.name,
      category: item.brand || item.category || 'Other',
      price: item.supplies?.[0]?.price || item.price || 0,
      stock: stockQuantity,
      status: productStatus,
      type: item.type
    };
  });

  const allSelected = selectedIds.length === adminProducts.length;

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'Category' || !categoryFilter) return adminProducts;
    return adminProducts.filter(p => {
      const productCategory = (p.category || '').trim();
      const filterCategory = categoryFilter.trim();
      return productCategory.toLowerCase() === filterCategory.toLowerCase();
    });
  }, [adminProducts, categoryFilter]);

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
      // Error handling
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
      // Error handling
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

      <Box id="products-table-top" />
      <ProductsTable
        onRefresh={() => fetchAllProducts(page)}
        products={adminProducts}
        selectedIds={selectedIds}
        handleSelectAll={handleSelectAll}
        handleSelectOne={handleSelectOne}
        allSelected={allSelected}
        h5={h5}
        checkboxStyles={checkboxStyles}
        page={page}
        totalPages={totalPages}
        onPageChange={(e, newPage) => {
          setPage(newPage);
        }}
        variant="admin"
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />
    </Box>
  );
}


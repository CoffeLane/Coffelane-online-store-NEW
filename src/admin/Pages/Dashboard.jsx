import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { apiWithAuth } from '../../store/api/axios.js';

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
  const location = useLocation();
  const navigate = useNavigate();

  // Обновляем список продуктов при монтировании
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Обновляем список продуктов, если пришли с флагом refresh
  useEffect(() => {
    if (location.state?.refresh) {
      // Задержка, чтобы дать время серверу обработать фото
      const timer = setTimeout(() => {
        fetchAllProducts();
        // Очищаем state, чтобы не обновлять при каждом рендере
        navigate(location.pathname, { replace: true, state: {} });
      }, 2000); // 2 секунды для обработки фото на сервере
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  // Обновляем данные при фокусе на окне (если пользователь вернулся на вкладку)
  useEffect(() => {
    const handleFocus = () => {
      // Обновляем данные при возврате на вкладку (но не слишком часто)
      const lastUpdate = sessionStorage.getItem('dashboardLastUpdate');
      const now = Date.now();
      if (!lastUpdate || now - parseInt(lastUpdate) > 30000) { // Обновляем не чаще раза в 30 секунд
        fetchAllProducts();
        sessionStorage.setItem('dashboardLastUpdate', now.toString());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchAllProducts = async () => {
    try {
      // Загружаем все страницы продуктов (используем apiWithAuth для полных данных)
      const firstPageRes = await apiWithAuth.get('/products', { params: { page: 1 } }).catch(() => {
        // Если авторизованный запрос не работает, используем обычный
        return api.get('/products', { params: { page: 1 } });
      });
      const totalPages = firstPageRes.data.total_pages || 1;
      
      const allPagesPromises = [];
      for (let p = 1; p <= totalPages; p++) {
        allPagesPromises.push(
          apiWithAuth.get('/products', { params: { page: p } }).catch(() => {
            return api.get('/products', { params: { page: p } });
          })
        );
      }
      
      const allPagesRes = await Promise.all(allPagesPromises);
      const allProducts = allPagesRes.flatMap(res => res.data.data || []);
      
      // Загружаем все аксессуары
      const accessoriesRes = await api.get('/accessories');
      const allAccessories = accessoriesRes.data.data || [];

      const combined = [
        ...allProducts.map(p => ({ ...p, type: 'product' })),
        ...allAccessories.map(a => ({ ...a, type: 'accessory' })),
      ];

      setProducts(combined);
      console.log('✅ Dashboard: Loaded', allProducts.length, 'products and', allAccessories.length, 'accessories');
      
      // Логирование структуры данных для первых продуктов (для отладки)
      if (allProducts.length > 0) {
        const sampleProduct = allProducts[0];
        console.log('📸 Sample product structure:', {
          id: sampleProduct.id,
          name: sampleProduct.name,
          hasPhotosUrl: !!sampleProduct.photos_url,
          photosUrl: sampleProduct.photos_url,
          photosUrlLength: Array.isArray(sampleProduct.photos_url) ? sampleProduct.photos_url.length : 'N/A',
          hasProductPhotos: !!sampleProduct.product_photos,
          productPhotos: sampleProduct.product_photos,
          productPhotosLength: Array.isArray(sampleProduct.product_photos) ? sampleProduct.product_photos.length : 'N/A',
          hasAccessoryPhotos: !!sampleProduct.accessory_photos,
          accessoryPhotos: sampleProduct.accessory_photos,
          photoKeys: Object.keys(sampleProduct).filter(k => 
            k.toLowerCase().includes('photo') || 
            k.toLowerCase().includes('image') ||
            k.toLowerCase().includes('cover')
          )
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const adminProducts = products.map(item => {
    let imageUrl = null;
    
    // Функция для извлечения URL из фото объекта
    const extractPhotoUrl = (photo) => {
      if (!photo) return null;
      if (typeof photo === 'string') return photo;
      if (typeof photo === 'object') {
        return photo?.url || photo?.photo || photo?.photo_url || photo?.image_url || photo?.url_path || photo?.image || null;
      }
      return null;
    };
    
    // Пробуем разные варианты получения фото (в порядке приоритета)
    // 1. product_photos (массив) - приоритет для продуктов
    if (item.product_photos && Array.isArray(item.product_photos) && item.product_photos.length > 0) {
      imageUrl = extractPhotoUrl(item.product_photos[0]);
    }
    // 2. photos_url (массив)
    else if (item.photos_url && Array.isArray(item.photos_url) && item.photos_url.length > 0) {
      imageUrl = extractPhotoUrl(item.photos_url[0]);
    }
    // 3. accessory_photos (массив)
    else if (item.accessory_photos && Array.isArray(item.accessory_photos) && item.accessory_photos.length > 0) {
      imageUrl = extractPhotoUrl(item.accessory_photos[0]);
    }
    // 4. Прямые поля с URL
    else if (item.photo_url) {
      imageUrl = item.photo_url;
    }
    else if (item.image_url) {
      imageUrl = item.image_url;
    }
    else if (item.image) {
      imageUrl = item.image;
    }
    // 5. cover_photo
    else if (item.cover_photo) {
      imageUrl = extractPhotoUrl(item.cover_photo);
    }
    // 6. cover (может быть объектом или строкой)
    else if (item.cover) {
      imageUrl = extractPhotoUrl(item.cover);
    }
    // 7. Проверяем все поля, содержащие "photo" или "image"
    else {
      const photoKeys = Object.keys(item).filter(k => 
        (k.toLowerCase().includes('photo') || k.toLowerCase().includes('image')) && 
        k !== 'photos_url' && k !== 'accessory_photos' && k !== 'product_photos'
      );
      for (const key of photoKeys) {
        const value = item[key];
        if (value) {
          imageUrl = extractPhotoUrl(value);
          if (imageUrl) break;
        }
      }
    }
    
    // Формируем полный URL, если нужно
    if (imageUrl && typeof imageUrl === 'string' && !imageUrl.startsWith('http')) {
      imageUrl = `https://onlinestore-928b.onrender.com${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    
    // Логирование для отладки (только для первых нескольких продуктов без фото)
    if (!imageUrl && item.type === 'product' && products.indexOf(item) < 3) {
      console.log('🔍 Product without image:', {
        id: item.id,
        name: item.name,
        hasPhotosUrl: !!item.photos_url,
        photosUrlType: Array.isArray(item.photos_url) ? 'array' : typeof item.photos_url,
        photosUrlLength: Array.isArray(item.photos_url) ? item.photos_url.length : 'N/A',
        photosUrlFirst: Array.isArray(item.photos_url) && item.photos_url.length > 0 ? item.photos_url[0] : null,
        hasProductPhotos: !!item.product_photos,
        productPhotosType: Array.isArray(item.product_photos) ? 'array' : typeof item.product_photos,
        productPhotosLength: Array.isArray(item.product_photos) ? item.product_photos.length : 'N/A',
        productPhotosFirst: Array.isArray(item.product_photos) && item.product_photos.length > 0 ? item.product_photos[0] : null,
        hasAccessoryPhotos: !!item.accessory_photos,
        hasPhotoUrl: !!item.photo_url,
        hasCoverPhoto: !!item.cover_photo,
        allPhotoKeys: Object.keys(item).filter(k => k.toLowerCase().includes('photo') || k.toLowerCase().includes('image')),
        sampleData: {
          photos_url: item.photos_url,
          product_photos: item.product_photos,
          accessory_photos: item.accessory_photos,
          photo_url: item.photo_url,
          image_url: item.image_url,
          cover_photo: item.cover_photo,
          cover: item.cover
        }
      });
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

  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = adminProducts.map(product => ({
        ID: product.id,
        Name: product.name,
        Category: product.category,
        Type: product.type,
        Price: product.price,
        Stock: product.stock,
        Status: product.status,
        Image: product.image || ''
      }));

      // Convert to CSV
      const headers = ['ID', 'Name', 'Category', 'Type', 'Price', 'Stock', 'Status', 'Image'];
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Ошибка при экспорте данных. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <Box sx={{ width: '100%', my: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 2, my: { xs: 2, md: 4 } }}>
        <Typography sx={{ ...h3, fontSize: { xs: '16px', md: '32px' } }}>Dashboard</Typography>
        <Button 
          onClick={handleExport}
          sx={{ ...btnCart, gap: 1, display: 'flex', alignItems: 'center', fontSize: { xs: '12px', md: '14px' }, py: { xs: 0.75, md: 1 }, flexShrink: 0 }}
        >
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


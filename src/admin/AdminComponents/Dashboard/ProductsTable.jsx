import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Chip, Box, Card, CardContent, Typography, useMediaQuery, useTheme } from '@mui/material';
import CategoryHeader from '../CategoryHeader.jsx';
import ActionsMenu from '../ActionsMenu.jsx';
import PaginationControl from '../../../components/PaginationControl/PaginationControl.jsx';

export default function ProductsTable({
  products,
  selectedIds,
  handleSelectAll,
  handleSelectOne,
  allSelected,
  h5,
  checkboxStyles,
  page,
  totalPages,
  onPageChange,
  variant,
  categoryFilter,
  setCategoryFilter,
  onRefresh,
}) {
  // Все доступные бренды из Filter.jsx
  const allBrands = ['Lavazza', 'Blasercafe', 'Nescafé', 'Jacobs', "L'OR", 'Starbucks', 'Nespresso'];
  
  // Формируем список категорий: сначала "Category", затем все бренды из Filter.jsx, затем уникальные категории из продуктов
  const categories = useMemo(() => {
    const productCategories = new Set(products.map(p => p.category));
    const allCategories = ['Category', ...allBrands, ...Array.from(productCategories)];
    // Убираем дубликаты, сохраняя порядок
    return Array.from(new Set(allCategories));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'Category' || !categoryFilter) return products;
    // Фильтруем продукты по категории, учитывая возможные различия в регистре и пробелах
    return products.filter(p => {
      const productCategory = (p.category || '').trim();
      const filterCategory = categoryFilter.trim();
      return productCategory.toLowerCase() === filterCategory.toLowerCase();
    });
  }, [products, categoryFilter]);

  // Пересчитываем totalPages на основе отфильтрованных продуктов
  // Если выбрана категория, применяем пагинацию на клиенте
  const itemsPerPage = 10;
  const calculatedTotalPages = categoryFilter === 'Category' || !categoryFilter
    ? totalPages
    : Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  
  // Применяем пагинацию к отфильтрованным продуктам, если выбрана категория
  const paginatedFilteredProducts = useMemo(() => {
    if (categoryFilter === 'Category' || !categoryFilter) {
      return filteredProducts; // Используем серверную пагинацию
    }
    // Применяем клиентскую пагинацию к отфильтрованным продуктам
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, page, categoryFilter, itemsPerPage]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ 
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          mb: 2
        }}>
          {/* Заголовок таблицы */}
          <Box sx={{ 
            backgroundColor: '#EAD9C9',
            px: 2,
            py: 1.5,
            borderBottom: '2px solid #D4C4B5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography sx={{ 
              fontWeight: 600, 
              fontSize: '14px', 
              color: '#3E3027' 
            }}>
              Products
            </Typography>
            <Checkbox
              checked={allSelected}
              indeterminate={selectedIds.length > 0 && !allSelected}
              onChange={handleSelectAll}
              sx={{ 
                p: 0,
                color: '#A4795B',
                '&.Mui-checked': {
                  color: '#A4795B',
                },
                '&.MuiCheckbox-indeterminate': {
                  color: '#A4795B',
                },
                '& .MuiSvgIcon-root': { fontSize: 20 }
              }}
            />
          </Box>
          
          {/* Контейнер с карточками */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1.5,
            p: 2,
            backgroundColor: '#fafafa'
          }}>
            {paginatedFilteredProducts.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography sx={{ color: '#999', fontSize: '14px' }}>No products found</Typography>
              </Box>
            ) : (
              paginatedFilteredProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <Card
                  key={p.id}
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    border: isSelected ? '2px solid #A4795B' : '1px solid #e0e0e0',
                    backgroundColor: isSelected ? '#f5e8ddff' : '#ffffff',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      borderColor: isSelected ? '#A4795B' : '#d0d0d0',
                    },
                    '&:not(:last-child)': {
                      borderBottom: '1px solid #f0f0f0',
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1.5, flex: 1 }}>
                        <Checkbox 
                          checked={isSelected} 
                          onChange={() => handleSelectOne(p.id)}
                          sx={{ 
                            p: 0,
                            color: '#A4795B',
                            '&.Mui-checked': {
                              color: '#A4795B',
                            },
                            '&.MuiCheckbox-indeterminate': {
                              color: '#A4795B',
                            },
                          }}
                        />
                        {p.image ? (
                          <Box
                            component="img"
                            src={p.image}
                            alt={p.name}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '8px',
                              objectFit: 'cover',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '8px',
                              backgroundColor: '#f0f0f0',
                            }}
                          />
                        )}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 0.5, wordBreak: 'break-word' }}>
                            {p.name}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#666' }}>
                            {p.category}
                          </Typography>
                        </Box>
                      </Box>
                      <ActionsMenu 
                        id={p.id} 
                        type="product" 
                        productType={p.type === 'accessory' ? 'accessory' : 'coffee'}
                        onRefresh={onRefresh} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.5 }}>Price</Typography>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#16675C' }}>
                          ${p.price}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.5 }}>Stock</Typography>
                        <Typography sx={{ fontSize: '14px' }}>
                          {p.stock}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '11px', color: '#999', mb: 0.5 }}>Status</Typography>
                        <Chip
                          label={p.status}
                          size="small"
                          sx={{
                            backgroundColor:
                              p.status === 'Active' ? '#7AF48C' :
                              p.status === 'Draft' ? '#FFE47A' :
                              p.status === 'Hidden' ? '#BDBABA' :
                              p.status === 'Out of stock' ? '#FD8888' : '#E0E0E0',
                            color: '#3E3027',
                            fontWeight: 600,
                            fontSize: '10px',
                            height: 24,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          )}
          </Box>
        </Paper>
        <PaginationControl page={page} totalPages={calculatedTotalPages} onPageChange={onPageChange} variant={variant} />
      </Box>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        width: '100%', 
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
      }}
    >
      <Table sx={{ width: '100%' }}>
        <TableHead sx={{ 
          backgroundColor: '#EAD9C9',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: { xs: '12px', md: '14px' },
            color: '#3E3027',
            borderBottom: '2px solid #D4C4B5',
            py: { xs: 1.5, md: 2 },
          }
        }}>
          <TableRow>
            <TableCell padding="checkbox" sx={{ ...checkboxStyles }}>
              <Checkbox
                checked={allSelected}
                indeterminate={selectedIds.length > 0 && !allSelected}
                onChange={handleSelectAll}
                sx={{ 
                  '&.MuiCheckbox-indeterminate': { color: '#A4795B' },
                  '& .MuiSvgIcon-root': { fontSize: { xs: 20, md: 24 } }
                }}
              />
            </TableCell>
            <TableCell sx={{ ...h5, fontSize: { xs: '12px', md: '14px' } }}>Product</TableCell>
            <TableCell sx={{ ...h5, fontSize: { xs: '12px', md: '14px' } }}>Name</TableCell>
            <CategoryHeader categories={categories} selectedCategory={categoryFilter} onCategoryChange={setCategoryFilter} />
            <TableCell sx={{ ...h5, fontSize: { xs: '12px', md: '14px' } }}>Price</TableCell>
            <TableCell sx={{ ...h5, fontSize: { xs: '12px', md: '14px' } }}>Stock</TableCell>
            <TableCell sx={{ ...h5, fontSize: { xs: '12px', md: '14px' } }}>Status</TableCell>
            <TableCell sx={{ ...h5, fontSize: { xs: '12px', md: '14px' } }}>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {paginatedFilteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#999', fontSize: { xs: '14px', md: '16px' } }}>
                No products found
              </TableCell>
            </TableRow>
          ) : (
            paginatedFilteredProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <TableRow
                  key={p.id}
                  sx={{
                    backgroundColor: isSelected ? '#f5e8ddff' : '#ffffff',
                    '&:hover': { 
                      backgroundColor: isSelected ? '#f5e8ddff' : '#f8f2edff',
                      transform: 'scale(1.001)',
                      transition: 'all 0.2s ease',
                    },
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderBottom: '1px solid #f0f0f0',
                    '&:last-child': {
                      borderBottom: 'none',
                    }
                  }}
                >
                  <TableCell padding="checkbox" sx={{ ...checkboxStyles }}>
                    <Checkbox 
                      checked={isSelected} 
                      onChange={() => handleSelectOne(p.id)}
                      sx={{
                        '& .MuiSvgIcon-root': { fontSize: { xs: 20, md: 24 } }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {p.image ? (
                      <Box
                        component="img"
                        src={p.image}
                        alt={p.name}
                        sx={{
                          width: { xs: 32, md: 40 },
                          height: { xs: 32, md: 40 },
                          borderRadius: '8px',
                          objectFit: 'cover',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: { xs: 32, md: 40 },
                          height: { xs: 32, md: 40 },
                          borderRadius: '8px',
                          backgroundColor: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '12px', md: '14px' }, fontWeight: 500 }}>{p.name}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '12px', md: '14px' }, color: '#666', whiteSpace: 'nowrap' }}>{p.category}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '12px', md: '14px' }, fontWeight: 600, color: '#16675C' }}>${p.price}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '12px', md: '14px' } }}>{p.stock}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      size="small"
                      sx={{
                        backgroundColor:
                          p.status === 'Active' ? '#7AF48C' :
                          p.status === 'Draft' ? '#FFE47A' :
                          p.status === 'Hidden' ? '#BDBABA' :
                          p.status === 'Out of stock' ? '#FD8888' : '#E0E0E0',
                        color: '#3E3027',
                        fontWeight: 600,
                        fontSize: { xs: '10px', md: '12px' },
                        height: { xs: 24, md: 28 },
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <ActionsMenu 
                      id={p.id} 
                      type="product" 
                      productType={p.type === 'accessory' ? 'accessory' : 'coffee'}
                      onRefresh={onRefresh} 
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <PaginationControl page={page} totalPages={totalPages} onPageChange={onPageChange} variant={variant} />
    </TableContainer>
  );
}


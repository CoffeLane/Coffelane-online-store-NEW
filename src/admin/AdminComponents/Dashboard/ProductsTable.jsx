import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Chip } from '@mui/material';
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
}) {
  
  const categories = useMemo(() => ['Category', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === 'Category') return products;
    return products.filter(p => p.category === categoryFilter);
  }, [products, categoryFilter]);

  return (
    <TableContainer component={Paper} sx={{ width: '100%', borderRadius: '24px' }}>
      <Table sx={{ width: '100%' }}>
        <TableHead sx={{ backgroundColor: '#EAD9C9' }}>
          <TableRow>
            <TableCell padding="checkbox" sx={{ ...checkboxStyles }}>
              <Checkbox
                checked={allSelected}
                indeterminate={selectedIds.length > 0 && !allSelected}
                onChange={handleSelectAll}
                sx={{ '&.MuiCheckbox-indeterminate': { color: '#A4795B', '& .MuiSvgIcon-root': { fontSize: 24 }}}}
              />
            </TableCell>
            <TableCell sx={{ ...h5 }}>Product</TableCell>
            <TableCell sx={{ ...h5 }}>Name</TableCell>
            <CategoryHeader categories={categories} selectedCategory={categoryFilter} onCategoryChange={setCategoryFilter} />
            <TableCell sx={{ ...h5 }}>Price</TableCell>
            <TableCell sx={{ ...h5 }}>Stock</TableCell>
            <TableCell sx={{ ...h5 }}>Status</TableCell>
            <TableCell sx={{ ...h5 }}>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">No products found</TableCell>
            </TableRow>
          ) : (
            filteredProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <TableRow
                  key={p.id}
                  sx={{
                    backgroundColor: isSelected ? '#f5e8ddff' : 'inherit',
                    '&:hover': { backgroundColor: isSelected ? '#f5e8ddff' : '#f8f2edff' },
                    cursor: 'pointer',
                  }}
                >
                  <TableCell padding="checkbox" sx={{ ...checkboxStyles }}>
                    <Checkbox checked={isSelected} onChange={() => handleSelectOne(p.id)} />
                  </TableCell>
                  <TableCell>
                    {p.image ? <img src={p.image} alt={p.name} style={{ width: 40, height: 40 }} /> : null}
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      sx={{
                        backgroundColor:
                          p.status === 'Active' ? '#7AF48C' :
                          p.status === 'Draft' ? '#FFE47A' :
                          p.status === 'Hidden' ? '#BDBABA' :
                          p.status === 'Out of stock' ? '#FD8888' : '#E0E0E0',
                        color: '#3E3027',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <ActionsMenu id={p.id} />
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



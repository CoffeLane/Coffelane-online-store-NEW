import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const ProductItem = ({ product, searchInput, onProductClick, isLastItem }) => {
  const imageUrl = product.photos_url?.[0]?.url || product.photos_url?.[0] || '';
  const price = product.supplies?.[0]?.price || '0';
  const productUrl = `/coffee/product/${product.id}`;

  const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const safeSearch = escapeRegExp(searchInput);

  const highlightText = (text, query) => {
    if (!query) return text;
    
    return text
      .split(new RegExp(`(${safeSearch})`, 'gi'))
      .map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} style={{ color: '#16675C', fontWeight: 600 }}>
            {part}
          </span>
        ) : (
          part
        )
      );
  };

  return (
    <Link
      to={productUrl}
      style={{ textDecoration: 'none' }}
      onClick={onProductClick}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          gap: 2,
          cursor: 'pointer',
          transition: 'background 0.2s',
          borderBottom: !isLastItem ? '1px solid #f0f0f0' : 'none',
          '&:hover': {
            bgcolor: '#f8f8f8',
          },
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt={product.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/80?text=No+Image';
          }}
          sx={{
            width: 80,
            height: 80,
            objectFit: 'cover',
            borderRadius: '8px',
            flexShrink: 0,
            bgcolor: '#f5f5f5',
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: '#232323',
              mb: 0.5,
            }}
          >
            {highlightText(product.name, searchInput)}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
            {product.category?.name || 'Coffee'}
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: '#16675C',
              fontWeight: 600,
            }}
          >
            ${parseFloat(price).toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};

export default ProductItem;
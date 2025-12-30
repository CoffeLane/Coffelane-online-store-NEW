import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import KitchenIcon from '@mui/icons-material/Kitchen';
import { useSelector } from 'react-redux';
import { getProductPrice, formatPrice } from '../utils/priceUtils.jsx';

const AccessoryItem = ({ accessory, searchInput, onProductClick, isLastItem }) => {
  const currency = useSelector((state) => state.settings.currency);
  const price = getProductPrice(accessory, currency);
  const productUrl = `/accessories/product/${accessory.id}`;

  const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const highlightText = (text, query) => {
    if (!query) return text;
    const safe = escapeRegExp(query);
    return text
      .split(new RegExp(`(${safe})`, 'gi'))
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
          key={`acc-${accessory.id}`}
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
              transform: 'translateX(4px)',
          },
        }}
      >
         <Box
           sx={{
             width: 50,
              height: 50,
              borderRadius: '8px',
              display: 'grid', placeItems: 'center',
              bgcolor: '#E8F5E9',
              border: '1px solid #e0e0e0',
              }}
         >
          <KitchenIcon sx={{ color: '#16675C', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: '#232323',
              mb: 0.5,
            }}
          >
            {highlightText(accessory.name, searchInput)}
          </Typography>
          
          {accessory.category?.name && (
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '12px',
                display: 'block',
                mb: 0.3,
              }}
            >
              {accessory.category.name}
            </Typography>
          )}

          <Typography
            variant="body1"
            sx={{
              color: '#16675C',
              fontWeight: 600,
            }}
          >
            {formatPrice(price, currency)}
          </Typography>
        </Box>
      </Box>
    </Link>
  );
};

export default AccessoryItem;
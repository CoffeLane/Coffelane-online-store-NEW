import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const SearchDropdown = ({ results, loading, query, onClose, error }) => {
  if (loading) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          mt: 1,
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          p: 2,
          zIndex: 1000,
          textAlign: 'center',
          minWidth: '300px',
        }}
      >
        <CircularProgress size={24} />
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
          Searching...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          mt: 1,
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          p: 2,
          zIndex: 1000,
          minWidth: '300px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
          <ErrorOutlineIcon fontSize="small" />
          <Typography variant="body2">
            {error}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!query || !query.trim()) {
    return null;
  }

  if (results.length === 0) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          mt: 1,
          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          p: 2,
          zIndex: 1000,
          textAlign: 'center',
          minWidth: '300px',
        }}
      >
        <Typography variant="body2" sx={{ color: '#666' }}>
          No products found for "{query}"
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        mt: 1,
        bgcolor: 'white',
        borderRadius: '8px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        maxHeight: '500px',
        overflowY: 'auto',
        zIndex: 1000,
        minWidth: '350px',
      }}
    >
      {results.slice(0, 8).map((product) => {
        const imageUrl = product.photos_url?.[0]?.url || product.photos_url?.[0] || '';
        const price = product.supplies?.[0]?.price || '0';
        
      
        const productUrl = `/coffee/product/${product.id}`;

        return (
          <Link
            key={product.id}
            to={productUrl}
            style={{ textDecoration: 'none' }}
            onClick={onClose}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1.5,
                gap: 1.5,
                cursor: 'pointer',
                transition: 'background 0.2s',
                borderBottom: '1px solid #f0f0f0',
                '&:hover': {
                  bgcolor: '#f8f8f8',
                },
                '&:last-child': {
                  borderBottom: 'none',
                }
              }}
            >
              {/* Image */}
              <Box
                component="img"
                src={imageUrl}
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                }}
                sx={{
                  width: 50,
                  height: 50,
                  objectFit: 'cover',
                  borderRadius: '6px',
                  flexShrink: 0,
                  bgcolor: '#f5f5f5',
                }}
              />

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#232323',
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {product.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#16675C',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  ${parseFloat(price).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Link>
        );
      })}

      {results.length > 8 && (
        <Box
          sx={{
            borderTop: '1px solid #e3e3e3',
            p: 1.5,
            textAlign: 'center',
            bgcolor: '#fafafa',
          }}
        >
          <Link
            to={`/coffee?search=${encodeURIComponent(query)}`}
            style={{ textDecoration: 'none' }}
            onClick={onClose}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#16675C',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              See all {results.length} results →
            </Typography>
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default SearchDropdown;
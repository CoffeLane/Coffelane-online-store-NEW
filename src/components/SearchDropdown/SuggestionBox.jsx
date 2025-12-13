import React from 'react';
import { Box, Typography } from '@mui/material';

export const SuggestionBox = ({ searchInput }) => {
    if (!searchInput.toLowerCase().includes('instant')) return null;
  
    return (
      <Box
        sx={{
          mb: 3,
          p: 2,
          bgcolor: '#f8f8f8',
          borderTop: '1px solid #999999',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: '#f0f0f0',
          },
        }}
      >
        <Typography
          variant="body1"
          sx={{
            color: '#232323',
            fontWeight: 500,
            mb: 0.5,
          }}
        >
          Which capsules are the top choice among customers?
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Among the most popular are{' '}
          <span style={{ color: '#16675C' }}>instant coffee</span> Jacobs Barista Editions Americano
        </Typography>
      </Box>
    );
  };
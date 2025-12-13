import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import NoResults from '../../assets/icons/cute-barista-cat-mascot--wearing-a-coffee-shop-apr.svg';

export const LoadingState = () => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <CircularProgress size={40} sx={{ color: '#16675C' }} />
    <Typography variant="body1" sx={{ mt: 2, color: '#666' }}>
      Searching...
    </Typography>
  </Box>
);

export const ErrorState = ({ error }) => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Typography variant="body1" sx={{ color: '#d32f2f' }}>
      {error}
    </Typography>
  </Box>
);

export const EmptyInputState = () => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Typography variant="body1" sx={{ color: '#999' }}>
      Start typing to search...
    </Typography>
  </Box>
);

export const NoResultsState = ({ searchInput }) => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Typography variant="h6" sx={{ color: '#232323', mb: 1 }}>
      We couldn't find any results for 
      <span style={{ fontWeight: 700 }}> "{searchInput}"</span>. Try with a different keyword.
    </Typography>
    <img 
      src={NoResults} 
      alt="no-results" 
      style={{ width: '560px', height: '315px', maxWidth: '100%' }} 
    />
  </Box>
);
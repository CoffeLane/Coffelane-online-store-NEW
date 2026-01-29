import React from 'react';
import { Box, Typography, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import NoResults from '../../assets/icons/noResults.svg';

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


export const NoResultsState = ({ searchInput }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ textAlign: 'center', py: isMobile ? 2 : 4, px: 2 }}>
      <Typography
        variant={isMobile ? "body1" : "h6"}
        sx={{ color: '#232323', mb: isMobile ? 1 : 2 }}
      >
        We couldn't find any results for
        <span style={{ fontWeight: 700 }}> "{searchInput}"</span>. Try with a different keyword.
      </Typography>
      <Box
        component="img"
        src={NoResults}
        alt="no-results"
        sx={{
          width: '100%',
          maxWidth: isMobile ? 300 : 560,
          height: 'auto',
          maxHeight: isMobile ? 180 : 315,
          margin: '0 auto',
        }}
      />
    </Box>
  );
};

export default NoResultsState;
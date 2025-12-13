import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

const SearchTabs = ({ activeTab, onTabChange, allResultsCount, productsCount }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f8f8' }}>
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        sx={{
          px: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '16px',
            fontWeight: 500,
            color: '#666',
            minWidth: 120,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            borderBottom: 'none',
            '&:hover': {
              color: '#16675c',
            },
          },
          '& .Mui-selected': {
            color: '#232323 !important',
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#16675C',
            height: 3,
          },
        }}
      >
        <Tab label={`All results ${allResultsCount > 0 ? allResultsCount : ''}`} />
        <Tab label={`Products ${productsCount > 0 ? productsCount : ''}`} />
      </Tabs>
    </Box>
  );
};

export default SearchTabs;
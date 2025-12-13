import React from 'react';
import { Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

const SearchHeader = ({ searchInput, setSearchInput, onClose, onSubmit, inputRef }) => {
  const handleClear = (e) => {
    e.stopPropagation();
    setSearchInput('');
    inputRef.current?.focus();
  };

  return (
    <Box
      sx={{
        bgcolor: '#f8f8f8',
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderBottom: '1px solid #999999',
      }}
    >
      <SearchIcon sx={{ color: '#3E3027', fontSize: 28 }} />
      
      <form onSubmit={onSubmit} style={{ flex: 1 }}>
        <input
          ref={inputRef}
          id="header-search-input"
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#3E3027',
            fontSize: '16px',
            fontWeight: 400,
            fontFamily: 'Montserrat, sans-serif',
          }}
        />
      </form>

      {searchInput ? (
        <Typography
          onClick={handleClear}
          sx={{
            color: '#16675C',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 500,
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Clear
        </Typography>
      ) : (
        <CloseIcon
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          sx={{
            color: '#3E3027',
            cursor: 'pointer',
            fontSize: 28,
            '&:hover': {
              opacity: 0.7,
            },
          }}
        />
      )}
    </Box>
  );
};

export default SearchHeader;
import React, { useRef, useEffect } from 'react';
import { Box, Typography, CircularProgress, Tabs, Tab } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import NoResults from '../../assets/icons/cute-barista-cat-mascot--wearing-a-coffee-shop-apr.svg';

const SearchDropdown = ({ results, loading, searchInput, setSearchInput, onClose, error }) => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState(0);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/coffee?search=${encodeURIComponent(searchInput)}`);
      onClose();
    }
  };

  const handleProductClick = () => {
    onClose();
  };

  const productResults = results || [];
  const allResultsCount = productResults.length;
  const productsCount = productResults.length;
  const escapeRegExp = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const safeSearch = escapeRegExp(searchInput);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '150px',
      }}
      onClick={onClose}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: '100%',
          maxWidth: '1200px',
          height: 'fit-content',
          maxHeight: 'calc(100vh - 200px)',
          bgcolor: '#f8f8f8',
          borderRadius: '16px',
          boxShadow: '0 -6px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
          <form onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
            <input
              ref={inputRef}
              id="header-search-input"
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onClick={(e) => e.stopPropagation()}
  onChange={(e) => setSearchInput(e.target.value)}
              // onChange={(e) => setSearchInput(e.target.value)}
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
            onClick={(e) => {
              e.stopPropagation();
              setSearchInput('');
            }}             
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
              // onClick={onClose}
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
          />)}
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8f8f8' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
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

        <Box
          sx={{
            flex: 1,
           display: 'flex', flexDirection: 'column' 
          }}
        >
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={40} sx={{ color: '#16675C' }} />
              <Typography variant="body1" sx={{ mt: 2, color: '#666' }}>
                Searching...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#d32f2f' }}>
                {error}
              </Typography>
            </Box>
          ) : !searchInput.trim() ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{ color: '#999' }}>
                Start typing to search...
              </Typography>
            </Box>
          ) : productResults.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: '#232323', mb: 1 }}>
              We couldn't find any results for 
              <span style={{ fontWeight: 700 }}> "{searchInput}"</span>. Try with a different keyword.
              </Typography>
              <img src={NoResults} alt="no-results" style={{ width: '560px', height: '315px' }} />
              
            </Box>
          ) : (
            <Box>
              

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', p: 3  }}>
                {productResults.map((product, index) => {
                  const imageUrl = product.photos_url?.[0]?.url || product.photos_url?.[0] || '';
                  const price = product.supplies?.[0]?.price || '0';
                  const productUrl = `/coffee/product/${product.id}`;

                  return (
                    <Link
                      key={product.id}
                      to={productUrl}
                      style={{ textDecoration: 'none' }}
                      onClick={handleProductClick}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          gap: 2,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          borderBottom: index < productResults.length - 1 ? '1px solid #f0f0f0' : 'none',
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
  {searchInput
    ? product.name
        .split(new RegExp(`(${safeSearch})`, 'gi'))
        .map((part, i) =>
          part.toLowerCase() === searchInput.toLowerCase() ? (
            <span key={i} style={{ color: '#16675C' }}>
              {part}
            </span>
          ) : (
            part
          )
        )
    : product.name}
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
                })}
              </Box>
              {searchInput.toLowerCase().includes('instant') && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    bgcolor: '#f8f8f8',
                    borderTop: '1px solid #999999 ',
                    flexShrink: 0, 
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
              )}
            </Box>
          )}
          
        </Box>
      </Box>
    </Box>
  );
};

export default SearchDropdown;

import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchHeader from './SearchHeader';
import SearchTabs from './SearchTabs';
import ProductItem from './ProductItem';
import {SuggestionBox} from './SuggestionBox';
import { 
  LoadingState, 
  ErrorState, 
  EmptyInputState, 
  NoResultsState, 
 
} from './SearchStates';

const SearchDropdown = ({
  results = [],
  loading = false,
  searchInput = '',
  setSearchInput,
  onClose,
  error = null,
}) => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
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

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (!searchInput.trim()) return <EmptyInputState />;
    if (productResults.length === 0) return <NoResultsState searchInput={searchInput} />;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {productResults.map((product, index) => (
          <ProductItem
            key={product.id}
            product={product}
            searchInput={searchInput}
            onProductClick={handleProductClick}
            isLastItem={index === productResults.length - 1}
          />
        ))}
      </Box>
    );
  };

  const showSuggestion = searchInput.toLowerCase().includes('instant') && 
                        productResults.length > 0 && 
                        !loading && 
                        !error;

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
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SearchHeader
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onClose={onClose}
          onSubmit={handleSearchSubmit}
          inputRef={inputRef}
        />

        <SearchTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          allResultsCount={allResultsCount}
          productsCount={productsCount}
        />

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
          }}
        >
          {renderContent()}
        </Box>

        {showSuggestion && <SuggestionBox searchInput={searchInput} />}
      </Box>
    </Box>
  );
};

export default SearchDropdown;



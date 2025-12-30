import React, {useRef, useEffect, useState} from "react";
import { Box, Link, Typography } from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";

import AccessoryItem from "./AccessoryItem.jsx";
import SearchHeader from "./SearchHeader.jsx";
import SearchTabs from './SearchTabs';
import ProductItem from './ProductItem';
import { 
  LoadingState, 
  ErrorState, 
  EmptyInputState, 
  NoResultsState 
} from './SearchStates';

const SearchDropdown = ({ results = [], loading = false, query = '', onClose, error = null, onSearchChange }) => {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchInput, setSearchInput] = useState(query);
  const accessories = useSelector((state) => state.search.accessories || []);
  const products = useSelector((state) => state.search.products || []);


  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);
  

   useEffect(() => {
    setSearchInput(query);
   }, [query]);
  
   

const debounceRef = useRef(null);

useEffect(() => {
  if (!searchInput.trim()) return;

  clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(() => {
    onSearchChange?.(searchInput);
  }, 400);

  return () => clearTimeout(debounceRef.current);
}, [searchInput]);
  
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
  

 const allResultsCount = products.length + accessories.length;
  const productsCount = products.length;

  const renderContent = () => {
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (!searchInput.trim()) return <EmptyInputState />;
    if (allResultsCount === 0) return <NoResultsState searchInput={searchInput} />;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
   
        {(activeTab === 0 || activeTab === 1)  && products.length > 0 && (
          <>
            {activeTab === 0 && (
              <Box sx={{
                px: 2,
                py: 1.5,
                bgcolor: '#f8f8f8',
                borderBottom: '1px solid #e0e0e0',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                  Products ({products.length})
                </Typography>
              </Box>
            )}
            {products.map((product, index) => (
              <ProductItem
                key={`product-${product.id}`}
                product={product}
                searchInput={searchInput}
                onProductClick={handleProductClick}
                isLastItem={activeTab === 1 ? index === products.length - 1 : false}
              />
            ))}
          </>
        )}

        {activeTab === 0 && accessories.length > 0 && (
          <>
            <Box sx={{
              px: 2,
              py: 1.5,
              bgcolor: '#f8f8f8',
              borderBottom: '1px solid #e0e0e0',
              position: 'sticky',
              top: 0,
              zIndex: 1,
              mt: products.length > 0 ? 1 : 0,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#666' }}>
                Accessories ({accessories.length})
              </Typography>
            </Box>
            {accessories.map((accessory, idx) => (
              <AccessoryItem
                key={`acc-${accessory.id}`}
                accessory={accessory}
                searchInput={searchInput}
                onProductClick={handleProductClick}
                isLastItem={idx === accessories.length - 1}
              />
            ))}
          </>
        )}

        {allResultsCount > 8 && (
          <Box sx={{
            borderTop: '1px solid #e3e3e3',
            p: 1.5,
            textAlign: 'center',
            bgcolor: '#fafafa',
          }}>
            <Link
              to={`/coffee?search=${encodeURIComponent(searchInput)}`}
              style={{ textDecoration: 'none' }}
              onClick={onClose}
            >
              <Typography variant="body2" sx={{
                color: '#16675C',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}>
                See all {allResultsCount} results →
              </Typography>
            </Link>
          </Box>
        )}
      </Box>
      
    );
  };

  // const showSuggestion = searchInput.toLowerCase().includes('instant') && 
  //                       productResults.length > 0 && 
  //                       !loading && 
  //                       !error;



//  if (loading) {
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
      onClick={(e) => e.stopPropagation()}
      >
        <SearchHeader
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onClose={onClose}
          onSubmit={handleSearchSubmit}
          inputRef={inputRef} />
        
        <SearchTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          allResultsCount={allResultsCount}
          productsCount={productsCount} />
        
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
          }}
        >
          {renderContent()}
        </Box>
        
        {/* {showSuggestion && <SuggestionBox searchInput={searchInput} />} */}
   
   </Box>
 

 
      </Box> 
      // </Box>
 );
};

export default SearchDropdown;

// import React, { useRef, useEffect, useState } from 'react';
// import { Box } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import SearchHeader from './SearchHeader';
// import SearchTabs from './SearchTabs';
// import ProductItem from './ProductItem';
// import {SuggestionBox} from './SuggestionBox';
// import { 
//   LoadingState, 
//   ErrorState, 
//   EmptyInputState, 
//   NoResultsState, 
 
// } from './SearchStates';

// const SearchDropdown = ({
//   results = [],
//   loading = false,
//   searchInput = '',
//   setSearchInput,
//   onClose,
//   error = null,
// }) => {
//   const inputRef = useRef(null);
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState(0);

//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   const handleTabChange = (event, newValue) => {
//     setActiveTab(newValue);
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (searchInput.trim()) {
//       navigate(`/coffee?search=${encodeURIComponent(searchInput)}`);
//       onClose();
//     }
//   };

//   const handleProductClick = () => {
//     onClose();
//   };

//   const productResults = results || [];
//   const allResultsCount = productResults.length;
//   const productsCount = productResults.length;

//   const renderContent = () => {
//     if (loading) return <LoadingState />;
//     if (error) return <ErrorState error={error} />;
//     if (!searchInput.trim()) return <EmptyInputState />;
//     if (productResults.length === 0) return <NoResultsState searchInput={searchInput} />;

//     return (
//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
//         {productResults.map((product, index) => (
//           <ProductItem
//             key={product.id}
//             product={product}
//             searchInput={searchInput}
//             onProductClick={handleProductClick}
//             isLastItem={index === productResults.length - 1}
//           />
//         ))}
//       </Box>
//     );
//   };

//   const showSuggestion = searchInput.toLowerCase().includes('instant') && 
//                         productResults.length > 0 && 
//                         !loading && 
//                         !error;

//   return (
//     <Box
//       sx={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         bgcolor: 'rgba(0, 0, 0, 0.5)',
//         zIndex: 9999,
//         display: 'flex',
//         justifyContent: 'center',
//         paddingTop: '150px',
//       }}
//       onClick={onClose}
//     >
//       <Box
//         onClick={(e) => e.stopPropagation()}
//         sx={{
//           width: '100%',
//           maxWidth: '1200px',
//           height: 'fit-content',
//           maxHeight: 'calc(100vh - 200px)',
//           bgcolor: '#f8f8f8',
//           borderRadius: '16px',
//           boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
//           overflow: 'hidden',
//           display: 'flex',
//           flexDirection: 'column',
//         }}
//       >
//         <SearchHeader
//           searchInput={searchInput}
//           setSearchInput={setSearchInput}
//           onClose={onClose}
//           onSubmit={handleSearchSubmit}
//           inputRef={inputRef}
//         />

//         <SearchTabs
//           activeTab={activeTab}
//           onTabChange={handleTabChange}
//           allResultsCount={allResultsCount}
//           productsCount={productsCount}
//         />

//         <Box
//           sx={{
//             flex: 1,
//             overflowY: 'auto',
//             p: 3,
//           }}
//         >
//           {renderContent()}
//         </Box>

//         {showSuggestion && <SuggestionBox searchInput={searchInput} />}
//       </Box>
//     </Box>
//   );
// };

// export default SearchDropdown;



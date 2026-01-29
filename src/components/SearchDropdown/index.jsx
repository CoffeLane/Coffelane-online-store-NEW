import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useSelector } from "react-redux";
import { getPrice, getProductPrice, formatPrice } from "../utils/priceUtils.jsx";
import KitchenIcon from "@mui/icons-material/Kitchen";
import NoResultsState from "../SearchDropdown/SearchStates.jsx"

const overlaySx = {
  position: "fixed",
  inset: 0,
  bgcolor: "rgba(0,0,0,0.4)",
  zIndex: 1200,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  pt: { xs: 17, md: 19 },
  px: 2,

};

const panelSx = {
  bgcolor: "white",
  borderRadius: "12px",
  boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
  minWidth: { xs: "320px", sm:"400px", md: "500px" },
  maxWidth: { xs: "92vw", sm: "700px", md: "800px" },
  maxHeight: "70vh",
  overflowY: "auto",
};

const SearchDropdown = ({ results, loading, query, onClose, error }) => {
  const currency = useSelector((state) => state.settings.currency);
  const products = useSelector((state) => state.search.products || []);
  const accessories = useSelector((state) => state.search.accessories || []);
  const products = useSelector((state) => state.search.products || []);

  if (!query || !query.trim()) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={overlaySx} onClick={onClose}>
        <Box
          sx={{
            ...panelSx,
            p: 2,
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CircularProgress size={24} />
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1, color: "#666" }}
          >
            Searching...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={overlaySx} onClick={onClose}>
        <Box
          sx={{
            ...panelSx,
            p: 2,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#d32f2f",
            }}
          >
            <ErrorOutlineIcon fontSize="small" />
            <Typography variant="body2">{error}</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (!totalResults) {
    return (
      <Box sx={overlaySx} onClick={onClose}>
        <Box
          sx={{
            ...panelSx,
            p: 2,
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <NoResultsState searchInput={query} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={overlaySx} onClick={onClose}>
      <Box sx={panelSx} onClick={(e) => e.stopPropagation()}>
        {products.length > 0 && (
          <>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "#f8f8f8",
                borderBottom: "1px solid #e0e0e0",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  px: 2,
                  pt: 1.5,
                  pb: 0.5,
                  fontWeight: 600,
                  color: "#666",
                }}
              >
                Products ({products.length})
              </Typography>
            </Box>

            {products.slice(0, 8).map((product) => {
              const imageUrl = product.photos_url?.[0]?.url || product.photos_url?.[0] || ''; 
              const supply = product.supplies?.[0];
              const price = supply
                ? getPrice(supply, currency)
                : getProductPrice(product, currency);
              const productUrl = `/coffee/product/${product.id}`;

              return (
                <Link
                  key={product.id}
                  to={productUrl}
                  style={{ textDecoration: "none" }}
                  onClick={onClose}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1.5,
                      gap: 1.5,
                      cursor: "pointer",
                      "&:last-child": {
                        borderBottom: "none",
                      },
                      borderBottom: "1px solid #f5f5f5",
                    }}
                  >
                    <Box
                      component="img"
                      src={imageUrl}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/50?text=No+Image";
                      }}
                      sx={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: "6px",
                        flexShrink: 0,
                        bgcolor: "#f5f5f5",
                      }}
                    />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#232323",
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#16675C",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {formatPrice(price, currency)}
                      </Typography>
                    </Box>
                  </Box>
                </Link>
              );
            })}
          </>
        )}

        {accessories.length > 0 && (
          <>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: "#f8f8f8",
                borderBottom: "1px solid #e0e0e0",
                position: "sticky",
                top: 0,
                zIndex: 1,
                mt: products.length > 0 ? 1 : 0,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  px: 2,
                  pt: 1.5,
                  pb: 0.5,
                  fontWeight: 600,
                  color: "#666",
                }}
              >
                Accessories ({accessories.length})
              </Typography>
            </Box>
            {accessories.slice(0, 4).map((accessory) => {
              const price = getProductPrice(accessory, currency);
              const productUrl = `/accessories/product/${accessory.id}`;

              return (
                <Link
                  key={`acc-${accessory.id}`}
                  to={productUrl}
                  style={{ textDecoration: "none" }}
                  onClick={onClose}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1.5,
                      gap: 1.5,
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "8px",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "#E8F5E9",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <KitchenIcon
                        sx={{
                          color: "#16675C",
                          fontSize: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          color: "#232323",
                          mb: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {accessory.name}
                      </Typography>
                      {accessory.category && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#666",
                            fontSize: "12px",
                            display: "block",
                            mb: 0.3,
                          }}
                        >
                          {accessory.category}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#16675C",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {formatPrice(price, currency)}
                      </Typography>
                    </Box>
                  </Box>
                </Link>
              );
            })}
          </>
        )}

        {totalResults > 8 && (
          <Box
            sx={{
              borderTop: "1px solid #e3e3e3",
              p: 1.5,
              textAlign: "center",
              bgcolor: "#fafafa",
            }}
          >
            <Link
              to={`/coffee?search=${encodeURIComponent(query)}`}
              style={{ textDecoration: "none" }}
              onClick={onClose}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#16675C",
                  fontWeight: 600,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                See all {totalResults} results →
              </Typography>
            </Link>
          </Box>
        )}
      </Box>
    </Box>
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



import React, { useState, useEffect, useMemo } from "react";
import Grid from '@mui/material/Grid';
import CoffeeCardData from '../components/Coffe/CoffeeCardData.jsx';
import { h5 } from "../styles/typographyStyles.jsx";
import { Box, Typography, CircularProgress, Drawer, IconButton, useMediaQuery, useTheme } from '@mui/material';
import Filter from '../components/Filter/Filter.jsx';
import PaginationControl from "../components/PaginationControl/PaginationControl.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slice/productsSlice.jsx';
import { toggleFavoriteItem, fetchFavorites } from '../store/slice/favoritesSlice.jsx';
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from '../components/Modal/LoginModal.jsx';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

const itemsPerPage = 12;

export default function CatalogCoffeePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loginOpen, setLoginOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const { items, loading, error } = useSelector((state) => state.products);
  const favorites = useSelector((state) => state.favorites.favorites);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const accessToken = token || localStorage.getItem("access");
    if (accessToken) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, token]);

  const [filters, setFilters] = useState({
    brand: "Brand",
    grind: [],
    roast: [],
    caffeine: [],
    bean: [],
    priceRange: [0, 1000],
    sort: "lowToHigh",
  });

  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageParam = parseInt(params.get("page"), 10);
    setPage(!isNaN(pageParam) && pageParam > 0 ? pageParam : 1);
  }, [location.search]);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 1000, filters }));
  }, [dispatch, filters]);

  const handlePageChange = (event, value) => {
    setPage(value);
    navigate(`?page=${value}`);
  };

  const handleToggleFavorite = (item) => {
    if (!token) {
      setLoginOpen(true);
      return;
    }
    const itemType = item.sku ? "product" : "accessory";
    dispatch(toggleFavoriteItem({ itemType, itemId: item.id, itemData: item }));
  };

  const favoritesMap = useMemo(() => {
    return favorites.reduce((acc, item) => ({ ...acc, [String(item.id)]: true }), {});
  }, [favorites]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (error) return <p>{error?.detail || error || "Error"}</p>;

  const filterContent = <Filter filters={filters} setFilters={setFilters} />;

  return (
    <Grid container sx={{ px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, md: 4 } }}>
      {isMobile ? (
        <>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => setFilterOpen(true)} sx={{ color: '#3E3027' }}>
              <FilterListIcon />
            </IconButton>
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography sx={{ color: "#3E3027", fontFamily: "Kefa", fontWeight: 400, fontSize: { xs: "24px", sm: "32px", md: "40px" }, mb: 1 }}>
                Your Coffee Corner
              </Typography>
            </Box>
            <Box sx={{ width: 40 }} />
          </Box>
          
          <Drawer
            anchor="left"
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: '280px',
                p: 2,
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>Filters</Typography>
              <IconButton onClick={() => setFilterOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            {filterContent}
          </Drawer>

          <Grid size={12}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Typography sx={{ ...h5, mb: 4, fontSize: { xs: '14px', md: '16px' } }}>
                Instant, ground, or beans — all the essentials in one place.
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <CoffeeCardData products={paginatedItems} favorites={favoritesMap} onToggleFavorite={handleToggleFavorite} />
                <LoginModal open={loginOpen} handleClose={() => setLoginOpen(false)} />
              </>
            )}

            <PaginationControl page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </Grid>
        </>
      ) : (
        <>
          <Grid size={3} sx={{ mb: 9 }}>
            <Filter filters={filters} setFilters={setFilters} />
          </Grid>
          <Grid size={9} sx={{ pl: 4 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ color: "#3E3027", fontFamily: "Kefa", fontWeight: 400, fontSize: "40px", mb: 1 }}>
                Your Coffee Corner
              </Typography>
              <Typography sx={{ ...h5, mb: 4 }}>
                Instant, ground, or beans — all the essentials in one place.
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <CoffeeCardData products={paginatedItems} favorites={favoritesMap} onToggleFavorite={handleToggleFavorite} />
                <LoginModal open={loginOpen} handleClose={() => setLoginOpen(false)} />
              </>
            )}

            <PaginationControl page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </Grid>
        </>
      )}
    </Grid>
  );
}

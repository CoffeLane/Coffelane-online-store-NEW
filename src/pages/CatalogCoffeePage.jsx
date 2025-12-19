import React, { useState, useEffect, useMemo } from "react";
import Grid from '@mui/material/Grid';
import CoffeeCardData from '../components/Coffe/CoffeeCardData.jsx';
import { h5 } from "../styles/typographyStyles.jsx";
import { Box, Typography, CircularProgress } from '@mui/material';
import Filter from '../components/Filter/Filter.jsx';
import PaginationControl from "../components/PaginationControl/PaginationControl.jsx";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slice/productsSlice.jsx';
import { toggleFavoriteItem, fetchFavorites } from '../store/slice/favoritesSlice.jsx';
import { useNavigate, useLocation } from "react-router-dom";
import LoginModal from '../components/Modal/LoginModal.jsx';

const itemsPerPage = 12;

export default function CatalogCoffeePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);

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

  return (
    <Grid container sx={{ px: 4, py: 4 }}>
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
    </Grid>
  );
}

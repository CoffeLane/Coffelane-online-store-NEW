import React, { useEffect, useState } from "react";
import { Box, Typography, FormControl, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Slider, useMediaQuery, useTheme } from "@mui/material";
import { h3, h4, h6 } from "../../styles/typographyStyles.jsx";
import { inputDropdown, selectMenuProps, checkboxStyles } from '../../styles/inputStyles.jsx';
import api from "../../store/api/axios.js";

export default function Filter({ filters, setFilters }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [availableBrands, setAvailableBrands] = useState(['Lavazza', 'Blasercafe', 'Nescafé', 'Jacobs', "L'OR", 'Starbucks', 'Nespresso']);
  const handleCheckboxChange = (value, key) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  // Загружаем доступные бренды из всех продуктов и аксессуаров
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const allBrands = ['Lavazza', 'Blasercafe', 'Nescafé', 'Jacobs', "L'OR", 'Starbucks', 'Nespresso'];

        const firstPageRes = await api.get('/products', { params: { page: 1 } });
        const totalPages = firstPageRes.data.total_pages || 1;

        const allPagesPromises = [];
        for (let p = 1; p <= totalPages; p++) {
          allPagesPromises.push(api.get('/products', { params: { page: p } }));
        }

        const allPagesRes = await Promise.all(allPagesPromises);
        const allProducts = allPagesRes.flatMap(res => res.data.data || []);

        const accessoriesRes = await api.get('/accessories');
        const allAccessories = accessoriesRes.data.data || [];

        const productBrands = new Set();
        allProducts.forEach(p => {
          const brand = p.brand || p.category;
          if (brand && brand.trim()) {
            productBrands.add(brand.trim());
          }
        });
        allAccessories.forEach(a => {
          const brand = a.brand || a.category;
          if (brand && brand.trim()) {
            productBrands.add(brand.trim());
          }
        });

        const allBrandsList = [...allBrands, ...Array.from(productBrands)].filter(Boolean);
        setAvailableBrands(Array.from(new Set(allBrandsList)));
      } catch (error) {
        console.error("Error fetching brands:", error);
        // В случае ошибки оставляем стандартные бренды
      }
    };

    fetchBrands();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fff', borderRadius: { xs: '8px', md: '16px' }, boxShadow: 2, height: 'auto', mb:{ xs: 4, md: 0 } }}>
      <Typography sx={{ ...h3, mb: { xs: 0.5, md: 1 }, fontSize: { xs: '18px', md: '24px' } }}>Sort By</Typography>
      <FormControl fullWidth sx={{ ...h6, ...inputDropdown, my: { xs: 0.5, md: 1 }, mb: { xs: 2, md: 3 } }}>
        <Select value={filters.sort} onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))} MenuProps={selectMenuProps}>
          <MenuItem value="lowToHigh">Price: Low to High</MenuItem>
          <MenuItem value="highToLow">Price: High to Low</MenuItem>
        </Select>
      </FormControl>

      <Typography sx={{ ...h3, mt: { xs: 2, md: 4 }, fontSize: { xs: '18px', md: '24px' } }}>Filter By</Typography>
      <FormControl fullWidth sx={{ ...h6, ...inputDropdown, my: { xs: 0.5, md: 1 }, mb: { xs: 2, md: 3 } }}>
        <Select value={filters.brand} onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value }))} MenuProps={selectMenuProps}>
          <MenuItem value="Brand">Brand</MenuItem>
          {availableBrands.map(brand => (
            <MenuItem key={brand} value={brand}>{brand}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography sx={{ ...h4, margin: { xs: '20px 0 6px 0', md: '32px 0 8px 0' }, fontSize: { xs: '16px', md: '20px' } }}>Grind type</Typography>
      <FormGroup sx={{ mb: { xs: 0.5, md: 1 } }}>
        {["Soluble", "Ground", "In grains", "In capsules"].map(item => (
          <FormControlLabel
            key={item}
            sx={{ ...h6, ...checkboxStyles, fontSize: { xs: '14px', md: '18px' } }}
            control={<Checkbox checked={filters.grind?.includes(item)} onChange={() => handleCheckboxChange(item, "grind")} size={isMobile ? "small" : "medium"} />}
            label={item}
          />
        ))}
      </FormGroup>

      <Typography sx={{ ...h4, margin: { xs: '20px 0 6px 0', md: '32px 0 8px 0' }, fontSize: { xs: '16px', md: '20px' } }}>Roast Level</Typography>
      <FormGroup>
        {["Light", "Medium", "Dark"].map(item => (
          <FormControlLabel
            key={item}
            sx={{ ...h6, ...checkboxStyles, fontSize: { xs: '14px', md: '18px' } }}
            control={<Checkbox checked={filters?.roast?.includes(item)} onChange={() => handleCheckboxChange(item, "roast")} size={isMobile ? "small" : "medium"} />}
            label={item}
          />
        ))}
      </FormGroup>

      <Typography sx={{ ...h4, margin: { xs: '20px 0 6px 0', md: '32px 0 8px 0' }, fontSize: { xs: '16px', md: '20px' } }}>Caffeine Content</Typography>
      <FormGroup>
        {["Caffeine", "Caffeine Medium", "Decaffeinated"].map(item => (
          <FormControlLabel
            key={item}
            sx={{ ...h6, ...checkboxStyles, fontSize: { xs: '14px', md: '18px' } }}
            control={<Checkbox checked={filters?.caffeine?.includes(item)} onChange={() => handleCheckboxChange(item, "caffeine")} size={isMobile ? "small" : "medium"} />}
            label={item}
          />
        ))}
      </FormGroup>

      <Typography sx={{ ...h4, margin: { xs: '20px 0 6px 0', md: '32px 0 8px 0' }, fontSize: { xs: '16px', md: '20px' } }}>Coffee Bean Type</Typography>
      <FormGroup>
        {["Arabica", "Robusta", "Arabica/robusta"].map(item => (
          <FormControlLabel
            key={item}
            sx={{ ...h6, ...checkboxStyles, fontSize: { xs: '14px', md: '18px' } }}
            control={<Checkbox checked={filters?.bean?.includes(item)} onChange={() => handleCheckboxChange(item, "bean")} size={isMobile ? "small" : "medium"} />}
            label={item}
          />
        ))}
      </FormGroup>

      <Typography sx={{ ...h3, margin: { xs: '20px 0', md: '32px 0' }, fontSize: { xs: '18px', md: '24px' } }}>Price range</Typography>
      <Slider
        value={filters.priceRange}
        onChange={(e, value) => setFilters(prev => ({ ...prev, priceRange: value }))}
        valueLabelDisplay="auto"
        min={0}
        max={1000}
        sx={{ color: "#A4795B", mb: { xs: 1, md: 0 } }}
      />
      <Box display="flex" justifyContent="space-between" sx={{ mt: { xs: 0.5, md: 0 } }}>
        <Typography sx={{ ...h6, fontSize: { xs: '14px', md: '18px' } }}>${filters.priceRange[0]}</Typography>
        <Typography sx={{ ...h6, fontSize: { xs: '14px', md: '18px' } }}>${filters.priceRange[1]}</Typography>
      </Box>
    </Box>
  );
}
import React from "react";
import { Box, Typography, FormControl, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Slider } from "@mui/material";
import { h3, h4, h6 } from "../../styles/typographyStyles.jsx";
import { inputDropdown, selectMenuProps, checkboxStyles } from '../../styles/inputStyles.jsx';

export default function Filter({ filters, setFilters }) {
  const handleCheckboxChange = (value, key) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#fff', borderRadius: '16px', boxShadow: 2, height: '100%' }}>
      <Typography sx={{ ...h3, mb: 1 }}>Sort By</Typography>
      <FormControl fullWidth sx={{ ...h6, ...inputDropdown, my: 1, mb: 3 }}>
        <Select value={filters.sort} onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))} MenuProps={selectMenuProps}>
          <MenuItem value="lowToHigh">Price: Low to High</MenuItem>
          <MenuItem value="highToLow">Price: High to Low</MenuItem>
        </Select>
      </FormControl>

      <Typography sx={{ ...h3, mt: 4 }}>Filter By</Typography>
      <FormControl fullWidth sx={{ ...h6, ...inputDropdown, my: 1, mb: 3 }}>
        <Select value={filters.brand} onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value }))} MenuProps={selectMenuProps}>
          <MenuItem value="Brand">Brand</MenuItem>
          <MenuItem value="Lavazza">Lavazza</MenuItem>
          <MenuItem value="Blasercafe">Blasercafe</MenuItem>
          <MenuItem value="Nescafé">Nescafé</MenuItem>
          <MenuItem value="Jacobs">Jacobs</MenuItem>
          <MenuItem value="L'OR">L'OR</MenuItem>
          <MenuItem value="Starbucks">Starbucks</MenuItem>
          <MenuItem value="Nespresso">Nespresso</MenuItem>
        </Select>
      </FormControl>

      <Typography sx={{ ...h4, margin: '32px 0 8px 0' }}>Grind type</Typography>
      <FormGroup sx={{ mb: 1 }}>
        {["Soluble", "Ground", "In grains", "In capsules"].map(item => (
          <FormControlLabel
            key={item}
            sx={{ ...h6, ...checkboxStyles }}
            control={<Checkbox checked={filters.grind?.includes(item)} onChange={() => handleCheckboxChange(item, "grind")} />}
            label={item}
          />
        ))}
      </FormGroup>

      <Typography sx={{ ...h4, margin: '32px 0 8px 0' }}>Roast Level</Typography>
      <FormGroup>
        {["Light", "Medium", "Dark"].map(item => (
          <FormControlLabel
            key={item}
            sx={{ ...h6, ...checkboxStyles }}
            control={<Checkbox checked={filters?.roast?.includes(item)} onChange={() => handleCheckboxChange(item, "roast")} />}
            label={item}
          />
        ))}
      </FormGroup>

      <Typography sx={{ ...h4, margin: '32px 0 8px 0' }}>Caffeine Content</Typography>
      <FormGroup>
        {["Caffeine", "Caffeine Medium", "Decaffeinated"].map(item => (
          <FormControlLabel
            key={item}
            sx={{ ...h6, ...checkboxStyles }}
            control={<Checkbox checked={filters?.caffeine?.includes(item)} onChange={() => handleCheckboxChange(item, "caffeine")} />}
            label={item}
          />
        ))}
      </FormGroup>

      <Typography sx={{ ...h4, margin: '32px 0 8px 0' }}>Coffee Bean Type</Typography>
      <FormGroup>
        {["Arabica", "Robusta", "Arabica/robusta"].map(item => (
          <FormControlLabel
            key={item}
            sx={{ ...h6, ...checkboxStyles }}
            control={<Checkbox checked={filters?.bean?.includes(item)} onChange={() => handleCheckboxChange(item, "bean")} />}
            label={item}
          />
        ))}
      </FormGroup>

      <Typography sx={{ ...h3, margin: '32px 0 ' }}>Price range</Typography>
      <Slider
        value={filters.priceRange}
        onChange={(e, value) => setFilters(prev => ({ ...prev, priceRange: value }))}
        valueLabelDisplay="auto"
        min={0}
        max={1000}
        sx={{ color: "#A4795B" }}
      />
      <Box display="flex" justifyContent="space-between">
        <Typography sx={{ ...h6 }}>${filters.priceRange[0]}</Typography>
        <Typography sx={{ ...h6 }}>${filters.priceRange[1]}</Typography>
      </Box>
    </Box>
  );
}
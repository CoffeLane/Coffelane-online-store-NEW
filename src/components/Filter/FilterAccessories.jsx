import React from "react";
import { Box, Typography, FormControl, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Slider } from "@mui/material";
import { h3, h5, h6 } from "../../styles/typographyStyles.jsx";
import { inputDropdown, selectMenuProps, } from '../../styles/inputStyles.jsx';

export default function FilterAccessories({ filters, setFilters }) {

  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: { xs: "center", md: "flex-end" }, 
      alignItems: "center", 
      gap: { xs: 0.75, md: 1 }, 
      mb: { xs: 2, md: 4 }, 
      pr: { xs: 0, md: 3 },
      px: { xs: 1, md: 0 }
    }}>
      <Typography sx={{ ...h5, fontSize: { xs: '16px', md: '20px' } }}>Sort By</Typography>
      <FormControl sx={{ ...h6, ...inputDropdown, minWidth: { xs: 150, md: 200 } }}>
        <Select value={filters.sort} onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))} MenuProps={selectMenuProps}>
          <MenuItem value="lowToHigh">Price: Low to High</MenuItem>
          <MenuItem value="highToLow">Price: High to Low</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
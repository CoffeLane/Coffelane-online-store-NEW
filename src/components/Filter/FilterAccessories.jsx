import React from "react";
import { Box, Typography, FormControl, Select, MenuItem, FormGroup, FormControlLabel, Checkbox, Slider } from "@mui/material";
import { h3, h5, h6 } from "../../styles/typographyStyles.jsx";
import { inputDropdown, selectMenuProps, } from '../../styles/inputStyles.jsx';

export default function FilterAccessories({ filters, setFilters }) {

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, mb: 4, pr: 3  }}>
      <Typography sx={{ ...h5,}}>Sort By</Typography>
      <FormControl  sx={{ ...h6, ...inputDropdown,}}>
        <Select value={filters.sort} onChange={e => setFilters(prev => ({ ...prev, sort: e.target.value }))} MenuProps={selectMenuProps}>
          <MenuItem value="lowToHigh">Price: Low to High</MenuItem>
          <MenuItem value="highToLow">Price: High to Low</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
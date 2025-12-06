import { IconButton, Menu, MenuItem, TableCell, Divider } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import { useState } from 'react';
import { h5 } from '../../styles/typographyStyles.jsx';

export default function CategoryHeader({ categories, selectedCategory, onCategoryChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (category) => {
    onCategoryChange(category); 
    handleClose();
  };

  return (
    <TableCell sx={{ ...h5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {selectedCategory}
      <IconButton size="small" onClick={handleClick}>
        <ArrowDropDown fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {categories.map((cat, i) => (
          <div key={i}>
            <MenuItem onClick={() => handleSelect(cat)}>
              {cat}
            </MenuItem>
            {i < categories.length - 1 && <Divider />}
          </div>
        ))}
      </Menu>
    </TableCell>
  );
}


import { IconButton, Menu, MenuItem, TableCell, Divider, Box } from '@mui/material';
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
    <>
      <TableCell sx={{ ...h5, fontSize: { xs: '12px', md: '14px' }, whiteSpace: 'nowrap', verticalAlign: 'middle',}}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5,}}>
          {selectedCategory}
          <IconButton size="small" onClick={handleClick} sx={{ padding: 0.5, '& .MuiSvgIcon-root': {fontSize: { xs: 18, md: 20 }}}}>
            <ArrowDropDown />
          </IconButton>
        </Box>
      </TableCell>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
        {categories.map((cat, i) => (
          <div key={i}>
            <MenuItem onClick={() => handleSelect(cat)}>
              {cat}
            </MenuItem>
            {i < categories.length - 1 && <Divider />}
          </div>
        ))}
      </Menu>
    </>
  );
}


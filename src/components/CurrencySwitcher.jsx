import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrency } from '../store/slice/settingsSlice';
import { fetchProducts } from '../store/slice/productsSlice';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';

export const CurrencySwitcher = () => {
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.settings.currency);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newCurrency) => {
    dispatch(setCurrency(newCurrency));
    // товары с новой валютой
    dispatch(fetchProducts({ filters: {} })); 
    handleClose();
  };

  return (
    <>
      <Tooltip title={`Current currency: ${currency}`}>
        <IconButton
          onClick={handleClick}
          sx={{ 
            color: '#3E3027',
            '&:hover': {
              backgroundColor: 'transparent',
            },
          }}
        >
          <PaidOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: '#EAD9C9', 
            color: '#3E3027',
          }
        }}
      >
        <MenuItem 
          onClick={() => handleSelect('USD')} 
          selected={currency === 'USD'}
        >
          USD ($)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSelect('UAH')} 
          selected={currency === 'UAH'}
        >
          UAH (₴)
        </MenuItem>
        <MenuItem 
          onClick={() => handleSelect('EUR')} 
          selected={currency === 'EUR'}
        >
          EUR (€)
        </MenuItem>
      </Menu>
    </>
  );
};
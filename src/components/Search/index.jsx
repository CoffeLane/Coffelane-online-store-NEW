import React, { useState } from 'react';
import { TextField, InputAdornment, Box, IconButton, } from '@mui/material';
import SearchIcon from '../../assets/icons/search-icon.svg';

const Search = () => {
  const [value, setValue] = useState('');

  const onChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <Box sx={{width:'240px', height:'52px'}}>
      <TextField fullWidth variant="outlined" size="small" placeholder="Search" onChange={onChange} autoComplete="off" autoCorrect="off"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: '#fff',
            fontFamily: 'Work Sans',
            height:'52px',
            color: '#000',
            '& input::placeholder': {
              color: '#000', 
              opacity: 1, 
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3E3027',
              borderWidth: '1px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3E3027',
              borderWidth: '1px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3E3027',
              borderWidth: '1px',
            },
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton edge="end" sx={{ '&:hover': { backgroundColor: 'white', color: 'black'},}}>
                <img src={SearchIcon} alt="search" style={{ width: 24, height: 24 }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

    </Box>
  );
};

export default Search;
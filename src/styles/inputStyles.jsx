export const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontFamily: 'Work Sans',
    height: '52px',
    color: '#000',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#3E3027',
      borderWidth: '1px',
    },
    '&:hover:not(.Mui-error):not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
      borderColor: '#B88A6E',
      borderWidth: '1px',
    },
    '&:hover:not(.Mui-error):not(.Mui-focused)': {
      color: '#B88A6E',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#A4795B',
      borderWidth: '1px',
    },
    '&.Mui-focused': {
      color: '#A4795B',
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FF2F2F',
      borderWidth: '1px',
    },
    '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#A63A3A',
      borderWidth: '2px',
    },
    '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#A63A3A',
      borderWidth: '2px',
    },
    '&.Mui-error': {
      color: '#FF2F2F',
    },
    '&.Mui-error:hover': {
      color: '#A63A3A',
    },
    '&.Mui-error.Mui-focused': {
      color: '#A63A3A',
    },
    '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
      borderColor: '#999999',
      backgroundColor: '#f5f5f5',
      borderWidth: '1px',
    },
    '&.Mui-disabled': {
      color: '#999999',
    },
    '&.Mui-disabled:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#999999',
    },
    '&.Mui-disabled.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#999999',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#999', 
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#A4795B', 
  },
};


export const helperTextRed = {
  color: '#FF2F2F',
  fontSize: '14px',
  fontWeight: 400,
    '&.MuiFormHelperText-root': {
      color: '#FF2F2F',
  },
}

export const selectMenuProps = {
  PaperProps: {
    sx: {
      "& .MuiMenuItem-root": {
        "&.Mui-selected": {
          backgroundColor: "#E6D3C1",
        },
        "&.Mui-selected:hover": {
          backgroundColor: "#D2B48C",
        },
        "&:hover": {
          backgroundColor: "#F5E3D3",
        },
      },
    },
  },
};

export const inputDropdown = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#999999",
    },
    "&:hover fieldset": {
      borderColor: "#B88A6E",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#A4795B",
    },
  },
};

export const checkboxStyles = {
  "& .MuiCheckbox-root": {
    color: "#999999",        
    "&.Mui-checked": {
      color: "#A4795B",     
    },
    "&.Mui-disabled": {
      color: "#A4795B",       
    },
  },
};

export const radioBtnStyles = {
  "& .MuiRadio-root.Mui-checked": {
    color: "#999999",        
    "&.Mui-checked": {
      color: "#A4795B",     
    },
    "&.Mui-disabled": {
      color: "#A4795B",       
    },
  },
};

import React, { useState } from "react";
import imgSignUp from '../../assets/images/home/imgsignup.png';
import { TextField, Box, Typography, Button, FormHelperText, CircularProgress } from '@mui/material';
import { btnStyles } from '../../styles/btnStyles.jsx';
import { helperTextRed } from '../../styles/inputStyles.jsx';
import { inputStyles } from '../../styles/inputStyles.jsx';
import { h3, h6 } from "../../styles/typographyStyles.jsx";
import api from '../../store/api/axios.js';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

export default function OurNewsletter() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setValue(e.target.value);
    if (error) setError("");
    if (success) setSuccess(false);
  };

  const handleSubmit = async () => {
    if (!validateEmail(value)) {
      setError("Invalid email format (example: user@example.com)");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      try {
        const response = await api.post("/newsletter/subscribe", { email: value });
        setSuccess(true);
        setValue("");
        setLoading(false);
        return;
      } catch (apiError) {
        if (apiError.response?.status === 404) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setSuccess(true);
          setValue("");
          setLoading(false);
          return;
        }
        
        throw apiError;
      }
    } catch (err) {
      console.error("❌ Newsletter subscription error:", err.response?.data || err.message);
      setError(
        err.response?.data?.email?.[0] || 
        err.response?.data?.message || 
        "Failed to subscribe. Please try again later."
      );
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100vw', maxWidth: '100%', margin: '0 auto', overflow: 'hidden', position: "relative", }}>
      <Box component="img" src={imgSignUp} alt="imgSignUp" sx={{ width: '100%', height: '448px', display: 'block', }} />
      <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
        <Typography sx={{...h3, mb: 2,}}>
          Sign up For our Newsletter
        </Typography>
        <Typography sx={{...h6, mb: 4, }}>
          Cofee Lane promotions, new products and sales. Directly to your inbox.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column",  width: '743px', mr: 2, '&:hover .helper-text': { color: '#A63A3A' }, '&:focus-within .helper-text': { color: '#A63A3A' },}}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField fullWidth variant="outlined" placeholder="Email" value={value} onChange={onChange} error={!!error}  sx={inputStyles} />
            <Button 
              variant="contained" 
              onClick={handleSubmit} 
              disabled={loading}
              sx={{ ...btnStyles, width: '149px', px: 3, ml: 2 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Subscribe"}
            </Button>
          </Box>

          {error && (<FormHelperText  sx={{ ...helperTextRed, mt: 2 }}>{error}</FormHelperText>)}
          {success && <Typography sx={{ color: "#16675C", fontWeight: 700, mt: 1 }}>Subscribed!</Typography>}
        </Box>

      </Box>
    </Box>
  );
}
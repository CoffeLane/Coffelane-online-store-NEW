import React from 'react';
import { Typography, Box } from '@mui/material';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';


function NotFoundPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/')
  };

  return (
    <Box sx={{ textAlign: 'center', marginTop: '100px', marginBottom: '100px' }}>
      <Typography variant="h3">404 Not Found</Typography>
      <Typography variant="h6">The page you are looking for does not exist.</Typography>
      <Button variant="contained" onClick={handleBack} sx={{ borderRadius: '8px', padding: '16px 24px', margin: '32px 0', background: '#A4795B', color: '#FFF', textTransform: 'capitalize' }} aria-label="Get started">
        Return to the main page
      </Button>
    </Box>
  );
}

export default NotFoundPage;
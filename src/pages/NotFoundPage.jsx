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
    <Box sx={{ 
      textAlign: 'center', 
      marginTop: { xs: '60px', md: '100px' }, 
      marginBottom: { xs: '60px', md: '100px' },
      px: { xs: 2, md: 0 }
    }}>
      <Typography 
        variant="h3" 
        sx={{ 
          fontSize: { xs: '28px', sm: '36px', md: '48px' },
          mb: { xs: 2, md: 3 },
          fontWeight: 600
        }}
      >
        404 Not Found
      </Typography>
      <Typography 
        variant="h6" 
        sx={{ 
          fontSize: { xs: '16px', sm: '18px', md: '20px' },
          mb: { xs: 3, md: 4 },
          color: '#666',
          px: { xs: 2, md: 0 }
        }}
      >
        The page you are looking for does not exist.
      </Typography>
      <Button 
        variant="contained" 
        onClick={handleBack} 
        sx={{ 
          borderRadius: '8px', 
          padding: { xs: '12px 20px', md: '16px 24px' },
          margin: { xs: '24px 0', md: '32px 0' }, 
          background: '#A4795B', 
          color: '#FFF', 
          textTransform: 'capitalize',
          fontSize: { xs: '14px', md: '16px' },
          '&:hover': {
            background: '#8d6a4f',
          }
        }} 
        aria-label="Return to main page"
      >
        Return to the main page
      </Button>
    </Box>
  );
}

export default NotFoundPage;
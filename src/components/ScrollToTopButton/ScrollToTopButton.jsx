import React, { useState, useEffect, useRef } from 'react';
import { Box, Fab } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const findScrollContainer = () => {
      const adminContent = document.querySelector('[data-admin-content]');
      if (adminContent) {
        scrollContainerRef.current = adminContent;
        return adminContent;
      }
      return window;
    };

    const scrollContainer = findScrollContainer();

    const toggleVisibility = () => {
      let scrollTop = 0;
      if (scrollContainer === window) {
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      } else {
        scrollTop = scrollContainer.scrollTop;
      }

      if (scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    if (scrollContainer === window) {
      window.addEventListener('scroll', toggleVisibility);
    } else {
      scrollContainer.addEventListener('scroll', toggleVisibility);
    }

    toggleVisibility();

    return () => {
      if (scrollContainer === window) {
        window.removeEventListener('scroll', toggleVisibility);
      } else {
        scrollContainer.removeEventListener('scroll', toggleVisibility);
      }
    };
  }, []);

  const scrollToTop = () => {
    const scrollContainer = scrollContainerRef.current || window;
    
    if (scrollContainer === window) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 24, md: 32 },
        right: { xs: 16, md: 32 },
        zIndex: 1300,
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease, visibility 0.3s ease',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <Fab
        onClick={scrollToTop}
        size="medium"
        sx={{
          backgroundColor: '#A4795B',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#8B6A4F',
          },
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        aria-label="scroll to top"
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Box>
  );
}


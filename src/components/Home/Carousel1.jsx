import React, { useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import sliderImg1 from "../../assets/images/home/sliderimg1.png";
import sliderImg2 from "../../assets/images/home/sliderimg2.png";
import sliderImg3 from "../../assets/images/home/sliderimg3.png";
import {btnStyles} from '../../styles/btnStyles.jsx';
import {h1, h3, h6} from '../../styles/typographyStyles.jsx';
import { useNavigate} from 'react-router-dom';

const items = [
  {
    title: "Gentle Pleasure",
    description: "DECAF, FULL OF TASTE",
    text: "Who says decaf can't be bold? This trio delivers rich taste and smooth crema — without the caffeine. Sip day or night and savor every moment, worry-free.",
    image: sliderImg1,
    buttonText: "Buy now!",
  },
  {
    title: "Holiday Favorite",
    description: "TOFFEE NUT BLISS",
    text: "Sweet, nutty, and cozy — just like your favorite winter memories. This limited blend wraps you in warm toffee notes and festive cheer. One sip, and it’s holiday season in a cup.",
    image: sliderImg2,
    buttonText: "Buy now!",
  },
  {
    title: "Bold & Unique",
    description: "IRISH COFFEE VIBES",
    text: "A hint of whiskey aroma, a wave of smooth coffee — this drink brings warmth with every sip. Elevate your breaks with Jacobs' twist on a classic Irish delight.",
    image: sliderImg3,
    buttonText: "Buy now!",
  },
];

const Carousel1 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
   const navigate = useNavigate();

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box sx={{ position: "relative", overflow: "hidden", mx: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, md: 4 } }}>
      <IconButton 
        onClick={handlePrev} 
        sx={{ 
          color: "white",
          position: "absolute", 
          borderRadius: '50px',
          backgroundColor: '#A4795B', 
          top: "50%", 
          left: { xs: 4, md: 0 }, 
          transform: "translateY(-50%)", 
          zIndex: 1, 
          "&:hover": {backgroundColor: "#B88A6E"},
          width: { xs: 32, md: 40 },
          height: { xs: 32, md: 40 }
        }}
      >
        <ArrowBackIosNew sx={{ fontSize: { xs: 16, md: 20 } }} />
      </IconButton>

      <Box sx={{ display: "flex", transition: "transform 0.6s ease-in-out", transform: `translateX(-${currentIndex * 100}%)`, width: "100%" }}>
        {items.map((slide, index) => (
          <Box key={index} sx={{ width: "100%", display: "flex", flexDirection: { xs: 'column', md: 'row' }, alignItems: "center", justifyContent: "space-between", minWidth: "100%", flexShrink: 0 }}>
            <Box sx={{ width: { xs: "100%", md: "40%" }, margin: { xs: '0 16px', md: '0 176px' }, order: { xs: 2, md: 1 }, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{...h1, fontSize: { xs: '24px', sm: '32px', md: '48px' } }}>
                {slide.title}
              </Typography>
              <Typography sx={{...h3, margin: { xs: '16px 0 12px 0', md: '24px 0 16px 0' }, fontSize: { xs: '18px', md: '24px' } }}>
                {slide.description}
              </Typography>
              <Typography sx={{...h6, fontSize: { xs: '12px', sm: '14px', md: '16px' }}}>
                {slide.text}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, marginTop: { xs: '16px', md: 'auto' } }}>
                <Button variant="contained" onClick={() => navigate('/coffee')} sx={{ ...btnStyles, marginTop: { xs: '16px', md: '32px' }, width: { xs: '140px', md: '156px' }, textTransform: 'none', fontSize: { xs: '12px', md: '14px' }}}>
                  {slide.buttonText}
                </Button>
              </Box>
            </Box>
            <Box sx={{ width: { xs: "100%", md: "60%" }, height: { xs: '250px', sm: '350px', md: '486px' }, order: { xs: 1, md: 2 }, mb: { xs: 2, md: 0 } }}>
              <Box component="img" src={slide.image} alt={slide.title} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
          </Box>
        ))}
      </Box>

      <IconButton 
        onClick={handleNext} 
        sx={{ 
          position: "absolute", 
          top: "50%", 
          right: { xs: 4, md: 0 }, 
          transform: "translateY(-50%)", 
          zIndex: 1, 
          color: "#fff", 
          borderRadius: '50px',
          backgroundColor: '#A4795B',
          "&:hover": {backgroundColor: "#B88A6E"},
          width: { xs: 32, md: 40 },
          height: { xs: 32, md: 40 }
        }}
      >
        <ArrowForwardIos sx={{ fontSize: { xs: 16, md: 20 } }} />
      </IconButton>
    </Box>
  );
};

export default Carousel1;

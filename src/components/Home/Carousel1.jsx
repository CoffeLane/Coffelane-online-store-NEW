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
    <Box sx={{ position: "relative", overflow: "hidden", mx: 4, py: 4,  }}>
      <IconButton onClick={handlePrev} sx={{ color: "white" ,position: "absolute", borderRadius:'50px',backgroundColor:'#A4795B', top: "50%", left: 0, transform: "translateY(-50%)", zIndex: 1, "&:hover": {backgroundColor: "#B88A6E"} }}>
        <ArrowBackIosNew />
      </IconButton>

      <Box sx={{ display: "flex", transition: "transform 0.6s ease-in-out", transform: `translateX(-${currentIndex * 100}vw)`, width: `${items.length * 100}vw`, }}>
        {items.map((slide, index) => (
          <Box key={index} sx={{ width: `${100 / items.length}%`, display: "flex", alignItems: "center", justifyContent: "space-between",  }}>
            <Box sx={{ width: "40%", margin: '0 176px', }}>
              <Typography sx={{...h1 }}>
                {slide.title}
              </Typography>
              <Typography sx={{...h3, margin: '24px 0 16px 0' }}>
                {slide.description}
              </Typography>
              <Typography sx={{...h6}}>
                {slide.text}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                <Button variant="contained" onClick={() => navigate('/coffee')} sx={{ ...btnStyles, marginTop: '32px', width: '156px', textTransform: 'none',}}>
                  {slide.buttonText}
                </Button>
              </Box>
            </Box>
            <Box sx={{ width: "60%", height: '486px' }}>
              <Box component="img" src={slide.image} alt={slide.title} />
            </Box>
          </Box>
        ))}
      </Box>

      <IconButton onClick={handleNext} sx={{ position: "absolute", top: "50%", right: 0, transform: "translateY(-50%)", zIndex: 1, color: "#fff", borderRadius:'50px',backgroundColor:'#A4795B',"&:hover": {backgroundColor: "#B88A6E"} }}>
        <ArrowForwardIos />
      </IconButton>
    </Box>
  );
};

export default Carousel1;

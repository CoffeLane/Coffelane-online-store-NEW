import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, Card, CardContent, CardMedia } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";
import sliderImg4 from "../../assets/images/home/sliderimg4.png";
import sliderImg5 from "../../assets/images/home/sliderimg5.png";
import sliderImg6 from "../../assets/images/home/sliderimg6.png";
import {btnCart} from '../../styles/btnStyles.jsx';
import { h4, h3, h6 } from "../../styles/typographyStyles.jsx";
import { useNavigate } from 'react-router-dom';

const items = [
    {
        image: sliderImg4,
        title: "Light Roast Coffee",
        text: "Deep, intense, and bold. Our dark roasts bring out notes of chocolate, spice, and toasted richness.",
        buttonText: "Shop now",
    },
    {
        image: sliderImg5,
        title: "Medium Roast Coffee",
        text: "Balanced and smooth. Medium roasts highlight a rich body with mellow acidity - a classic cup for every day.",
        buttonText: "Shop now",
    },
    {
        image: sliderImg6,
        title: "Dark Roast Coffee",
        text: "Deep, intense, and bold. Our dark roasts bring out notes of chocolate, spice, and toasted richness.",
        buttonText: "Shop now",
    },
    {
        image: sliderImg4,
        title: "Extra Light Roast",
        text: "Fruity, bright, and aromatic.",
        buttonText: "Shop now",
    },
    {
        image: sliderImg5,
        title: "Special Medium Roast",
        text: "Smooth and rich flavor.",
        buttonText: "Shop now",
    },
];

const Carousel2 = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCards, setVisibleCards] = useState(3);
    const navigate = useNavigate();

    const updateVisibleCards = () => {
        if (window.innerWidth < 600) {
            setVisibleCards(1);
        } else if (window.innerWidth < 960) {
            setVisibleCards(2);
        } else {
            setVisibleCards(3);
        }
    };

    useEffect(() => {
        updateVisibleCards();
        window.addEventListener('resize', updateVisibleCards);

        return () => {
            window.removeEventListener('resize', updateVisibleCards);
        };
    }, []);

    const handlePrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? items.length - visibleCards : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prev) =>
            prev >= items.length - visibleCards ? 0 : prev + 1
        );
    };

    return (
        <Box sx={{ position: "relative", overflow: "hidden", mx: { xs: 1, sm: 2, md: 4 }, py: { xs: 3, md: 6 } }}>

            <Typography sx={{ ...h3, color: "#000", textAlign: 'center', mb: { xs: 2, md: 4 }, fontSize: { xs: '24px', md: '32px' } }} >
                Shop Our Collections
            </Typography>
            <IconButton 
                onClick={handlePrev} 
                sx={{ 
                    position: "absolute", 
                    left: { xs: 4, md: 0 }, 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    backgroundColor: "#16675C", 
                    color: "#fff", 
                    borderRadius: "50px", 
                    zIndex: 1, 
                    "&:hover": { backgroundColor: "#02715C" },
                    width: { xs: 32, md: 40 },
                    height: { xs: 32, md: 40 }
                }}
            >
                <ArrowBackIosNew sx={{ fontSize: { xs: 16, md: 20 } }} />
            </IconButton>

            <Box sx={{ display: "flex", justifyContent: { xs: 'center', md: 'space-evenly' }, gap: { xs: 2, md: 0 }, transition: "transform 0.6s ease-in-out", overflow: { xs: 'hidden', md: 'visible' } }}>
                {items.slice(currentIndex, currentIndex + visibleCards).map((slide, index) => (
                    <Box key={index} sx={{ 
                        width: { xs: "280px", sm: "300px", md: "340px" }, 
                        height: { xs: "auto", md: "560px" }, 
                        minWidth: { xs: "280px", sm: "300px", md: "340px" },
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center",
                        mb: { xs: 2, md: 0 }
                    }}>

                        <Box component="img" src={slide.image} alt={slide.title} sx={{ mb: 2, maxWidth: "100%", height: "auto", objectFit: "cover", width: { xs: "200px", md: "100%" } }} />
                        
                        <Typography sx={{...h4, color: "#000", mb: 1, fontSize: { xs: '18px', md: '20px' }, textAlign: 'center' }}>
                            {slide.title}
                        </Typography>

                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <Typography sx={{...h6, color: "#000", mb: 2, fontSize: { xs: '12px', md: '14px' }, textAlign: 'center', px: { xs: 1, md: 0 } }}>
                            {slide.text}
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/coffee')} sx={{ ...btnCart, width: { xs: '150px', md: '177px' }, mt: "auto", fontSize: { xs: '12px', md: '14px' }}}>
                            {slide.buttonText}
                        </Button>
                          </Box>
                    </Box>
                ))}
            </Box>

            <IconButton 
                onClick={handleNext} 
                sx={{ 
                    position: "absolute", 
                    right: { xs: 4, md: 0 }, 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    backgroundColor: "#16675C", 
                    color: "#fff", 
                    borderRadius: "50px", 
                    zIndex: 1, 
                    "&:hover": { backgroundColor: "#02715C" },
                    width: { xs: 32, md: 40 },
                    height: { xs: 32, md: 40 }
                }}
            >
                <ArrowForwardIos sx={{ fontSize: { xs: 16, md: 20 } }} />
            </IconButton>
        </Box>
    );
};

export default Carousel2;

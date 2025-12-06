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
        <Box sx={{ position: "relative", overflow: "hidden", mx: 4, py: 6 }}>

            <Typography sx={{ ...h3, color: "#000", textAlign: 'center', mb: 4 }} >
                Shop Our Collections
            </Typography>
            <IconButton onClick={handlePrev} sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", backgroundColor: "#16675C", color: "#fff", borderRadius: "50px", zIndex: 1, "&:hover": { backgroundColor: "#02715C" }, }}>
                <ArrowBackIosNew />
            </IconButton>

            <Box sx={{ display: "flex", justifyContent:'space-evenly', transition: "transform 0.6s ease-in-out" }}>
                {items.slice(currentIndex, currentIndex + visibleCards).map((slide, index) => (
                    <Box key={index} sx={{ width: "340px", height: "560px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", }}>

                        <Box component="img" src={slide.image} alt={slide.title} sx={{ mb: 2, maxWidth: "100%", height: "auto", objectFit: "cover",}} />
                        
                        <Typography sx={{...h4, color: "#000", mb: 1 }}>
                            {slide.title}
                        </Typography>

                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",}}>
                        <Typography sx={{...h6, color: "#000", mb: 2 }}>
                            {slide.text}
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/coffee')} sx={{ ...btnCart, width: '177px', mt: "auto",}}>
                            {slide.buttonText}
                        </Button>
                          </Box>
                    </Box>
                ))}
            </Box>


            <IconButton onClick={handleNext} sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", backgroundColor: "#16675C", color: "#fff", borderRadius: "50px", zIndex: 1, "&:hover": { backgroundColor: "#02715C" }, }}>
                <ArrowForwardIos />
            </IconButton>
        </Box>
    );
};

export default Carousel2;

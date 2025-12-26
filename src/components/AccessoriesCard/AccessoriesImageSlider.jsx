import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CoffeeIcon from '@mui/icons-material/Coffee'; // Импортируем иконку

export default function AccessoriesImageSlider({ photos = [], productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const photoUrls = photos.filter((photo) => photo.url).map((photo) => photo.url);

  const handlePrev = () =>
    setSelectedIndex((prev) => (prev === 0 ? photoUrls.length - 1 : prev - 1));
  const handleNext = () =>
    setSelectedIndex((prev) => (prev === photoUrls.length - 1 ? 0 : prev + 1));

  // Блок-заглушка, если фото нет
  if (!photoUrls.length) {
    return (
      <Box sx={{ 
        width: { xs: 200, md: 300 }, 
        height: { xs: 200, md: 300 }, 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#F4F1EE", 
        borderRadius: 2,
        mt: { xs: 2, md: 4 }
      }}>
        <CoffeeIcon sx={{ fontSize: { xs: 60, md: 80 }, color: "#ccc" }} />
        <Typography sx={{ color: "#999", mt: 1, fontWeight: 500 }}>
          No image
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: { xs: 2, md: 4 }, maxWidth: { xs: "100%", md: 700 }, mx: "auto", px: { xs: 1, md: 0 } }}>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Кнопки навигации показываем только если фото больше одного */}
        {photoUrls.length > 1 && (
          <IconButton 
            onClick={handlePrev} 
            sx={{ 
              position: "absolute", 
              left: { xs: -8, md: 0 }, 
              backgroundColor: "rgba(255,255,255,0.9)", 
              boxShadow: 1,
              width: { xs: 32, md: 40 },
              height: { xs: 32, md: 40 },
              zIndex: 1,
              '&:hover': { backgroundColor: "#fff" }
            }}
          >
            <ArrowBackIosIcon sx={{ fontSize: { xs: 16, md: 20 }, ml: 0.5 }} />
          </IconButton>
        )}

        <Box 
          component="img" 
          src={photoUrls[selectedIndex]} 
          alt={productName} 
          sx={{ 
            backgroundColor: "#fff", 
            p: { xs: 1, md: 2 }, 
            height: { xs: 200, md: 300 }, 
            width: "100%",
            maxWidth: { xs: "100%", md: "600px" },
            objectFit: "contain", 
            mx: { xs: 2, md: 6 },
            borderRadius: 2
          }} 
        />

        {photoUrls.length > 1 && (
          <IconButton 
            onClick={handleNext} 
            sx={{ 
              position: "absolute", 
              right: { xs: -8, md: 0 }, 
              backgroundColor: "rgba(255,255,255,0.9)", 
              boxShadow: 1,
              width: { xs: 32, md: 40 },
              height: { xs: 32, md: 40 },
              zIndex: 1,
              '&:hover': { backgroundColor: "#fff" }
            }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
          </IconButton>
        )}
      </Box>

      {/* Превью (миниатюры) показываем только если фото больше одного */}
      {photoUrls.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 1, md: 2 }, mt: { xs: 2, md: 4 }, flexWrap: "wrap", px: { xs: 1, md: 0 } }}>
          {photoUrls.map((img, index) => (
            <Box key={index} sx={{ cursor: "pointer", textAlign: "center" }} onClick={() => setSelectedIndex(index)}>
              <Box 
                component="img" 
                src={img} 
                alt={`${productName}-${index}`} 
                sx={{ 
                  backgroundColor: "#fff", 
                  p: { xs: 0.5, md: 1 }, 
                  width: { xs: 60, md: 80 }, 
                  height: { xs: 60, md: 80 }, 
                  objectFit: "contain", 
                  borderRadius: 1,
                  border: selectedIndex === index ? "2px solid #3E3027" : "1px solid #eee",
                  transition: "all 0.2s ease"
                }} 
              />
              <Box sx={{ 
                width: "100%", 
                height: { xs: 3, md: 4 }, 
                borderRadius: 2, 
                backgroundColor: selectedIndex === index ? "#3E3027" : "transparent", 
                mt: 0.5 
              }} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function AccessoriesImageSlider({ photos = [], productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handlePrev = () =>
    setSelectedIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  const handleNext = () =>
    setSelectedIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));

  if (!photos.length)
    return (
      <Box sx={{ width: "100%", height: { xs: 200, md: 300 }, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0", }}>
        No image
      </Box>
    );

  const photoUrls = photos.filter((photo) => photo.url).map((photo) => photo.url);

  return (
    <Box sx={{ mt: { xs: 2, md: 4 }, maxWidth: { xs: "100%", md: 700 }, mx: "auto", px: { xs: 1, md: 0 } }}>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconButton 
          onClick={handlePrev} 
          sx={{ 
            position: "absolute", 
            left: { xs: -8, md: 0 }, 
            backgroundColor: "rgba(255,255,255,0.9)", 
            boxShadow: 1,
            width: { xs: 32, md: 40 },
            height: { xs: 32, md: 40 },
            zIndex: 1
          }}
        >
          <ArrowBackIosIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
        </IconButton>

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
            mx: { xs: 4, md: 6 } 
          }} 
        />

        <IconButton 
          onClick={handleNext} 
          sx={{ 
            position: "absolute", 
            right: { xs: -8, md: 0 }, 
            backgroundColor: "rgba(255,255,255,0.9)", 
            boxShadow: 1,
            width: { xs: 32, md: 40 },
            height: { xs: 32, md: 40 },
            zIndex: 1
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
        </IconButton>
      </Box>

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
                borderRadius: 1 
              }} 
            />
            <Box sx={{ width: { xs: 60, md: 96 }, height: { xs: 3, md: 4 }, borderRadius: 2, backgroundColor: selectedIndex === index ? "#3E3027" : "#ccc", mt: 0.5 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

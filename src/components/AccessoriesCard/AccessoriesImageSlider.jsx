import { useState } from "react";
import { Box, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CoffeeIcon from '@mui/icons-material/Coffee'; 

export default function AccessoriesImageSlider({ photos = [], productName }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainImageError, setMainImageError] = useState(false);
  const [thumbnailErrors, setThumbnailErrors] = useState({});
  
  const photoUrls = photos
    .map(photo => {
      if (typeof photo === 'string') {
        return photo.startsWith('http') ? photo : `https://onlinestore-928b.onrender.com${photo.startsWith('/') ? '' : '/'}${photo}`;
      }
      const photoUrl = photo.url || photo.photo || photo.photo_url || photo.image_url || null;
      if (photoUrl && typeof photoUrl === 'string') {
        if (!photoUrl.startsWith('http')) {
          return `https://onlinestore-928b.onrender.com${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
        }
        return photoUrl;
      }
      return null;
    })
    .filter(url => url !== null);

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? photoUrls.length - 1 : prev - 1));
    setMainImageError(false);
  };
  const handleNext = () => {
    setSelectedIndex((prev) => (prev === photoUrls.length - 1 ? 0 : prev + 1));
    setMainImageError(false);
  };

  if (!photoUrls.length) {
    return (
      <Box sx={{ 
        width: { xs: 250, md: 300 }, 
        height: { xs: 250, md: 300 }, 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#eee", 
        borderRadius: 2,
        mt: { xs: 2, md: 4 },
        mx: "auto"
      }}>
        <CoffeeIcon sx={{ fontSize: { xs: 60, md: 80 }, color: "#ccc" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: { xs: 2, md: 4 }, maxWidth: { xs: "100%", md: 700 }, mx: "auto", px: { xs: 1, md: 0 } }}>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>

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

        <Box sx={{
          width: { xs: 200, md: 350 }, 
          height: { xs: 200, md: 350 }, 
          display: "flex",
          alignItems: "center", 
          justifyContent: "center", 
          mx: { xs: 4, md: 6 }
        }}>
          {mainImageError ? (
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#eee", borderRadius: "12px" }}>
              <CoffeeIcon sx={{ color: "#ccc", fontSize: 50 }} />
            </Box>
          ) : (
            <Box
              component="img"
              src={photoUrls[selectedIndex]}
              alt={productName}
              onError={() => setMainImageError(true)}
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </Box>

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

      {photoUrls.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 1, md: 2 }, mt: { xs: 2, md: 4 }, flexWrap: "wrap", px: { xs: 1, md: 0 } }}>
          {photoUrls.map((img, index) => (
            <Box key={index} sx={{ cursor: "pointer", textAlign: "center" }} onClick={() => {
              setSelectedIndex(index);
              setMainImageError(false);
            }}>
              {thumbnailErrors[index] ? (
                <Box sx={{ 
                  backgroundColor: "#fff", 
                  p: { xs: 0.5, md: 1 }, 
                  width: { xs: 60, md: 80 }, 
                  height: { xs: 60, md: 80 }, 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 1,
                  border: selectedIndex === index ? "2px solid #3E3027" : "1px solid #eee",
                  transition: "all 0.2s ease"
                }}>
                  <CoffeeIcon sx={{ fontSize: { xs: 30, md: 40 }, color: "#ccc" }} />
                </Box>
              ) : (
                <Box 
                  component="img" 
                  src={img} 
                  alt={`${productName}-${index}`}
                  onError={() => setThumbnailErrors(prev => ({ ...prev, [index]: true }))}
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
              )}
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

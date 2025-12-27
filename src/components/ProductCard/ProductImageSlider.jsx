import { useState } from "react";
import { Box, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CoffeeIcon from '@mui/icons-material/Coffee';


const ThumbnailItem = ({ img, isSelected, onClick, productName, index }) => {
  const [thumbError, setThumbError] = useState(false);

  return (
    <Box sx={{ cursor: "pointer", textAlign: "center" }} onClick={onClick}>
      <Box sx={{
        width: { xs: 60, md: 80 },
        height: { xs: 60, md: 80 },
        backgroundColor: "#fff",
        borderRadius: 1,
        border: isSelected ? "1px solid #3E3027" : "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        p: 0.5
      }}>
        {thumbError ? (
          <CoffeeIcon sx={{ color: "#ccc", fontSize: 30, }} />
        ) : (
          <Box
            component="img"
            src={img}
            alt={`${productName}-${index}`}
            onError={() => setThumbError(true)}
            sx={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        )}
      </Box>
      <Box sx={{
        width: "100%",
        height: { xs: 3, md: 4 },
        borderRadius: 2,
        backgroundColor: isSelected ? "#3E3027" : "#ccc",
        mt: 0.5
      }} />
    </Box>
  );
};

export default function ProductImageSlider({ photos = [], productName }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mainError, setMainError] = useState(false);

  const photoUrls = photos.filter((photo) => photo.url).map((photo) => photo.url);

  if (photoUrls.length === 0) {
    return (
      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#eee", borderRadius: "12px" }}>
        <CoffeeIcon sx={{ color: "#ccc", fontSize: 50 }} />
      </Box>
    );
  }

  const handleSwitch = (newIndex) => {
    setMainError(false);
    setSelectedIndex(newIndex);
  };

  return (
    <Box sx={{ mt: { xs: 2, md: 4 }, maxWidth: { xs: "100%", md: 700 }, mx: "auto", px: { xs: 1, md: 0 } }}>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

        {photoUrls.length > 1 && (
          <IconButton
            onClick={() => handleSwitch(selectedIndex === 0 ? photoUrls.length - 1 : selectedIndex - 1)}
            sx={{ position: "absolute", left: { xs: -8, md: 0 }, backgroundColor: "rgba(255,255,255,0.9)", boxShadow: 1, zIndex: 1 }}
          >
            <ArrowBackIosIcon sx={{ fontSize: { xs: 16, md: 20 }, ml: 0.5 }} />
          </IconButton>
        )}

        <Box sx={{
          width: { xs: 200, md: 350 }, height: { xs: 200, md: 350 }, display: "flex",
          alignItems: "center", justifyContent: "center", mx: { xs: 4, md: 6 }
        }}>
          {mainError ? (
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#eee", borderRadius: "12px" }}>
              <CoffeeIcon sx={{ color: "#ccc", fontSize: 50 }} />
            </Box>
          ) : (
            <Box
              component="img"
              src={photoUrls[selectedIndex]}
              alt={productName}
              onError={() => setMainError(true)}
              sx={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </Box>

        {photoUrls.length > 1 && (
          <IconButton
            onClick={() => handleSwitch(selectedIndex === photoUrls.length - 1 ? 0 : selectedIndex + 1)}
            sx={{ position: "absolute", right: { xs: -8, md: 0 }, backgroundColor: "rgba(255,255,255,0.9)", boxShadow: 1, zIndex: 1 }}
          >
            <ArrowForwardIosIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
          </IconButton>
        )}
      </Box>

      {/* Сетка миниатюр с заглушками */}
      {photoUrls.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 1, md: 2 }, mt: { xs: 2, md: 4 }, flexWrap: "wrap" }}>
          {photoUrls.map((img, index) => (
            <ThumbnailItem
              key={index}
              img={img}
              index={index}
              productName={productName}
              isSelected={selectedIndex === index}
              onClick={() => handleSwitch(index)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

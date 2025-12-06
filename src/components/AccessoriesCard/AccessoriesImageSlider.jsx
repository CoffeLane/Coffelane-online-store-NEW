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
      <Box sx={{ width: "100%", height: 300, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0", }}>
        No image
      </Box>
    );

  const photoUrls = photos.filter((photo) => photo.url).map((photo) => photo.url);

  return (
    <Box sx={{ mt: 4, maxWidth: 700, mx: "auto" }}>
      <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IconButton onClick={handlePrev} sx={{ position: "absolute", left: 0, backgroundColor: "rgba(255,255,255,0.9)", boxShadow: 1, }}>
          <ArrowBackIosIcon />
        </IconButton>

        <Box component="img" src={photoUrls[selectedIndex]} alt={productName} sx={{ backgroundColor: "#fff", p: 2, height: 300, objectFit: "contain", mx: 6 }} />

        <IconButton onClick={handleNext} sx={{ position: "absolute", right: 0, backgroundColor: "rgba(255,255,255,0.9)", boxShadow: 1, }}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
        {photoUrls.map((img, index) => (
          <Box key={index} sx={{ cursor: "pointer", textAlign: "center" }} onClick={() => setSelectedIndex(index)}>
            <Box component="img" src={img} alt={`${productName}-${index}`} sx={{ backgroundColor: "#fff", p: 1, width: 80, height: 80, objectFit: "contain", borderRadius: 1, }} />
            <Box sx={{ width: 96, height: 4, borderRadius: 2, backgroundColor: selectedIndex === index ? "#3E3027" : "#ccc", }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

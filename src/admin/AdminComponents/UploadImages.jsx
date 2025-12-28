import React from "react";
import { Box, Typography, Button, IconButton, useMediaQuery, useTheme } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function UploadImages({ images, cover, setCover, handleImageUpload, handleDeletePhoto }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: { xs: 'flex-start', md: 'space-between' },
      gap: { xs: 2, md: 2 },
      alignItems: { xs: 'flex-start', md: 'flex-start' }
    }}>
      <Box sx={{ width: '100%', maxWidth: { xs: '100%', md: 350 }, flex: { xs: 'none', md: 1 } }}>
        <label htmlFor="upload-cover" style={{ cursor: "pointer", display: "block", width: "100%" }}>
          <Box
            sx={{
              width: { xs: '100%', md: 350 },
              maxWidth: '100%',
              height: { xs: 300, md: 350 },
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
              border: cover ? "none" : "2px dashed #3F63AC",
              backgroundColor: cover ? "transparent" : "#EAF9FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cover ? (
              <img
                src={cover.url || (cover.file ? URL.createObjectURL(cover.file) : "")}
                alt="Cover"
                width="100%"
                height="100%"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <Typography sx={{ fontSize: 48, color: "#3F63AC" }}>+</Typography>
            )}

            <Button
              variant="outlined"
              component="span"
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                borderRadius: 4,
                backgroundColor: "#F2EFEF",
                width: "88px",
                height: "38px",
                border: "1px solid #3E3027",
                color: "#3E3027",
                textTransform: "none",
              }}
            >
              Cover
            </Button>
          </Box>
        <input type="file" id="upload-cover" accept="image/*" hidden onChange={handleImageUpload} />
        </label>
      </Box>
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: 'row', md: 'column' },
        gap: 2,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        width: { xs: '100%', md: 280 },
        minWidth: { xs: 'auto', md: 280 },
        flexShrink: 0,
      }}>
        {images.map((img, i) => {
          const src = img.url || (img.file ? URL.createObjectURL(img.file) : "");
          if (!src) return null;

          return (
            <Box key={img.id || i} sx={{ position: "relative", width: { xs: 100, md: '100%' } }}>
              <Box
                component="img"
                src={src}
                alt={`thumb-${i}`}
                onClick={() => setCover(img)}
                sx={{
                  width: '100%',
                  height: { xs: 100, md: 280 },
                  borderRadius: "8px",
                  border: cover === img ? "2px solid #3F63AC" : "2px solid transparent",
                  cursor: "pointer",
                  objectFit: "cover",
                }}
              />
              {handleDeletePhoto && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Передаем id если есть, иначе сам объект изображения
                    handleDeletePhoto(img.id || img);
                  }}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(255,255,255,0.7)",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          );
        })}

        <Box
          component="label"
          htmlFor="upload-image"
          sx={{
            width: { xs: 100, md: '100%' },
            height: { xs: 100, md: 280 },
            borderRadius: "8px",
            border: "2px dashed #3F63AC",
            backgroundColor: "#EAF9FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: { xs: 24, md: 28 }, color: "#3F63AC" }}>+</Typography>
          <input type="file" id="upload-image" multiple accept="image/*" hidden onChange={handleImageUpload} />
        </Box>
      </Box>
    </Box>
  );
}


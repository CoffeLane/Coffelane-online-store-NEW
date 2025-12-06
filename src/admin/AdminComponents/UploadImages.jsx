import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function UploadImages({ images, cover, setCover, handleImageUpload, handleDeletePhoto }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      {}
      <Box>
        <label htmlFor="upload-cover" style={{ cursor: "pointer" }}>
          <Box
            sx={{
              width: 400,
              height: 400,
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
        </label>

        <input type="file" id="upload-cover" accept="image/*" hidden onChange={handleImageUpload} />
      </Box>
      <Box display="flex" flexDirection="column" gap={2}>
        {images.map((img, i) => {
          const src = img.url || (img.file ? URL.createObjectURL(img.file) : "");
          if (!src) return null;

          return (
            <Box key={img.id || i} position="relative">
              <img
                src={src}
                alt={`thumb-${i}`}
                width="160"
                height="160"
                style={{
                  borderRadius: "8px",
                  border: cover === img ? "2px solid #3F63AC" : "2px solid transparent",
                  cursor: "pointer",
                  objectFit: "cover",
                }}
                onClick={() => setCover(img)}
              />
              {img.id && handleDeletePhoto && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(img.id);
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

        <label
          htmlFor="upload-image"
          style={{
            width: 160,
            height: 160,
            borderRadius: "8px",
            border: "2px dashed #3F63AC",
            backgroundColor: "#EAF9FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <Typography sx={{ fontSize: 28, color: "#3F63AC" }}>+</Typography>
          <input type="file" id="upload-image" multiple accept="image/*" hidden onChange={handleImageUpload} />
        </label>
      </Box>
    </Box>
  );
}


import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
} from "@mui/material";
import { useSelector } from "react-redux";
import { getProductPrice, formatPrice } from "../utils/priceUtils";
import { Link as RouterLink } from "react-router-dom";
import NoResults from "../../assets/icons/noResults.svg";
import CoffeeIcon from "@mui/icons-material/Coffee";
import { buildImageUrl } from "../utils/helpers";

// Хелпер для извлечения URL из разных форматов полей
const extractPhotoUrl = (photo) => {
  if (!photo) return null;
  if (typeof photo === "string") return photo;
  if (typeof photo === "object") {
    return (
      photo?.url || photo?.photo || photo?.photo_url || photo?.image_url || null
    );
  }
  return null;
};

// Хелпер для обработки массива фотографий
const processPhotoArray = (photos) => {
  if (!photos || !Array.isArray(photos) || photos.length === 0) return [];

  return photos
    .map((photo) => {
      let photoUrl = null;
      if (photo.photo) {
        if (typeof photo.photo === "string") {
          photoUrl = photo.photo;
        } else if (photo.photo.url) {
          photoUrl = photo.photo.url;
        } else if (photo.photo.photo_url) {
          photoUrl = photo.photo.photo_url;
        }
      } else {
        photoUrl = extractPhotoUrl(photo);
      }

      photoUrl = buildImageUrl(photoUrl);

      return {
        id: photo.id || photo.photo_id || null,
        url: photoUrl,
      };
    })
    .filter((img) => img.url !== null);
};

function SearchDropdown({ loading, query, onClose }) {
  const [tabValue, setTabValue] = useState(0);
  const currency = useSelector((state) => state.settings.currency);

  const products = useSelector((state) => state.search.products || []);
  const accessories = useSelector((state) => state.search.accessories || []);

  const allResults = [...products, ...accessories];
  const currentItems = tabValue === 0 ? allResults : products;

  if (!query.trim()) return null;

  if (!loading && allResults.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center", bgcolor: "white" }}>
        <Typography variant="body1" color="text.secondary">
          No results found for "{query}"
        </Typography>
        <Box
          component="img"
          src={NoResults}
          alt="no-results"
          sx={{
            width: "100%",
            maxWidth: { xs: 300, md: 560 },
            height: "auto",
            margin: "20px auto 0",
          }}
        />
      </Box>
    );
  }

  const highlightText = (text, highlight) => {
    if (!text) return "";
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} style={{ color: "#16675C", fontWeight: 700 }}>
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "white",
        borderRadius: "0 0 12px 12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
        }}
      >
        <Tab label={`All results ${allResults.length}`} />
        <Tab label={`Products ${products.length}`} />
      </Tabs>

      <Box sx={{ maxHeight: "420px", overflowY: "auto" }}>
        {loading ? (
          <Typography sx={{ p: 3, textAlign: "center" }}>Loading...</Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {currentItems.map((item, index) => {
              if (!item) return null;
              const price = getProductPrice(item, currency);
              const photosSource =
                (item.photos_url?.length ? item.photos_url : null) ||
                (item.product_photos?.length ? item.product_photos : null) ||
                (item.accessory_photos?.length
                  ? item.accessory_photos
                  : null) ||
                (item.product?.photos_url?.length
                  ? item.product.photos_url
                  : null) ||
                (item.product?.product_photos?.length
                  ? item.product.product_photos
                  : null) ||
                [];

              const processedPhotos = processPhotoArray(photosSource);

              const singlePhotoSource =
                item.image ||
                item.photo ||
                item.img ||
                item.cover ||
                item.product?.image ||
                item.product?.photo ||
                item.photos_url?.[0]?.url ||
                item.product_photos?.[0]?.photo ||
                item.accessory_photos?.[0]?.photo;

              const rawPhoto =
                processedPhotos.length > 0
                  ? processedPhotos[0].url
                  : singlePhotoSource
                    ? buildImageUrl(singlePhotoSource)
                    : null;
              const isAccessory = !item.caffeine_type;

              const itemPath = isAccessory
                ? `/accessories/product/${item.id}`
                : `/coffee/product/${item.id}`;

              const uniqueKey = `${isAccessory ? "acc" : "prod"}-${item.id}-${index}`;

              return (
                <ListItem
                  key={uniqueKey}
                  component={RouterLink}
                  to={itemPath}
                  onClick={onClose}
                  sx={{
                    gap: 2,
                    alignItems: "flex-start",
                    p: 2,
                    borderBottom: "1px solid #f0f0f0",
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": { bgcolor: "#f9f9f9" },
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      position: "relative",
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CoffeeIcon
                      sx={{
                        position: "absolute",
                        color: "#ccc",
                        fontSize: 28,
                        zIndex: 0,
                      }}
                    />

                    {rawPhoto && (
                      <Box
                        component="img"
                        src={rawPhoto}
                        alt={item.name}
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          objectFit: isAccessory ? "contain" : "cover",
                          zIndex: 1,
                          backgroundColor: "white",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, lineHeight: 1.2, mb: 0.5 }}
                    >
                      {highlightText(item.name, query)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      {item.description
                        ? `${item.description.substring(0, 60)}...`
                        : "No description available"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#16675C" }}
                    >
                      {formatPrice(price, currency)}
                    </Typography>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      <Divider />
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          "&:hover": { bgcolor: "#f9f9f9" },
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Which capsules are the top choice?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Check out our <span style={{ color: "#16675C" }}>Best Sellers</span>
          </Typography>
        </Box>
        <Typography sx={{ color: "#999", fontSize: 24 }}>&rsaquo;</Typography>
      </Box>
    </Box>
  );
}

export default SearchDropdown;

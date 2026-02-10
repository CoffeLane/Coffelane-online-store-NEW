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
            maxHeight: { xs: 180, md: 315 },
            margin: "20px auto 0",
          }}
        />
      </Box>
    );
  }

  const highlightText = (text, highlight) => {
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
      sx={{ width: "100%", bgcolor: "white", borderRadius: "0 0 12px 12px" }}
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
            {currentItems.map((item) => {
              const price = getProductPrice(item, currency);
              const imageUrl = item.photos_url?.[0]?.url || item.image;
              const itemPath =
                item.category === "accessories"
                  ? `/accessories/product/${item.id}`
                  : `/coffee/product/${item.id}`;

              return (
                <ListItem
                  key={item.id}
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
                      bgcolor: "#eee",
                      borderRadius: 1,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CoffeeIcon sx={{ color: "#ccc", fontSize: 32 }} />
                    </Box>

                    {imageUrl && (
                      <Box
                        component="img"
                        src={imageUrl}
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          zIndex: 1,
                        }}
                        onError={(e) => {
                          if (e.currentTarget) {
                            e.currentTarget.style.display = "none";
                          }
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
                      {item.description?.substring(0, 60)}...
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
      {/* Футер дропдауна */}
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
            Which capsules are the top choice among customers?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Among the most popular are{" "}
            <span style={{ color: "#16675C" }}>Instant coffee...</span>
          </Typography>
        </Box>
        <Typography sx={{ color: "#999", fontWeight: 300, fontSize: 24 }}>
          &rsaquo;
        </Typography>
      </Box>
    </Box>
  );
}

export default SearchDropdown;

import React from "react";
import {
  Card,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
} from "@mui/material";
import { h6, h4 } from "../../styles/typographyStyles.jsx";
import { buildImageUrl } from "../../components/utils/helpers.js";

export default function RelatedItems({ items = [] }) {
  return (
    <Card sx={{ p: 3, borderRadius: "24px", my: 3 }}>
      <Typography sx={h4}>Recommended for this product</Typography>
      <Typography
        sx={{ ...h6, color: "text.secondary", fontSize: "14px" }}
        mb={2}
      >
        Items from the same brand
      </Typography>

      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    alt={item.name}
                    src={buildImageUrl(
                      item.product_photos?.[0]?.photo ||
                        item.photos_url?.[0]?.url ||
                        item.photos_url?.[0]?.photo ||
                        item.image_url,
                    )}
                    sx={{ width: 48, height: 48, mr: 2, borderRadius: "10px" }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{ fontSize: "14px", fontWeight: 600 }}
                  secondary={`${item.displayPrice || item.price || 0} USD`}
                />
              </ListItem>
              {index < items.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))
        ) : (
          <Box sx={{ py: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No similar items found.
            </Typography>
          </Box>
        )}
      </List>
    </Card>
  );
}

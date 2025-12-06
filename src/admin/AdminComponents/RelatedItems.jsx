import React from "react";
import { Card, Typography, Box, CardMedia, Divider, Button } from "@mui/material";
import {btnBorderStyles} from "../../styles/btnStyles";
export default function RelatedItems({ onAddItems }) {
  const items = [10.5, 12.5, 12.5];

  return (
    <Card sx={{ p: 3, borderRadius: "24px" }}>
      <Typography variant="h6">Related items</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Add related items to this product
      </Typography>

      <Box>
        {/* {items.map((price, i) => (
          <Box key={i}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1}>
                <CardMedia
                  component="img"
                  image="https://cdn.shopify.com/s/files/1/0680/4150/7114/products/Instant-coffee-Jacobs-Barista-Americano.png?v=1672164638"
                  sx={{ width: 40, height: 40, borderRadius: 1 }}
                />
                <Typography variant="body2">
                  Instant coffee Jacobs Barista Editions Americano
                </Typography>
              </Box>
              <Typography>${price}</Typography>
            </Box>
            {i < items.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))} */}

        <Button variant="outlined" fullWidth sx={{ mt: 2, borderRadius: "20px", textTransform: "none", ...btnBorderStyles }} onClick={onAddItems}>
          Add items
        </Button>
      </Box>
    </Card>
  );
}
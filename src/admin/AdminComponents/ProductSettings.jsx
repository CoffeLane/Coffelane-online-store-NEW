import React, { useMemo } from "react";
import { Card, Typography, RadioGroup, FormControlLabel, Radio, Box } from "@mui/material";
import { h6, h4 } from "../../styles/typographyStyles.jsx";
import { radioBtnStyles } from "../../styles/inputStyles.jsx";

export default function ProductSettings({ visible, setVisible, stock }) {

  const { statusText, statusBg, statusDescription } = useMemo(() => {
    let text = "";
    let bg = "";
    let desc = "";

    if (stock === null) {
      text = "Draft";
      bg = "#BDBABA";
      desc = "The product is not published yet.";
    } else if (stock === 0) {
      text = "Out of stock";
      bg = "#FD8888";
      desc = "The product is published but not available for purchase.";
    } else if (!visible) {
      text = "Hidden";
      bg = "#FFE47A";
      desc = "The product is active but not visible in the store.";
    } else {
      text = "Active";
      bg = "#7AF48C";
      desc = "The product is available for customers.";
    }

    return { statusText: text, statusBg: bg, statusDescription: desc };
  }, [visible, stock]);

  return (
    <>
      <Card sx={{ p: 3, borderRadius: "24px", mb: 3 }}>
        <Typography sx={{ ...h4 }}>Visibility</Typography>
        <Typography sx={{ ...h6 }} mb={1}>
          You can change the visibility of this product for customers
        </Typography>
        <RadioGroup
          sx={{ ...h6 }}
          row
          value={visible === null ? "" : visible ? "visible" : "notVisible"}
          onChange={(e) => setVisible(e.target.value === "visible")}
        >
          <FormControlLabel
            value="visible"
            sx={{ ...radioBtnStyles }}
            control={<Radio />}
            label="Visible"
          />
          <FormControlLabel
            value="notVisible"
            sx={{ ...radioBtnStyles }}
            control={<Radio />}
            label="Not visible"
          />
        </RadioGroup>
      </Card>

      <Card sx={{ p: 3, borderRadius: "24px" }}>
        <Typography sx={{ ...h4 }}>Status</Typography>
        <Box
          mt={1}
          sx={{
            backgroundColor: statusBg,
            borderRadius: "20px",
            py: 1,
            textAlign: "center",
            ...h6,
            transition: "all 0.3s ease"
          }}
        >
          {statusText}
        </Box>
        <Typography mt={1} sx={{ ...h6 }}>
          {statusDescription}
        </Typography>
      </Card>
    </>
  );
}


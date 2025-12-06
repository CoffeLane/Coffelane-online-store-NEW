import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { h4, h6 } from "../../styles/typographyStyles.jsx";

export default function ProductAccordion({ product }) {
  const sections = [
    { title: "Coffee Brew Guide", content: product?.coffee_brew_guide || "No brew guide available." },
    { title: "Shipping Details", content: product?.shipping_details || "Shipping info will be available soon." },
    { title: "Sustainability", content: product?.sustainability || "Sustainability info coming soon." },
  ];

  return (
    <Box sx={{ border: '1px solid #999', borderRadius: 4, overflow: 'hidden' }}>
      {sections.map((section, index) => (
        <Accordion key={index} square disableGutters sx={{ m: 0,'& .MuiAccordionSummary-root': { minHeight: 48, p: 2, '&.Mui-expanded': { minHeight: 48, margin: 0 }}, '& .MuiAccordionSummary-content': {margin: 0, '&.Mui-expanded': { margin: 0 }}}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#EAD9C9' }}>
            <Typography sx={{ ...h4 }}>{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Typography sx={{ ...h6 }}>{section.content}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

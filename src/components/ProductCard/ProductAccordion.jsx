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
    <Box sx={{ border: '1px solid #999', borderRadius: { xs: 2, md: 4 }, overflow: 'hidden' }}>
      {sections.map((section, index) => (
        <Accordion 
          key={index} 
          square 
          disableGutters 
          sx={{ 
            m: 0,
            '& .MuiAccordionSummary-root': { 
              minHeight: { xs: 40, md: 48 }, 
              p: { xs: 1.5, md: 2 }, 
              '&.Mui-expanded': { minHeight: { xs: 40, md: 48 }, margin: 0 }
            }, 
            '& .MuiAccordionSummary-content': {
              margin: 0, 
              '&.Mui-expanded': { margin: 0 }
            }
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: { xs: 20, md: 24 } }} />} sx={{ backgroundColor: '#EAD9C9' }}>
            <Typography sx={{ ...h4, fontSize: { xs: '16px', md: '20px' } }}>{section.title}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1.5, md: 2 } }}>
            <Typography sx={{ ...h6, fontSize: { xs: '14px', md: '18px' } }}>{section.content}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

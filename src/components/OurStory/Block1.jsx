import React from "react";
import { Box, Typography } from '@mui/material';
import Subheader from "../../assets/images/ourStory/Subheader.png";
import { headTitle } from "../../styles/typographyStyles.jsx";

function Block1() {
  return (
    <Box sx={{ position: "relative", width: "100%", height: { xs: 120, sm: 150, md: 180 }, backgroundImage: `url(${Subheader})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", }}>
      <Typography sx={{ ...headTitle, color: "#EAD9C9", textAlign: "center", fontSize: { xs: '24px', sm: '32px', md: '48px' }, px: { xs: 2, md: 0 } }}>
        About Coffee Lane
      </Typography>
    </Box>
  );
}

export default Block1;
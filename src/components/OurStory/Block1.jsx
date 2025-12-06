import React from "react";
import { Box, Typography } from '@mui/material';
import Subheader from "../../assets/images/ourStory/Subheader.png";
import { headTitle } from "../../styles/typographyStyles.jsx";


function Block1() {
  return (
    <Box sx={{ position: "relative", width: "100%", height: 180, backgroundImage: `url(${Subheader})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center", }}>
      <Typography sx={{ ...headTitle, color: "#EAD9C9", textAlign: "center", }}>
        About Coffee Lane
      </Typography>
    </Box>
  );
}

export default Block1;
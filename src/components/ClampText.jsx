import React from "react";
import { Typography } from "@mui/material";

export default function ClampText({ children, lines = 2, sx = {}, ...props }) {
  return (
    <Typography sx={{ display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", ...sx, }} {...props}>
      {children}
    </Typography>
  );
}
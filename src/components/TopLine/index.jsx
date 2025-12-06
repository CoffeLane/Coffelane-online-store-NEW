import { Box, Typography } from "@mui/material";

export default function TopLine() {
  return (
    <Box sx={{ overflow: "hidden", whiteSpace: "nowrap", backgroundColor: " #a4795b", height: '44px',  display: "flex", alignItems: "center" }}>
      <Box component="div" sx={{ display: "inline-block", animation: "scroll 180s linear infinite", willChange: "transform",}}>
        {Array.from({ length: 20 }).map((_, index) => (
          <Typography key={index} component="span" sx={{ marginRight: "32px", fontSize: "16px", fontWeight: 400, fontFamily: "Montserrat, sans-serif", color: '#fff', }}>
            Coffee Lane is open! Use{" "}
            <strong style={{ fontWeight: 500, fontSize: "18px", }}>WELCOME 10</strong> for 10% off
            your first order!
          </Typography>
        ))}
      </Box>

      <style>
        {`
          @keyframes scroll {
            0%   { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </Box>
  );
}


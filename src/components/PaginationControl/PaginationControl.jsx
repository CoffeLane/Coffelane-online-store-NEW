import React from "react";
import { Box, Pagination, useMediaQuery, useTheme } from "@mui/material";

const PaginationControl = ({ page, totalPages, onPageChange, variant = "catalog" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const activeBg = variant === "admin" ? "#EAD9C9" : "#FFFFFF"; 
  const activeColor = variant === "admin" ? "#3E3027" : "#3E3027"; 

  return (
    <Box sx={{ display: "flex", justifyContent: "center", my: { xs: 2, md: 4 } }}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={onPageChange}
        size={isMobile ? "small" : "medium"}
        siblingCount={isMobile ? 0 : 1}
        boundaryCount={isMobile ? 1 : 1}
        sx={{
          "& .MuiPaginationItem-root": {
            borderRadius: "50%",
            minWidth: { xs: "32px", md: "40px" },
            minHeight: { xs: "32px", md: "40px" },
            fontSize: { xs: "14px", md: "16px" },
            color: "#3E3027",
          },
          "& .MuiPaginationItem-previousNext": {
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            margin: { xs: "0 8px", md: "0 96px" },
            minWidth: { xs: "32px", md: "40px" },
            minHeight: { xs: "32px", md: "40px" },
          },
          "& .Mui-selected": {
            borderRadius: "50%",
            minWidth: { xs: "32px", md: "40px" },
            minHeight: { xs: "32px", md: "40px" },
            backgroundColor: `${activeBg} !important`,
            color: activeColor,
          },
          "& .Mui-selected:hover": {
            backgroundColor: `${activeBg} !important`,
          },
          "& .MuiPaginationItem-root.Mui-selected.Mui-focusVisible": {
            backgroundColor: `${activeBg} !important`,
          },
        }}
      />
    </Box>
  );
};

export default PaginationControl;

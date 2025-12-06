import React from "react";
import { Box, Pagination } from "@mui/material";

const PaginationControl = ({ page, totalPages, onPageChange, variant = "catalog" }) => {

  const activeBg = variant === "admin" ? "#EAD9C9" : "#FFFFFF"; 
  const activeColor = variant === "admin" ? "#3E3027" : "#3E3027"; 

  return (
    <Box sx={{ display: "flex", justifyContent: "center", my: 4}}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={onPageChange}
        sx={{
          "& .MuiPaginationItem-root": {
            borderRadius: "50%",
            minWidth: "40px",
            minHeight: "40px",
            color: "#3E3027",
          },
          "& .MuiPaginationItem-previousNext": {
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            margin: "0 96px",
            minWidth: "40px",
            minHeight: "40px",
          },
          "& .Mui-selected": {
            borderRadius: "50%",
            minWidth: "40px",
            minHeight: "40px",
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

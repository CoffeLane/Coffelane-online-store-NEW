import { Box } from "@mui/material";
import Footer from "../Footer";
import Header from "../Header";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(to bottom, #FFFFFF, #EAD9C9)" }}>
      <Header />
      <Box sx={{ flex: 1 }}>
        <Outlet /> 
      </Box>
      <Footer />
    </Box>
  );
}
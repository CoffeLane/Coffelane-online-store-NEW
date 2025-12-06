import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { AppBar, Toolbar, Typography } from "@mui/material";


const navLinkStyles = {
  textDecoration: 'none',
  cursor: 'pointer',
  color: '#3E3027',
  borderBottom: '3px solid transparent',
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 500,
  fontSize: '16px',
  '&.active': { color: '#B88A6E', borderBottomColor: '#B88A6E' },
  '&:hover': { color: '#B88A6E', borderBottomColor: '#B88A6E' },
  transition: 'color 0.3s, border-bottom-color 0.3s',
};

export default function Navbar() {
  return (
    <AppBar position='static' sx={{ backgroundColor: "#EAD9C9", boxShadow: 'none', }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {[
          { to: '/', label: 'Home' },
          { to: '/coffee', label: 'Coffee' },
          { to: '/accessories', label: 'Accessories' },
          { to: '/ourStory', label: 'Our Story' },
        ].map((link) => (
          <Typography key={link.to + link.label} component={RouterNavLink} to={link.to} sx={navLinkStyles} >
            {link.label}
          </Typography>
        ))}
      </Toolbar>
    </AppBar>
  );
}

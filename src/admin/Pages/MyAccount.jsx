import React, { useState } from "react";
import { Box, Typography, Paper, Button, TextField, Grid, Divider } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import userAvatar from "../../assets/admin/user-avatar.jpg";
import { h4, h6, h7 } from "../../styles/typographyStyles.jsx";
import EditIcon from '@mui/icons-material/Edit';
import { btnCart } from "../../styles/btnStyles.jsx";
import { inputStyles } from "../../styles/inputStyles.jsx";

export default function MyAccount() {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const user = {
    firstName: "Jane",
    lastName: "Jordan",
    position: "Administrator",
    avatar: userAvatar,
    email: "jane.jordan@example.com",
    role: "Admin",
    phone: "(202) 555-0147",
    dob: "07.07.1993",
    address: {
      country: "USA",
      state: "Oregon",
      city: "Portland",
      street: "Pinewood Avenue",
      house: "427",
      apt: "12B",
    },
  };

  const paperStyle = (isEditing) => ({
    p: 3,
    mb: 3,
    border: isEditing ? '2px solid yellow' : 'none',
    borderRadius: '24px',
  });

  return (
    <Box sx={{ width: "100%", mt: 4, mb: 3 }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <AdminBreadcrumbs />
      </Box>

      {/* Avatar */}
      <Paper sx={{ p: 3, mb: 3, borderRadius:"24px" }}>
        <Box component={RouterLink} to="/admin/account" sx={{ display: "flex", alignItems: "center", gap: 2, textDecoration: "none", color: "inherit", cursor: "pointer", "&:hover": { backgroundColor: "action.hover", borderRadius: "16px" }, p: 1}}>
          <Box component="img" src={user.avatar} alt="Avatar" sx={{ width: 64, height: 64, borderRadius: "50%" }}/>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography sx={{ ...h6, mb: 0.5 }}>{user.firstName} {user.lastName}</Typography>
            <Typography sx={{ ...h7 }}>{user.position}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Personal Information */}
      <Paper sx={paperStyle(isEditingPersonal)}>
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ ...h4 }}>Personal Information</Typography>
            <Button variant="contained" size="small" endIcon={!isEditingPersonal ? <EditIcon /> : null} sx={{ ...btnCart }} onClick={() => setIsEditingPersonal(!isEditingPersonal)}>
              {isEditingPersonal ? "Save changes" : "Edit"}
            </Button>
          </Box>
          <Divider />
        </Box>

        <Grid container spacing={2}>
          <Grid display="flex" flexDirection="column" gap={2} flex={1}>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>Name</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={`${user.firstName} ${user.lastName}`} />
            </Box>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>Email</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.email} />
            </Box>
          </Grid>

          <Grid display="flex" flexDirection="column" gap={2} flex={1}>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>Phone number</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.phone} />
            </Box>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>Date of birth</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.dob} />
            </Box>
          </Grid>

          <Grid display="flex" flexDirection="column" gap={2} flex={1}>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>User role</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.role} />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Address */}
      <Paper sx={paperStyle(isEditingAddress)} >
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={{ ...h4 }}>Address</Typography>
            <Button variant="contained" size="small" endIcon={!isEditingAddress ? <EditIcon /> : null} sx={{ ...btnCart }} onClick={() => setIsEditingAddress(!isEditingAddress)} >
              {isEditingAddress ? "Save changes" : "Edit"}
            </Button>
          </Box>
          <Divider />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4} display="flex" flexDirection="column" gap={2} flex={1}>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>Country</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.address.country} />
            </Box>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>City</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.address.city} />
            </Box>
          </Grid>

          <Grid item xs={12} md={4} display="flex" flexDirection="column" gap={2} flex={1}>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>State</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.address.state} />
            </Box>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>Street name</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.address.street} />
            </Box>
          </Grid>

          <Grid item xs={12} md={4} display="flex" flexDirection="column" gap={2} flex={1}>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>House number</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.address.house} />
            </Box>
            <Box>
              <Typography sx={{ ...h7, mb: 1 }}>Apt. number</Typography>
              <TextField fullWidth sx={{ ...inputStyles }} value={user.address.apt} />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}








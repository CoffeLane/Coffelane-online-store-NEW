import React, { useState, useEffect } from "react";
import { Grid, TextField, Button, Typography, Box, Alert } from "@mui/material";
import { inputStyles, helperTextRed } from "../../styles/inputStyles.jsx";
import { btnStyles } from "../../styles/btnStyles.jsx";
import { formatPhone } from "../../components/utils/formatters.jsx";
import { validateProfile } from "../../components/utils/validation/validateProfile.jsx";

export default function PersonalInfoForm({ user }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    streetName: "",
    houseNumber: "",
    aptNumber: "",
  });

  const [leftErrors, setLeftErrors] = useState({});
  const [rightErrors, setRightErrors] = useState({});
  const [leftSuccess, setLeftSuccess] = useState("");
  const [rightSuccess, setRightSuccess] = useState("");

useEffect(() => {
    if (user) {
      setFormData({
        fullName: `${user.first_name || ""} ${user.last_name || ""}`,
        email: user.email || "",
        phone: user.phone_number || "",
        country: user.country || "",
        city: user.region || "",
        state: user.state || "",
        streetName: user.street_name || "",
        houseNumber: user.zip_code || "",
        aptNumber: user.apartment_number || "",
      });
    }
  }, [user]);

const handleChange = (field, column = "left") => (e) => {
    let value = e.target.value;
    if (field === "phone") value = formatPhone(value);
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (column === "left" && leftErrors[field]) {
      setLeftErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (column === "right" && rightErrors[field]) {
      setRightErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSaveLeft = () => {
    const errors = validateProfile({ type: "personal", ...formData });
    setLeftErrors(errors);

    if (Object.keys(errors).length === 0) {
      setLeftSuccess("Personal info saved!");
      setTimeout(() => setLeftSuccess(""), 3000);
    }
  };

  const handleSaveRight = () => {
    const errors = validateProfile({ type: "address", ...formData });
    setRightErrors(errors);

    if (Object.keys(errors).length === 0) {
      setRightSuccess("Address saved!");
      setTimeout(() => setRightSuccess(""), 3000);
    }
  };

  return (
    <Box sx={{ px: 2, py: 0 }}>
      <Grid container spacing={4}>
        <Grid size={6}>
          {/* Левые поля */}
          <Typography>Full Name</Typography>
          <TextField
            fullWidth
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange("fullName", "left")}
            error={!!leftErrors.fullName}
            helperText={leftErrors.fullName}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />

          <Typography sx={{ mt: 2 }}>Email</Typography>
          <TextField
            fullWidth
            placeholder="Email"
            value={formData.email}
            onChange={handleChange("email", "left")}
            error={!!leftErrors.email}
            helperText={leftErrors.email}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />

          <Typography sx={{ mt: 2 }}>Phone number</Typography>
          <TextField
            fullWidth
            placeholder="Phone number"
            value={formData.phone}
            onChange={handleChange("phone", "left")}
            onKeyDown={(e) => {
              if (!/[0-9]/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete") e.preventDefault();
            }}
            error={!!leftErrors.phone}
            helperText={leftErrors.phone}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />

          <Button fullWidth variant="contained" sx={{ ...btnStyles, textTransform: "none", mt: 3 }} onClick={handleSaveLeft}>
            Save changes
          </Button>

          {leftSuccess && <Alert severity="success" sx={{ mt: 2 }}>{leftSuccess}</Alert>}
        </Grid>

        <Grid size={6}>
          {/* Правые поля */}
          <Typography>Country</Typography>
          <TextField
            fullWidth
            placeholder="Country"
            value={formData.country}
            onChange={handleChange("country", "right")}
            error={!!rightErrors.country}
            helperText={rightErrors.country}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />

          <Typography sx={{ mt: 2 }}>City</Typography>
          <TextField
            fullWidth
            placeholder="City"
            value={formData.city}
            onChange={handleChange("city", "right")}
            error={!!rightErrors.city}
            helperText={rightErrors.city}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />

          <Typography sx={{ mt: 2 }}>State</Typography>
          <TextField
            fullWidth
            placeholder="State"
            value={formData.state}
            onChange={handleChange("state", "right")}
            error={!!rightErrors.state}
            helperText={rightErrors.state}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />

          <Typography sx={{ mt: 2 }}>Street name</Typography>
          <TextField
            fullWidth
            placeholder="Street name"
            value={formData.streetName}
            onChange={handleChange("streetName", "right")}
            error={!!rightErrors.streetName}
            helperText={rightErrors.streetName}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />

          <Typography sx={{ mt: 2 }}>House number</Typography>
          <TextField
            fullWidth
            placeholder="House number"
            value={formData.houseNumber}
            onChange={handleChange("houseNumber", "right")}
            error={!!rightErrors.houseNumber}
            helperText={rightErrors.houseNumber}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />

          <Typography sx={{ mt: 2 }}>Apt. number</Typography>
          <TextField
            fullWidth
            placeholder="Apt. number"
            value={formData.aptNumber}
            onChange={handleChange("aptNumber", "right")}
            error={!!rightErrors.aptNumber}
            helperText={rightErrors.aptNumber}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />

          <Button fullWidth variant="contained" sx={{ ...btnStyles, textTransform: "none", mt: 3 }} onClick={handleSaveRight}>
            Save changes
          </Button>

          {rightSuccess && <Alert severity="success" sx={{ mt: 2 }}>{rightSuccess}</Alert>}
        </Grid>
      </Grid>
    </Box>
  );
}
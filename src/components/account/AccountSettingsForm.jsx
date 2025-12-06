import React, { useState, useEffect } from "react";
import { Grid, TextField, Button, Typography, Box, Alert, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { inputStyles, helperTextRed } from "../../styles/inputStyles.jsx";
import { btnStyles } from "../../styles/btnStyles.jsx";
import { changePassword, clearChangePasswordSuccess } from "../../store/slice/authSlice.jsx";
import { validatePasswords } from "../../components/utils/validation/validatePasswords.jsx";

export default function AccountSettingsForm() {
  const dispatch = useDispatch();
  const { loading, error, changePasswordSuccess } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [leftSuccess, setLeftSuccess] = useState("");
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    repeatNewPassword: false,
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClickShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateLeft = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format. Example: user@example.com";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRight = () => {
    const newErrors = validatePasswords({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      repeatNewPassword: formData.repeatNewPassword,
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveLeft = () => {
    if (!validateLeft()) return;
    setLeftSuccess("Personal info saved!");
    setTimeout(() => setLeftSuccess(""), 3000);
  };

  const handleSaveRight = () => {
    if (!validateRight()) return;

    dispatch(
      changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        repeatNewPassword: formData.repeatNewPassword,
      })
    );
  };

  useEffect(() => {
    if (changePasswordSuccess) {
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        repeatNewPassword: "",
      }));
      const timer = setTimeout(() => dispatch(clearChangePasswordSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [changePasswordSuccess, dispatch]);

  const renderPasswordField = (field, label) => (
    <TextField
      fullWidth
      placeholder={label}
      type={showPassword[field] ? "text" : "password"}
      value={formData[field]}
      onChange={handleChange(field)}
      error={!!errors[field]}
      helperText={errors[field]}
      sx={{ ...inputStyles, mt: 1 }}
      slotProps={{ formHelperText: { sx: helperTextRed } }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => handleClickShowPassword(field)} edge="end">
              {showPassword[field] ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <Box sx={{ px: 2, py: 0 }}>
      <Grid container spacing={4}>
        <Grid size={6}>
          <Typography>Email</Typography>
          <TextField
            fullWidth
            placeholder="Email"
            value={formData.email}
            onChange={handleChange("email")}
            error={!!errors.email}
            helperText={errors.email}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />
          <Button fullWidth variant="contained" sx={{ ...btnStyles, textTransform: "none", mt: 3 }} onClick={handleSaveLeft}> Save changes</Button>
          {leftSuccess && <Alert severity="success" sx={{ mt: 2 }}>{leftSuccess}</Alert>}
        </Grid>

        <Grid size={6}>
          <Typography>Current password</Typography>
          {renderPasswordField("currentPassword", "Current password")}
          <Typography sx={{ mt: 2 }}>New password</Typography>
          {renderPasswordField("newPassword", "New password")}
          <Typography sx={{ mt: 2 }}>Repeat new password</Typography>
          {renderPasswordField("repeatNewPassword", "Repeat new password")}

          <Button fullWidth variant="contained" sx={{ ...btnStyles, textTransform: "none", mt: 3 }} onClick={handleSaveRight} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>

          {changePasswordSuccess && <Alert severity="success" sx={{ mt: 2 }}>{changePasswordSuccess}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Grid>
      </Grid>
    </Box>
  );
}

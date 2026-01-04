import React, { useState, useEffect } from "react";
import { Grid, TextField, Button, Typography, Box, Alert, IconButton, InputAdornment, CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { inputStyles, helperTextRed } from "../../styles/inputStyles.jsx";
import { btnStyles } from "../../styles/btnStyles.jsx";
import { changePassword, clearChangePasswordSuccess, fetchProfile } from "../../store/slice/authSlice.jsx";
import { validatePasswords } from "../../components/utils/validation/validatePasswords.jsx";
import { apiWithAuth } from "../../store/api/axios.js";

export default function AccountSettingsForm() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { changePasswordLoading, changePasswordError, changePasswordSuccess } = auth;

  const userEmail = auth.user?.email || auth.profile?.email || auth.email || "";

  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [leftSuccess, setLeftSuccess] = useState("");
  const [leftLoading, setLeftLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    repeatNewPassword: false,
  });

  useEffect(() => {
    if (userEmail) {
      setFormData((prev) => ({ ...prev, email: userEmail }));
    }
  }, [userEmail]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClickShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateLeft = () => {
    const newErrors = {};
    const email = formData.email?.trim() || "";
    const forbiddenDomains = ["test.test", "example.com"];
    const domain = email.split("@")[1]?.toLowerCase(); 

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      newErrors.email = "Invalid email format (example: user@example.com).";
    } else if (forbiddenDomains.includes(domain)) {
      newErrors.email = "This email domain is not allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveLeft = async () => {
    if (!validateLeft()) return;

    setLeftLoading(true);
    setLeftSuccess("");
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      const response = await apiWithAuth.patch("/users/update", { email: formData.email });

      setLeftSuccess("Email saved!");
      setTimeout(() => setLeftSuccess(""), 3000);

      dispatch(fetchProfile());
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit:
          error.response?.data?.message ||
          error.response?.data?.email?.[0] ||
          "Failed to save email",
      }));
    } finally {
      setLeftLoading(false);
    }
  };

  const handleSaveRight = async () => {
    const validationErrors = validatePasswords({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      repeatNewPassword: formData.repeatNewPassword,
    });

    setErrors((prev) => ({ ...validationErrors, submit: undefined }));

    if (Object.keys(validationErrors).length === 0) {
      await dispatch(
        changePassword({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        })
      );
    }
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

  const getErrorMessage = (error) => {
    if (!error) return "";
    if (typeof error === "string") return error;
    if (error.message) return error.message;
    return Object.values(error).flat().join(", ");
  };

  return (
    <Box sx={{ px: 2, py: 0 }}>
      <Grid container spacing={4}>
        <Grid item xs={6}>
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
          <Button
            fullWidth
            variant="contained"
            sx={{ ...btnStyles, textTransform: "none", mt: 3 }}
            onClick={handleSaveLeft}
            disabled={leftLoading || !formData.email.trim()}
          >
            {leftLoading ? <CircularProgress size={24} color="inherit" /> : "Save changes"}
          </Button>
          {leftSuccess && <Alert severity="success" sx={{ mt: 2 }}>{leftSuccess}</Alert>}
          {errors.submit && <Alert severity="error" sx={{ mt: 2 }}>{errors.submit}</Alert>}
        </Grid>

        <Grid item xs={6}>
          <Typography>Current password</Typography>
          {renderPasswordField("currentPassword", "Current password")}
          <Typography sx={{ mt: 2 }}>New password</Typography>
          {renderPasswordField("newPassword", "New password")}
          <Typography sx={{ mt: 2 }}>Repeat new password</Typography>
          {renderPasswordField("repeatNewPassword", "Repeat new password")}

          <Button
            fullWidth
            variant="contained"
            sx={{ ...btnStyles, textTransform: "none", mt: 3 }}
            onClick={handleSaveRight}
            disabled={changePasswordLoading}
          >
            {changePasswordLoading ? <CircularProgress size={24} color="inherit" /> : "Save changes"}
          </Button>

          {changePasswordSuccess && <Alert severity="success" sx={{ mt: 2 }}>Password changed successfully!</Alert>}
          {changePasswordError && <Alert severity="error" sx={{ mt: 2 }}>{getErrorMessage(changePasswordError)}</Alert>}
        </Grid>
      </Grid>
    </Box>
  );
}


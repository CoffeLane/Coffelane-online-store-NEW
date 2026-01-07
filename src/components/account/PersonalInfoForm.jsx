import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Grid, TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material";
import { inputStyles, helperTextRed } from "../../styles/inputStyles.jsx";
import { btnStyles } from "../../styles/btnStyles.jsx";
import { formatPhone } from "../../components/utils/formatters.jsx";
import { validateProfile } from "../../components/utils/validation/validateProfile.jsx";
import { apiWithAuth } from "../../store/api/axios.js";
import { fetchProfile } from "../../store/slice/authSlice.jsx";
import { normalizePhone } from "../../components/utils/validation/validateProfile.jsx";

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

  const dispatch = useDispatch();
  const [leftErrors, setLeftErrors] = useState({});
  const [rightErrors, setRightErrors] = useState({});
  const [leftSuccess, setLeftSuccess] = useState("");
  const [rightSuccess, setRightSuccess] = useState("");
  const [leftLoading, setLeftLoading] = useState(false);
  const [rightLoading, setRightLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email: user.email || "",
        phone: user.phone_number ? formatPhone(user.phone_number) : "",
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

 const handleSaveLeft = async () => {
    const errors = validateProfile({ type: "personal", ...formData });
    setLeftErrors(errors);

    if (Object.keys(errors).length === 0) {
      setLeftLoading(true);
      setLeftSuccess("");

      try {
        const token = localStorage.getItem("access");
        if (!token) {
          setLeftErrors({ submit: "You are not logged in." });
          setLeftLoading(false);
          return;
        }

        const nameParts = formData.fullName.trim().split(/\s+/);
        const updateData = {
          profile: {
            first_name: nameParts[0] || "",
            last_name: nameParts.slice(1).join(" ") || "",
            phone_number: normalizePhone(formData.phone),
          },
          email: formData.email,
        };
        
        try {
          await apiWithAuth.patch("/users/update", updateData);
          setLeftSuccess("Personal info saved!");
          setTimeout(() => setLeftSuccess(""), 3000);
          dispatch(fetchProfile());
        } catch (error) {
          if (error.response?.status === 401) {
            // Интерцептор уже попытался обновить токен
            // Если все еще 401, значит сессия истекла
            setLeftErrors({ submit: "Your session has expired. Please log in again." });
          } else {
            const data = error.response?.data;
            if (data?.profile?.phone_number) {
              setLeftErrors(prev => ({ ...prev, phone: Array.isArray(data.profile.phone_number) ? data.profile.phone_number.join(" ") : data.profile.phone_number }));
            } else if (data?.email) {
              setLeftErrors(prev => ({ ...prev, email: Array.isArray(data.email) ? data.email.join(" ") : data.email }));
            } else {
              setLeftErrors(prev => ({ ...prev, submit: data?.message || "Failed to save data" }));
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setLeftErrors({ submit: "An unexpected error occurred." });
      } finally {
        setLeftLoading(false);
      }
    }
  };

  const handleSaveRight = async () => {
    const errors = validateProfile({ type: "address", ...formData });
    setRightErrors(errors);

    if (Object.keys(errors).length === 0) {
      setRightLoading(true);
      setRightSuccess("");

      try {
        const token = localStorage.getItem("access");
        if (!token) {
          setRightErrors({ submit: "Log in first." });
          setRightLoading(false);
          return;
        }

        const updateData = {
          profile: {
            country: formData.country?.trim(),
            region: formData.city?.trim(),
            state: formData.state?.trim(),
            street_name: formData.streetName?.trim(),
            zip_code: formData.houseNumber?.trim(),
            apartment_number: formData.aptNumber?.trim(),
          },
        };
        
        try {
          await apiWithAuth.patch("/users/update", updateData);
          setRightSuccess("Address saved!");
          setTimeout(() => setRightSuccess(""), 3000);
          dispatch(fetchProfile());
        } catch (error) {
          if (error.response?.status === 401) {
            // Интерцептор уже попытался обновить токен
            // Если все еще 401, значит сессия истекла
            setRightErrors({ submit: "Session expired." });
          } else {
            setRightErrors({ submit: error.response?.data?.message || "Failed to save address" });
          }
        }
      } catch (error) {
        setRightErrors({ submit: "Unexpected error." });
      } finally {
        setRightLoading(false);
      }
    }
  };

  return (
    <Box sx={{ px: { xs: 1, md: 2 }, py: 0 }}>
      <Grid container spacing={{ xs: 2, md: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
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
            error={!!leftErrors.phone}
            helperText={leftErrors.phone}
            sx={{ ...inputStyles, mt: 1 }}
            slotProps={{ formHelperText: { sx: helperTextRed } }}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ ...btnStyles, textTransform: "none", mt: 3 }}
            onClick={handleSaveLeft}
            disabled={leftLoading}
          >
            {leftLoading ? <CircularProgress size={24} color="inherit" /> : "Save changes"}
          </Button>

          {leftSuccess && <Alert severity="success" sx={{ mt: 2 }}>{leftSuccess}</Alert>}
          {leftErrors.submit && <Alert severity="error" sx={{ mt: 2 }}>{leftErrors.submit}</Alert>}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
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

          <Typography sx={{ mt: 2 }}>Zip / Postal Code</Typography>
          <TextField
            fullWidth
            placeholder="Zip code (e.g., 12345, 12345-6789, K1A 0B1)"
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

          <Button
            fullWidth
            variant="contained"
            sx={{ ...btnStyles, textTransform: "none", mt: 3 }}
            onClick={handleSaveRight}
            disabled={rightLoading}
          >
            {rightLoading ? <CircularProgress size={24} color="inherit" /> : "Save changes"}
          </Button>

          {rightSuccess && <Alert severity="success" sx={{ mt: 2 }}>{rightSuccess}</Alert>}
          {rightErrors.submit && <Alert severity="error" sx={{ mt: 2 }}>{rightErrors.submit}</Alert>}
        </Grid>
      </Grid>
    </Box>
  );
}
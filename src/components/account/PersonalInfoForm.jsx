import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Grid, TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material";
import { inputStyles, helperTextRed } from "../../styles/inputStyles.jsx";
import { btnStyles } from "../../styles/btnStyles.jsx";
import { formatPhone } from "../../components/utils/formatters.jsx";
import { validateProfile } from "../../components/utils/validation/validateProfile.jsx";
import { apiWithAuth } from "../../store/api/axios.js";
import { fetchProfile, refreshAccessToken } from "../../store/slice/authSlice.jsx";
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
          setLeftErrors({ submit: "You are not logged in. Please log in first." });
          setLeftLoading(false);
          return;
        }

        const nameParts = formData.fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const updateData = {
          profile: {
            first_name: firstName,
            last_name: lastName,
            phone_number: normalizePhone(formData.phone), // убирает пробелы, скобки, дефисы
          },
          email: formData.email,
        };

        let apiAuth = apiWithAuth(token);
        
        try {
          await apiAuth.patch("/users/update", updateData);

          setLeftSuccess("Personal info saved!");
          setTimeout(() => setLeftSuccess(""), 3000);

          dispatch(fetchProfile());
        } catch (error) {
          // Если токен истек (401), пытаемся обновить его
          if (error.response?.status === 401) {
            console.warn("⚠️ Token expired when saving personal info, attempting to refresh...");
            
            const refreshResult = await dispatch(refreshAccessToken());
            
            if (refreshAccessToken.fulfilled.match(refreshResult)) {
              // Токен обновлен, повторяем запрос с новым токеном
              console.log("✅ Token refreshed, retrying save...");
              const newToken = refreshResult.payload.access;
              apiAuth = apiWithAuth(newToken);
              
              await apiAuth.patch("/users/update", updateData);

              setLeftSuccess("Personal info saved!");
              setTimeout(() => setLeftSuccess(""), 3000);

              dispatch(fetchProfile());
            } else {
              // Не удалось обновить токен
              setLeftErrors({ submit: "Your session has expired. Please log in again." });
            }
          } else {
            // Другие ошибки
            const data = error.response?.data;

            if (data?.profile?.phone_number) {
              // если массив
              const msg = Array.isArray(data.profile.phone_number)
                ? data.profile.phone_number.join(" ")
                : data.profile.phone_number;

              setLeftErrors(prev => ({ ...prev, phone: msg }));
            } else if (data?.email) {
              const msg = Array.isArray(data.email) ? data.email.join(" ") : data.email;
              setLeftErrors(prev => ({ ...prev, email: msg }));
            } else {
              setLeftErrors(prev => ({ ...prev, submit: data?.message || "Failed to save personal info" }));
            }
          }
        }
      } catch (error) {
        console.error("Error saving personal info:", error);
        setLeftErrors({ submit: "An unexpected error occurred. Please try again." });
      } finally {
        setLeftLoading(false);
      }
    }
  };

  const handleSaveRight = async () => {
    console.log("▶ handleSaveRight called");
    const errors = validateProfile({ type: "address", ...formData });
    console.log("▶ Validation errors:", errors);
    setRightErrors(errors);

    if (Object.keys(errors).length === 0) {
      console.log("▶ No validation errors, proceeding with save");
      setRightLoading(true);
      setRightSuccess("");

      try {
        const token = localStorage.getItem("access");
        if (!token) {
          setRightErrors({ submit: "You are not logged in. Please log in first." });
          setRightLoading(false);
          return;
        }

        // Собираем данные профиля, исключая пустые значения
        const profileData = {};
        if (formData.country?.trim()) profileData.country = formData.country.trim();
        if (formData.city?.trim()) profileData.region = formData.city.trim();
        if (formData.state?.trim()) profileData.state = formData.state.trim();
        if (formData.streetName?.trim()) profileData.street_name = formData.streetName.trim();
        if (formData.houseNumber?.trim()) profileData.zip_code = formData.houseNumber.trim();
        if (formData.aptNumber?.trim()) profileData.apartment_number = formData.aptNumber.trim();

        const updateData = {
          profile: profileData,
        };

        console.log("▶ Saving address:", updateData);
        console.log("▶ Profile data keys:", Object.keys(profileData));

        let apiAuth = apiWithAuth(token);
        
        try {
          await apiAuth.patch("/users/update", updateData);

          console.log("✅ Address saved");
          setRightSuccess("Address saved!");
          setTimeout(() => setRightSuccess(""), 3000);

          dispatch(fetchProfile());
        } catch (error) {
          // Если токен истек (401), пытаемся обновить его
          if (error.response?.status === 401) {
            console.warn("⚠️ Token expired when saving address, attempting to refresh...");
            
            const refreshResult = await dispatch(refreshAccessToken());
            
            if (refreshAccessToken.fulfilled.match(refreshResult)) {
              // Токен обновлен, повторяем запрос с новым токеном
              console.log("✅ Token refreshed, retrying save...");
              const newToken = refreshResult.payload.access;
              apiAuth = apiWithAuth(newToken);
              
              await apiAuth.patch("/users/update", updateData);

              setRightSuccess("Address saved!");
              setTimeout(() => setRightSuccess(""), 3000);

              dispatch(fetchProfile());
            } else {
              // Не удалось обновить токен
              setRightErrors({ submit: "Your session has expired. Please log in again." });
            }
          } else {
            // Другие ошибки
            console.error("❌ Error saving address:", error);
            console.error("❌ Error response:", error.response?.data);
            console.error("❌ Error status:", error.response?.status);
            
            const data = error.response?.data;
            let errorMessage = "Failed to save address";
            
            if (data) {
              // Проверяем ошибки валидации от сервера
              if (data.profile) {
                // Если есть ошибки в profile, собираем их
                const profileErrors = Object.entries(data.profile)
                  .map(([key, value]) => {
                    const msg = Array.isArray(value) ? value.join(" ") : value;
                    return `${key}: ${msg}`;
                  })
                  .join("; ");
                errorMessage = profileErrors || data.message || errorMessage;
              } else if (data.message) {
                errorMessage = data.message;
              } else if (typeof data === 'string') {
                errorMessage = data;
              }
            }
            
            setRightErrors({ submit: errorMessage });
          }
        }
      } catch (error) {
        console.error("Error saving address:", error);
        setRightErrors({ submit: "An unexpected error occurred. Please try again." });
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
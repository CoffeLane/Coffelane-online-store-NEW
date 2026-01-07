import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, Typography, Paper, Button, TextField, Grid, Divider, Alert, CircularProgress, IconButton, Avatar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AdminBreadcrumbs from "../AdminBreadcrumbs/AdminBreadcrumbs.jsx";
import { h4, h6, h7 } from "../../styles/typographyStyles.jsx";
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { btnCart } from "../../styles/btnStyles.jsx";
import { inputStyles } from "../../styles/inputStyles.jsx";
import { apiWithAuth } from "../../store/api/axios.js";
import { fetchProfile } from "../../store/slice/authSlice.jsx";
import { formatPhone } from "../../components/utils/formatters.jsx";
import { normalizePhone } from "../../components/utils/validation/validateProfile.jsx";
import { patterns } from "../../components/utils/validation/validatorsPatterns.jsx";


const e164Regex = /^\+[1-9]\d{7,14}$/;
const isValidPhone = (phone) => {
  if (!phone || !phone.trim()) return false;
  return e164Regex.test(normalizePhone(phone));
};

export default function MyAccountAdmin() {
  const dispatch = useDispatch();
  const { user: authUser, email } = useSelector((state) => state.auth);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [personalSuccess, setPersonalSuccess] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");
  const [personalErrors, setPersonalErrors] = useState({});
  const [addressErrors, setAddressErrors] = useState({});
  const [personalData, setPersonalData] = useState({firstName: "", lastName: "", email: "", phone: "",role: "Administrator",});
  const [addressData, setAddressData] = useState({country: "", state: "", city: "", street: "", house: "", apt: ""});


  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarImageError, setAvatarImageError] = useState(false);
  const fileInputRef = useRef(null);
  const avatarInitializedRef = useRef(false);
  const userInitials = useMemo(() => {
    const firstName = personalData.firstName || authUser?.first_name || '';
    const lastName = personalData.lastName || authUser?.last_name || '';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'A';
  }, [personalData.firstName, personalData.lastName, authUser?.first_name, authUser?.last_name]);

  const phoneInputRef = useRef(null);
  const personalDataInitializedRef = useRef(false);
  const addressDataInitializedRef = useRef(false);

  useEffect(() => {
    if (authUser) {
      if (!personalDataInitializedRef.current || !isEditingPersonal) {
       
        const newPersonalData = {
          firstName: authUser.first_name || "",
          lastName: authUser.last_name || "",
          email: email || authUser.email || "",
          phone: authUser.phone_number ? formatPhone(authUser.phone_number) : "",
          role: authUser.role === 'admin' || authUser.role === 'Administrator' ? "Administrator" : "User",
        };
       
        setPersonalData(newPersonalData);
        personalDataInitializedRef.current = true;
      }
    }
  }, [authUser, email, isEditingPersonal]);

  useEffect(() => {
    if (authUser) {
      if (!addressDataInitializedRef.current || !isEditingAddress) {
        const newAddressData = {
          country: authUser.country || "",
          state: authUser.state || "",
          city: authUser.region || "",
          street: authUser.street_name || "",
          house: authUser.zip_code || "",
          apt: authUser.apartment_number || "",
        };
        setAddressData(newAddressData);
        addressDataInitializedRef.current = true;
      }
    }
  }, [authUser, isEditingAddress]);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('userAvatar');
    if (!avatar && savedAvatar) {
      setAvatar(savedAvatar);
      avatarInitializedRef.current = true;
      return; 
    }

    if (authUser) {
      const avatarUrl = authUser.avatar || authUser.profile?.avatar;
      if (avatarUrl) {
        setAvatar((currentAvatar) => {
          if (currentAvatar && currentAvatar.startsWith('blob:')) {
            const fullAvatarUrl = avatarUrl.startsWith('http') ? avatarUrl : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
            localStorage.setItem('userAvatar', fullAvatarUrl);
            return fullAvatarUrl;
          }
     
          if (currentAvatar && !currentAvatar.startsWith('blob:')) {
            return currentAvatar;
          }
         
          if (!currentAvatar) {
            const fullAvatarUrl = avatarUrl.startsWith('http') ? avatarUrl : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
            localStorage.setItem('userAvatar', fullAvatarUrl);
            avatarInitializedRef.current = true;
            return fullAvatarUrl;
          }
          return currentAvatar;
        });
      } else if (!avatarInitializedRef.current) {
        if (savedAvatar) {
          setAvatar(savedAvatar);
          avatarInitializedRef.current = true;
        } else {
          setAvatar(null);
          avatarInitializedRef.current = true;
        }
      } else {
        if (savedAvatar && !avatar) {
          setAvatar(savedAvatar);
        } else if (!savedAvatar && !avatar) {
          console.log("No avatar in authUser or localStorage, keeping null");
        } else {
          console.log("Keeping current avatar:", avatar);
        }
      }
    } else if (!avatarInitializedRef.current) {
      if (savedAvatar) {
        setAvatar(savedAvatar);
        avatarInitializedRef.current = true;
      } else {
        avatarInitializedRef.current = true;
      }
    }
  }, [authUser]);

  useEffect(() => {
    setAvatarImageError(false);
  }, [avatar]);

  const handlePersonalChange = (field) => (e) => {
    setPersonalData((prev) => ({ ...prev, [field]: e.target.value }));
    if (personalErrors[field]) {
      setPersonalErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressChange = (field) => (e) => {
    setAddressData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSavePersonal = async () => {
    setPersonalLoading(true);
    setPersonalSuccess("");
    setPersonalErrors({});
    const errors = {};

    if (!personalData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!personalData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!personalData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(personalData.email.trim())) {
      errors.email = "Invalid email format (example: user@example.com)";
    }

    if (personalData.phone && !isValidPhone(personalData.phone)) {
      errors.phone = "Please enter a valid phone number in international format, for example +380931234567";
    }

    if (Object.keys(errors).length > 0) {
      setPersonalErrors(errors);
      setPersonalLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setPersonalErrors({ general: "No access token. Please log in again." });
        setPersonalLoading(false);
        return;
      }

      let cleanPhone = "";
      if (personalData.phone) {
        const normalized = normalizePhone(personalData.phone);
        cleanPhone = normalized.startsWith("+") ? normalized : `+${normalized}`;
      }

      const updateData = {
        profile: {
          first_name: personalData.firstName?.trim() || "",
          last_name: personalData.lastName?.trim() || "",
          ...(cleanPhone && { phone_number: cleanPhone }), 
        },
        email: personalData.email?.trim() || "",
      };

      try {
        await apiWithAuth.patch("/users/update", updateData);

        setPersonalSuccess("Personal information saved successfully!");
        setTimeout(() => setPersonalSuccess(""), 3000);
        setIsEditingPersonal(false);
        await dispatch(fetchProfile());
      } catch (error) {
        if (error.response?.status === 401) {
          setPersonalErrors({
            general: "Your session has expired. Please log out and log in again to continue."
          });
        } else {
          console.error("Error saving personal info:", error);
          console.error("Error response:", error.response?.data);
          console.error("Error status:", error.response?.status);
          const errorData = error.response?.data;
          let errorMessage = "Failed to save personal information. Please try again.";
          if (errorData) {
            if (errorData.profile) {
              const profileErrors = Object.entries(errorData.profile)
                .map(([key, value]) => {
                  const msg = Array.isArray(value) ? value.join(" ") : value;
                  return `${key}: ${msg}`;
                })
                .join("; ");
              errorMessage = profileErrors || errorData.message || errorData.detail || errorMessage;
            } else if (errorData.email) {
              const msg = Array.isArray(errorData.email) ? errorData.email.join(" ") : errorData.email;
              errorMessage = `Email: ${msg}`;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }
          }

          setPersonalErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      console.error("Error saving personal info:", error);
      setPersonalErrors({
        general: "An unexpected error occurred. Please try again."
      });
    } finally {
      setPersonalLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    setAddressLoading(true);
    setAddressSuccess("");
    setAddressErrors({});

    const errors = {};
    if (addressData.house?.trim()) {
      const zipValue = addressData.house.trim();
      if (!patterns.zip.test(zipValue)) {
        errors.house = "Zip code format must be as follows: 12345, 12345-6789, K1A 0B1, SW1A 1AA, 75008, 01001";
      }
    }

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors);
      setAddressLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        setAddressLoading(false);
        return;
      }

      const profileData = {};
      if (addressData.country?.trim()) profileData.country = addressData.country.trim();
      if (addressData.state?.trim()) profileData.state = addressData.state.trim();
      if (addressData.city?.trim()) profileData.region = addressData.city.trim();
      if (addressData.street?.trim()) profileData.street_name = addressData.street.trim();
      if (addressData.house?.trim()) profileData.zip_code = addressData.house.trim();
      if (addressData.apt?.trim()) profileData.apartment_number = addressData.apt.trim();

      const updateData = {
        profile: profileData,
      };

      try {
        await apiWithAuth.patch("/users/update", updateData);

        setAddressSuccess("Address saved successfully!");
        setTimeout(() => setAddressSuccess(""), 3000);
        setIsEditingAddress(false);
        await dispatch(fetchProfile());
      } catch (error) {
        if (error.response?.status === 401) {
          setAddressErrors({
            general: "Your session has expired. Please log out and log in again to continue."
          });
        } else {
          console.error("Error saving address:", error);
          console.error("Error response:", error.response?.data);
          console.error("Error status:", error.response?.status);
          const errorData = error.response?.data;
          let errorMessage = "Failed to save address";

          if (errorData) {
            if (errorData.profile) {
              const profileErrors = Object.entries(errorData.profile)
                .map(([key, value]) => {
                  const msg = Array.isArray(value) ? value.join(" ") : value;
                  return `${key}: ${msg}`;
                })
                .join("; ");
              errorMessage = profileErrors || errorData.message || errorMessage;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }
          }

          setAddressErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAvatarError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('Image size should be less than 5MB');
        return;
      }
      await handleSaveAvatar(file);
    }
  };


  const handleSaveAvatar = async (file = null) => {
    const fileToUpload = file || avatarFile;
    if (!fileToUpload) return;

    setAvatarLoading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", fileToUpload);

      try {
        const response = await apiWithAuth.put("/users/avatars", formData, {
          headers: {
            'Content-Type': undefined, 
          },
        });

        let avatarUrl = response.data?.avatar ||
          response.data?.profile?.avatar ||
          response.data?.avatar_url ||
          response.data?.profile?.avatar_url ||
          response.data?.profile?.photo ||
          response.data?.photo ||
          response.data?.url ||
          response.data?.image_url ||
          response.data?.file ||
          response.data?.file_url ||
          null;

        if (avatarUrl && !avatarUrl.startsWith('http')) {
          avatarUrl = `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        }

        console.log("🔍 Extracted avatarUrl from response:", avatarUrl);

        const tempAvatarUrl = URL.createObjectURL(fileToUpload);
        setAvatar(tempAvatarUrl);

        if (avatarUrl) {
          localStorage.setItem('userAvatar', avatarUrl);
          setAvatar(avatarUrl);
          URL.revokeObjectURL(tempAvatarUrl);
          const profileResult = await dispatch(fetchProfile());
          const profileAvatar = profileResult.payload?.user?.avatar ||
            profileResult.payload?.user?.profile?.avatar ||
            profileResult.payload?.profile?.avatar ||
            profileResult.payload?.avatar;

          if (profileAvatar && profileAvatar !== avatarUrl) {
            const fullAvatarUrl = profileAvatar.startsWith('http') ? profileAvatar : `https://onlinestore-928b.onrender.com${profileAvatar.startsWith('/') ? '' : '/'}${profileAvatar}`;
            setAvatar(fullAvatarUrl);
            localStorage.setItem('userAvatar', fullAvatarUrl);
          } else if (profileAvatar) {
            console.log("Avatar already set, keeping current:", avatarUrl);
          } else {
            console.log("No avatar in profile result, keeping current from upload:", avatarUrl);

            if (avatarUrl) {
              localStorage.setItem('userAvatar', avatarUrl);
            }
          }
        } else {
          console.log("No avatar URL in response, trying to get user ID and fetch via /users/list/{id}/...");

          const currentUserId = authUser?.id || authUser?.profile?.id;

          if (currentUserId) {
            try {
              console.log("🔍 Trying to fetch avatar via /users/list/{id}/ for userId:", currentUserId);
              const userListRes = await apiWithAuth.get(`/users/list/${currentUserId}/`);
              console.log("🔍 User list response:", userListRes.data);

              const listAvatarUrl = userListRes.data?.avatar ||
                userListRes.data?.profile?.avatar ||
                userListRes.data?.avatar_url ||
                userListRes.data?.profile?.avatar_url ||
                null;

              if (listAvatarUrl) {
                const fullListAvatarUrl = listAvatarUrl.startsWith('http')
                  ? listAvatarUrl
                  : `https://onlinestore-928b.onrender.com${listAvatarUrl.startsWith('/') ? '' : '/'}${listAvatarUrl}`;
                setAvatar(fullListAvatarUrl);
                localStorage.setItem('userAvatar', fullListAvatarUrl);
                console.log("💾 Avatar saved to localStorage (from /users/list/{id}/):", fullListAvatarUrl);
                URL.revokeObjectURL(tempAvatarUrl);
                await dispatch(fetchProfile());
                return;
              }
            } catch (listError) {
              console.error("Error fetching user by ID:", listError.response?.status, listError.message);
            }
          }
          const profileResult = await dispatch(fetchProfile());
          const updatedAvatar = profileResult.payload?.user?.avatar ||
            profileResult.payload?.user?.profile?.avatar ||
            profileResult.payload?.profile?.avatar ||
            profileResult.payload?.avatar;

          if (updatedAvatar) {
            const fullAvatarUrl = updatedAvatar.startsWith('http') ? updatedAvatar : `https://onlinestore-928b.onrender.com${updatedAvatar.startsWith('/') ? '' : '/'}${updatedAvatar}`;
            setAvatar(fullAvatarUrl);
            localStorage.setItem('userAvatar', fullAvatarUrl);
            URL.revokeObjectURL(tempAvatarUrl);
          } else {
            localStorage.setItem('avatarUploaded', 'true');
            localStorage.setItem('avatarUploadTime', Date.now().toString());
          }
        }

        setAvatarFile(null);
        setAvatarError("");

      } catch (error) {
        if (error.response?.status === 401) {
          setAvatarError("Your session has expired. Please log out and log in again to continue.");
        } else {
          console.error("Error saving avatar:", error);
          console.error("Error response:", error.response?.data);
          console.error("Error status:", error.response?.status);

          let errorMessage = "Failed to save avatar. Please try again.";

          if (error.response?.data) {
            const errorData = error.response.data;
            if (errorData.avatar) {
              const msg = Array.isArray(errorData.avatar) ? errorData.avatar.join(" ") : errorData.avatar;
              errorMessage = `Avatar: ${msg}`;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          setAvatarError(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error saving avatar:", error);
      setAvatarError("An unexpected error occurred. Please try again.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const user = {
    firstName: personalData.firstName || "Admin",
    lastName: personalData.lastName || "User",
    position: "Administrator",
    avatar: avatar, 
    email: personalData.email || email || "",
    role: personalData.role,
    phone: personalData.phone || "",
  };

  const paperStyle = (isEditing) => ({
    p: 3,
    mb: 3,
    border: isEditing ? '2px solid yellow' : 'none',
    borderRadius: '24px',
  });

  const disabledInputStyles = {
    ...inputStyles,
  
    '& .MuiOutlinedInput-root.Mui-disabled': {
      color: '#000', 
      backgroundColor: 'transparent', 
      '& .MuiOutlinedInput-notchedOutline': {
        backgroundColor: 'transparent', 
      },
      '& .MuiOutlinedInput-input': {
        WebkitTextFillColor: '#000 !important',
        color: '#000 !important',
      },
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: '#000 !important',
      color: '#000 !important',
    },
  };


  return (
    <Box sx={{ width: "100%", maxWidth: "100%", mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 3 }, boxSizing: "border-box" }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <AdminBreadcrumbs />
      </Box>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 }, borderRadius: "24px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
          <Box sx={{ position: "relative", display: "inline-block" }}>
            {user.avatar && !avatarImageError ? (
              <Box component="img" src={user.avatar} onError={() => setAvatarImageError(true)} alt="Avatar" sx={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}/>
            ) : (
              <Avatar sx={{ width: 64, height: 64, bgcolor: '#A4795B', color: 'white', fontSize: '24px', fontWeight: 600,}}>
                {userInitials}
              </Avatar>
            )}
            <IconButton sx={{ position: "absolute", top: 0, right: -8, backgroundColor: "#16675C", color: "white", width: 28, height: 28, padding: 0, zIndex: 10, "&:hover": { backgroundColor: "#02715C", }}}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const input = document.getElementById('avatar-upload');
                if (input) {
                  input.click();
                }
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <input type="file" id="avatar-upload" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange}/>
          </Box>
          <Box component={RouterLink} to="/admin/account" sx={{ display: "flex", flexDirection: "column", flex: 1, textDecoration: "none", color: "inherit", cursor: "pointer", "&:hover": { opacity: 0.8 } }}>
            <Typography sx={{ ...h6, mb: 0.5 }}>{user.firstName} {user.lastName}</Typography>
            <Typography sx={{ ...h7 }}>{user.position}</Typography>
          </Box>
          {avatarLoading && (
            <CircularProgress size={24} sx={{ color: "#16675C" }} />
          )}
        </Box>
        {avatarError && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setAvatarError("")}>
            {avatarError}
          </Alert>
        )}
      </Paper>
      <Paper sx={{ ...paperStyle(isEditingPersonal), width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
            <Typography sx={{ ...h4, fontSize: { xs: '16px', md: '18px' } }}>Personal Information</Typography>
            <Button variant="contained" size="small" endIcon={!isEditingPersonal ? <EditIcon /> : null} sx={{ ...btnCart, fontSize: { xs: '12px', md: '14px' } }}
              onClick={() => {
                if (isEditingPersonal) {
                  handleSavePersonal();
                } else {
                  setPersonalErrors({});
                  setIsEditingPersonal(true);
                }
              }}
              disabled={personalLoading}
            >
              {personalLoading ? <CircularProgress size={20} /> : isEditingPersonal ? "Save changes" : "Edit"}
            </Button>
          </Box>
          <Divider />
        </Box>

        {personalSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>{personalSuccess}</Alert>
        )}

        {personalErrors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>{personalErrors.general}</Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 2 }} sx={{ width: "100%", m: 0 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>First Name</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={personalData?.firstName || ""}
                onChange={handlePersonalChange("firstName")}
                disabled={!isEditingPersonal}
                placeholder="First Name"
                error={!!personalErrors.firstName}
                helperText={personalErrors.firstName}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>Last Name</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={personalData?.lastName || ""}
                onChange={handlePersonalChange("lastName")}
                disabled={!isEditingPersonal}
                placeholder="Last Name"
                error={!!personalErrors.lastName}
                helperText={personalErrors.lastName}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>Email</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={personalData?.email || ""}
                onChange={handlePersonalChange("email")}
                disabled={!isEditingPersonal}
                placeholder="Email"
                error={!!personalErrors.email}
                helperText={personalErrors.email}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>Phone number</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={personalData?.phone || ""}
                inputRef={phoneInputRef}
                onChange={isEditingPersonal ? (e) => {
                  const input = e.target;
                  const inputValue = input.value;
                  const cursorPosition = input.selectionStart;
                  const digitsBeforeCursor = inputValue.slice(0, cursorPosition).replace(/\D/g, '').length;
                  const formatted = formatPhone(inputValue);
                  if (personalErrors.phone) {
                    setPersonalErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                  setPersonalData((prev) => ({ ...prev, phone: formatted }));
                  requestAnimationFrame(() => {
                    if (phoneInputRef.current) {
                      let newCursorPosition = 0;
                      let digitCount = 0;
                      for (let i = 0; i < formatted.length; i++) {
                        if (/\d/.test(formatted[i])) {
                          digitCount++;
                          if (digitCount === digitsBeforeCursor) {
                            newCursorPosition = i + 1;
                            break;
                          }
                        }
                        if (digitCount < digitsBeforeCursor && i === formatted.length - 1) {
                          newCursorPosition = formatted.length;
                        }
                      }
                      if (newCursorPosition === 0 && formatted.length > 0) {
                        newCursorPosition = formatted.length;
                      }

                      phoneInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
                    }
                  });
                } : undefined}
                onBlur={isEditingPersonal ? (e) => {
                  const formatted = formatPhone(e.target.value);
                  if (formatted !== personalData.phone) {
                    setPersonalData((prev) => ({ ...prev, phone: formatted }));
                  }
                  if (formatted && !isValidPhone(formatted)) {
                    setPersonalErrors((prev) => ({
                      ...prev,
                      phone: "Please enter a valid phone number in international format, for example +380931234567"
                    }));
                  }
                } : undefined}
                disabled={!isEditingPersonal}
                placeholder="+380 12 345 67 89"
                error={!!personalErrors.phone}
                helperText={personalErrors.phone}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Paper sx={{ ...paperStyle(isEditingAddress), width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
            <Typography sx={{ ...h4, fontSize: { xs: '16px', md: '18px' } }}>Address</Typography>
            <Button
              variant="contained"
              size="small"
              endIcon={!isEditingAddress ? <EditIcon /> : null}
              sx={{ ...btnCart, fontSize: { xs: '12px', md: '14px' } }}
              onClick={() => {
                if (isEditingAddress) {
                  handleSaveAddress();
                } else {
                  setAddressErrors({});
                  setIsEditingAddress(true);
                }
              }}
              disabled={addressLoading}
            >
              {addressLoading ? <CircularProgress size={20} /> : isEditingAddress ? "Save changes" : "Edit"}
            </Button>
          </Box>
          <Divider />
        </Box>

        {addressSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>{addressSuccess}</Alert>
        )}

        {addressErrors.general && (
          <Alert severity="error" sx={{ mb: 2 }}>{addressErrors.general}</Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 2 }} sx={{ width: "100%", m: 0 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>Country</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={addressData.country || ""}
                onChange={handleAddressChange("country")}
                disabled={!isEditingAddress}
                placeholder="Country"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>City/Region</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={addressData.city || ""}
                onChange={handleAddressChange("city")}
                disabled={!isEditingAddress}
                placeholder="City/Region"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>State</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={addressData.state || ""}
                onChange={handleAddressChange("state")}
                disabled={!isEditingAddress}
                placeholder="State"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>Street name</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={addressData.street || ""}
                onChange={handleAddressChange("street")}
                disabled={!isEditingAddress}
                placeholder="Street name"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>Zip code</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={addressData.house || ""}
                onChange={(e) => {
                  handleAddressChange("house")(e);
                  if (addressErrors.house) {
                    setAddressErrors((prev) => ({ ...prev, house: undefined }));
                  }
                }}
                disabled={!isEditingAddress}
                placeholder="Zip code (e.g., 12345, 12345-6789, K1A 0B1, SW1A 1AA)"
                error={!!addressErrors.house}
                helperText={addressErrors.house}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ ...h7, mb: 1 }}>Apt. number</Typography>
              <TextField
                fullWidth
                sx={disabledInputStyles}
                value={addressData.apt || ""}
                onChange={handleAddressChange("apt")}
                disabled={!isEditingAddress}
                placeholder="Apt. number"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}


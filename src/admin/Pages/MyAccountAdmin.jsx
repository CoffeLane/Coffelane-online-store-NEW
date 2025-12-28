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
import { fetchProfile, refreshAccessToken } from "../../store/slice/authSlice.jsx";
import { formatPhone } from "../../components/utils/formatters.jsx";
import { normalizePhone } from "../../components/utils/validation/validateProfile.jsx";
import { patterns } from "../../components/utils/validation/validatorsPatterns.jsx";

// Валидация телефона в формате E.164
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

  // Состояния для полей формы
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Administrator",
  });

  const [addressData, setAddressData] = useState({
    country: "",
    state: "",
    city: "",
    street: "",
    house: "",
    apt: "",
  });

  // Состояние для аватарки
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);
  const avatarInitializedRef = useRef(false);

  // Получаем инициалы для дефолтной аватарки
  const userInitials = useMemo(() => {
    const firstName = personalData.firstName || authUser?.first_name || '';
    const lastName = personalData.lastName || authUser?.last_name || '';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'A';
  }, [personalData.firstName, personalData.lastName, authUser?.first_name, authUser?.last_name]);

  // Не вызываем fetchProfile здесь, так как он уже вызывается в App.jsx
  // Если нужно обновить данные, это делается после сохранения

  const phoneInputRef = useRef(null);
  const personalDataInitializedRef = useRef(false);
  const addressDataInitializedRef = useRef(false);
  
  // Заполняем данные из Redux store сразу при появлении authUser
  // Данные устанавливаются при первой загрузке или когда authUser меняется
  useEffect(() => {
    if (authUser) {
      // Устанавливаем данные при первой загрузке или если не редактируем
      if (!personalDataInitializedRef.current || !isEditingPersonal) {
        // console.log("MyAccountAdmin - Setting personalData from authUser:", authUser);
        
        const newPersonalData = {
          firstName: authUser.first_name || "",
          lastName: authUser.last_name || "",
          email: email || authUser.email || "",
          phone: authUser.phone_number ? formatPhone(authUser.phone_number) : "",
          role: authUser.role === 'admin' || authUser.role === 'Administrator' ? "Administrator" : "User",
        };
        // console.log("MyAccountAdmin - Setting personalData:", newPersonalData);
        setPersonalData(newPersonalData);
        personalDataInitializedRef.current = true;
      }
    }
  }, [authUser, email, isEditingPersonal]);
  
  useEffect(() => {
    if (authUser) {
      // Устанавливаем данные при первой загрузке или если не редактируем
      if (!addressDataInitializedRef.current || !isEditingAddress) {
        // console.log("MyAccountAdmin - Setting addressData from authUser:", authUser);
        
        const newAddressData = {
          country: authUser.country || "",
          state: authUser.state || "",
          city: authUser.region || "",
          street: authUser.street_name || "",
          house: authUser.zip_code || "",
          apt: authUser.apartment_number || "",
        };
        // console.log("MyAccountAdmin - Setting addressData:", newAddressData);
        setAddressData(newAddressData);
        addressDataInitializedRef.current = true;
      }
    }
  }, [authUser, isEditingAddress]);

  // Устанавливаем аватарку из authUser, если она есть
  // Также проверяем localStorage для восстановления после обновления страницы
  useEffect(() => {
    // Всегда проверяем localStorage для восстановления аватарки после обновления страницы
    const savedAvatar = localStorage.getItem('userAvatar');
    
    // Если аватарка не установлена, но есть в localStorage, восстанавливаем ее
    if (!avatar && savedAvatar) {
      console.log("✅ Restoring avatar from localStorage:", savedAvatar);
      setAvatar(savedAvatar);
      avatarInitializedRef.current = true;
      return; // Выходим, чтобы не перезаписывать аватарку из authUser
    }
    
    if (authUser) {
      // Проверяем аватарку в разных местах структуры authUser
      const avatarUrl = authUser.avatar || authUser.profile?.avatar;
      
      console.log("🔄 useEffect authUser avatar check:", {
        authUserAvatar: authUser.avatar,
        authUserProfileAvatar: authUser.profile?.avatar,
        avatarUrl,
        currentAvatar: avatar,
        savedAvatar
      });
      
      if (avatarUrl) {
        // Обновляем аватарку только если она изменилась или еще не установлена
        setAvatar((currentAvatar) => {
          // Если текущая аватарка - это blob URL (временная), заменяем ее
          if (currentAvatar && currentAvatar.startsWith('blob:')) {
            // Убеждаемся, что URL абсолютный
            const fullAvatarUrl = avatarUrl.startsWith('http') ? avatarUrl : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
            console.log("✅ Replacing blob URL with:", fullAvatarUrl);
            localStorage.setItem('userAvatar', fullAvatarUrl);
            return fullAvatarUrl;
          }
          // Если аватарка уже установлена и это не временная, не меняем ее
          if (currentAvatar && !currentAvatar.startsWith('blob:')) {
            console.log("✅ Keeping existing avatar:", currentAvatar);
            return currentAvatar;
          }
          // Если аватарки нет (null или undefined), устанавливаем новую из authUser
          if (!currentAvatar) {
            // Убеждаемся, что URL абсолютный
            const fullAvatarUrl = avatarUrl.startsWith('http') ? avatarUrl : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
            console.log("✅ Setting new avatar from authUser:", fullAvatarUrl);
            localStorage.setItem('userAvatar', fullAvatarUrl);
            avatarInitializedRef.current = true;
            return fullAvatarUrl;
          }
          return currentAvatar;
        });
      } else if (!avatarInitializedRef.current) {
        // Если в authUser нет аватарки и мы еще не инициализировали аватарку, проверяем localStorage
        if (savedAvatar) {
          console.log("✅ Using saved avatar from localStorage:", savedAvatar);
          setAvatar(savedAvatar);
          avatarInitializedRef.current = true;
        } else {
          console.log("⚠️ No avatar in authUser or localStorage, setting to null");
          setAvatar(null);
          avatarInitializedRef.current = true;
        }
      } else {
        // Если уже инициализировано, но нет аватарки в authUser, проверяем localStorage
        if (savedAvatar && !avatar) {
          console.log("✅ No avatar in authUser, restoring from localStorage:", savedAvatar);
          setAvatar(savedAvatar);
        } else if (!savedAvatar && !avatar) {
          console.log("⚠️ No avatar in authUser or localStorage, keeping null");
        } else {
          console.log("✅ Keeping current avatar:", avatar);
        }
      }
    } else if (!avatarInitializedRef.current) {
      // Если authUser еще не загружен, но есть сохраненная аватарка, используем ее
      if (savedAvatar) {
        console.log("✅ authUser not loaded yet, using saved avatar from localStorage:", savedAvatar);
        setAvatar(savedAvatar);
        avatarInitializedRef.current = true;
      } else {
        console.log("⚠️ authUser is null/undefined and no saved avatar");
        avatarInitializedRef.current = true;
      }
    }
  }, [authUser]);

  const handlePersonalChange = (field) => (e) => {
    setPersonalData((prev) => ({ ...prev, [field]: e.target.value }));
    // Очищаем ошибку при вводе
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

    // Валидация полей
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
    
    // Валидация телефона (если он указан)
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

      // Очищаем телефон от форматирования перед отправкой в формате E.164
      let cleanPhone = "";
      if (personalData.phone) {
        // Используем normalizePhone, который убирает пробелы, скобки, дефисы, но сохраняет +
        const normalized = normalizePhone(personalData.phone);
        // Если + уже есть, используем как есть, иначе добавляем
        cleanPhone = normalized.startsWith("+") ? normalized : `+${normalized}`;
      }
      
      const updateData = {
        profile: {
          first_name: personalData.firstName?.trim() || "",
          last_name: personalData.lastName?.trim() || "",
          ...(cleanPhone && { phone_number: cleanPhone }), // Отправляем только если есть значение
        },
        email: personalData.email?.trim() || "",
      };

      // console.log("▶ Saving personal data:", updateData);
      // console.log("▶ Clean phone:", cleanPhone);

      try {
        await apiWithAuth.patch("/users/update", updateData);

        setPersonalSuccess("Personal information saved successfully!");
        setTimeout(() => setPersonalSuccess(""), 3000);
        setIsEditingPersonal(false);
        
        // Обновляем профиль с сервера, чтобы получить актуальные данные
        await dispatch(fetchProfile());
      } catch (error) {
        // Если токен истек (401), пытаемся обновить его
        if (error.response?.status === 401) {
          // console.warn("⚠️ Token expired when saving personal info, attempting to refresh...");
          
          const refreshResult = await dispatch(refreshAccessToken());
          
          if (refreshAccessToken.fulfilled.match(refreshResult)) {
            // Токен обновлен, повторяем запрос с новым токеном
            // console.log("✅ Token refreshed, retrying save...");
            
            await apiWithAuth.patch("/users/update", updateData);

            setPersonalSuccess("Personal information saved successfully!");
            setTimeout(() => setPersonalSuccess(""), 3000);
            setIsEditingPersonal(false);
            
            // Обновляем профиль с сервера, чтобы получить актуальные данные
            await dispatch(fetchProfile());
          } else {
            // Не удалось обновить токен
            // console.warn("⚠️ Failed to refresh token", refreshResult);
            const errorPayload = refreshResult.payload || refreshResult.error;
            const isTokenExpired = errorPayload?.code === 'token_not_valid' || 
                                   errorPayload?.detail?.includes('expired') ||
                                   errorPayload?.detail?.includes('Token is expired');
            
            if (isTokenExpired) {
              // Refresh token истек - сессия закончилась
              setPersonalErrors({ 
                general: "Your session has expired. Please log out and log in again to continue." 
              });
            } else {
              // Другая ошибка при обновлении токена
              setPersonalErrors({ 
                general: "Failed to save. Please try again or refresh the page." 
              });
            }
          }
        } else {
          // Другие ошибки
          // console.error("Error saving personal info:", error);
          // console.error("Error response:", error.response?.data);
          // console.error("Error status:", error.response?.status);
          
          const errorData = error.response?.data;
          let errorMessage = "Failed to save personal information. Please try again.";
          
          if (errorData) {
            // Проверяем ошибки валидации от сервера
            if (errorData.profile) {
              // Если есть ошибки в profile, собираем их
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
      // console.error("Error saving personal info:", error);
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

    // Валидация zip_code перед отправкой
    const errors = {};
    if (addressData.house?.trim()) {
      const zipValue = addressData.house.trim();
      if (!patterns.zip.test(zipValue)) {
        errors.house = "Zip code format must be as follows: 12345, 12345-6789, K1A 0B1, SW1A 1AA, 75008, 01001";
      }
    }

    // Если есть ошибки валидации, показываем их и не отправляем запрос
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

      // Собираем данные профиля, исключая пустые значения
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

      // console.log("▶ Saving address:", updateData);

      try {
        await apiWithAuth.patch("/users/update", updateData);

        setAddressSuccess("Address saved successfully!");
        setTimeout(() => setAddressSuccess(""), 3000);
        setIsEditingAddress(false);
        
        // Обновляем профиль с сервера, чтобы получить актуальные данные
        await dispatch(fetchProfile());
      } catch (error) {
        // Если токен истек (401), пытаемся обновить его
        if (error.response?.status === 401) {
          // console.warn("⚠️ Token expired when saving address, attempting to refresh...");
          
          const refreshResult = await dispatch(refreshAccessToken());
          
          if (refreshAccessToken.fulfilled.match(refreshResult)) {
            // Токен обновлен, повторяем запрос с новым токеном
            // console.log("✅ Token refreshed, retrying save...");
            
            await apiWithAuth.patch("/users/update", updateData);

            setAddressSuccess("Address saved successfully!");
            setTimeout(() => setAddressSuccess(""), 3000);
            setIsEditingAddress(false);
            
            // Обновляем профиль с сервера, чтобы получить актуальные данные
            await dispatch(fetchProfile());
          } else {
            // Не удалось обновить токен
            // console.warn("⚠️ Failed to refresh token", refreshResult);
            const errorPayload = refreshResult.payload || refreshResult.error;
            const isTokenExpired = errorPayload?.code === 'token_not_valid' || 
                                   errorPayload?.detail?.includes('expired') ||
                                   errorPayload?.detail?.includes('Token is expired');
            
            if (isTokenExpired) {
              // Refresh token истек - сессия закончилась
              setAddressErrors({ 
                general: "Your session has expired. Please log out and log in again to continue." 
              });
            } else {
              // Другая ошибка при обновлении токена
              setAddressErrors({ 
                general: "Failed to save. Please try again or refresh the page." 
              });
            }
          }
        } else {
          // Другие ошибки
          // console.error("Error saving address:", error);
          // console.error("Error response:", error.response?.data);
          // console.error("Error status:", error.response?.status);
          
          // Показываем ошибку пользователю
          const errorData = error.response?.data;
          let errorMessage = "Failed to save address";
          
          if (errorData) {
            // Проверяем ошибки валидации от сервера
            if (errorData.profile) {
              // Если есть ошибки в profile, собираем их
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
      // console.error("Error saving address:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  // Обработка загрузки аватарки
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        setAvatarError('Please select an image file');
        return;
      }
      
      // Проверяем размер файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('Image size should be less than 5MB');
        return;
      }
      
      // Создаем временный URL для предпросмотра (будет использован в handleSaveAvatar)
      // Не устанавливаем здесь, чтобы не конфликтовать с логикой в handleSaveAvatar
      
      // Сразу сохраняем аватарку на сервер
      await handleSaveAvatar(file);
    }
  };

  // Сохранение аватарки на сервер
  const handleSaveAvatar = async (file = null) => {
    const fileToUpload = file || avatarFile;
    if (!fileToUpload) return;
    
    setAvatarLoading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", fileToUpload);
      
      try {
        console.log("📤 Uploading avatar:", {
          fileName: fileToUpload.name,
          fileSize: fileToUpload.size,
          fileType: fileToUpload.type
        });
        
        // Используем PUT /users/avatars для загрузки аватарки
        // apiWithAuth - это экземпляр axios, токен добавляется автоматически через интерцептор
        // Интерцептор автоматически обновит токен, если он истек (401)
        const response = await apiWithAuth.put("/users/avatars", formData, {
          headers: {
            'Content-Type': undefined, // Позволяем Axios установить правильный Content-Type автоматически
          },
        });

        console.log("✅ Avatar uploaded successfully:", response.data);
        console.log("✅ Response data profile:", response.data?.profile);
        console.log("✅ Response data full:", JSON.stringify(response.data, null, 2));
        console.log("✅ Response status:", response.status);
        console.log("✅ Response headers:", response.headers);

        // Проверяем, есть ли URL аватарки в ответе (различные возможные варианты)
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

        // Если URL относительный, формируем полный URL
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          avatarUrl = `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        }

        console.log("🔍 Extracted avatarUrl from response:", avatarUrl);

        // Используем временный URL для немедленного отображения
        const tempAvatarUrl = URL.createObjectURL(fileToUpload);
        console.log("✅ Using temporary avatar URL for preview:", tempAvatarUrl);
        setAvatar(tempAvatarUrl);
        
        if (avatarUrl) {
          console.log("✅ Setting avatar from response:", avatarUrl);
          // Сохраняем аватарку в localStorage для восстановления при обновлении страницы
          localStorage.setItem('userAvatar', avatarUrl);
          // Обновляем аватар в компоненте
          setAvatar(avatarUrl);
          // Освобождаем временный URL
          URL.revokeObjectURL(tempAvatarUrl);
          
          // Обновляем профиль с сервера, чтобы синхронизировать состояние
          // НЕ сбрасываем аватарку после fetchProfile, так как она уже установлена
          const profileResult = await dispatch(fetchProfile());
          console.log("✅ Profile fetched after avatar upload:", profileResult.payload);
          
          // Проверяем, есть ли аватарка в обновленном профиле, и обновляем только если нужно
          const profileAvatar = profileResult.payload?.user?.avatar || 
                               profileResult.payload?.user?.profile?.avatar ||
                               profileResult.payload?.profile?.avatar ||
                               profileResult.payload?.avatar;
          
          console.log("🔍 Checking profile avatar:", {
            profileResultPayload: profileResult.payload,
            userAvatar: profileResult.payload?.user?.avatar,
            userProfileAvatar: profileResult.payload?.user?.profile?.avatar,
            profileAvatar: profileResult.payload?.profile?.avatar,
            payloadAvatar: profileResult.payload?.avatar,
            profileAvatar
          });
          
          if (profileAvatar && profileAvatar !== avatarUrl) {
            console.log("✅ Updating avatar from profile:", profileAvatar);
            const fullAvatarUrl = profileAvatar.startsWith('http') ? profileAvatar : `https://onlinestore-928b.onrender.com${profileAvatar.startsWith('/') ? '' : '/'}${profileAvatar}`;
            setAvatar(fullAvatarUrl);
            localStorage.setItem('userAvatar', fullAvatarUrl);
          } else if (profileAvatar) {
            console.log("✅ Avatar already set, keeping current:", avatarUrl);
          } else {
            // Если API не вернул аватар в профиле, но мы его загрузили, сохраняем текущий URL
            console.log("⚠️ No avatar in profile result, keeping current from upload:", avatarUrl);
            // Убеждаемся, что аватар сохранен в localStorage
            if (avatarUrl) {
              localStorage.setItem('userAvatar', avatarUrl);
              console.log("💾 Avatar saved to localStorage (from upload response):", avatarUrl);
            }
          }
        } else {
          console.log("⚠️ No avatar URL in response, trying to get user ID and fetch via /users/list/{id}/...");
          
          // Пытаемся получить ID пользователя из текущего профиля
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
                console.log("✅ Avatar found via /users/list/{id}/:", fullListAvatarUrl);
                setAvatar(fullListAvatarUrl);
                localStorage.setItem('userAvatar', fullListAvatarUrl);
                console.log("💾 Avatar saved to localStorage (from /users/list/{id}/):", fullListAvatarUrl);
                URL.revokeObjectURL(tempAvatarUrl);
                
                // Обновляем профиль
                await dispatch(fetchProfile());
                return;
              }
            } catch (listError) {
              console.log("⚠️ Error fetching user by ID:", listError.response?.status, listError.message);
            }
          }
          
          // Если не получилось через /users/list/{id}/, пробуем через fetchProfile
          console.log("⚠️ No avatar URL in response, fetching from profile...");
          const profileResult = await dispatch(fetchProfile());
          console.log("✅ Profile fetched after avatar upload:", profileResult.payload);
          
          // Проверяем аватарку в обновленном профиле
          const updatedAvatar = profileResult.payload?.user?.avatar || 
                               profileResult.payload?.user?.profile?.avatar ||
                               profileResult.payload?.profile?.avatar ||
                               profileResult.payload?.avatar;
          
          if (updatedAvatar) {
            console.log("✅ Setting avatar from fetched profile:", updatedAvatar);
            // Если URL относительный, делаем его абсолютным
            const fullAvatarUrl = updatedAvatar.startsWith('http') ? updatedAvatar : `https://onlinestore-928b.onrender.com${updatedAvatar.startsWith('/') ? '' : '/'}${updatedAvatar}`;
            setAvatar(fullAvatarUrl);
            localStorage.setItem('userAvatar', fullAvatarUrl);
            console.log("💾 Avatar saved to localStorage (from profile):", fullAvatarUrl);
            // Освобождаем временный URL
            URL.revokeObjectURL(tempAvatarUrl);
          } else {
            // Если сервер не вернул URL, оставляем временный URL для предпросмотра
            // Временный URL будет работать до перезагрузки страницы
            console.log("⚠️ Server did not return avatar URL in profile, using temporary preview URL");
            console.log("⚠️ Temporary URL will work until page reload.");
            console.log("⚠️ Note: The server successfully received the avatar file, but did not return its URL.");
            console.log("⚠️ The avatar may be available after page refresh, or the backend may need to be configured to return the avatar URL.");
            
            // Сохраняем информацию о том, что аватарка была загружена
            // Это поможет при следующей загрузке страницы определить, что аватарка должна быть
            localStorage.setItem('avatarUploaded', 'true');
            localStorage.setItem('avatarUploadTime', Date.now().toString());
          }
        }
        
        setAvatarFile(null);
        setAvatarError("");
        // Аватарка сохранена автоматически
      } catch (error) {
        console.error("❌ Error saving avatar:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        
        // Проверяем, не истек ли refresh token (интерцептор уже пытался обновить токен)
        const errorData = error.response?.data;
        const isRefreshTokenExpired = errorData?.code === 'token_not_valid' || 
                                     errorData?.detail?.includes('expired') ||
                                     errorData?.detail?.includes('Token is expired');
        
        // Если токен истек (401), пытаемся обновить его вручную
        if (error.response?.status === 401 && !isRefreshTokenExpired) {
          console.warn("⚠️ Token expired when saving avatar, attempting to refresh...");
          
          const refreshResult = await dispatch(refreshAccessToken());
          
          if (refreshAccessToken.fulfilled.match(refreshResult)) {
            console.log("✅ Token refreshed, retrying avatar upload...");
            // Используем PUT /users/avatars для загрузки аватарки
            // apiWithAuth - это экземпляр axios, токен обновляется автоматически через интерцептор
            // Интерцептор автоматически использует новый токен
            try {
              await apiWithAuth.put("/users/avatars", formData, {
                headers: {
                  'Content-Type': undefined, // Позволяем Axios установить правильный Content-Type автоматически
                },
              });

              await dispatch(fetchProfile());
              setAvatarFile(null);
              setAvatarError("");
              return;
            } catch (retryError) {
              console.error("❌ Error retrying avatar upload after token refresh:", retryError);
              setAvatarError("Failed to save avatar after token refresh. Please try again.");
            }
          } else {
            const errorPayload = refreshResult.payload || refreshResult.error;
            const isTokenExpired = errorPayload?.code === 'token_not_valid' || 
                                   errorPayload?.detail?.includes('expired') ||
                                   errorPayload?.detail?.includes('Token is expired');
            
            if (isTokenExpired) {
              setAvatarError("Your session has expired. Please log out and log in again to continue.");
            } else {
              setAvatarError("Failed to save avatar. Please try again or refresh the page.");
            }
          }
        } else if (isRefreshTokenExpired || error.response?.status === 401) {
          // Если refresh token тоже истек, предлагаем перелогиниться
          setAvatarError("Your session has expired. Please log out and log in again to continue.");
        } else {
          console.error("Error saving avatar:", error);
          console.error("Error response:", error.response?.data);
          console.error("Error status:", error.response?.status);
          
          // Формируем понятное сообщение об ошибке
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
    avatar: avatar, // null если нет загруженной аватарки
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

  // Стили для disabled полей, чтобы текст был видимым, сохраняя дизайн из inputStyles
  // Переопределяем только цвет текста в disabled состоянии, сохраняя все остальные стили
  const disabledInputStyles = {
    ...inputStyles,
    // Переопределяем только disabled стили для видимости текста
    '& .MuiOutlinedInput-root.Mui-disabled': {
      color: '#000', // Черный текст вместо серого (#999999)
      backgroundColor: 'transparent', // Прозрачный фон вместо серого (#f5f5f5)
      '& .MuiOutlinedInput-notchedOutline': {
        backgroundColor: 'transparent', // Прозрачный фон для border
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

  // Отладочный лог перед рендером
  // console.log("MyAccountAdmin - Render - authUser:", authUser);
  // console.log("MyAccountAdmin - Render - personalData:", personalData);
  // console.log("MyAccountAdmin - Render - personalData.firstName:", personalData?.firstName);
  // console.log("MyAccountAdmin - Render - personalData.lastName:", personalData?.lastName);
  // console.log("MyAccountAdmin - Render - personalData.email:", personalData?.email);
  // console.log("MyAccountAdmin - Render - personalData.phone:", personalData?.phone);
  // console.log("MyAccountAdmin - Render - isEditingPersonal:", isEditingPersonal);
  // console.log("MyAccountAdmin - Render - addressData:", addressData);
  // console.log("MyAccountAdmin - Render - isEditingAddress:", isEditingAddress);

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 3 }, boxSizing: "border-box" }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <AdminBreadcrumbs />
      </Box>

      {}
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 }, borderRadius:"24px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
          <Box sx={{ position: "relative", display: "inline-block" }}>
            {user.avatar ? (
              <Box 
                component="img" 
                src={user.avatar} 
                alt="Avatar" 
                sx={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: '#A4795B',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 600,
                }}
              >
                {userInitials}
              </Avatar>
            )}
            <IconButton
              sx={{
                position: "absolute",
                top: 0,
                right: -8,
                backgroundColor: "#16675C",
                color: "white",
                width: 28,
                height: 28,
                padding: 0,
                zIndex: 10,
                "&:hover": {
                  backgroundColor: "#02715C",
                },
              }}
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
            <input
              type="file"
              id="avatar-upload"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </Box>
          <Box 
            component={RouterLink} 
            to="/admin/account" 
            sx={{ display: "flex", flexDirection: "column", flex: 1, textDecoration: "none", color: "inherit", cursor: "pointer", "&:hover": { opacity: 0.8 } }}
          >
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

      {}
      <Paper sx={{ ...paperStyle(isEditingPersonal), width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap" gap={1}>
            <Typography sx={{ ...h4, fontSize: { xs: '16px', md: '18px' } }}>Personal Information</Typography>
            <Button 
              variant="contained" 
              size="small" 
              endIcon={!isEditingPersonal ? <EditIcon /> : null} 
              sx={{ ...btnCart, fontSize: { xs: '12px', md: '14px' } }} 
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
                  
                  // Сохраняем количество цифр до курсора
                  const digitsBeforeCursor = inputValue.slice(0, cursorPosition).replace(/\D/g, '').length;
                  
                  // Форматируем телефон при вводе
                  const formatted = formatPhone(inputValue);
                  
                  // Очищаем ошибку при вводе
                  if (personalErrors.phone) {
                    setPersonalErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                  
                  // Обновляем состояние
                  setPersonalData((prev) => ({ ...prev, phone: formatted }));
                  
                  // Восстанавливаем позицию курсора после форматирования
                  requestAnimationFrame(() => {
                    if (phoneInputRef.current) {
                      // Подсчитываем позицию курсора в отформатированном значении
                      let newCursorPosition = 0;
                      let digitCount = 0;
                      
                      // Находим позицию, где должно быть курсор на основе количества цифр
                      for (let i = 0; i < formatted.length; i++) {
                        if (/\d/.test(formatted[i])) {
                          digitCount++;
                          if (digitCount === digitsBeforeCursor) {
                            newCursorPosition = i + 1;
                            break;
                          }
                        }
                        // Если это последняя цифра, ставим курсор после неё
                        if (digitCount < digitsBeforeCursor && i === formatted.length - 1) {
                          newCursorPosition = formatted.length;
                        }
                      }
                      
                      // Если курсор был в начале или не найдена позиция, ставим после последней цифры
                      if (newCursorPosition === 0 && formatted.length > 0) {
                        newCursorPosition = formatted.length;
                      }
                      
                      phoneInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
                    }
                  });
                } : undefined}
                onBlur={isEditingPersonal ? (e) => {
                  // При потере фокуса убеждаемся, что формат правильный
                  const formatted = formatPhone(e.target.value);
                  if (formatted !== personalData.phone) {
                    setPersonalData((prev) => ({ ...prev, phone: formatted }));
                  }
                  // Валидация при потере фокуса (только если поле не пустое)
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

      {}
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
                  // Очищаем ошибку при вводе
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


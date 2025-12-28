import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { apiWithAuth } from "../api/axios";
import { clearFavorites } from './favoritesSlice';
import { clearCart } from './cartSlice';
import { clearBasket } from './basketSlice';

// Список админских email (можно расширить)
const ADMIN_EMAILS = [
  'admin@coffeelane.com',
  'admin@example.com',
  // Добавьте сюда другие админские email
];

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      // Логируем данные для отладки
      console.log("Registration data being sent:", JSON.stringify(data, null, 2));

      const res = await api.post("/users/registration", data);
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || err.message;
      console.error("Registration error:", errorData);
      console.error("Error status:", err.response?.status);
      console.error("Full error response:", JSON.stringify(err.response?.data, null, 2));

      // Если ошибка в формате {email: Array(1)}, преобразуем её в более читаемый формат
      if (errorData && typeof errorData === 'object') {
        const formattedError = {};
        Object.keys(errorData).forEach(key => {
          if (Array.isArray(errorData[key])) {
            formattedError[key] = errorData[key].join(' ');
          } else {
            formattedError[key] = errorData[key];
          }
        });
        return rejectWithValue(formattedError);
      }

      return rejectWithValue(errorData);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {

      const res = await api.post("/auth/login", { email, password });
      const { access, refresh } = res.data;

      if (!access) {
        return rejectWithValue("No access token received");
      }

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      const profileRes = await api.get("/users/info", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const profileData = profileRes.data;
      // console.log("▶ loginUser - profileData (FULL):", JSON.stringify(profileData, null, 2));
      // console.log("▶ loginUser - profileData.email:", profileData.email);
      // console.log("▶ loginUser - email from login param:", email);

      const userEmail = profileData.email || email;

      // console.log("▶ loginUser - final userEmail:", userEmail);

      // Проверяем, является ли пользователь админом по email
      const isAdminEmail = ADMIN_EMAILS.some(adminEmail =>
        userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()
      );

      // Проверяем аватарку в разных местах ответа API
      let avatarUrl = profileData.avatar || 
                       profileData.profile?.avatar || 
                       profileData.avatar_url ||
                       profileData.profile?.avatar_url ||
                       null;

      // Если аватарки нет в API ответе, проверяем localStorage (может быть сохранен с предыдущей сессии)
      if (!avatarUrl) {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
          console.log("💾 Avatar not in API response, using saved avatar from localStorage:", savedAvatar);
          avatarUrl = savedAvatar;
        }
      }

      // Формируем полный URL аватарки, если она есть
      let fullAvatarUrl = null;
      if (avatarUrl) {
        fullAvatarUrl = avatarUrl.startsWith('http') 
          ? avatarUrl 
          : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        // Сохраняем аватарку в localStorage при логине
        localStorage.setItem('userAvatar', fullAvatarUrl);
        console.log("💾 Avatar saved to localStorage on login:", fullAvatarUrl);
      }

      // profileData уже содержит все данные профиля, включая аватар
      const profileWithEmail = {
        ...profileData,
        email: userEmail,
        role: isAdminEmail ? 'admin' : undefined,
        avatar: fullAvatarUrl || avatarUrl
      };

      return {
        user: profileWithEmail,
        profile: profileWithEmail,
        token: access,
        email: userEmail,
        isAdmin: isAdminEmail
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const registerAndLoginUser = createAsyncThunk(
  "auth/registerAndLogin",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      // console.log("🔹 Register + Login start");

      const registerResult = await dispatch(registerUser(data));
      if (registerResult.meta.requestStatus !== "fulfilled") {
        return rejectWithValue(registerResult.payload);
      }

      await new Promise(res => setTimeout(res, 200));

      const loginResult = await dispatch(
        loginUser({ email: data.email, password: data.password })
      );

      if (loginResult.meta.requestStatus !== "fulfilled") {
        return rejectWithValue(loginResult.payload);
      }

      // console.log("✅ Register + Login successful:", loginResult.payload);

      return loginResult.payload;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async ({ email, token }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth_google/callback", { email, token });

      const userEmail = res.data.email || email;
      const isAdminEmail = ADMIN_EMAILS.some(adminEmail =>
        userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()
      );

      return {
        user: {
          email: userEmail,
          role: isAdminEmail ? 'admin' : undefined
        },
        access: res.data.access,
        refresh: res.data.refresh,
        isAdmin: isAdminEmail
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// Обновление access token через refresh token
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        return rejectWithValue("No refresh token");
      }

      const res = await api.post("/auth/refresh", {
        refresh: refreshToken.replace(/^"|"$/g, ""),
      });

      const { access, refresh: newRefresh } = res.data;

      if (access) {
        localStorage.setItem("access", access);
        if (newRefresh) {
          localStorage.setItem("refresh", newRefresh);
        }
        return { access, refresh: newRefresh };
      }

      return rejectWithValue("No access token in refresh response");
    } catch (err) {
      // Если refresh token тоже истек, НЕ очищаем токены
      // Пользователь остается залогиненным, токены могут быть обновлены позже
      // localStorage.removeItem("access");
      // localStorage.removeItem("refresh");
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      // ИСПРАВЛЕНО: apiWithAuth БЕЗ скобок, так как это экспорт из axios.js
      const res = await apiWithAuth.get("/users/info");
      
      console.log("🔍 fetchProfile API response:", {
        data: res.data,
        avatar: res.data.avatar,
        profileAvatar: res.data.profile?.avatar,
        profile: res.data.profile,
        fullData: JSON.stringify(res.data, null, 2)
      });
      
      const userEmail = res.data.email;
      const userId = res.data.profile?.id || res.data.id || res.data.profile_id;
      const isAdminEmail = userEmail ? ADMIN_EMAILS.some(adminEmail =>
        userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()
      ) : false;

      // Проверяем аватарку в разных местах ответа API
      let avatarUrl = res.data.avatar || 
                       res.data.profile?.avatar || 
                       res.data.avatar_url ||
                       res.data.profile?.avatar_url ||
                       null;

      // Если аватарки нет в ответе API, пробуем получить по ID пользователя через /users/list/{id}/
      // Но только если эндпоинт доступен (не все API поддерживают этот эндпоинт)
      if (!avatarUrl && userId) {
        try {
          console.log("🔍 Avatar not in /users/info, trying /users/list/{id}/ for userId:", userId);
          const userListRes = await apiWithAuth.get(`/users/list/${userId}/`);
          console.log("🔍 User list response:", userListRes.data);
          
          avatarUrl = userListRes.data?.avatar || 
                       userListRes.data?.profile?.avatar || 
                       userListRes.data?.avatar_url ||
                       userListRes.data?.profile?.avatar_url ||
                       null;
          
          if (avatarUrl) {
            console.log("✅ Avatar found via /users/list/{id}/:", avatarUrl);
          }
        } catch (listError) {
          // Эндпоинт может быть недоступен (404) или требовать других прав
          console.log("⚠️ Error fetching user by ID:", listError.response?.status, listError.message);
          console.log("⚠️ Endpoint /users/list/{id}/ may not be available, continuing with localStorage check");
          // Игнорируем ошибку и продолжаем с localStorage
        }
      }

      // Если аватарки нет в ответе API, проверяем localStorage
      // (возможно, аватар был загружен ранее, но API не возвращает его)
      if (!avatarUrl) {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
          console.log("💾 Avatar not in API response, using saved avatar from localStorage:", savedAvatar);
          avatarUrl = savedAvatar;
        }
      }

      // Формируем полный URL аватарки, если она есть
      let fullAvatarUrl = null;
      if (avatarUrl) {
        fullAvatarUrl = avatarUrl.startsWith('http') 
          ? avatarUrl 
          : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        // Сохраняем аватарку в localStorage
        localStorage.setItem('userAvatar', fullAvatarUrl);
        console.log("💾 Avatar saved to localStorage:", fullAvatarUrl);
      } else {
        // Если аватарки нет в API ответе, проверяем localStorage
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
          console.log("💾 Using saved avatar from localStorage (API returned null):", savedAvatar);
          fullAvatarUrl = savedAvatar;
          // Убеждаемся, что аватар сохранен в localStorage
          localStorage.setItem('userAvatar', savedAvatar);
        } else {
          // НЕ удаляем из localStorage, если аватар был загружен ранее
          // Проверяем флаг загрузки
          const avatarUploaded = localStorage.getItem('avatarUploaded');
          if (avatarUploaded === 'true') {
            console.log("⚠️ Avatar was uploaded but not found in API response or localStorage");
            console.log("⚠️ Avatar may need to be re-uploaded or backend needs to return avatar URL");
          } else {
            // Если аватарки никогда не было, удаляем из localStorage
            localStorage.removeItem('userAvatar');
            console.log("⚠️ No avatar in API response or localStorage");
          }
        }
      }

      // Используем fullAvatarUrl, если он есть (из API или localStorage)
      const finalAvatarUrl = fullAvatarUrl || null;
      
      const profileData = res.data.profile ? {
        ...res.data.profile,
        email: userEmail,
        role: isAdminEmail ? 'admin' : undefined,
        avatar: finalAvatarUrl
      } : {
        ...res.data,
        email: userEmail,
        role: isAdminEmail ? 'admin' : undefined,
        avatar: finalAvatarUrl
      };

      console.log("✅ fetchProfile returning:", {
        user: profileData,
        avatar: profileData.avatar
      });

      return {
        user: profileData,
        profile: profileData,
        email: userEmail,
        isAdmin: isAdminEmail
      };
    } catch (err) {
      // Если запрос упал даже после попытки интерцептора обновить токен
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {

    try {
      // Пытаемся вызвать logout на сервере, но игнорируем ошибки
      // (токен может быть уже истек, но logout все равно должен работать)
      try {
        await apiWithAuth.post("/auth/logout");
      } catch (logoutError) {
        // Игнорируем ошибки logout (400, 401, 404 и т.д.)
        // Пользователь все равно должен быть разлогинен локально
        // console.log("Logout API error (ignored):", logoutError.response?.status);
      }

      // Очищаем корзину при разлогинивании
      dispatch(clearCart());
      try {
        await dispatch(clearBasket());
      } catch (basketError) {
        // Игнорируем ошибки очистки корзины при logout
      }

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("persist:auth");
      // НЕ удаляем userAvatar - он должен сохраняться между сессиями
      // localStorage.removeItem("userAvatar");
      dispatch(clearFavorites());
      dispatch(clearAuthState());

      return {};
    } catch (err) {
      // Очищаем корзину даже при ошибке logout
      dispatch(clearCart());
      try {
        await dispatch(clearBasket());
      } catch (basketError) {
        // Игнорируем ошибки
      }

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("persist:auth");
      dispatch(clearAuthState());
      dispatch(clearFavorites());
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const payload = {
        old_password: oldPassword,
        new_password: newPassword
      };

      const res = await apiWithAuth.put("/auth/change_password", payload);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("access") || null,
    user: null,
    profile: null,
    email: null, // Сохраняем email отдельно
    loading: false,
    error: null,
    tokenInvalid: false, // Флаг для отслеживания невалидного токена
    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordSuccess: false,
    // Проверяем isAdmin из localStorage, но также проверяем роль пользователя из persist
    isAdmin: (() => {
      const storedIsAdmin = localStorage.getItem("isAdmin");
      if (storedIsAdmin === "true") return true;
      if (storedIsAdmin === "false") return false;
      // Если в localStorage нет значения, проверяем persist:auth
      try {
        const persistAuth = localStorage.getItem("persist:auth");
        if (persistAuth) {
          const parsed = JSON.parse(persistAuth);
          if (parsed.profile) {
            const profile = JSON.parse(parsed.profile);
            if (profile?.role === 'admin' || profile?.role === 'Administrator') {
              return true;
            }
          }
        }
      } catch (e) {
        console.warn("Error parsing persist:auth:", e);
      }
      return false;
    })(),
  },
  reducers: {
    clearAuthState: (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.email = null;
      state.error = null;
      state.loading = false;
      state.tokenInvalid = false;
      state.changePasswordLoading = false;
      state.changePasswordError = null;
      state.changePasswordSuccess = false;
      state.isAdmin = false;
      localStorage.removeItem("isAdmin");
    },
    clearChangePasswordSuccess: (state) => {
      state.changePasswordSuccess = false;
    },
    tokenRefreshedFromInterceptor: (state, action) => {
      state.token = action.payload.access;
      state.tokenInvalid = false;
    },
    setAdminMode: (state, action) => {
      state.isAdmin = action.payload;
      if (action.payload) {
        localStorage.setItem("isAdmin", "true");
        // Устанавливаем роль в user объекте для совместимости
        if (state.user) {
          state.user.role = "admin";
        }
      } else {
        localStorage.removeItem("isAdmin");
        if (state.user && state.user.role === "admin") {
          delete state.user.role;
        }
      }
    },
    // Внутри authSlice.js
    setTokens: (state, action) => {
      state.token = action.payload.access;
      // если хранишь refresh в сторе, то и его:
      // state.refreshToken = action.payload.refresh;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerAndLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAndLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.tokenInvalid = false; // Сбрасываем флаг при успешной регистрации
      })
      .addCase(registerAndLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;      // user для Header
        state.profile = action.payload.profile; // если тебе нужен profile отдельно
        state.token = action.payload.token || null; // если есть токен
        state.email = action.payload.email || null; // сохраняем email
        state.tokenInvalid = false; // Сбрасываем флаг при успешном логине
        
        // Сохраняем аватар в localStorage, если он есть в user
        if (action.payload.user?.avatar) {
          localStorage.setItem('userAvatar', action.payload.user.avatar);
          console.log("💾 Avatar saved to localStorage in loginUser.fulfilled:", action.payload.user.avatar);
        }
        
        // Устанавливаем флаг админа из payload
        if (action.payload.isAdmin) {
          state.isAdmin = true;
          localStorage.setItem("isAdmin", "true");
          if (state.user) {
            state.user.role = "admin";
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = action.payload.access || null;
        state.email = action.payload.user?.email || null;
        state.tokenInvalid = false; // Сбрасываем флаг при успешном логине
        // Устанавливаем флаг админа из payload
        if (action.payload.isAdmin) {
          state.isAdmin = true;
          localStorage.setItem("isAdmin", "true");
          if (state.user) {
            state.user.role = "admin";
          }
        }
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.token = null;
        state.email = null;
        state.tokenInvalid = false;
        state.isAdmin = false;
        state.favorites = [];
        state.toggling = {};
        state.loading = false;
        state.error = null;
        localStorage.removeItem("isAdmin");
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.profile = null;
        state.token = null;
        state.email = null;
        state.tokenInvalid = false;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.email = action.payload.email || null;
        state.loading = false;
        state.tokenInvalid = false; // Сбрасываем флаг при успешной загрузке
        
        console.log("🔄 fetchProfile.fulfilled - payload:", {
          userAvatar: action.payload.user?.avatar,
          profileAvatar: action.payload.profile?.avatar,
          user: action.payload.user,
          profile: action.payload.profile
        });
        
        // Сохраняем аватар в localStorage и убеждаемся, что он в user объекте
        const avatarUrl = action.payload.user?.avatar || action.payload.profile?.avatar;
        if (avatarUrl) {
          localStorage.setItem('userAvatar', avatarUrl);
          console.log("💾 Avatar saved to localStorage in fetchProfile.fulfilled:", avatarUrl);
          // Убеждаемся, что аватар есть в user объекте
          if (state.user) {
            state.user.avatar = avatarUrl;
          }
          if (state.profile) {
            state.profile.avatar = avatarUrl;
          }
        } else {
          // Если аватарки нет в payload, проверяем localStorage
          const savedAvatar = localStorage.getItem('userAvatar');
          if (savedAvatar) {
            console.log("💾 Using saved avatar from localStorage in fetchProfile.fulfilled:", savedAvatar);
            if (state.user) {
              state.user.avatar = savedAvatar;
            }
            if (state.profile) {
              state.profile.avatar = savedAvatar;
            }
          } else {
            // НЕ удаляем из localStorage, если аватар был загружен ранее
            // Проверяем флаг загрузки
            const avatarUploaded = localStorage.getItem('avatarUploaded');
            if (avatarUploaded === 'true') {
              console.log("⚠️ Avatar was uploaded but not found in payload or localStorage");
              console.log("⚠️ Avatar may need to be re-uploaded");
            } else {
              // Если аватарки никогда не было, удаляем из localStorage
              localStorage.removeItem('userAvatar');
              console.log("⚠️ No avatar in payload or localStorage, removed from localStorage");
            }
          }
        }
        
        // Устанавливаем флаг админа из payload
        if (action.payload.isAdmin) {
          state.isAdmin = true;
          localStorage.setItem("isAdmin", "true");
          if (state.user) {
            state.user.role = "admin";
          }
        }
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.access;
        state.tokenInvalid = false; // Сбрасываем флаг при успешном обновлении
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // Если refresh token истек, помечаем токен как невалидный
        // Но НЕ очищаем данные пользователя - пользователь остается залогиненным
        state.tokenInvalid = true;
        // Не очищаем токены из localStorage, чтобы можно было попробовать обновить позже
        // localStorage.removeItem("access");
        // localStorage.removeItem("refresh");
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;

        // Если токен невалиден (401), помечаем токен как невалидный
        // Но НЕ очищаем данные пользователя - пользователь остается залогиненным
        // Токен будет автоматически обновляться при следующем запросе через refresh token
        if (action.payload?.code === "token_not_valid" || action.payload?.silent) {
          // Помечаем токен как невалидный, но сохраняем данные пользователя
          state.tokenInvalid = true;
          // НЕ очищаем user, profile, email - пользователь остается залогиненным
          // НЕ очищаем isAdmin - флаг админа сохраняется
          // Не сохраняем ошибку, если это тихая ошибка (истекший токен)
        } else {
          // Для других ошибок сохраняем сообщение об ошибке
          state.error = action.payload;
          state.tokenInvalid = false; // Сбрасываем флаг для других ошибок
        }
      },
      )
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
        state.changePasswordError = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordLoading = false;
        state.changePasswordSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordError = action.payload;
      });
  },
});

export const { clearAuthState, clearChangePasswordSuccess, setAdminMode, tokenRefreshedFromInterceptor, setTokens } = authSlice.actions;
export default authSlice.reducer;


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { apiWithAuth } from "../api/axios";
import { clearFavorites } from './favoritesSlice';
import { clearCart } from './cartSlice';
import { clearBasket, clearBasketState } from './basketSlice';


const ADMIN_EMAILS = [
  'admin@coffeelane.com',
  'admin@example.com',
];

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      // console.log("Registration data being sent:", JSON.stringify(data, null, 2));
      const res = await api.post("/users/registration", data);
      return res.data;
    } catch (err) {
      const errorData = err.response?.data || err.message;
      console.error("Registration error:", errorData);
      console.error("Error status:", err.response?.status);
      console.error("Full error response:", JSON.stringify(err.response?.data, null, 2));

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
      console.log("▶ loginUser - profileData (FULL):", JSON.stringify(profileData, null, 2));
      console.log("▶ loginUser - profileData.email:", profileData.email);
      console.log("▶ loginUser - email from login param:", email);

      const userEmail = profileData.email || email;

      console.log("▶ loginUser - final userEmail:", userEmail);

      const isAdminEmail = ADMIN_EMAILS.some(adminEmail =>
        userEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()
      );

      let avatarUrl = profileData.avatar ||
        profileData.profile?.avatar ||
        profileData.avatar_url ||
        profileData.profile?.avatar_url ||
        null;

      if (!avatarUrl) {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
          console.log("💾 Avatar not in API response, using saved avatar from localStorage:", savedAvatar);
          avatarUrl = savedAvatar;
        }
      }

      let fullAvatarUrl = null;
      if (avatarUrl) {
        fullAvatarUrl = avatarUrl.startsWith('http')
          ? avatarUrl
          : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        localStorage.setItem('userAvatar', fullAvatarUrl);
        console.log("💾 Avatar saved to localStorage on login:", fullAvatarUrl);
      }

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
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
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

      let avatarUrl = res.data.avatar ||
        res.data.profile?.avatar ||
        res.data.avatar_url ||
        res.data.profile?.avatar_url ||
        null;

      // Если аватарки нет в ответе API, пробуем получить по ID пользователя через /users/list/{id}/
      // Но только если эндпоинт доступен (не все API поддерживают этот эндпоинт)
      // if (!avatarUrl && userId) {
      //   try {
      //     console.log("🔍 Avatar not in /users/info, trying /users/list/{id}/ for userId:", userId);
      //     const userListRes = await apiWithAuth.get(`/users/list/${userId}/`);
      //     console.log("🔍 User list response:", userListRes.data);

      //     avatarUrl = userListRes.data?.avatar || 
      //                  userListRes.data?.profile?.avatar || 
      //                  userListRes.data?.avatar_url ||
      //                  userListRes.data?.profile?.avatar_url ||
      //                  null;

      //     if (avatarUrl) {
      //       console.log("✅ Avatar found via /users/list/{id}/:", avatarUrl);
      //     }
      //   } catch (listError) {
      //     // Эндпоинт может быть недоступен (404) или требовать других прав
      //     console.log("⚠️ Error fetching user by ID:", listError.response?.status, listError.message);
      //     console.log("⚠️ Endpoint /users/list/{id}/ may not be available, continuing with localStorage check");
      //     // Игнорируем ошибку и продолжаем с localStorage
      //   }
      // }

      if (!avatarUrl) {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
          // console.log("💾 Avatar not in API response, using saved avatar from localStorage:", savedAvatar);
          avatarUrl = savedAvatar;
        }
      }

      let fullAvatarUrl = null;
      if (avatarUrl) {
        fullAvatarUrl = avatarUrl.startsWith('http')
          ? avatarUrl
          : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        localStorage.setItem('userAvatar', fullAvatarUrl);
        console.log("💾 Avatar saved to localStorage:", fullAvatarUrl);
      } else {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
          console.log("💾 Using saved avatar from localStorage (API returned null):", savedAvatar);
          fullAvatarUrl = savedAvatar;
          localStorage.setItem('userAvatar', savedAvatar);
        } else {
          const avatarUploaded = localStorage.getItem('avatarUploaded');
          if (avatarUploaded === 'true') {
            // console.log("⚠️ Avatar was uploaded but not found in API response or localStorage");
            // console.log("⚠️ Avatar may need to be re-uploaded or backend needs to return avatar URL");
          } else {
            localStorage.removeItem('userAvatar');
            // console.log("⚠️ No avatar in API response or localStorage");
          }
        }
      }
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

      // console.log("✅ fetchProfile returning:", {
      //   user: profileData,
      //   avatar: profileData.avatar
      // });

      return {
        user: profileData,
        profile: profileData,
        email: userEmail,
        isAdmin: isAdminEmail
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    // 1. Достаем токен и ОЧЕНЬ тщательно чистим его
    const rawRefresh = localStorage.getItem("refresh");

    // Если токена нет совсем, просто чистим локально и выходим
    if (!rawRefresh) {
      dispatch(clearAuthState());
      dispatch(clearCart());
      dispatch(clearFavorites());
      dispatch(clearBasketState());
      return;
    }

    const cleanRefresh = rawRefresh.replace(/^"+|"+$/g, "");

    try {
      // 2. Пытаемся уведомить сервер
      await apiWithAuth.post("/auth/logout", { refresh: cleanRefresh });
    } catch (serverError) {
      // Если 400 или 401 — серверу этот токен уже не важен
      console.warn("Server-side logout failed, proceeding with local cleanup", serverError.response?.data);
    } finally {
      // 3. САМОЕ ВАЖНОЕ: Что бы ни случилось на сервере, чистим браузер
      localStorage.clear(); // Удаляет всё: access, refresh, isAdmin, userAvatar

      dispatch(clearAuthState());
      dispatch(clearCart());
      dispatch(clearFavorites());
      dispatch(clearBasketState());

      // Перенаправление на главную (опционально, если не срабатывает автоматически)
      window.location.href = '/';
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue, getState }) => {
    try {
      // 1. Берем самый актуальный токен прямо из стейта перед запросом
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("access")?.replace(/^"+|"+$/g, "");

      const payload = {
        old_password: oldPassword,
        new_password: newPassword
      };

      // 2. Явно передаем заголовки, если apiWithAuth иногда их "теряет"
      const res = await apiWithAuth.put("/auth/change_password", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return res.data;
    } catch (err) {
      // Если сервер вернул 401 даже с токеном, возможно, нужно разлогинить пользователя
      if (err.response?.status === 401) {
        // Опционально: dispatch(logoutUser());
        return rejectWithValue("Сессия истекла. Пожалуйста, войдите снова.");
      }
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("access")?.replace(/^"+|"+$/g, "") || null,
    user: null,
    profile: null,
    email: null,
    loading: false,
    error: null,
    tokenInvalid: false,
    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordSuccess: false,
    isAdmin: (() => {
      const storedIsAdmin = localStorage.getItem("isAdmin");
      return storedIsAdmin === "true";
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
      state.isAdmin = false;
      localStorage.removeItem("isAdmin");
    },
    clearChangePasswordSuccess: (state) => {
      state.changePasswordSuccess = false;
    },
    tokenRefreshedFromInterceptor: (state, action) => {
      state.token = action.payload.access?.replace(/^"+|"+$/g, "");
      state.tokenInvalid = false;
    },
    setAdminMode: (state, action) => {
      if (state.isAdmin === action.payload) return;
      state.isAdmin = action.payload;
      if (action.payload) {
        localStorage.setItem("isAdmin", "true");
      } else {
        localStorage.removeItem("isAdmin");
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER + LOGIN
      .addCase(registerAndLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAndLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.token = action.payload.token?.replace(/^"+|"+$/g, "");
        state.tokenInvalid = false;
      })

      // LOGIN USER (ОБЪЕДИНЕННЫЙ И ИСПРАВЛЕННЫЙ)
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
       // 1. Очищуємо токени від лапок ПЕРЕД збереженням
      const cleanAccess = action.payload.token?.replace(/^"+|"+$/g, "");
      // Якщо refresh приходить окремо (залежить від вашого API)
      const cleanRefresh = action.payload.refresh?.replace(/^"+|"+$/g, "");

      state.token = cleanAccess;
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.email = action.payload.email || null;
      state.tokenInvalid = false;

      // 2. Зберігаємо чисті рядки в localStorage
      if (cleanAccess) localStorage.setItem("access", cleanAccess);
      if (cleanRefresh) localStorage.setItem("refresh", cleanRefresh);
      
      if (action.payload.user?.avatar) {
        localStorage.setItem('userAvatar', action.payload.user.avatar);
      }
      
      if (action.payload.isAdmin) {
        state.isAdmin = true;
        localStorage.setItem("isAdmin", "true");
      }
    })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH PROFILE
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.email = action.payload.email || null;
        state.tokenInvalid = false;
        state.user.avatar && localStorage.setItem('userAvatar', state.user.avatar);

        if (action.payload.isAdmin) {
          state.isAdmin = true;
          localStorage.setItem("isAdmin", "true");
        }
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        // Полный сброс стейта при успешном выходе
        return {
          ...authSlice.getInitialState(),
          token: null,
          isAdmin: false
        };
      })

      // REFRESH TOKEN
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        const cleanAccess = action.payload.access?.replace(/^"+|"+$/g, "");
        const cleanRefresh = action.payload.refresh?.replace(/^"+|"+$/g, "");
        state.token = cleanAccess;
        state.tokenInvalid = false;

        if (cleanAccess) localStorage.setItem("access", cleanAccess);
        if (cleanRefresh) localStorage.setItem("refresh", cleanRefresh);
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.tokenInvalid = true;
      })

      // CHANGE PASSWORD
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

export const { clearAuthState, clearChangePasswordSuccess, setAdminMode, tokenRefreshedFromInterceptor } = authSlice.actions;
export default authSlice.reducer;

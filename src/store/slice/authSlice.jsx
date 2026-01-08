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
      const userEmail = profileData.email || email;
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
          avatarUrl = savedAvatar;
        }
      }

      let fullAvatarUrl = null;
      if (avatarUrl) {
        fullAvatarUrl = avatarUrl.startsWith('http')
          ? avatarUrl
          : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        localStorage.setItem('userAvatar', fullAvatarUrl);
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


export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiWithAuth.get("/users/info");
      // console.log("🔍 fetchProfile API response:", {
      //   data: res.data,
      //   avatar: res.data.avatar,
      //   profileAvatar: res.data.profile?.avatar,
      //   profile: res.data.profile,
      //   fullData: JSON.stringify(res.data, null, 2)
      // });

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

      // аватаркa пользователя через /users/list/{id}/
    
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
          avatarUrl = savedAvatar;
        }
      }

      let fullAvatarUrl = null;
      if (avatarUrl) {
        fullAvatarUrl = avatarUrl.startsWith('http')
          ? avatarUrl
          : `https://onlinestore-928b.onrender.com${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
        localStorage.setItem('userAvatar', fullAvatarUrl);
      } else {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
          fullAvatarUrl = savedAvatar;
          localStorage.setItem('userAvatar', savedAvatar);
        } else {
          const avatarUploaded = localStorage.getItem('avatarUploaded');
          if (avatarUploaded === 'true') {
          } else {
            localStorage.removeItem('userAvatar');
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
    const rawRefresh = localStorage.getItem("refresh");
    const cleanRefresh = rawRefresh ? rawRefresh.replace(/^"+|"+$/g, "") : null;

    try {
      if (cleanRefresh) {
        await apiWithAuth.post("/auth/logout", { refresh: cleanRefresh });
      }
    } catch (serverError) {
      console.warn("Server-side logout failed, proceeding with local cleanup");
    } finally {
      sessionStorage.setItem("logoutFlag", "true");

      dispatch(clearAuthState());
      dispatch(clearCart());
      dispatch(clearFavorites());
      dispatch(clearBasketState());

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("persist:auth");
      localStorage.removeItem("persist:cart");
      localStorage.removeItem("persist:favorites");
      localStorage.removeItem("persist:products");
      localStorage.removeItem("persist:basket");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userAvatar");
      localStorage.removeItem("avatarUploaded");

      setTimeout(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("persist:auth");
        localStorage.removeItem("persist:cart");
        localStorage.removeItem("persist:favorites");
        localStorage.removeItem("persist:products");
        localStorage.removeItem("persist:basket");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("userAvatar");
        localStorage.removeItem("avatarUploaded");

        window.location.href = '/';
      }, 50);
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state.auth?.token || localStorage.getItem("access")?.replace(/^"+|"+$/g, "");

      const payload = {
        old_password: oldPassword,
        new_password: newPassword
      };

      const res = await apiWithAuth.put("/auth/change_password", payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("Session timed out. Please log in again.");
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
      const cleanAccess = action.payload.access?.replace(/^"+|"+$/g, "");
      const cleanRefresh = action.payload.refresh?.replace(/^"+|"+$/g, "");
      state.token = cleanAccess;
      state.tokenInvalid = false;
      if (cleanAccess) {
        localStorage.setItem("access", cleanAccess);
      }
      if (cleanRefresh) {
        localStorage.setItem("refresh", cleanRefresh);
      }
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
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const cleanAccess = action.payload.token?.replace(/^"+|"+$/g, "");
        const cleanRefresh = action.payload.refresh?.replace(/^"+|"+$/g, "");

        state.token = cleanAccess;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.email = action.payload.email || null;
        state.tokenInvalid = false;

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
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        const cleanAccess = action.payload.access?.replace(/^"+|"+$/g, "");
        const cleanRefresh = action.payload.refresh?.replace(/^"+|"+$/g, "");

        state.token = cleanAccess;
        state.user = action.payload.user;
        state.email = action.payload.user?.email;
        state.isAdmin = action.payload.isAdmin;

        if (cleanAccess) localStorage.setItem("access", cleanAccess);
        if (cleanRefresh) localStorage.setItem("refresh", cleanRefresh);
        if (action.payload.isAdmin) localStorage.setItem("isAdmin", "true");
      })
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
      .addCase(logoutUser.fulfilled, (state) => {
        return {
          ...authSlice.getInitialState(),
          token: null,
          isAdmin: false
        };
      })
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

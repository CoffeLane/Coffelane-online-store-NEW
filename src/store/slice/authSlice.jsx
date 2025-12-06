import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { apiWithAuth } from "../api/axios";


// ===== Thunks =====

// Регистрация (с profile)
export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/users/registration", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== Login User =====
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // 1. Логинимся и получаем токены
      const res = await api.post("/auth/login", { email, password });
      const { access, refresh } = res.data;

      if (!access) {
        return rejectWithValue("No access token received");
      }

      // Сохраняем токены в localStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // 2. Запрашиваем профиль с токеном
      const profileRes = await api.get("/users/info", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const profileData = profileRes.data; // тут сами данные пользователя

      return { user: profileData.profile, profile: profileData.profile, token: access };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== Register + Auto-Login =====
export const registerAndLoginUser = createAsyncThunk(
  "auth/registerAndLogin",
  async (data, { dispatch, rejectWithValue }) => {
    try {
      console.log("🔹 Register + Login start");

      // 1. Регистрируем пользователя
      const registerResult = await dispatch(registerUser(data));
      if (registerResult.meta.requestStatus !== "fulfilled") {
        return rejectWithValue(registerResult.payload);
      }

      // 2. Делаем небольшую задержку (100-200ms), чтобы сервер точно успел создать пользователя
      await new Promise(res => setTimeout(res, 200));

      // 3. Логинимся с тем же email/password
      const loginResult = await dispatch(
        loginUser({ email: data.email, password: data.password })
      );

      if (loginResult.meta.requestStatus !== "fulfilled") {
        return rejectWithValue(loginResult.payload);
      }

      console.log("✅ Register + Login successful:", loginResult.payload);

      return loginResult.payload;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);


// ===== Login via Google =====
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async ({ email, token }, { rejectWithValue }) => {
    try {
      // 1. Отправляем токен и email на твой бекенд
      const res = await api.post("/auth_google/callback", {
        email,
        token,
      });

      const { access, refresh } = res.data;

      if (!access) {
        return rejectWithValue("No access token received");
      }

      // 2. Сохраняем токены
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // 3. Получаем профиль
      const profileRes = await api.get("/users/info", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const profileData = profileRes.data;

      return {
        user: profileData.profile,
        profile: profileData.profile,
        token: access,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== Fetch Profile =====
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue, dispatch }) => {
    const token = localStorage.getItem("access");
    if (!token) {
      // Нет токена — не делаем fetch
      return rejectWithValue("No access token");
    }

    try {
      const apiAuth = apiWithAuth();
      const res = await apiAuth.get("/users/info");
      return { user: res.data.profile, profile: res.data.profile };
    } catch (err) {
      const message = err.response?.data;
      if (message?.code === "token_not_valid") {
        // Очистка токенов и state при invalid token
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        dispatch(clearAuthState());
      }
      return rejectWithValue(message || err.message);
    }
  }
);

// ===== Logout User =====

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const access = localStorage.getItem("access");
      if (access) {
        await api.post("/auth/logout", null, {
          headers: { Authorization: `Bearer ${access}` },
        });
      }

      // Удаляем токены
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      // Очищаем persisted auth
      localStorage.removeItem("persist:auth");

      // Очищаем auth state
      dispatch(clearAuthState());

      return {};
    } catch (err) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("persist:auth");
      dispatch(clearAuthState());
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// ===== Change Password =====
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const res = await apiWithAuth().post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// ===== Slice =====

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("access") || null,
    user: null,
    profile: null,
    loading: false,
    error: null,
    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordSuccess: false,
  },
  reducers: {
    clearAuthState: (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.error = null;
      state.loading = false;
      state.changePasswordLoading = false;
      state.changePasswordError = null;
      state.changePasswordSuccess = false;
    },
    clearChangePasswordSuccess: (state) => {
      state.changePasswordSuccess = false;
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
        state.token = action.payload.token || null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.token = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.profile = null;
        state.token = null;
      })
    .addCase(fetchProfile.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.loading = false;
    })
    .addCase(fetchProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
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


export const { clearAuthState, clearChangePasswordSuccess } = authSlice.actions;
export default authSlice.reducer;


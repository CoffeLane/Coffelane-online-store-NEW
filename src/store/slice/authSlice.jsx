import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { apiWithAuth } from "../api/axios";


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

      const profileData = profileRes.data; // Структура: { id, email, profile: {...} }
      // console.log("▶ loginUser - profileData (FULL):", JSON.stringify(profileData, null, 2));
      // console.log("▶ loginUser - profileData.email:", profileData.email);
      // console.log("▶ loginUser - email from login param:", email);

      const userEmail = profileData.email || email;
      
      // console.log("▶ loginUser - final userEmail:", userEmail);

      const profileWithEmail = profileData.profile 
        ? { ...profileData.profile, email: userEmail }
        : null;

      return { 
        user: profileWithEmail, 
        profile: profileWithEmail, 
        token: access,
        email: userEmail // Сохраняем email отдельно
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

      const res = await api.post("/auth_google/callback", {
        email,
        token,
      });

      const { access, refresh } = res.data;

      if (!access) {
        return rejectWithValue("No access token received");
      }

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      const profileRes = await api.get("/users/info", {
        headers: { Authorization: `Bearer ${access}` },
      });

      const profileData = profileRes.data; // Структура: { id, email, profile: {...} }
      // console.log("▶ loginWithGoogle - profileData:", profileData);

      const userEmail = profileData.email || email;

      const profileWithEmail = profileData.profile 
        ? { ...profileData.profile, email: userEmail }
        : null;

      return {
        user: profileWithEmail,
        profile: profileWithEmail,
        token: access,
        email: userEmail // Сохраняем email отдельно
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue, dispatch }) => {
    const token = localStorage.getItem("access");
    if (!token) {

      return rejectWithValue("No access token");
    }

      try {
      const apiAuth = apiWithAuth();

      const res = await apiAuth.get("/users/info");
      // console.log("▶ fetchProfile - /users/info res.data (FULL):", JSON.stringify(res.data, null, 2));

      let userEmail = res.data.email;

      if (!userEmail) {
        // console.log("⚠️ Email not found in /users/info, trying /users/autofill_form...");
        try {
          const autofillRes = await apiAuth.get("/users/autofill_form");
          // console.log("▶ fetchProfile - /users/autofill_form res.data:", JSON.stringify(autofillRes.data, null, 2));
          userEmail = autofillRes.data?.email;
        } catch (autofillErr) {
          // console.warn("⚠️ Could not fetch from /users/autofill_form:", autofillErr.response?.data || autofillErr.message);
        }
      }
      
      if (!userEmail) {
        // console.warn("⚠️ Email not found in any API response!");
      }

      const profileWithEmail = res.data.profile 
        ? { ...res.data.profile, email: userEmail }
        : null;
      
      // console.log("▶ fetchProfile - returning:", { 
      //   user: profileWithEmail, 
      //   profile: profileWithEmail,
      //   email: userEmail 
      // });
      
      return { 
        user: profileWithEmail, 
        profile: profileWithEmail,
        email: userEmail // Сохраняем email отдельно
      };
    } catch (err) {
      const message = err.response?.data;
      if (message?.code === "token_not_valid") {

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        dispatch(clearAuthState());
      }
      return rejectWithValue(message || err.message);
    }
  }
);


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

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      localStorage.removeItem("persist:auth");

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

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const apiAuth = apiWithAuth();

      const payload = {
        old_password: oldPassword,
        new_password: newPassword
      };
      
      const res = await apiAuth.put("/auth/change_password", payload);
      
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
    changePasswordLoading: false,
    changePasswordError: null,
    changePasswordSuccess: false,
  },
  reducers: {
    clearAuthState: (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.email = null;
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
        state.email = action.payload.email || null; // сохраняем email
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
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.profile = null;
        state.token = null;
        state.email = null;
      })
    .addCase(fetchProfile.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.profile = action.payload.profile;
      state.email = action.payload.email || null; // сохраняем email
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


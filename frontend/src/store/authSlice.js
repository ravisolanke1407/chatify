import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  checkAuthAPI,
  loginAPI,
  logoutAPI,
  registerAPI,
  updateProfileAPI,
} from "./api/auth";
import { UPDATE_ONLINE_USERS } from "./socketActions";

// Register User
const signUp = createAsyncThunk("auth/signUp", async (userData, thunkAPI) => {
  try {
    const { data } = await registerAPI(userData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Check Auth Status
const checkAuth = createAsyncThunk("auth/checkAuth", async (_, thunkAPI) => {
  try {
    const { data } = await checkAuthAPI();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

const logIn = createAsyncThunk("auth/logIn", async (credentials, thunkAPI) => {
  try {
    const { data } = await loginAPI(credentials);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

const logout = createAsyncThunk("auth/logOut", async (_, thunkAPI) => {
  try {
    const { data } = await logoutAPI();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const { data } = await updateProfileAPI(profileData);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  authUser: null,
  onlineUsers: [],
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: () => {},
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(signUp.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isSigningUp = false;
        state.authUser = action.payload;
      })
      .addCase(signUp.rejected, (state) => {
        state.isSigningUp = false;
      });

    // Check Auth Status
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.authUser = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isCheckingAuth = false;
        state.authUser = null;
      });

    // Login User
    builder
      .addCase(logIn.pending, (state) => {
        state.isLoggingIn = true;
      })

      .addCase(logIn.fulfilled, (state, action) => {
        state.isLoggingIn = false;
        state.authUser = action.payload;
      })

      .addCase(logIn.rejected, (state) => {
        state.isLoggingIn = false;
      });

    // Logout User
    builder.addCase(logout.fulfilled, (state) => {
      state.authUser = null;
    });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdatingProfile = false;
        state.authUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.isUpdatingProfile = false;
      });

    // Socket -> Update online users list
    builder.addCase(UPDATE_ONLINE_USERS, (state, action) => {
      state.onlineUsers = action.payload;
    });
  },
});

export { signUp, checkAuth, logout, logIn, updateProfile };
export default authSlice.reducer;

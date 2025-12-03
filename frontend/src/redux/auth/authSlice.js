import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signOut } from "firebase/auth";
import axios from "axios";
import { auth } from "../../utils/firebase";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  "Request failed. Check server/network connection.";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, password, navigate }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      });
      navigate("/profile");
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// LOGIN
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, navigate }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });

      if (res.status === 202) return res.data;

      navigate("/profile");
      return res.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// LOGOUT
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await axios.get("/api/auth/logout");
    await signOut(auth);
    return null;
  } catch {
    return null;
  }
});

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserData: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        const unverifiedMessage =
          "Account not verified. A new verification code has been sent";

        if (
          action.payload.message &&
          action.payload.message.includes(unverifiedMessage)
        ) {
          state.error = action.payload.message;
          state.user = null;
        } else {
          state.user = action.payload;
          state.error = null;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearError, setUserData } = authSlice.actions;
export default authSlice.reducer;

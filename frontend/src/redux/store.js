import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/auth/authSlice";
import resumeReducer from "../redux/resume/resumeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
  },
});

import { useCallback, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/Home/HomePage";

import Navbar from "./components/Navbar";

import ProtectedLayout from "./layouts/ProtectedLayout";
import PublicLayout from "./layouts/PublicLayout";
import { checkAuth } from "./store/authSlice";

function App() {
  const { theme } = useSelector((state) => state.theme);

  const dispatch = useDispatch();

  const hasAuthenticated = useCallback(async () => {
    try {
      await dispatch(checkAuth()).unwrap();
    } catch (error) {
      console.error("Authentication check failed:", error);
    }
  }, [dispatch]);

  useEffect(() => {
    hasAuthenticated();
  }, [hasAuthenticated]);

  return (
    <div data-theme={theme}>
      <Toaster />

      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/settings" element={<SettingsPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

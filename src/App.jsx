import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import RestaurantDetails from "./pages/RestaurantDetails";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BusinessDashboard from "./pages/BusinessDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import BusinessPage from "./pages/BusinessPage";
import ForgotPassword from "./pages/ForgotPassword";
import Contact from "./pages/Contact";
import Advertise from "./pages/Advertise";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import BlogPage from "./pages/BlogPage";
import BlogPost from "./pages/BlogPost";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import PageLoader from "./components/ui/PageLoader";
import { useState, useEffect } from "react";

function App() {
 const location = useLocation();
 const [loading, setLoading] = useState(false);
 const isDashboard =
  location.pathname === "/business-dashboard" ||
  location.pathname === "/super-admin" ||
  location.pathname === "/business";

 useEffect(() => {
  setLoading(true);
  const timer = setTimeout(() => setLoading(false), 800); // Simulated loading for smooth transition
  return () => clearTimeout(timer);
 }, [location.pathname]);

 return (
  <AuthProvider>
   <ToastProvider>
    <div className="app relative min-h-screen">
     {loading && <PageLoader />}
     {!isDashboard && <Navbar />}
     <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/restaurant/:id" element={<RestaurantDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/business-dashboard" element={<BusinessDashboard />} />
      <Route path="/super-admin" element={<SuperAdminDashboard />} />
      <Route path="/business" element={<BusinessPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/advertise" element={<Advertise />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="*" element={<NotFound />} />
     </Routes>
    </div>
   </ToastProvider>
  </AuthProvider>
 );
}

export default App;

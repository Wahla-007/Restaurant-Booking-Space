import { createContext, useContext, useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { supabase } from "../supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [authLoading, setAuthLoading] = useState(true);

 useEffect(() => {
  // Check for active local session
  const storedUser = localStorage.getItem("session_v1");
  if (storedUser) {
   setUser(JSON.parse(storedUser));
  }
  setAuthLoading(false);
 }, []);

 // Helper for email validation
 const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 };

 const checkPasswordStrength = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("min 8 chars");
  if (!/[A-Z]/.test(password)) errors.push("1 uppercase");
  if (!/[a-z]/.test(password)) errors.push("1 lowercase");
  if (!/[0-9]/.test(password)) errors.push("1 number");
  if (!/[!@#$%^&*]/.test(password)) errors.push("1 special char (!@#$%^&*)");

  return {
   isValid: errors.length === 0,
   message: errors.length > 0 ? `Password needs: ${errors.join(", ")}` : "",
  };
 };

 const login = async (email, password) => {
  if (!email || !password) {
   return { success: false, message: "All fields are required." };
  }

  const cleanEmail = email.trim().toLowerCase();

  // DB CALL: Fetch user by email
  const { data: users, error } = await supabase
   .from("users")
   .select("*")
   .eq("email", cleanEmail)
   .eq("password", password) // Note: In a real production app, use Supabase Auth or hash passwords!
   .limit(1);

  if (error) {
   console.error("Supabase error:", error);
   return { success: false, message: "Database error. Please try again." };
  }

  const foundUser = users?.[0];

  if (!foundUser) {
   return { success: false, message: "Invalid email or password." };
  }

  if (!foundUser.is_verified) {
   return {
    success: false,
    message: "Please verify your email address to log in.",
   };
  }

  // Create session
  const { password: _, ...userWithoutPass } = foundUser;
  setUser(userWithoutPass);
  localStorage.setItem("session_v1", JSON.stringify(userWithoutPass));

  // Return user role so UI can redirect accordingly
  return { success: true, role: foundUser.role || "customer" };
 };

 const signup = async (name, email, password, role = "customer") => {
  // 1. Input Sanitization & Validation
  if (!name || !email || !password) {
   return { success: false, message: "All fields are required." };
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
   return { success: false, message: "Please enter a valid email address." };
  }

  // Strong Password Check
  const passwordCheck = checkPasswordStrength(password);
  if (!passwordCheck.isValid) {
   return { success: false, message: passwordCheck.message };
  }

  // DB CALL: Check for existing email
  const { data: existingUsers } = await supabase
   .from("users")
   .select("email")
   .eq("email", cleanEmail);

  if (existingUsers && existingUsers.length > 0) {
   return { success: false, message: "This email is already registered." };
  }

  // Generate a 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // DB CALL: Call Insert User
  const { data, error } = await supabase
   .from("users")
   .insert([
    {
     name: cleanName,
     email: cleanEmail,
     password: password, // Storing plain for this specific demo flow (Use Supabase Auth normally!)
     role: role, // 'customer' or 'business'
     avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random`,
     is_verified: false,
     verification_token: otp,
    },
   ])
   .select();

  if (error) {
   console.error("Signup DB Error:", error);
   return {
    success: false,
    message: "Failed to create account. Please try again.",
   };
  }

  // Send Real Email via EmailJS
  const SERVICE_ID = "service_wcykj6j";
  const TEMPLATE_ID = "template_2ou7h3b";
  const PUBLIC_KEY = "3cenvoR92dSsx7chn";

  try {
   await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
     email: cleanEmail,
     to_name: cleanName,
     otp: otp,
     time: new Date().toLocaleTimeString(),
    },
    PUBLIC_KEY,
   );

   console.log("Email sent successfully!");
   return { success: true, otp, email: cleanEmail };
  } catch (error) {
   console.error("Email failed to send:", error);
   const errorMsg = error.text || error.message || "Unknown network error";
   return {
    success: false,
    message: `EmailJS Error: ${errorMsg}. (Check your Template ID!)`,
   };
  }
 };

 const verifyAccount = async (email, otp) => {
  const cleanEmail = email.trim().toLowerCase();

  // DB CALL: Get user to verify
  const { data: users } = await supabase
   .from("users")
   .select("*")
   .eq("email", cleanEmail)
   .limit(1);

  const user = users?.[0];

  if (!user) {
   return {
    success: false,
    message: "Account not found. Please sign up first.",
   };
  }

  if (user.is_verified) {
   return {
    success: true,
    message: "Account is already active. Please log in.",
   };
  }

  if (user.verification_token !== otp) {
   return {
    success: false,
    message:
     "Invalid verification code. Please check your email and try again.",
   };
  }

  // DB CALL: Update user status
  const { error: updateError } = await supabase
   .from("users")
   .update({ is_verified: true, verification_token: null }) // Consume token
   .eq("id", user.id);

  if (updateError) {
   return { success: false, message: "Verification failed. Database error." };
  }

  // Auto-login: Create session
  const { password: _, ...userWithoutPass } = user;
  setUser(userWithoutPass);
  localStorage.setItem("session_v1", JSON.stringify(userWithoutPass));

  return { success: true, role: user.role || "customer" };
 };

 // --- Quick Login / Guest Flow ---

 const requestLoginOTP = async (email) => {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check if user exists
  const { data: users } = await supabase
   .from("users")
   .select("*")
   .eq("email", cleanEmail)
   .limit(1);
  let user = users?.[0];

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  if (user) {
   // Existing user: Update OTP
   await supabase
    .from("users")
    .update({ verification_token: otp })
    .eq("id", user.id);
  } else {
   // New user: Create account
   // Generate a name from email (e.g. "john" from "john@doe.com")
   const nameFromEmail = cleanEmail.split("@")[0];
   const { data: newUser, error } = await supabase
    .from("users")
    .insert([
     {
      email: cleanEmail,
      name: nameFromEmail, // Placeholder name
      password: "GUEST_LOGIN_" + Date.now(), // Placeholder
      avatar: `https://ui-avatars.com/api/?name=${nameFromEmail}&background=random`,
      is_verified: false,
      verification_token: otp,
     },
    ])
    .select()
    .single();

   if (error)
    return { success: false, message: "Failed to create guest account." };
   user = newUser; // though asking for it again isn't strictly needed if we trust insert
  }

  // 2. Send Email
  const SERVICE_ID = "service_wcykj6j";
  const TEMPLATE_ID = "template_2ou7h3b";
  const PUBLIC_KEY = "3cenvoR92dSsx7chn";

  try {
   await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
     email: cleanEmail,
     to_name: user?.name || "Guest",
     otp: otp,
     time: new Date().toLocaleTimeString(),
    },
    PUBLIC_KEY,
   );
   return { success: true };
  } catch (error) {
   const errorMsg = error.text || error.message;
   return { success: false, message: `Email failed: ${errorMsg}` };
  }
 };

 const verifyLoginOTP = async (email, otp) => {
  const cleanEmail = email.trim().toLowerCase();
  // Verifies OTP and Logs User In
  const { data: users } = await supabase
   .from("users")
   .select("*")
   .eq("email", cleanEmail)
   .limit(1);
  const user = users?.[0];

  if (!user) return { success: false, message: "User not found." };
  if (user.verification_token !== otp)
   return { success: false, message: "Invalid code." };

  // Verify & Consume Token
  await supabase
   .from("users")
   .update({ is_verified: true, verification_token: null })
   .eq("id", user.id);

  // Log In
  const { password: _, ...userWithoutPass } = user;
  setUser(userWithoutPass);
  localStorage.setItem("session_v1", JSON.stringify(userWithoutPass));

  return { success: true };
 };

 const logout = () => {
  setUser(null);
  localStorage.removeItem("session_v1");
 };

 return (
  <AuthContext.Provider
   value={{
    user,
    authLoading,
    login,
    signup,
    verifyAccount,
    requestLoginOTP,
    verifyLoginOTP,
    logout,
   }}>
   {children}
  </AuthContext.Provider>
 );
};

export const useAuth = () => useContext(AuthContext);

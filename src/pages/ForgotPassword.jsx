import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
 ChevronLeft,
 Mail,
 KeyRound,
 Eye,
 EyeOff,
 ShieldCheck,
 CheckCircle,
 ArrowRight,
 Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
 const navigate = useNavigate();
 const { requestPasswordReset, verifyResetOTP, resetPassword } = useAuth();

 // Steps: email → otp → newPassword → success
 const [step, setStep] = useState("email");

 // Email step
 const [email, setEmail] = useState("");

 // OTP step
 const [code, setCode] = useState(["", "", "", ""]);
 const inputRefs = useRef([]);

 // Password step
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirm, setShowConfirm] = useState(false);

 // Shared
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 // --- Email Step ---
 const handleSendOTP = async (e) => {
  e.preventDefault();
  if (!email.trim()) return;
  setLoading(true);
  setError("");

  const result = await requestPasswordReset(email);
  setLoading(false);

  if (result.success) {
   setStep("otp");
  } else {
   setError(result.message);
  }
 };

 // --- OTP Step ---
 const handleOTPChange = (index, value) => {
  if (!/^\d*$/.test(value)) return;
  const newCode = [...code];
  newCode[index] = value;
  setCode(newCode);
  if (value && index < 3) {
   inputRefs.current[index + 1].focus();
  }
 };

 const handleOTPKeyDown = (index, e) => {
  if (e.key === "Backspace" && !code[index] && index > 0) {
   inputRefs.current[index - 1].focus();
  }
 };

 const handleOTPPaste = (e) => {
  e.preventDefault();
  const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
  if (pasted.length > 0) {
   const newCode = [...code];
   for (let i = 0; i < 4; i++) {
    newCode[i] = pasted[i] || "";
   }
   setCode(newCode);
   const focusIndex = Math.min(pasted.length, 3);
   inputRefs.current[focusIndex]?.focus();
  }
 };

 const handleVerifyOTP = async (e) => {
  e.preventDefault();
  const otp = code.join("");
  if (otp.length !== 4) return;
  setLoading(true);
  setError("");

  const result = await verifyResetOTP(email, otp);
  setLoading(false);

  if (result.success) {
   setStep("newPassword");
  } else {
   setError(result.message);
  }
 };

 // --- New Password Step ---
 const handleResetPassword = async (e) => {
  e.preventDefault();
  setError("");

  if (newPassword !== confirmPassword) {
   setError("Passwords do not match.");
   return;
  }

  setLoading(true);
  const result = await resetPassword(email, newPassword);
  setLoading(false);

  if (result.success) {
   setStep("success");
  } else {
   setError(result.message);
  }
 };

 // Password strength indicator
 const getStrength = () => {
  let score = 0;
  if (newPassword.length >= 8) score++;
  if (/[A-Z]/.test(newPassword)) score++;
  if (/[a-z]/.test(newPassword)) score++;
  if (/[0-9]/.test(newPassword)) score++;
  if (/[!@#$%^&*]/.test(newPassword)) score++;
  return score;
 };

 const strength = getStrength();
 const strengthColors = [
  "bg-slate-200",
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-emerald-400",
  "bg-emerald-500",
 ];
 const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];

 return (
  <div className="min-h-screen bg-white flex items-center justify-center px-4">
   <div className="w-full max-w-[440px] py-12">
    {/* Back button & logo */}
    <div className="flex items-center gap-4 mb-6">
     <button
      onClick={() => {
       if (step === "email") navigate("/login");
       else if (step === "otp") setStep("email");
       else if (step === "newPassword") setStep("otp");
      }}
      className="p-1 text-[#002b11] hover:text-[#002b11]/70 transition-colors cursor-pointer">
      <ChevronLeft size={28} strokeWidth={2.5} />
     </button>
     <img src="/logo/logo.svg" alt="ReserveKaru" className="w-10 h-10" />
    </div>

    <AnimatePresence mode="wait">
     {/* ========== STEP 1: Enter Email ========== */}
     {step === "email" && (
      <motion.div
       key="email"
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       transition={{ duration: 0.25 }}>
       <div className="mb-6">
        <h1 className="text-[32px] font-black text-[#002b11] tracking-tight">
         Forgot password?
        </h1>
        <p className="text-slate-500 text-[15px] mt-2">
         No worries. Enter your email and we'll send you a verification code.
        </p>
       </div>

       <form onSubmit={handleSendOTP} className="space-y-5">
        <div>
         <label className="block text-[15px] font-bold text-[#002b11] mb-2">
          Email address
         </label>
         <div className="relative">
          <Mail
           size={18}
           className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
           type="email"
           required
           value={email}
           onChange={(e) => setEmail(e.target.value)}
           placeholder="Enter your email"
           className="w-full pl-11 pr-4 py-3.5 rounded-lg border-2 border-[#002b11] bg-[#f7f7f7] text-[#002b11] text-[15px] placeholder-gray-400 outline-none focus:border-[#00aa6c] transition-colors"
          />
         </div>
        </div>

        {error && (
         <p className="text-red-500 text-sm text-center font-medium">{error}</p>
        )}

        <button
         type="submit"
         disabled={loading}
         className="w-full py-4 rounded-full bg-[#002b11] hover:bg-[#004d1f] text-white font-bold text-[16px] transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
         {loading ? (
          <>
           <Loader2 size={18} className="animate-spin" />
           Sending code...
          </>
         ) : (
          "Send verification code"
         )}
        </button>
       </form>

       <p className="text-center text-sm text-slate-400 mt-8">
        Remember your password?{" "}
        <Link
         to="/login"
         className="font-bold text-[#002b11] underline underline-offset-2 hover:text-[#00aa6c] transition-colors">
         Sign in
        </Link>
       </p>
      </motion.div>
     )}

     {/* ========== STEP 2: Enter OTP ========== */}
     {step === "otp" && (
      <motion.div
       key="otp"
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       transition={{ duration: 0.25 }}>
       <div className="mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#002b11]/5 flex items-center justify-center mb-4">
         <ShieldCheck size={28} className="text-[#002b11]" />
        </div>
        <h1 className="text-[28px] font-black text-[#002b11] tracking-tight">
         Enter verification code
        </h1>
        <p className="text-slate-500 text-[15px] mt-2">
         We sent a 4-digit code to{" "}
         <span className="font-semibold text-[#002b11]/80">{email}</span>
        </p>
       </div>

       <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div className="flex gap-3 justify-center">
         {code.map((digit, i) => (
          <input
           key={i}
           ref={(el) => (inputRefs.current[i] = el)}
           type="text"
           inputMode="numeric"
           maxLength={1}
           value={digit}
           onChange={(e) => handleOTPChange(i, e.target.value)}
           onKeyDown={(e) => handleOTPKeyDown(i, e)}
           onPaste={handleOTPPaste}
           className={`w-16 h-18 text-center text-2xl font-black rounded-xl border-2 outline-none transition-all
            ${
             digit
              ? "border-[#002b11] bg-[#002b11]/5 text-[#002b11]"
              : "border-slate-200 bg-[#f7f7f7] text-slate-800"
            }
            focus:border-[#00aa6c] focus:ring-4 focus:ring-[#00aa6c]/10`}
          />
         ))}
        </div>

        {error && (
         <p className="text-red-500 text-sm text-center font-medium">{error}</p>
        )}

        <button
         type="submit"
         disabled={loading || code.join("").length !== 4}
         className="w-full py-4 rounded-full bg-[#002b11] hover:bg-[#004d1f] text-white font-bold text-[16px] transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
         {loading ? (
          <>
           <Loader2 size={18} className="animate-spin" />
           Verifying...
          </>
         ) : (
          "Verify code"
         )}
        </button>
       </form>

       <button
        onClick={() => {
         setCode(["", "", "", ""]);
         setError("");
         handleSendOTP({ preventDefault: () => {} });
        }}
        className="w-full text-center text-sm text-slate-400 mt-6 hover:text-[#002b11] transition-colors cursor-pointer">
        Didn't receive it?{" "}
        <span className="font-bold underline underline-offset-2">
         Resend code
        </span>
       </button>
      </motion.div>
     )}

     {/* ========== STEP 3: New Password ========== */}
     {step === "newPassword" && (
      <motion.div
       key="newPassword"
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       transition={{ duration: 0.25 }}>
       <div className="mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#002b11]/5 flex items-center justify-center mb-4">
         <KeyRound size={28} className="text-[#002b11]" />
        </div>
        <h1 className="text-[28px] font-black text-[#002b11] tracking-tight">
         Create new password
        </h1>
        <p className="text-slate-500 text-[15px] mt-2">
         Your new password must be different from your previous one
        </p>
       </div>

       <form onSubmit={handleResetPassword} className="space-y-5">
        {/* New Password */}
        <div>
         <label className="block text-[15px] font-bold text-[#002b11] mb-2">
          New password
         </label>
         <div className="relative">
          <input
           type={showPassword ? "text" : "password"}
           required
           value={newPassword}
           onChange={(e) => setNewPassword(e.target.value)}
           placeholder="Enter new password"
           className="w-full px-4 py-3.5 pr-12 rounded-lg border-2 border-[#002b11] bg-[#f7f7f7] text-[#002b11] text-[15px] placeholder-gray-400 outline-none focus:border-[#00aa6c] transition-colors"
          />
          <button
           type="button"
           onClick={() => setShowPassword(!showPassword)}
           className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#002b11]/40 hover:text-[#002b11]/70 transition-colors cursor-pointer">
           {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
         </div>

         {/* Strength bar */}
         {newPassword.length > 0 && (
          <div className="mt-3">
           <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
             <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
               i <= strength ? strengthColors[strength] : "bg-slate-100"
              }`}
             />
            ))}
           </div>
           <p
            className={`text-xs font-semibold mt-1.5 ${
             strength <= 2
              ? "text-red-500"
              : strength <= 3
                ? "text-orange-500"
                : "text-emerald-600"
            }`}>
            {strengthLabels[strength]}
           </p>
          </div>
         )}
        </div>

        {/* Confirm Password */}
        <div>
         <label className="block text-[15px] font-bold text-[#002b11] mb-2">
          Confirm new password
         </label>
         <div className="relative">
          <input
           type={showConfirm ? "text" : "password"}
           required
           value={confirmPassword}
           onChange={(e) => setConfirmPassword(e.target.value)}
           placeholder="Confirm your password"
           className={`w-full px-4 py-3.5 pr-12 rounded-lg border-2 bg-[#f7f7f7] text-[#002b11] text-[15px] placeholder-gray-400 outline-none transition-colors ${
            confirmPassword && confirmPassword === newPassword
             ? "border-emerald-500 focus:border-emerald-500"
             : confirmPassword && confirmPassword !== newPassword
               ? "border-red-400 focus:border-red-400"
               : "border-[#002b11] focus:border-[#00aa6c]"
           }`}
          />
          <button
           type="button"
           onClick={() => setShowConfirm(!showConfirm)}
           className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#002b11]/40 hover:text-[#002b11]/70 transition-colors cursor-pointer">
           {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
         </div>
         {confirmPassword && confirmPassword !== newPassword && (
          <p className="text-red-500 text-xs font-medium mt-1.5">
           Passwords do not match
          </p>
         )}
        </div>

        {error && (
         <p className="text-red-500 text-sm text-center font-medium">{error}</p>
        )}

        <button
         type="submit"
         disabled={
          loading ||
          !newPassword ||
          !confirmPassword ||
          newPassword !== confirmPassword
         }
         className="w-full py-4 rounded-full bg-[#002b11] hover:bg-[#004d1f] text-white font-bold text-[16px] transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
         {loading ? (
          <>
           <Loader2 size={18} className="animate-spin" />
           Resetting password...
          </>
         ) : (
          "Reset password"
         )}
        </button>
       </form>
      </motion.div>
     )}

     {/* ========== STEP 4: Success ========== */}
     {step === "success" && (
      <motion.div
       key="success"
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: 0.4 }}
       className="text-center py-8">
       <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-100">
        <CheckCircle size={40} className="text-emerald-500" />
       </motion.div>

       <h1 className="text-[28px] font-black text-[#002b11] tracking-tight mb-2">
        Password reset!
       </h1>
       <p className="text-slate-500 text-[15px] mb-8">
        Your password has been successfully updated. You can now sign in with
        your new password.
       </p>

       <button
        onClick={() => navigate("/login")}
        className="w-full py-4 rounded-full bg-[#002b11] hover:bg-[#004d1f] text-white font-bold text-[16px] transition-colors cursor-pointer flex items-center justify-center gap-2">
        Back to Sign in
        <ArrowRight size={18} />
       </button>
      </motion.div>
     )}
    </AnimatePresence>
   </div>
  </div>
 );
}

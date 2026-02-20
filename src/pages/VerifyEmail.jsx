import { useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyEmail() {
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const { verifyAccount } = useAuth();

 const email = searchParams.get("email");

 const [code, setCode] = useState(["", "", "", ""]);
 const [status, setStatus] = useState("pending"); // pending, success, error
 const [message, setMessage] = useState("");
 const [loading, setLoading] = useState(false);
 const inputRefs = useRef([]);

 const handleChange = (index, value) => {
  if (!/^\d*$/.test(value)) return;

  const newCode = [...code];
  newCode[index] = value;
  setCode(newCode);

  // Auto-focus next input
  if (value && index < 3) {
   inputRefs.current[index + 1].focus();
  }
 };

 const handleKeyDown = (index, e) => {
  if (e.key === "Backspace" && !code[index] && index > 0) {
   inputRefs.current[index - 1].focus();
  }
 };

 const handlePaste = (e) => {
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

 const handleVerify = async (e) => {
  e.preventDefault();
  const otp = code.join("");
  if (otp.length !== 4) return;

  setLoading(true);
  setStatus("pending");

  try {
   const result = await verifyAccount(email, otp);
   if (result.success) {
    setStatus("success");
    setTimeout(() => {
     if (result.role === "business") {
      navigate("/business-dashboard");
     } else {
      navigate("/");
     }
    }, 2000);
   } else {
    setStatus("error");
    setMessage(result.message);
   }
  } catch (err) {
   setStatus("error");
   setMessage("An unexpected error occurred.");
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#f0fdf4] flex items-center justify-center px-4 py-12">
   {/* Subtle background decoration */}
   <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#7cfc00]/10 blur-3xl" />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#002b11]/5 blur-3xl" />
   </div>

   <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="relative w-full max-w-[440px]">
    <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,43,17,0.08)] border border-[#002b11]/[0.06] p-8 sm:p-10 text-center">
     {status === "pending" || status === "error" ? (
      <>
       {/* Icon */}
       <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-[72px] h-[72px] rounded-2xl bg-[#002b11]/[0.06] flex items-center justify-center mx-auto mb-6">
        <Mail size={30} className="text-[#002b11]" />
       </motion.div>

       {/* Heading */}
       <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#002b11] tracking-tight mb-2">
        Verify your email
       </h2>
       <p className="text-[15px] text-[#002b11]/50 mb-8 leading-relaxed">
        We've sent a 4-digit code to{" "}
        <span className="font-semibold text-[#002b11]/80">{email}</span>
       </p>

       {/* OTP Form */}
       <form onSubmit={handleVerify}>
        <div className="flex justify-center gap-3 mb-6">
         {code.map((digit, index) => (
          <input
           key={index}
           ref={(el) => (inputRefs.current[index] = el)}
           type="text"
           inputMode="numeric"
           maxLength="1"
           value={digit}
           onChange={(e) => handleChange(index, e.target.value)}
           onKeyDown={(e) => handleKeyDown(index, e)}
           onPaste={index === 0 ? handlePaste : undefined}
           className={`w-14 h-14 sm:w-16 sm:h-16 text-2xl font-bold text-center rounded-2xl border-2 transition-all duration-200 outline-none
            ${
             digit
              ? "border-[#002b11] bg-[#002b11]/[0.03] text-[#002b11]"
              : "border-[#002b11]/10 bg-[#002b11]/[0.02] text-[#002b11]"
            }
            focus:border-[#002b11] focus:ring-4 focus:ring-[#002b11]/[0.08]`}
          />
         ))}
        </div>

        {/* Error message */}
        {status === "error" && (
         <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
           <span className="text-red-500 text-xs font-bold">!</span>
          </div>
          <p className="text-sm text-red-600 font-medium">{message}</p>
         </motion.div>
        )}

        {/* Submit button */}
        <motion.button
         whileHover={{ scale: 1.01 }}
         whileTap={{ scale: 0.98 }}
         type="submit"
         disabled={loading || code.join("").length !== 4}
         className="w-full py-3.5 rounded-full bg-[#002b11] text-white font-bold text-[15px] shadow-lg shadow-[#002b11]/20 hover:bg-[#004d1f] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2">
         {loading ? (
          <>
           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
           Verifying...
          </>
         ) : (
          <>
           <ShieldCheck size={18} />
           Verify Account
          </>
         )}
        </motion.button>
       </form>

       {/* Resend link */}
       <p className="text-sm text-[#002b11]/40 mt-6">
        Didn't receive the code?{" "}
        <button className="text-[#002b11] font-semibold hover:underline cursor-pointer">
         Resend
        </button>
       </p>
      </>
     ) : (
      /* ========== SUCCESS STATE ========== */
      <motion.div
       initial={{ opacity: 0, scale: 0.9 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
       {/* Success animation circle */}
       <div className="relative w-20 h-20 mx-auto mb-6">
        <motion.div
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
         className="absolute inset-0 rounded-full bg-[#7cfc00]/20"
        />
        <motion.div
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
         className="absolute inset-2 rounded-full bg-[#7cfc00]/30"
        />
        <motion.div
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{ delay: 0.3, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
         className="absolute inset-0 flex items-center justify-center">
         <div className="w-14 h-14 rounded-full bg-[#002b11] flex items-center justify-center shadow-lg shadow-[#002b11]/30">
          <CheckCircle size={28} className="text-[#7cfc00]" />
         </div>
        </motion.div>
       </div>

       {/* Success text */}
       <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-[28px] font-extrabold text-[#002b11] tracking-tight mb-2">
        You're verified!
       </motion.h2>
       <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-[15px] text-[#002b11]/50 mb-8 leading-relaxed">
        Your account has been verified successfully.
        <br />
        Redirecting you now...
       </motion.p>

       {/* Progress bar */}
       <div className="w-full h-1.5 bg-[#002b11]/[0.06] rounded-full overflow-hidden mb-6">
        <motion.div
         initial={{ width: 0 }}
         animate={{ width: "100%" }}
         transition={{ duration: 2, ease: "linear" }}
         className="h-full bg-gradient-to-r from-[#002b11] to-[#7cfc00] rounded-full"
        />
       </div>

       {/* Manual redirect button */}
       <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/")}
        className="w-full py-3.5 rounded-full bg-[#002b11] text-white font-bold text-[15px] shadow-lg shadow-[#002b11]/20 hover:bg-[#004d1f] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
        Go to Dashboard
        <ArrowRight size={18} />
       </motion.button>
      </motion.div>
     )}
    </div>

    {/* Security badge */}
    <div className="flex items-center justify-center gap-2 mt-5">
     <ShieldCheck size={14} className="text-[#002b11]/30" />
     <p className="text-xs text-[#002b11]/30 font-medium">
      Secured with end-to-end encryption
     </p>
    </div>
   </motion.div>
  </div>
 );
}

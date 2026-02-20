import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Users, Briefcase, Eye, EyeOff, ChevronLeft } from "lucide-react";

export default function Signup() {
 const [accountType, setAccountType] = useState("customer");
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const { signup } = useAuth();
 const navigate = useNavigate();

 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (password.length < 6) {
   setError("Password must be at least 6 characters long.");
   return;
  }

  setLoading(true);
  try {
   const result = await signup(name, email, password, accountType);
   if (result.success) {
    navigate(`/verify-email?email=${encodeURIComponent(email)}`);
   } else {
    setError(result.message);
   }
  } catch (err) {
   setError("Failed to create account. Please try again.");
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-white flex items-center justify-center px-4">
   <div className="w-full max-w-[440px] py-12">
    {/* Back Button */}
    <button
     onClick={() => navigate(-1)}
     className="mb-8 p-1 text-[#002b11] hover:text-[#002b11]/70 transition-colors cursor-pointer">
     <ChevronLeft size={28} strokeWidth={2.5} />
    </button>

    {/* Logo */}
    <div className="mb-8">
     <img src="/logo/logo.svg" alt="ReserveKaru" className="w-16 h-16 mb-6" />
     <h1 className="text-[32px] font-black text-[#002b11] tracking-tight">
      Join ReserveKaru.
     </h1>
    </div>

    {/* Account Type Tabs */}
    <div className="flex gap-2 mb-8 p-1.5 rounded-xl bg-[#f7f7f7] border border-gray-200">
     <button
      type="button"
      onClick={() => setAccountType("customer")}
      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
       accountType === "customer"
        ? "bg-[#002b11] text-white shadow-sm"
        : "text-[#002b11]/50 hover:text-[#002b11]/80"
      }`}>
      <Users size={20} />
      <span>Customer</span>
     </button>
     <button
      type="button"
      onClick={() => setAccountType("business")}
      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
       accountType === "business"
        ? "bg-[#002b11] text-white shadow-sm"
        : "text-[#002b11]/50 hover:text-[#002b11]/80"
      }`}>
      <Briefcase size={20} />
      <span>Business</span>
     </button>
    </div>

    <form onSubmit={handleSubmit} className="space-y-5">
     {/* Name */}
     <div>
      <label className="block text-[15px] font-bold text-[#002b11] mb-2">
       {accountType === "business" ? "Restaurant / Business name" : "Full name"}
      </label>
      <input
       type="text"
       required
       value={name}
       onChange={(e) => setName(e.target.value)}
       placeholder={
        accountType === "business" ? "Tasty Bites Inc." : "John Doe"
       }
       className="w-full px-4 py-3.5 rounded-lg border-2 border-[#002b11] bg-[#f7f7f7] text-[#002b11] text-[15px] placeholder-gray-400 outline-none focus:border-[#00aa6c] transition-colors"
      />
     </div>

     {/* Email */}
     <div>
      <label className="block text-[15px] font-bold text-[#002b11] mb-2">
       {accountType === "business" ? "Business email" : "Email address"}
      </label>
      <input
       type="email"
       required
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       placeholder={
        accountType === "business" ? "owner@restaurant.com" : "you@example.com"
       }
       className="w-full px-4 py-3.5 rounded-lg border-2 border-[#002b11] bg-[#f7f7f7] text-[#002b11] text-[15px] placeholder-gray-400 outline-none focus:border-[#00aa6c] transition-colors"
      />
     </div>

     {/* Password */}
     <div>
      <label className="block text-[15px] font-bold text-[#002b11] mb-2">
       Password
      </label>
      <div className="relative">
       <input
        type={showPassword ? "text" : "password"}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Min. 6 characters"
        className="w-full px-4 py-3.5 pr-12 rounded-lg border-2 border-[#002b11] bg-[#f7f7f7] text-[#002b11] text-[15px] placeholder-gray-400 outline-none focus:border-[#00aa6c] transition-colors"
       />
       <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#002b11]/40 hover:text-[#002b11]/70 transition-colors cursor-pointer">
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
       </button>
      </div>
     </div>

     {/* Error */}
     {error && (
      <p className="text-red-500 text-sm text-center font-medium">{error}</p>
     )}

     {/* Submit Button */}
     <button
      type="submit"
      disabled={loading}
      className="w-full py-4 rounded-full bg-[#002b11] hover:bg-[#004d1f] text-white font-bold text-[16px] transition-colors disabled:opacity-60 cursor-pointer mt-2">
      {loading
       ? "Creating account..."
       : accountType === "business"
         ? "Register Business"
         : "Create Account"}
     </button>
    </form>

    {/* Divider */}
    <div className="flex items-center gap-4 my-8">
     <div className="flex-1 h-px bg-gray-200" />
     <span className="text-sm text-gray-400">Already a member?</span>
     <div className="flex-1 h-px bg-gray-200" />
    </div>

    {/* Login Link */}
    <p className="text-center text-[15px] text-[#002b11]">
     <Link
      to="/login"
      className="font-bold underline underline-offset-2 hover:text-[#00aa6c] transition-colors">
      Sign in
     </Link>{" "}
     to your existing account.
    </p>
   </div>
  </div>
 );
}

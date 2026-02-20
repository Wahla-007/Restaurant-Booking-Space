import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

export default function Login() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState("");
 const { login } = useAuth();
 const navigate = useNavigate();

 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
   const result = await login(email, password);
   if (result.success) {
    if (result.role === "admin") {
     navigate("/super-admin");
    } else if (result.role === "business") {
     navigate("/business-dashboard");
    } else {
     navigate("/");
    }
   } else {
    setError(result.message);
   }
  } catch {
   setError("Failed to login. Please try again.");
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen bg-white flex items-center justify-center px-4">
   <div className="w-full max-w-[440px] pt-18 pb-12">
    {/* Back Button */}
    <div className="flex items-center gap-4 w-full h-full">
     <button
      onClick={() => navigate(-1)}
      className="mb-0 md:hidden  p-1 text-[#002b11] hover:text-[#002b11]/70 transition-colors cursor-pointer">
      <ChevronLeft size={28} strokeWidth={2.5} />
     </button>
     <img src="/logo/logo.svg" alt="ReserveKaru" className="w-10 h-10 mb-0" />
     {/* Logo */}
    </div>
    <div className="mb-4">
     <h1 className="text-[32px] font-black text-[#002b11] tracking-tight">
      Welcome back.
     </h1>
    </div>

    <form onSubmit={handleSubmit} className="space-y-5">
     {/* Email */}
     <div>
      <label className="block text-[15px] font-bold text-[#002b11] mb-2">
       Email address
      </label>
      <input
       type="email"
       required
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       placeholder="Email"
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
        placeholder="Password"
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

     {/* Forgot Password */}
     <div>
      <button
       type="button"
       className="text-[#002b11] text-[15px] font-semibold underline underline-offset-2 hover:text-[#00aa6c] transition-colors cursor-pointer">
       Forgot password?
      </button>
     </div>

     {/* Error */}
     {error && (
      <p className="text-red-500 text-sm text-center font-medium">{error}</p>
     )}

     {/* Sign In Button */}
     <button
      type="submit"
      disabled={loading}
      className="w-full py-4 rounded-full bg-[#002b11] hover:bg-[#004d1f] text-white font-bold text-[16px] transition-colors disabled:opacity-60 cursor-pointer mt-2">
      {loading ? "Signing in..." : "Sign in"}
     </button>
    </form>

    {/* Divider */}
    <div className="flex items-center gap-4 my-8">
     <div className="flex-1 h-px bg-gray-200" />
     <span className="text-sm text-gray-400">Not a member?</span>
     <div className="flex-1 h-px bg-gray-200" />
    </div>

    {/* Join Link */}
    <p className="text-center text-[15px] text-[#002b11]">
     <Link
      to="/signup"
      className="font-bold underline underline-offset-2 hover:text-[#00aa6c] transition-colors">
      Join
     </Link>{" "}
     to unlock the best of ReserveKaru.
    </p>
   </div>
  </div>
 );
}

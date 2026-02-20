import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
 const navigate = useNavigate();
 const { user, logout } = useAuth();
 const [scrolled, setScrolled] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);

 useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 return (
  <motion.nav
   initial={{ y: -80 }}
   animate={{ y: 0 }}
   transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
   className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
    scrolled ? "shadow-[0_2px_12px_rgba(0,0,0,0.08)]" : ""
   }`}>
   <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="flex items-center justify-between h-[68px]">
     {/* Logo */}
     <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-2.5 cursor-pointer"
      onClick={() => {
       if (user?.role === "admin") navigate("/super-admin");
       else if (user?.role === "business") navigate("/business-dashboard");
       else navigate("/");
      }}>
      <div className="w-9 h-9 rounded-full bg-[#002b11] flex items-center justify-center">
       <span className="text-white font-bold text-sm">LT</span>
      </div>
      <span className="text-[22px] font-bold tracking-tight text-[#002b11]">
       ReserveKaru
      </span>
     </motion.div>

     {/* Desktop Center Nav Links */}
     <div className="hidden md:flex items-center gap-1">
      {["Discover", "Cuisines", "Reviews", "About"].map((item) => (
       <button
        key={item}
        className="px-4 py-2 text-[15px] font-semibold text-[#002b11]/70 hover:text-[#002b11] rounded-full hover:bg-[#002b11]/[0.04] transition-all duration-200"
        onClick={() => {
         const el = document.getElementById(item.toLowerCase());
         el?.scrollIntoView({ behavior: "smooth" });
        }}>
        {item}
       </button>
      ))}
     </div>

     {/* Right Side Auth */}
     <div className="hidden md:flex items-center gap-2">
      {user ? (
       <div className="flex items-center gap-2">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
         <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#002b11]/10">
          <img
           src={user.avatar}
           alt="avatar"
           className="w-full h-full object-cover"
          />
         </div>
         <span className="text-sm font-semibold text-[#002b11]">
          {user.name}
         </span>
        </div>
        <button
         onClick={logout}
         className="p-2.5 rounded-full text-[#002b11]/40 hover:text-[#002b11] hover:bg-gray-50 transition-all duration-200">
         <LogOut size={18} />
        </button>
       </div>
      ) : (
       <>
        <button
         className="px-4 py-2 text-sm font-semibold text-[#002b11]/70 hover:text-[#002b11] hover:bg-gray-50 rounded-full transition-all duration-200"
         onClick={() => navigate("/signup")}>
         Sign up
        </button>
        <motion.button
         whileHover={{ scale: 1.02 }}
         whileTap={{ scale: 0.98 }}
         className="px-5 py-2.5 text-sm font-bold text-white bg-[#002b11] hover:bg-[#004d1f] rounded-full transition-all duration-200 shadow-sm"
         onClick={() => navigate("/login")}>
         Sign in
        </motion.button>
       </>
      )}
     </div>

     {/* Mobile Menu Toggle */}
     <button
      className="md:hidden p-2 text-[#002b11]/60 hover:text-[#002b11] rounded-lg hover:bg-gray-50 transition-all"
      onClick={() => setMobileOpen(!mobileOpen)}>
      {mobileOpen ? <X size={24} /> : <Menu size={24} />}
     </button>
    </div>
   </div>

   {/* Mobile Menu */}
   <AnimatePresence>
    {mobileOpen && (
     <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="md:hidden bg-white border-t border-gray-100">
      <div className="px-6 py-5 space-y-1">
       {["Discover", "Cuisines", "Reviews", "About"].map((item) => (
        <button
         key={item}
         className="block w-full text-left px-4 py-3 text-[15px] font-semibold text-[#002b11]/70 hover:text-[#002b11] hover:bg-[#002b11]/[0.03] rounded-xl transition-all"
         onClick={() => {
          setMobileOpen(false);
          const el = document.getElementById(item.toLowerCase());
          el?.scrollIntoView({ behavior: "smooth" });
         }}>
         {item}
        </button>
       ))}
       <div className="pt-3 border-t border-gray-100 flex gap-3 mt-2">
        {user ? (
         <button
          onClick={() => {
           logout();
           setMobileOpen(false);
          }}
          className="flex-1 py-3 text-sm font-semibold text-[#002b11] rounded-full border border-gray-200 hover:bg-gray-50">
          Sign out
         </button>
        ) : (
         <>
          <button
           onClick={() => {
            setMobileOpen(false);
            navigate("/signup");
           }}
           className="flex-1 py-3 text-sm font-semibold text-[#002b11] rounded-full border border-gray-200 hover:bg-gray-50">
           Sign up
          </button>
          <button
           onClick={() => {
            setMobileOpen(false);
            navigate("/login");
           }}
           className="flex-1 py-3 text-sm font-bold text-white rounded-full bg-[#002b11] hover:bg-[#004d1f]">
           Sign in
          </button>
         </>
        )}
       </div>
      </div>
     </motion.div>
    )}
   </AnimatePresence>
  </motion.nav>
 );
}

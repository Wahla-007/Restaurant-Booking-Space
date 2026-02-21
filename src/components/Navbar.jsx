import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X, User, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
 { label: "Discover", sectionId: "discover" },
 { label: "Cuisines", sectionId: "cuisines" },
 { label: "Reviews", sectionId: "reviews" },
 { label: "About", sectionId: "about" },
 { label: "Blog", path: "/blog" },
 { label: "For Business", path: "/business" },
];

export default function Navbar() {
 const navigate = useNavigate();
 const location = useLocation();
 const { user, logout } = useAuth();
 const [scrolled, setScrolled] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const [profileOpen, setProfileOpen] = useState(false);
 const profileRef = useRef(null);

 // Close profile dropdown when clicking outside
 useEffect(() => {
  const handleClickOutside = (e) => {
   if (profileRef.current && !profileRef.current.contains(e.target)) {
    setProfileOpen(false);
   }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 const handleNavClick = (link) => {
  if (link.path) {
   navigate(link.path);
   return;
  }
  // If on homepage, scroll to section
  if (location.pathname === "/") {
   const el = document.getElementById(link.sectionId);
   el?.scrollIntoView({ behavior: "smooth" });
  } else {
   // Navigate to homepage then scroll
   navigate("/");
   setTimeout(() => {
    const el = document.getElementById(link.sectionId);
    el?.scrollIntoView({ behavior: "smooth" });
   }, 300);
  }
 };

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
      <img src="/logo/logo.svg" alt="ReserveKaru Logo" className="w-10 h-8" />

      <span className="text-[26px] font-[900] tracking-tight text-[#002b11]">
       ReserveKaru
      </span>
     </motion.div>

     {/* Desktop Center Nav Links */}
     <div className="hidden md:flex items-center gap-1">
      {navLinks.map((link) => (
       <button
        key={link.label}
        className={`px-4 cursor-pointer py-2 text-[15px] font-semibold rounded-full transition-all duration-200 ${
         link.path && location.pathname === link.path
          ? "text-[#002b11] bg-[#002b11]/[0.06]"
          : "text-[#002b11]/70 hover:text-[#002b11] hover:bg-[#002b11]/[0.04]"
        }`}
        onClick={() => handleNavClick(link)}>
        {link.label}
       </button>
      ))}
     </div>

     {/* Right Side Auth */}
     <div className="hidden md:flex items-center gap-2">
      {user ? (
       <div className="relative" ref={profileRef}>
        <button
         onClick={() => setProfileOpen(!profileOpen)}
         className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
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
         <ChevronDown
          size={14}
          className={`text-[#002b11]/40 transition-transform duration-200 ${
           profileOpen ? "rotate-180" : ""
          }`}
         />
        </button>

        {/* Profile Dropdown */}
        <AnimatePresence>
         {profileOpen && (
          <motion.div
           initial={{ opacity: 0, y: 6, scale: 0.97 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: 6, scale: 0.97 }}
           transition={{ duration: 0.15 }}
           className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden z-50">
           <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-bold text-[#002b11] truncate">
             {user.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
           </div>
           <div className="py-1">
            <button
             onClick={() => {
              setProfileOpen(false);
              navigate("/profile");
             }}
             className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#002b11]/70 hover:text-[#002b11] hover:bg-gray-50 transition-colors cursor-pointer">
             <User size={16} />
             My Profile
            </button>
            <button
             onClick={() => {
              setProfileOpen(false);
              logout();
             }}
             className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-500/70 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
             <LogOut size={16} />
             Sign Out
            </button>
           </div>
          </motion.div>
         )}
        </AnimatePresence>
       </div>
      ) : (
       <div className="flex items-center gap-3">
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
       </div>
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
     <>
      {/* Blurred backdrop */}
      <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       transition={{ duration: 0.2 }}
       className="md:hidden fixed inset-0 top-[68px] bg-black/20 backdrop-blur-sm z-40"
       onClick={() => setMobileOpen(false)}
      />
      {/* Menu panel */}
      <motion.div
       initial={{ opacity: 0, height: 0 }}
       animate={{ opacity: 1, height: "auto" }}
       exit={{ opacity: 0, height: 0 }}
       transition={{ duration: 0.25 }}
       className="md:hidden relative z-50 bg-white border-t border-gray-100 shadow-xl">
       <div className="px-6 py-5 space-y-1">
        {navLinks.map((link) => (
         <button
          key={link.label}
          className={`block w-full text-left px-4 py-3 text-[15px] font-semibold rounded-xl transition-all ${
           link.path && location.pathname === link.path
            ? "text-[#002b11] bg-[#002b11]/[0.06]"
            : "text-[#002b11]/70 hover:text-[#002b11] hover:bg-[#002b11]/[0.03]"
          }`}
          onClick={() => {
           setMobileOpen(false);
           handleNavClick(link);
          }}>
          {link.label}
         </button>
        ))}
        <div className="pt-3 border-t border-gray-100 space-y-2 mt-2">
         {user ? (
          <>
           <button
            onClick={() => {
             setMobileOpen(false);
             navigate("/profile");
            }}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-full bg-[#002b11] hover:bg-[#004d1f] cursor-pointer">
            <User size={15} />
            My Profile
           </button>
           <button
            onClick={() => {
             logout();
             setMobileOpen(false);
            }}
            className="w-full py-3 text-sm font-semibold text-[#002b11] rounded-full border border-gray-200 hover:bg-gray-50 cursor-pointer">
            Sign out
           </button>
          </>
         ) : (
          <div className="flex flex-col xs:flex-row gap-2 w-full">
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
          </div>
         )}
        </div>
       </div>
      </motion.div>
     </>
    )}
   </AnimatePresence>
  </motion.nav>
 );
}

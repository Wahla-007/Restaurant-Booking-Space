import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ChefHat, Utensils, Award, Smartphone } from "lucide-react";

export default function AppDownloadPopup() {
 const [isOpen, setIsOpen] = useState(false);

 useEffect(() => {
  // Check if user has dismissed popup before
  const dismissed = sessionStorage.getItem("app-popup-dismissed");
  if (dismissed) return;

  const timer = setTimeout(() => {
   setIsOpen(true);
  }, 4000); // Show after 4 seconds

  return () => clearTimeout(timer);
 }, []);

 const handleClose = () => {
  setIsOpen(false);
  sessionStorage.setItem("app-popup-dismissed", "true");
 };

 return (
  <AnimatePresence>
   {isOpen && (
    <>
     {/* Backdrop */}
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
     />

     {/* Popup */}
     <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="relative w-full max-w-[860px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
       {/* Close Button */}
       <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors cursor-pointer">
        <X size={18} className="text-[#002b11]" />
       </button>

       {/* Left Side — Green Visual */}
       <div className="relative w-full md:w-[48%] bg-[#7cfc00] overflow-hidden p-8 md:p-10 flex flex-col items-center justify-center min-h-[280px] md:min-h-[440px]">
        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden">
         {/* Wavy border decorations */}
         <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full border-[3px] border-white/40 border-dashed" />
         <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border-[3px] border-white/40 border-dashed" />
         <div className="absolute top-12 right-6 w-16 h-16 rounded-full border-[3px] border-white/30 border-dashed" />
         <div className="absolute bottom-16 left-4 w-20 h-20 rounded-full border-[3px] border-white/30 border-dashed" />

         {/* Floating icons */}
         <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="absolute top-8 left-8">
          <div className="w-12 h-12 rounded-xl bg-white/90 shadow-lg flex items-center justify-center">
           <Award size={22} className="text-[#002b11]" />
          </div>
         </motion.div>

         <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
           repeat: Infinity,
           duration: 2.8,
           ease: "easeInOut",
           delay: 0.3,
          }}
          className="absolute top-6 right-10">
          <div className="w-10 h-10 rounded-lg bg-[#002b11] shadow-lg flex items-center justify-center">
           <Star size={16} className="text-[#7cfc00] fill-[#7cfc00]" />
          </div>
         </motion.div>

         <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
           repeat: Infinity,
           duration: 3.2,
           ease: "easeInOut",
           delay: 0.6,
          }}
          className="absolute bottom-8 right-12">
          <div className="w-11 h-11 rounded-xl bg-white/90 shadow-lg flex items-center justify-center">
           <ChefHat size={20} className="text-[#002b11]" />
          </div>
         </motion.div>

         <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
           repeat: Infinity,
           duration: 2.5,
           ease: "easeInOut",
           delay: 0.9,
          }}
          className="absolute bottom-12 left-6">
          <div className="w-10 h-10 rounded-lg bg-[#002b11] shadow-lg flex items-center justify-center">
           <Utensils size={16} className="text-[#7cfc00]" />
          </div>
         </motion.div>
        </div>

        {/* Phone Mockup */}
        <div className="relative z-[1]">
         <div className="w-[200px] md:w-[220px] bg-[#1a1a2e] rounded-[32px] p-2 shadow-2xl border-[3px] border-[#002b11]/20">
          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1a1a2e] rounded-b-2xl z-10" />
          {/* Screen */}
          <div className="bg-white rounded-[26px] overflow-hidden">
           {/* Status bar */}
           <div className="bg-[#002b11] px-4 py-3 flex items-center justify-between">
            <span className="text-[9px] text-white/80 font-medium">9:41</span>
            <div className="flex items-center gap-1">
             <div className="w-3 h-2 rounded-sm bg-white/60" />
             <div className="w-3 h-2 rounded-sm bg-white/60" />
            </div>
           </div>

           {/* App header */}
           <div className="bg-[#002b11] px-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
             <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-[7px] text-white font-bold">RK</span>
             </div>
             <span className="text-[10px] text-white font-bold">
              ReserveKaru
             </span>
            </div>
            <div className="bg-white/15 rounded-lg px-3 py-2">
             <span className="text-[8px] text-white/60">
              Search restaurants...
             </span>
            </div>
           </div>

           {/* Sample restaurant card inside phone */}
           <div className="p-3">
            <div className="rounded-xl overflow-hidden border border-gray-100">
             <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=60"
              alt="Restaurant"
              className="w-full h-20 object-cover"
             />
             <div className="p-2.5">
              <p className="text-[9px] font-bold text-[#002b11]">
               The Grand Table
              </p>
              <div className="flex items-center gap-1 mt-1">
               <div className="flex gap-[2px]">
                {[...Array(5)].map((_, i) => (
                 <div
                  key={i}
                  className="w-[6px] h-[6px] rounded-full bg-[#00aa6c]"
                 />
                ))}
               </div>
               <span className="text-[7px] text-gray-400">(2,808)</span>
              </div>
              <div className="mt-2 flex gap-1">
               <div className="px-2 py-0.5 rounded bg-[#002b11] text-[6px] text-white font-medium">
                Book Now
               </div>
              </div>
             </div>
            </div>

            {/* Welcome offer badge */}
            <div className="mt-3 bg-[#f0fdf4] border border-[#00aa6c]/20 rounded-xl p-2.5 flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg bg-[#00aa6c]/10 flex items-center justify-center shrink-0">
              <span className="text-[10px]">🎉</span>
             </div>
             <div>
              <p className="text-[8px] font-bold text-[#002b11]">
               Welcome Offer
              </p>
              <p className="text-[6px] text-gray-400">
               20% off your first booking
              </p>
             </div>
            </div>
           </div>

           {/* Bottom nav */}
           <div className="px-3 pb-2 pt-1 border-t border-gray-100 flex items-center justify-around">
            {["Home", "Search", "Bookings", "Account"].map((tab) => (
             <div key={tab} className="flex flex-col items-center gap-0.5">
              <div className="w-3 h-3 rounded bg-gray-200" />
              <span className="text-[6px] text-gray-400">{tab}</span>
             </div>
            ))}
           </div>
          </div>
         </div>
        </div>

        {/* QR Code section */}
        <div className="mt-5 flex items-center gap-3 bg-white/90 rounded-xl px-3 py-2.5 shadow-md z-[1]">
         <div className="w-12 h-12 bg-[#002b11] rounded-lg flex items-center justify-center">
          <div className="grid grid-cols-3 gap-[2px]">
           {[...Array(9)].map((_, i) => (
            <div
             key={i}
             className={`w-[5px] h-[5px] rounded-[1px] ${
              [0, 2, 3, 5, 6, 8].includes(i) ? "bg-white" : "bg-white/30"
             }`}
            />
           ))}
          </div>
         </div>
         <div>
          <p className="text-[10px] font-bold text-[#002b11]">
           Scan to download
          </p>
          <p className="text-[8px] text-gray-500">Available on iOS & Android</p>
         </div>
        </div>
       </div>

       {/* Right Side — Content */}
       <div className="w-full md:w-[52%] p-8 md:p-12 flex flex-col justify-center">
        <motion.div
         initial={{ opacity: 0, x: 20 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ delay: 0.15, duration: 0.4 }}>
         <h2 className="text-3xl md:text-[38px] font-extrabold text-[#002b11] leading-tight tracking-tight mb-6">
          Get the app,
          <br />
          dine smarter
         </h2>

         <div className="space-y-4 mb-8">
          {[
           "Download ReserveKaru for free",
           "Get 10% off your first reservation",
           "Exclusive app-only restaurant deals",
           "Instant booking confirmations",
          ].map((item, i) => (
           <div key={i} className="flex items-start gap-3">
            <span className="text-[#002b11] text-lg mt-0.5">✓</span>
            <p className="text-[15px] text-[#002b11]/80 font-medium leading-snug">
             {item}
            </p>
           </div>
          ))}
         </div>

         <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
           whileHover={{ scale: 1.03 }}
           whileTap={{ scale: 0.97 }}
           className="px-8 py-3.5 rounded-full bg-[#002b11] text-white font-bold text-sm shadow-lg hover:bg-[#004d1f] transition-colors cursor-pointer">
           Download Now
          </motion.button>

          <motion.button
           whileHover={{ scale: 1.03 }}
           whileTap={{ scale: 0.97 }}
           onClick={handleClose}
           className="px-8 py-3.5 rounded-full bg-transparent border-2 border-[#002b11]/15 text-[#002b11]/70 font-bold text-sm hover:border-[#002b11]/30 hover:text-[#002b11] transition-all cursor-pointer">
           Maybe Later
          </motion.button>
         </div>

         {/* App store badges */}
         <div className="flex items-center gap-4 mt-8">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white cursor-pointer hover:bg-gray-800 transition-colors">
           <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
           </svg>
           <div>
            <p className="text-[7px] leading-none opacity-80">
             Download on the
            </p>
            <p className="text-[11px] font-semibold leading-tight">App Store</p>
           </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white cursor-pointer hover:bg-gray-800 transition-colors">
           <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M3.18 23.69c.41.16.86.12 1.24-.1l11.38-6.61-2.9-2.87L3.18 23.69zm-.47-1.73L2.68 2.04c0-.04.01-.08.02-.12l9.67 9.58-9.67 9.46zM20.68 10.82L17.6 9.04l-3.19 3.12 3.22 3.1 3.05-1.78c.55-.32.88-.89.88-1.53 0-.63-.33-1.2-.88-1.53-.01-.01.01.4 0 .4zM4.95 1.34L16.27 8l-2.86 2.8L3.75.32c.4-.24.86-.19 1.2.02v1z" />
           </svg>
           <div>
            <p className="text-[7px] leading-none opacity-80">Get it on</p>
            <p className="text-[11px] font-semibold leading-tight">
             Google Play
            </p>
           </div>
          </div>
         </div>
        </motion.div>
       </div>
      </div>
     </motion.div>
    </>
   )}
  </AnimatePresence>
 );
}

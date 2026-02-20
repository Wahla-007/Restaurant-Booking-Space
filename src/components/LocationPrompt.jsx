import { useState } from "react";
import { MapPin, X, Navigation, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LocationPrompt({ onLocationGranted, onDismiss }) {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const handleDismiss = () => {
  localStorage.setItem("location-prompt-dismissed", "true");
  onDismiss?.();
 };

 const handleEnable = () => {
  if (!navigator.geolocation) {
   setError("Geolocation not supported by your browser");
   return;
  }

  setLoading(true);
  setError("");

  navigator.geolocation.getCurrentPosition(
   async (position) => {
    try {
     const { latitude, longitude } = position.coords;
     const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
     );
     const data = await resp.json();
     const city =
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.county ||
      "";
     if (city) {
      localStorage.setItem("user-city", city);
      localStorage.setItem("location-prompt-dismissed", "true");
      onLocationGranted?.(city);
     } else {
      setError("Could not detect your city. Please try again.");
      setLoading(false);
     }
    } catch {
     setError("Network error. Please try again.");
     setLoading(false);
    }
   },
   (err) => {
    setLoading(false);
    if (err.code === 1) {
     setError("Location access denied. Please allow it in browser settings.");
    } else {
     setError("Could not get location. Please try again.");
    }
   },
   { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
  );
 };

 return (
  <AnimatePresence>
   <motion.div
    initial={{ y: -80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -80, opacity: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className="fixed top-0 left-0 right-0 z-[60]">
    <div className="bg-gradient-to-r from-[#002b11] to-[#004a1e] shadow-xl shadow-[#002b11]/20">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 py-3 sm:py-3.5">
       {/* Left: Icon + Text */}
       <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 w-9 h-9 rounded-full bg-[#7cfc00]/15 flex items-center justify-center">
         <MapPin size={18} className="text-[#7cfc00]" />
        </div>
        <div className="min-w-0">
         <p className="text-white text-sm font-semibold truncate">
          Find restaurants near you
         </p>
         <p className="text-white/50 text-xs hidden sm:block">
          Enable location to discover the best dining spots in your area
         </p>
        </div>
       </div>

       {/* Right: Buttons */}
       <div className="flex items-center gap-2 shrink-0">
        <button
         onClick={handleEnable}
         disabled={loading}
         className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-[#7cfc00] hover:bg-[#6ee600] text-[#002b11] rounded-full text-sm font-bold transition-all disabled:opacity-70 cursor-pointer shadow-md shadow-[#7cfc00]/20">
         {loading ? (
          <>
           <Loader2 size={15} className="animate-spin" />
           <span className="hidden sm:inline">Detecting...</span>
          </>
         ) : (
          <>
           <Navigation size={15} />
           <span className="hidden sm:inline">Enable Location</span>
           <span className="sm:hidden">Enable</span>
          </>
         )}
        </button>
        <button
         onClick={handleDismiss}
         className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
         aria-label="Dismiss">
         <X size={16} className="text-white/60" />
        </button>
       </div>
      </div>

      {/* Error message */}
      {error && (
       <div className="pb-2.5 -mt-1">
        <p className="text-amber-300 text-xs font-medium">{error}</p>
       </div>
      )}
     </div>
    </div>
   </motion.div>
  </AnimatePresence>
 );
}

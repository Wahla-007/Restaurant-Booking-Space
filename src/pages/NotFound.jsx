import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, MapPin } from "lucide-react";

export default function NotFound() {
 return (
  <div className="min-h-screen bg-white flex flex-col">
   <div className="flex-1 flex items-center justify-center px-6 py-20">
    <div className="max-w-lg w-full text-center">
     {/* 404 Number */}
     <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}>
      <h1 className="text-[140px] sm:text-[180px] font-black text-[#002b11]/[0.04] leading-none select-none tracking-tighter">
       404
      </h1>
     </motion.div>

     {/* Icon + Message */}
     <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="-mt-16 sm:-mt-20">
      <div className="w-16 h-16 rounded-2xl bg-[#00aa6c]/10 flex items-center justify-center mx-auto mb-6">
       <MapPin size={28} className="text-[#00aa6c]" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight mb-3">
       Page not found
      </h2>
      <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-sm mx-auto mb-8">
       Looks like this page has moved or doesn't exist. Let's get you back to
       discovering great restaurants.
      </p>
     </motion.div>

     {/* Actions */}
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Link
       to="/"
       className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#002b11] hover:bg-[#003d18] text-white text-sm font-semibold transition-colors">
       <Home size={16} />
       Back to Home
      </Link>
      <button
       onClick={() => window.history.back()}
       className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-[#002b11] text-sm font-semibold transition-colors border border-gray-100 cursor-pointer">
       <ArrowLeft size={16} />
       Go Back
      </button>
     </motion.div>

     {/* Search hint */}
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="mt-12 pt-8 border-t border-gray-100">
      <p className="text-xs text-gray-300 mb-3">
       Or try searching for what you need
      </p>
      <Link
       to="/"
       className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gray-200 hover:border-[#002b11]/20 text-sm text-gray-400 hover:text-[#002b11] transition-colors">
       <Search size={15} />
       Search restaurants...
      </Link>
     </motion.div>
    </div>
   </div>

   {/* Footer */}
   <footer className="border-t border-gray-100 py-8 bg-white">
    <div className="max-w-7xl mx-auto px-6">
     <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
       <img src="/logo/logo.svg" alt="ReserveKaru" className="h-7 w-7" />
       <span className="text-base font-bold tracking-tight text-[#002b11]">
        ReserveKaru
       </span>
      </div>
      <p className="text-xs text-gray-300">
       © 2026 ReserveKaru. All rights reserved.
      </p>
     </div>
    </div>
   </footer>
  </div>
 );
}

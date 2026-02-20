import React from "react";

const PageLoader = () => {
 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-xl">
   <div className="flex flex-col items-center gap-4">
    <div className="relative w-12 h-12">
     <div className="absolute inset-0 rounded-full border-2 border-[#002b11]/10 animate-ping" />
     <div className="absolute inset-0 rounded-full border-t-2 border-[#002b11] animate-spin" />
    </div>
    <p className="text-[#002b11]/40 text-xs font-medium tracking-widest uppercase animate-pulse">
     Loading
    </p>
   </div>
  </div>
 );
};

export default PageLoader;

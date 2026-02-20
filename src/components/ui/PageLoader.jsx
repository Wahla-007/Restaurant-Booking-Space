import React from "react";
import { Loader2 } from "lucide-react";

const PageLoader = () => {
 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
   <div className="flex flex-col items-center gap-4">
    <div className="relative">
     <div className="w-16 h-16 rounded-full border-4 border-emerald-100 animate-pulse"></div>
     <div className="absolute inset-0 border-t-4 border-emerald-600 rounded-full animate-spin"></div>
     <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-emerald-600 animate-spin" />
    </div>
    <p className="text-emerald-800 font-medium tracking-wide animate-pulse">
     Loading...
    </p>
   </div>
  </div>
 );
};

export default PageLoader;

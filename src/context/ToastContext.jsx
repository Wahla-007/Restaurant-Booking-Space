import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => {
 const context = useContext(ToastContext);
 if (!context) {
  throw new Error("useToast must be used within a ToastProvider");
 }
 return context;
};

export const ToastProvider = ({ children }) => {
 const [toasts, setToasts] = useState([]);

 const addToast = useCallback((message, type = "info", duration = 3000) => {
  const id = Date.now();
  setToasts((prev) => [...prev, { id, message, type }]);

  setTimeout(() => {
   setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, duration);
 }, []);

 const removeToast = useCallback((id) => {
  setToasts((prev) => prev.filter((toast) => toast.id !== id));
 }, []);

 return (
  <ToastContext.Provider value={{ addToast }}>
   {children}
   <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    {toasts.map((toast) => (
     <div
      key={toast.id}
      className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-in
              ${
               toast.type === "success"
                ? "bg-white border-emerald-100 text-emerald-800"
                : toast.type === "error"
                  ? "bg-white border-rose-100 text-rose-800"
                  : "bg-white border-slate-100 text-slate-800"
              }
            `}>
      {toast.type === "success" && (
       <CheckCircle className="w-5 h-5 text-emerald-500" />
      )}
      {toast.type === "error" && (
       <AlertCircle className="w-5 h-5 text-rose-500" />
      )}
      {toast.type === "info" && <Info className="w-5 h-5 text-blue-500" />}

      <p className="font-medium text-sm">{toast.message}</p>

      <button
       onClick={() => removeToast(toast.id)}
       className="ml-4 text-slate-400 hover:text-slate-600">
       <X className="w-4 h-4" />
      </button>
     </div>
    ))}
   </div>
  </ToastContext.Provider>
 );
};

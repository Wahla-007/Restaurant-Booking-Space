import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, footer }) {
 if (!isOpen) return null;

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
   <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
    <div className="flex justify-between items-center p-6 border-b border-slate-100">
     <h3 className="text-lg font-bold text-slate-800">{title}</h3>
     <button
      onClick={onClose}
      className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors">
      <X className="w-5 h-5" />
     </button>
    </div>
    <div className="p-6">{children}</div>
    {footer && (
     <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
      {footer}
     </div>
    )}
   </div>
  </div>
 );
}

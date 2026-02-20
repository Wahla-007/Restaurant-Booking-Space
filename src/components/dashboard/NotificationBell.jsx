import { useState, useRef, useEffect } from "react";
import { Bell, CalendarCheck, Star, X, Check } from "lucide-react";
import { format } from "date-fns";

export default function NotificationBell({
 notifications,
 onClear,
 onClearAll,
}) {
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef(null);
 const prevCountRef = useRef(notifications.length);

 const unreadCount = notifications.length;

 // Auto-open dropdown and flash when new notification arrives
 useEffect(() => {
  if (notifications.length > prevCountRef.current) {
   setIsOpen(true);
  }
  prevCountRef.current = notifications.length;
 }, [notifications.length]);

 // Close dropdown when clicking outside
 useEffect(() => {
  const handleClickOutside = (e) => {
   if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
    setIsOpen(false);
   }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 return (
  <div className="relative" ref={dropdownRef}>
   {/* Bell Button */}
   <button
    onClick={() => setIsOpen(!isOpen)}
    className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors group"
    title="Notifications">
    <Bell
     size={22}
     className="text-slate-500 group-hover:text-slate-700 transition-colors"
    />
    {unreadCount > 0 && (
     <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 flex items-center justify-center px-1 text-[11px] font-bold text-white bg-red-500 rounded-full shadow-lg shadow-red-200 animate-pulse">
      {unreadCount > 99 ? "99+" : unreadCount}
     </span>
    )}
   </button>

   {/* Dropdown Panel */}
   {isOpen && (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden">
     {/* Header */}
     <div className="flex items-center justify-between px-5 py-3.5 bg-linear-to-r from-slate-50 to-white border-b border-slate-100">
      <div className="flex items-center gap-2">
       <Bell size={16} className="text-slate-600" />
       <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
       {unreadCount > 0 && (
        <span className="text-xs font-medium text-white bg-emerald-500 px-2 py-0.5 rounded-full">
         {unreadCount} new
        </span>
       )}
      </div>
      {unreadCount > 0 && (
       <button
        onClick={() => {
         onClearAll();
         setIsOpen(false);
        }}
        className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium flex items-center gap-1">
        <Check size={12} />
        Clear all
       </button>
      )}
     </div>

     {/* Notifications List */}
     <div className="max-h-96 overflow-y-auto">
      {notifications.length === 0 ? (
       <div className="flex flex-col items-center justify-center py-12 px-5">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
         <Bell size={24} className="text-slate-300" />
        </div>
        <p className="text-slate-400 text-sm font-medium">
         No new notifications
        </p>
        <p className="text-slate-300 text-xs mt-1">You're all caught up!</p>
       </div>
      ) : (
       notifications.map((notif) => (
        <div
         key={notif.id}
         className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group">
         {/* Icon */}
         <div
          className={`mt-0.5 shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
           notif.type === "booking"
            ? "bg-blue-50 text-blue-500"
            : "bg-amber-50 text-amber-500"
          }`}>
          {notif.type === "booking" ? (
           <CalendarCheck size={16} />
          ) : (
           <Star size={16} />
          )}
         </div>

         {/* Content */}
         <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 font-medium leading-snug">
           {notif.title}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
           {notif.message}
          </p>
          <p className="text-[11px] text-slate-300 mt-1">
           {format(new Date(notif.time), "hh:mm a")}
          </p>
         </div>

         {/* Dismiss */}
         <button
          onClick={() => onClear(notif.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded-lg shrink-0"
          title="Dismiss">
          <X size={14} className="text-slate-400" />
         </button>
        </div>
       ))
      )}
     </div>
    </div>
   )}
  </div>
 );
}

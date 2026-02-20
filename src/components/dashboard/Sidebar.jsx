import { useState } from "react";
import {
 LayoutDashboard,
 UtensilsCrossed,
 CalendarClock,
 Settings,
 LogOut,
 Store,
 Users,
 Headset,
 MessageSquareText,
 BarChart3,
 Volume2,
 VolumeOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { isSoundEnabled, toggleSound } from "../../utils/notificationSound";
import { useToast } from "../../context/ToastContext";

const Sidebar = ({ activeTab, setActiveTab, onLogout, restaurantName }) => {
 const { addToast } = useToast();
 const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

 const handleToggleSound = () => {
  const newState = toggleSound();
  setSoundOn(newState);
  addToast(
   newState
    ? "🔔 Notification sound enabled"
    : "🔕 Notification sound disabled",
   newState ? "success" : "info",
  );
 };

 return (
  <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen sticky top-0">
   <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
    <div className="bg-emerald-600 p-2 rounded-lg shrink-0">
     <Store className="text-white w-6 h-6" />
    </div>
    <div className="overflow-hidden">
     <h1 className="text-lg font-bold text-slate-800 tracking-tight truncate">
      {restaurantName || "RestoManager"}
     </h1>
     <p className="text-xs text-slate-500 font-medium truncate">
      Business Dashboard
     </p>
    </div>
   </div>

   <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
    <SidebarItem
     icon={LayoutDashboard}
     label="Overview"
     active={activeTab === "Overview"}
     onClick={() => setActiveTab("Overview")}
    />
    <SidebarItem
     icon={UtensilsCrossed}
     label="Menu"
     active={activeTab === "Menu"}
     onClick={() => setActiveTab("Menu")}
    />
    <SidebarItem
     icon={CalendarClock}
     label="Reservations"
     active={activeTab === "Reservations"}
     onClick={() => setActiveTab("Reservations")}
    />
    <SidebarItem
     icon={Users}
     label="Leads"
     active={activeTab === "Leads"}
     onClick={() => setActiveTab("Leads")}
    />
    <SidebarItem
     icon={MessageSquareText}
     label="Reviews"
     active={activeTab === "Reviews"}
     onClick={() => setActiveTab("Reviews")}
    />
    <SidebarItem
     icon={BarChart3}
     label="Traffic"
     active={activeTab === "Traffic"}
     onClick={() => setActiveTab("Traffic")}
    />
    <SidebarItem
     icon={Settings}
     label="Settings"
     active={activeTab === "Settings"}
     onClick={() => setActiveTab("Settings")}
    />
    <SidebarItem
     icon={Headset}
     label="Support"
     active={activeTab === "Support"}
     onClick={() => setActiveTab("Support")}
    />
   </nav>

   <div className="p-4 border-t border-slate-100 space-y-1 shrink-0">
    <button
     onClick={handleToggleSound}
     className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer ${
      soundOn
       ? "text-emerald-600 hover:bg-emerald-50"
       : "text-slate-400 hover:bg-slate-50"
     }`}>
     {soundOn ? (
      <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
     ) : (
      <VolumeOff className="w-5 h-5 group-hover:scale-110 transition-transform" />
     )}
     <span className="font-medium">Sound {soundOn ? "On" : "Off"}</span>
    </button>
    <button
     onClick={onLogout}
     className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-red-600 rounded-xl transition-all duration-200 group cursor-pointer">
     <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
     <span className="font-medium">Sign Out</span>
    </button>
   </div>
  </aside>
 );
};

// Internal component for sidebar items
const SidebarItem = ({ icon: Icon, label, active, badge, onClick }) => (
 <button
  onClick={onClick}
  className={`
      flex items-center cursor-pointer justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group
      ${
       active
        ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm ring-1 ring-emerald-200"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }
    `}>
  <div className="flex items-center gap-3">
   <Icon
    className={`w-5 h-5 ${active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
   />
   <span>{label}</span>
  </div>
  {badge && (
   <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
    {badge}
   </span>
  )}
 </button>
);

export default Sidebar;

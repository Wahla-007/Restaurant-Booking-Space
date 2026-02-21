import { useState, useEffect } from "react";
import {
 LayoutDashboard,
 Store,
 CalendarClock,
 Users,
 Star,
 MessageSquareHeart,
 Headset,
 Megaphone,
 Banknote,
 LogOut,
 ShieldCheck,
 Volume2,
 VolumeOff,
 Newspaper,
} from "lucide-react";
import { isSoundEnabled, toggleSound } from "../../utils/notificationSound";
import { useToast } from "../../context/ToastContext";

const AdminSidebar = ({ activeTab, setActiveTab, onLogout }) => {
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
    <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
     <ShieldCheck className="text-white w-6 h-6" />
    </div>
    <div className="overflow-hidden">
     <h1 className="text-lg font-bold text-slate-800 tracking-tight truncate">
      Super Admin
     </h1>
     <p className="text-xs text-slate-500 font-medium truncate">
      System Control Panel
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
     icon={Store}
     label="Restaurants"
     active={activeTab === "Restaurants"}
     onClick={() => setActiveTab("Restaurants")}
    />
    <SidebarItem
     icon={CalendarClock}
     label="Today's Reservations"
     active={activeTab === "Reservations"}
     onClick={() => setActiveTab("Reservations")}
    />
    <SidebarItem
     icon={Users}
     label="Users"
     active={activeTab === "Users"}
     onClick={() => setActiveTab("Users")}
    />
    <SidebarItem
     icon={Star}
     label="Reviews"
     active={activeTab === "Reviews"}
     onClick={() => setActiveTab("Reviews")}
    />
    <SidebarItem
     icon={MessageSquareHeart}
     label="Web Reviews"
     active={activeTab === "Web Reviews"}
     onClick={() => setActiveTab("Web Reviews")}
    />
    <SidebarItem
     icon={Megaphone}
     label="Banner Ads"
     active={activeTab === "Banner Ads"}
     onClick={() => setActiveTab("Banner Ads")}
    />
    <SidebarItem
     icon={Banknote}
     label="Payments"
     active={activeTab === "Payments"}
     onClick={() => setActiveTab("Payments")}
    />
    <SidebarItem
     icon={Newspaper}
     label="Blog"
     active={activeTab === "Blog"}
     onClick={() => setActiveTab("Blog")}
    />
    <SidebarItem
     icon={Headset}
     label="Support Tickets"
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

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
 <button
  onClick={onClick}
  className={`
      flex items-center cursor-pointer justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group
      ${
       active
        ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm ring-1 ring-indigo-200"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }
    `}>
  <div className="flex items-center gap-3">
   <Icon
    className={`w-5 h-5 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
   />
   <span>{label}</span>
  </div>
 </button>
);

export default AdminSidebar;

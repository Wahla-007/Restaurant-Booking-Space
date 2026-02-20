import {
 Store,
 Users,
 CalendarCheck,
 TrendingUp,
 Star,
 ArrowUpRight,
} from "lucide-react";

export default function AdminOverview({
 restaurants,
 users,
 bookings,
 todayBookings,
}) {
 const totalRestaurants = restaurants.length;
 const activeRestaurants = restaurants.filter(
  (r) => r.is_active !== false,
 ).length;
 const totalUsers = users.length;
 const totalBookings = bookings.length;
 const todayCount = todayBookings.length;
 const completedBookings = bookings.filter(
  (b) => b.status === "completed",
 ).length;
 const cancelledBookings = bookings.filter(
  (b) => b.status === "cancelled",
 ).length;

 // Top restaurants by bookings
 const restaurantBookingCounts = {};
 bookings.forEach((b) => {
  const name = b.restaurant_name || "Unknown";
  restaurantBookingCounts[name] = (restaurantBookingCounts[name] || 0) + 1;
 });
 const topRestaurants = Object.entries(restaurantBookingCounts)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5);

 const maxBookingCount = topRestaurants.length > 0 ? topRestaurants[0][1] : 1;

 return (
  <div className="space-y-6">
   <div>
    <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
    <p className="text-sm text-slate-500 mt-1">
     Platform-wide stats at a glance
    </p>
   </div>

   {/* Stats Grid */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <StatCard
     title="Total Restaurants"
     value={totalRestaurants}
     subtitle={`${activeRestaurants} active`}
     icon={Store}
     color="indigo"
    />
    <StatCard
     title="Registered Users"
     value={totalUsers}
     subtitle="All accounts"
     icon={Users}
     color="blue"
    />
    <StatCard
     title="Total Bookings"
     value={totalBookings}
     subtitle={`${completedBookings} completed`}
     icon={CalendarCheck}
     color="emerald"
    />
    <StatCard
     title="Today's Reservations"
     value={todayCount}
     subtitle={`${cancelledBookings} cancelled overall`}
     icon={TrendingUp}
     color="amber"
    />
   </div>

   {/* Two Column Layout */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Top Restaurants */}
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
     <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-semibold text-slate-800">
       Top Restaurants by Bookings
      </h3>
      <Star className="w-5 h-5 text-amber-400" fill="#fbbf24" />
     </div>
     {topRestaurants.length === 0 ? (
      <p className="text-sm text-slate-400 py-8 text-center">No data yet</p>
     ) : (
      <div className="space-y-3">
       {topRestaurants.map(([name, count], i) => (
        <div key={name} className="flex items-center gap-3">
         <span className="w-6 text-xs font-bold text-slate-400 text-center">
          #{i + 1}
         </span>
         <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
           <span className="text-sm font-medium text-slate-700 truncate max-w-50">
            {name}
           </span>
           <span className="text-xs font-semibold text-slate-500">
            {count} bookings
           </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
           <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(count / maxBookingCount) * 100}%` }}
           />
          </div>
         </div>
        </div>
       ))}
      </div>
     )}
    </div>

    {/* Recent Bookings */}
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
     <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-semibold text-slate-800">
       Latest Bookings
      </h3>
      <ArrowUpRight className="w-5 h-5 text-slate-400" />
     </div>
     {bookings.length === 0 ? (
      <p className="text-sm text-slate-400 py-8 text-center">No bookings yet</p>
     ) : (
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
       {bookings.slice(0, 8).map((b) => (
        <div
         key={b.id}
         className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
         <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
           <span className="text-xs font-bold text-indigo-600">
            {(b.users?.name || b.user_name || "G").charAt(0).toUpperCase()}
           </span>
          </div>
          <div className="min-w-0">
           <p className="text-sm font-medium text-slate-700 truncate">
            {b.users?.name || b.user_name || "Guest"}
           </p>
           <p className="text-xs text-slate-400 truncate">
            {b.restaurant_name || "—"} · {b.date} at {b.time}
           </p>
          </div>
         </div>
         <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
           b.status === "completed"
            ? "bg-emerald-50 text-emerald-700"
            : b.status === "cancelled"
              ? "bg-red-50 text-red-600"
              : "bg-blue-50 text-blue-600"
          }`}>
          {b.status}
         </span>
        </div>
       ))}
      </div>
     )}
    </div>
   </div>
  </div>
 );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
 const colors = {
  indigo: {
   bg: "bg-indigo-50",
   icon: "text-indigo-600",
   ring: "ring-indigo-100",
  },
  blue: { bg: "bg-blue-50", icon: "text-blue-600", ring: "ring-blue-100" },
  emerald: {
   bg: "bg-emerald-50",
   icon: "text-emerald-600",
   ring: "ring-emerald-100",
  },
  amber: {
   bg: "bg-amber-50",
   icon: "text-amber-600",
   ring: "ring-amber-100",
  },
 };

 const c = colors[color] || colors.indigo;

 return (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
   <div className="flex items-center justify-between mb-3">
    <div className={`${c.bg} p-2.5 rounded-xl ring-1 ${c.ring}`}>
     <Icon className={`w-5 h-5 ${c.icon}`} />
    </div>
   </div>
   <p className="text-2xl font-bold text-slate-800">{value}</p>
   <p className="text-sm text-slate-500 mt-0.5">{title}</p>
   <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
  </div>
 );
}

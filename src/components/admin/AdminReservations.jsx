import { useState, useMemo } from "react";
import {
 Search,
 CalendarCheck,
 Clock,
 Users as UsersIcon,
 ChevronLeft,
 ChevronRight,
 X,
 Store,
 Filter,
} from "lucide-react";

const PER_PAGE = 10;

export default function AdminReservations({ bookings, restaurants }) {
 const [search, setSearch] = useState("");
 const [filterRestaurant, setFilterRestaurant] = useState("all");
 const [filterStatus, setFilterStatus] = useState("all");
 const [currentPage, setCurrentPage] = useState(1);

 // Get today's date string
 const todayStr = new Date().toISOString().split("T")[0];

 // Today's bookings
 const todayBookings = useMemo(
  () => bookings.filter((b) => b.date === todayStr),
  [bookings, todayStr],
 );

 // Filtered
 const filtered = todayBookings.filter((b) => {
  const matchesSearch =
   !search ||
   (b.users?.name || b.user_name || "")
    .toLowerCase()
    .includes(search.toLowerCase()) ||
   (b.restaurant_name || "").toLowerCase().includes(search.toLowerCase()) ||
   (b.booking_code || "").toLowerCase().includes(search.toLowerCase());

  const matchesRestaurant =
   filterRestaurant === "all" || b.restaurant_id === filterRestaurant;

  const matchesStatus = filterStatus === "all" || b.status === filterStatus;

  return matchesSearch && matchesRestaurant && matchesStatus;
 });

 const totalPages = Math.ceil(filtered.length / PER_PAGE);
 const paginated = filtered.slice(
  (currentPage - 1) * PER_PAGE,
  currentPage * PER_PAGE,
 );

 // Group today's bookings by restaurant
 const byRestaurant = useMemo(() => {
  const map = {};
  todayBookings.forEach((b) => {
   const name = b.restaurant_name || "Unknown";
   if (!map[name])
    map[name] = { confirmed: 0, cancelled: 0, completed: 0, total: 0 };
   map[name].total++;
   if (b.status === "confirmed") map[name].confirmed++;
   else if (b.status === "cancelled") map[name].cancelled++;
   else if (b.status === "completed") map[name].completed++;
  });
  return Object.entries(map).sort(([, a], [, b]) => b.total - a.total);
 }, [todayBookings]);

 // Unique restaurant IDs for filter
 const restaurantOptions = useMemo(() => {
  const seen = new Map();
  todayBookings.forEach((b) => {
   if (b.restaurant_id && !seen.has(b.restaurant_id)) {
    seen.set(b.restaurant_id, b.restaurant_name || "Unknown");
   }
  });
  return Array.from(seen.entries());
 }, [todayBookings]);

 const statusCounts = useMemo(() => {
  const counts = { confirmed: 0, cancelled: 0, completed: 0 };
  todayBookings.forEach((b) => {
   if (counts[b.status] !== undefined) counts[b.status]++;
  });
  return counts;
 }, [todayBookings]);

 return (
  <div className="space-y-6">
   <div>
    <h2 className="text-2xl font-bold text-slate-800">Today's Reservations</h2>
    <p className="text-sm text-slate-500 mt-1">
     {new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
     })}{" "}
     · {todayBookings.length} total reservations
    </p>
   </div>

   {/* Quick Stats */}
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <QuickStat
     label="Total Today"
     value={todayBookings.length}
     color="indigo"
    />
    <QuickStat label="Confirmed" value={statusCounts.confirmed} color="blue" />
    <QuickStat
     label="Completed"
     value={statusCounts.completed}
     color="emerald"
    />
    <QuickStat label="Cancelled" value={statusCounts.cancelled} color="red" />
   </div>

   {/* By Restaurant Summary */}
   {byRestaurant.length > 0 && (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
     <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
      <Store size={16} className="text-indigo-500" />
      Reservations by Restaurant
     </h3>
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {byRestaurant.map(([name, counts]) => (
       <div
        key={name}
        className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
        <span className="text-sm font-medium text-slate-700 truncate max-w-40">
         {name}
        </span>
        <div className="flex items-center gap-2">
         <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {counts.confirmed}
         </span>
         <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
          {counts.completed}
         </span>
         <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
          {counts.cancelled}
         </span>
        </div>
       </div>
      ))}
     </div>
    </div>
   )}

   {/* Search & Filter */}
   <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
     <input
      type="text"
      placeholder="Search guest, restaurant, or booking code..."
      value={search}
      onChange={(e) => {
       setSearch(e.target.value);
       setCurrentPage(1);
      }}
      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
     />
     {search && (
      <button
       onClick={() => setSearch("")}
       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
       <X size={16} />
      </button>
     )}
    </div>
    <div className="relative">
     <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
     <select
      value={filterRestaurant}
      onChange={(e) => {
       setFilterRestaurant(e.target.value);
       setCurrentPage(1);
      }}
      className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer">
      <option value="all">All Restaurants</option>
      {restaurantOptions.map(([id, name]) => (
       <option key={id} value={id}>
        {name}
       </option>
      ))}
     </select>
    </div>
    <select
     value={filterStatus}
     onChange={(e) => {
      setFilterStatus(e.target.value);
      setCurrentPage(1);
     }}
     className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer">
     <option value="all">All Statuses</option>
     <option value="confirmed">Confirmed</option>
     <option value="completed">Completed</option>
     <option value="cancelled">Cancelled</option>
    </select>
   </div>

   {/* Table */}
   {filtered.length === 0 ? (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
     <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
     <h3 className="text-lg font-semibold text-slate-700">
      {todayBookings.length === 0
       ? "No reservations today"
       : "No matching reservations"}
     </h3>
     <p className="text-sm text-slate-500 mt-1">
      {todayBookings.length === 0
       ? "There are no reservations scheduled for today."
       : "Try adjusting your search or filters."}
     </p>
    </div>
   ) : (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
     <div className="overflow-x-auto">
      <table className="w-full">
       <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
         <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Guest
         </th>
         <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Restaurant
         </th>
         <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Time
         </th>
         <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Party
         </th>
         <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Code
         </th>
         <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Status
         </th>
        </tr>
       </thead>
       <tbody className="divide-y divide-slate-100">
        {paginated.map((b) => (
         <tr key={b.id} className="hover:bg-slate-50 transition-colors">
          <td className="px-5 py-3.5">
           <div className="flex items-center gap-2.5">
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
              {b.users?.email || "—"}
             </p>
            </div>
           </div>
          </td>
          <td className="px-5 py-3.5">
           <p className="text-sm text-slate-700 truncate max-w-45">
            {b.restaurant_name || "—"}
           </p>
          </td>
          <td className="px-5 py-3.5">
           <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Clock size={13} className="text-slate-400" />
            {b.time}
           </div>
          </td>
          <td className="px-5 py-3.5 text-center">
           <div className="inline-flex items-center gap-1 text-sm text-slate-600">
            <UsersIcon size={13} className="text-slate-400" />
            {b.party_size}
           </div>
          </td>
          <td className="px-5 py-3.5">
           <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {b.booking_code || "—"}
           </span>
          </td>
          <td className="px-5 py-3.5 text-center">
           <span
            className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${
             b.status === "completed"
              ? "bg-emerald-50 text-emerald-700"
              : b.status === "cancelled"
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}>
            {b.status}
           </span>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   )}

   {/* Pagination */}
   {totalPages > 1 && (
    <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-sm">
     <p className="text-sm text-slate-500">
      Showing{" "}
      <span className="font-semibold text-slate-700">
       {(currentPage - 1) * PER_PAGE + 1}
      </span>
      –
      <span className="font-semibold text-slate-700">
       {Math.min(currentPage * PER_PAGE, filtered.length)}
      </span>{" "}
      of <span className="font-semibold text-slate-700">{filtered.length}</span>
     </p>
     <div className="flex items-center gap-1">
      <button
       onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
       disabled={currentPage === 1}
       className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
       <ChevronLeft size={18} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
       .filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
       )
       .reduce((acc, p, idx, arr) => {
        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
        acc.push(p);
        return acc;
       }, [])
       .map((p, idx) =>
        p === "..." ? (
         <span key={`d-${idx}`} className="px-2 text-slate-400 text-sm">
          …
         </span>
        ) : (
         <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
           currentPage === p
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
          }`}>
          {p}
         </button>
        ),
       )}
      <button
       onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
       disabled={currentPage === totalPages}
       className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
       <ChevronRight size={18} />
      </button>
     </div>
    </div>
   )}
  </div>
 );
}

function QuickStat({ label, value, color }) {
 const colors = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-red-50 text-red-700 border-red-200",
 };

 return (
  <div
   className={`rounded-2xl border p-4 text-center ${colors[color] || colors.indigo}`}>
   <p className="text-2xl font-bold">{value}</p>
   <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
  </div>
 );
}

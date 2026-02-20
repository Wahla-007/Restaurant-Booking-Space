import { useState } from "react";
import {
 Search,
 ChevronLeft,
 ChevronRight,
 X,
 Users as UsersIcon,
 Mail,
 ShieldCheck,
 ShieldOff,
 Crown,
 UserCheck,
 Store,
 Calendar,
 Trash2,
 ArrowRightLeft,
 AlertTriangle,
} from "lucide-react";

const PER_PAGE = 10;

export default function AdminUsers({
 users,
 bookings,
 onDeleteUser,
 onChangeRole,
 adminEmail,
}) {
 const [search, setSearch] = useState("");
 const [filterRole, setFilterRole] = useState("all");
 const [filterVerified, setFilterVerified] = useState("all");
 const [currentPage, setCurrentPage] = useState(1);
 const [confirmAction, setConfirmAction] = useState(null);
 // confirmAction: { type: 'delete' | 'role', user, newRole? }

 // Enrich users with booking count
 const enrichedUsers = users.map((u) => {
  const userBookings = bookings.filter(
   (b) => String(b.user_id) === String(u.id),
  );
  return { ...u, bookingCount: userBookings.length };
 });

 const filtered = enrichedUsers.filter((u) => {
  const matchesSearch =
   !search ||
   u.name?.toLowerCase().includes(search.toLowerCase()) ||
   u.email?.toLowerCase().includes(search.toLowerCase());

  const matchesRole = filterRole === "all" || u.role === filterRole;

  const matchesVerified =
   filterVerified === "all" ||
   (filterVerified === "verified" && u.is_verified) ||
   (filterVerified === "unverified" && !u.is_verified);

  return matchesSearch && matchesRole && matchesVerified;
 });

 const totalPages = Math.ceil(filtered.length / PER_PAGE);
 const paginated = filtered.slice(
  (currentPage - 1) * PER_PAGE,
  currentPage * PER_PAGE,
 );

 const customerCount = users.filter((u) => u.role !== "business").length;
 const businessCount = users.filter((u) => u.role === "business").length;
 const verifiedCount = users.filter((u) => u.is_verified).length;

 return (
  <div className="space-y-6">
   <div>
    <h2 className="text-2xl font-bold text-slate-800">All Users</h2>
    <p className="text-sm text-slate-500 mt-1">
     {users.length} total · {customerCount} customers · {businessCount} business
     owners · {verifiedCount} verified
    </p>
   </div>

   {/* Quick Stats */}
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <QuickStat
     icon={UsersIcon}
     label="Total Users"
     value={users.length}
     color="indigo"
    />
    <QuickStat
     icon={UserCheck}
     label="Customers"
     value={customerCount}
     color="blue"
    />
    <QuickStat
     icon={Store}
     label="Business"
     value={businessCount}
     color="amber"
    />
    <QuickStat
     icon={ShieldCheck}
     label="Verified"
     value={verifiedCount}
     color="emerald"
    />
   </div>

   {/* Search & Filter */}
   <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
     <input
      type="text"
      placeholder="Search by name or email..."
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
    <select
     value={filterRole}
     onChange={(e) => {
      setFilterRole(e.target.value);
      setCurrentPage(1);
     }}
     className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer">
     <option value="all">All Roles</option>
     <option value="customer">Customers</option>
     <option value="business">Business</option>
    </select>
    <select
     value={filterVerified}
     onChange={(e) => {
      setFilterVerified(e.target.value);
      setCurrentPage(1);
     }}
     className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer">
     <option value="all">All Status</option>
     <option value="verified">Verified</option>
     <option value="unverified">Unverified</option>
    </select>
   </div>

   {/* Users Table */}
   {filtered.length === 0 ? (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
     <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
     <h3 className="text-lg font-semibold text-slate-700">No users found</h3>
     <p className="text-sm text-slate-500 mt-1">
      Try adjusting your search or filters
     </p>
    </div>
   ) : (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
     <div className="overflow-x-auto">
      <table className="w-full">
       <thead>
        <tr className="bg-slate-50 border-b border-slate-200">
         <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          User
         </th>
         <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Email
         </th>
         <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Role
         </th>
         <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Verified
         </th>
         <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Bookings
         </th>
         <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Joined
         </th>
         <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
          Actions
         </th>
        </tr>
       </thead>
       <tbody className="divide-y divide-slate-100">
        {paginated.map((u) => (
         <tr key={u.id} className="hover:bg-slate-50 transition-colors">
          <td className="px-5 py-3.5">
           <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-indigo-100">
             {u.avatar ? (
              <img
               src={u.avatar}
               alt={u.name}
               className="w-full h-full object-cover"
              />
             ) : (
              <div className="w-full h-full flex items-center justify-center">
               <span className="text-sm font-bold text-indigo-600">
                {(u.name || "?").charAt(0).toUpperCase()}
               </span>
              </div>
             )}
            </div>
            <span className="text-sm font-medium text-slate-700 truncate max-w-40">
             {u.name || "—"}
            </span>
           </div>
          </td>
          <td className="px-5 py-3.5">
           <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Mail size={13} className="text-slate-400 shrink-0" />
            <span className="truncate max-w-50">{u.email}</span>
           </div>
          </td>
          <td className="px-5 py-3.5 text-center">
           <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
             u.role === "business"
              ? "bg-amber-50 text-amber-700"
              : "bg-blue-50 text-blue-600"
            }`}>
            {u.role === "business" ? (
             <Crown size={11} />
            ) : (
             <UserCheck size={11} />
            )}
            {u.role === "business" ? "Business" : "Customer"}
           </span>
          </td>
          <td className="px-5 py-3.5 text-center">
           {u.is_verified ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
             <ShieldCheck size={12} />
             Yes
            </span>
           ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
             <ShieldOff size={12} />
             No
            </span>
           )}
          </td>
          <td className="px-5 py-3.5 text-center">
           <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600">
            <Calendar size={13} className="text-slate-400" />
            {u.bookingCount}
           </span>
          </td>
          <td className="px-5 py-3.5">
           <span className="text-xs text-slate-400">
            {u.created_at
             ? new Date(u.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
               })
             : "—"}
           </span>
          </td>
          <td className="px-5 py-3.5 text-center">
           {u.email !== adminEmail ? (
            <div className="flex items-center justify-center gap-1.5">
             {/* Role Change */}
             <select
              value={u.role || "customer"}
              onChange={(e) =>
               setConfirmAction({
                type: "role",
                user: u,
                newRole: e.target.value,
               })
              }
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
              <option value="customer">Customer</option>
              <option value="business">Business</option>
              <option value="admin">Admin</option>
             </select>
             {/* Delete */}
             <button
              onClick={() => setConfirmAction({ type: "delete", user: u })}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete user">
              <Trash2 size={15} />
             </button>
            </div>
           ) : (
            <span className="text-xs text-indigo-500 font-medium">You</span>
           )}
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

   {/* Confirmation Modal */}
   {confirmAction && (
    <div
     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
     onClick={() => setConfirmAction(null)}>
     <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
      onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-3 mb-4">
       <div
        className={`p-2.5 rounded-xl ${
         confirmAction.type === "delete"
          ? "bg-red-100 text-red-600"
          : "bg-indigo-100 text-indigo-600"
        }`}>
        {confirmAction.type === "delete" ? (
         <Trash2 size={20} />
        ) : (
         <ArrowRightLeft size={20} />
        )}
       </div>
       <div>
        <h3 className="font-semibold text-slate-800">
         {confirmAction.type === "delete" ? "Delete User" : "Change User Role"}
        </h3>
        <p className="text-xs text-slate-500">This action cannot be undone</p>
       </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 mb-5">
       <p className="text-sm text-slate-700">
        {confirmAction.type === "delete" ? (
         <>
          Are you sure you want to permanently delete{" "}
          <strong>{confirmAction.user.name || confirmAction.user.email}</strong>
          ? All their data will be removed.
         </>
        ) : (
         <>
          Change{" "}
          <strong>{confirmAction.user.name || confirmAction.user.email}</strong>
          's role from <strong>
           {confirmAction.user.role || "customer"}
          </strong>{" "}
          to <strong>{confirmAction.newRole}</strong>?
         </>
        )}
       </p>
      </div>

      <div className="flex items-center gap-3">
       <button
        onClick={() => setConfirmAction(null)}
        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
        Cancel
       </button>
       <button
        onClick={() => {
         if (confirmAction.type === "delete") {
          onDeleteUser(confirmAction.user.id);
         } else {
          onChangeRole(confirmAction.user.id, confirmAction.newRole);
         }
         setConfirmAction(null);
        }}
        className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors cursor-pointer ${
         confirmAction.type === "delete"
          ? "bg-red-600 hover:bg-red-700"
          : "bg-indigo-600 hover:bg-indigo-700"
        }`}>
        {confirmAction.type === "delete" ? "Delete" : "Change Role"}
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}

function QuickStat({ icon: Icon, label, value, color }) {
 const colors = {
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
 };

 return (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
   <div className="flex items-center gap-3">
    <div
     className={`p-2.5 rounded-xl border ${colors[color] || colors.indigo}`}>
     <Icon className="w-5 h-5" />
    </div>
    <div>
     <p className="text-2xl font-bold text-slate-800">{value}</p>
     <p className="text-xs text-slate-500">{label}</p>
    </div>
   </div>
  </div>
 );
}

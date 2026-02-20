import { useState } from "react";
import {
 Search,
 Store,
 MapPin,
 Eye,
 ToggleLeft,
 ToggleRight,
 ChevronLeft,
 ChevronRight,
 X,
 Clock,
 Tag,
 UtensilsCrossed,
 ExternalLink,
 Star,
} from "lucide-react";

const PER_PAGE = 8;

export default function AdminRestaurants({
 restaurants,
 onToggleActive,
 onToggleFeatured,
 toggling,
}) {
 const [search, setSearch] = useState("");
 const [filterStatus, setFilterStatus] = useState("all");
 const [currentPage, setCurrentPage] = useState(1);
 const [viewingRestaurant, setViewingRestaurant] = useState(null);

 // Filter
 const filtered = restaurants.filter((r) => {
  const matchesSearch =
   !search ||
   r.name?.toLowerCase().includes(search.toLowerCase()) ||
   r.cuisine?.toLowerCase().includes(search.toLowerCase()) ||
   r.location?.toLowerCase().includes(search.toLowerCase());

  const matchesStatus =
   filterStatus === "all" ||
   (filterStatus === "active" && r.is_active !== false) ||
   (filterStatus === "inactive" && r.is_active === false);

  return matchesSearch && matchesStatus;
 });

 const totalPages = Math.ceil(filtered.length / PER_PAGE);
 const paginated = filtered.slice(
  (currentPage - 1) * PER_PAGE,
  currentPage * PER_PAGE,
 );

 const activeCount = restaurants.filter((r) => r.is_active !== false).length;
 const inactiveCount = restaurants.length - activeCount;

 return (
  <div className="space-y-6">
   <div className="flex items-center justify-between">
    <div>
     <h2 className="text-2xl font-bold text-slate-800">All Restaurants</h2>
     <p className="text-sm text-slate-500 mt-1">
      {restaurants.length} total · {activeCount} active · {inactiveCount}{" "}
      inactive
     </p>
    </div>
   </div>

   {/* Search & Filters */}
   <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
     <input
      type="text"
      placeholder="Search by name, cuisine, or location..."
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
    <div className="flex gap-2">
     {["all", "active", "inactive"].map((status) => (
      <button
       key={status}
       onClick={() => {
        setFilterStatus(status);
        setCurrentPage(1);
       }}
       className={`px-4 py-2.5 text-sm font-medium rounded-xl border transition-all cursor-pointer ${
        filterStatus === status
         ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
         : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
       }`}>
       {status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
     ))}
    </div>
   </div>

   {/* Restaurant Cards */}
   {filtered.length === 0 ? (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
     <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
     <h3 className="text-lg font-semibold text-slate-700">
      No restaurants found
     </h3>
     <p className="text-sm text-slate-500 mt-1">
      Try adjusting your search or filter
     </p>
    </div>
   ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     {paginated.map((r) => (
      <div
       key={r.id}
       className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
        r.is_active === false ? "border-red-200 opacity-75" : "border-slate-200"
       }`}>
       {/* Image Banner */}
       <div className="relative h-36 bg-slate-100">
        <img
         src={
          r.images?.[0] ||
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"
         }
         alt={r.name}
         className="w-full h-full object-cover"
        />
        {r.is_featured && (
         <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
          <svg width="14" height="14" viewBox="0 0 40 40" fill="none">
           <path
            d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094z"
            fill="#1DA1F2"
           />
           <path
            d="M17.204 27.822l-6.904-6.904 2.828-2.828 4.076 4.076 8.876-8.876 2.828 2.828-11.704 11.704z"
            fill="#fff"
           />
          </svg>
          Featured
         </div>
        )}
        {r.is_active === false && (
         <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
           INACTIVE
          </span>
         </div>
        )}
       </div>

       {/* Card Body */}
       <div className="p-4">
        <div className="flex items-start justify-between mb-2">
         <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800 truncate">{r.name}</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
           {r.cuisine && (
            <span className="flex items-center gap-1">
             <UtensilsCrossed size={11} />
             {r.cuisine}
            </span>
           )}
           {r.price && (
            <span className="flex items-center gap-1">
             <Tag size={11} />
             {r.price}
            </span>
           )}
          </div>
         </div>
        </div>

        {r.location && (
         <p className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 truncate">
          <MapPin size={12} className="shrink-0" />
          {r.location}
         </p>
        )}

        {r.opening_time && r.closing_time && (
         <p className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <Clock size={12} />
          {r.opening_time} – {r.closing_time}
         </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
         <button
          onClick={() => setViewingRestaurant(r)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
          <Eye size={14} />
          View Details
         </button>
         <button
          onClick={() => onToggleFeatured(r.id, r.is_featured === true)}
          disabled={toggling === r.id}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
           r.is_featured
            ? "text-amber-600 hover:bg-amber-50"
            : "text-slate-500 hover:bg-slate-50"
          } disabled:opacity-50`}>
          <Star size={14} fill={r.is_featured ? "currentColor" : "none"} />
          {r.is_featured ? "Unfeature" : "Feature"}
         </button>
         <button
          onClick={() => onToggleActive(r.id, r.is_active !== false)}
          disabled={toggling === r.id}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ml-auto ${
           r.is_active === false
            ? "text-emerald-600 hover:bg-emerald-50"
            : "text-red-600 hover:bg-red-50"
          } disabled:opacity-50`}>
          {r.is_active === false ? (
           <>
            <ToggleLeft size={14} />
            {toggling === r.id ? "Activating..." : "Activate"}
           </>
          ) : (
           <>
            <ToggleRight size={14} />
            {toggling === r.id ? "Deactivating..." : "Deactivate"}
           </>
          )}
         </button>
        </div>
       </div>
      </div>
     ))}
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
         <span key={`dots-${idx}`} className="px-2 text-slate-400 text-sm">
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

   {/* Detail Modal */}
   {viewingRestaurant && (
    <div
     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
     onClick={() => setViewingRestaurant(null)}>
     <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}>
      {/* Modal Header Image */}
      <div className="relative h-48">
       <img
        src={
         viewingRestaurant.images?.[0] ||
         "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"
        }
        alt={viewingRestaurant.name}
        className="w-full h-full object-cover rounded-t-2xl"
       />
       <button
        onClick={() => setViewingRestaurant(null)}
        className="absolute top-3 right-3 bg-white/90 hover:bg-white p-1.5 rounded-full shadow cursor-pointer">
        <X size={18} className="text-slate-600" />
       </button>
       {viewingRestaurant.is_active === false && (
        <div className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
         INACTIVE
        </div>
       )}
      </div>

      {/* Modal Body */}
      <div className="p-6 space-y-4">
       <div>
        <h3 className="text-xl font-bold text-slate-800">
         {viewingRestaurant.name}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
         {viewingRestaurant.cuisine} · {viewingRestaurant.price}
        </p>
       </div>

       {viewingRestaurant.description && (
        <p className="text-sm text-slate-600 leading-relaxed">
         {viewingRestaurant.description}
        </p>
       )}

       <div className="grid grid-cols-2 gap-3">
        <InfoItem label="Location" value={viewingRestaurant.location || "—"} />
        <InfoItem
         label="Hours"
         value={
          viewingRestaurant.opening_time && viewingRestaurant.closing_time
           ? `${viewingRestaurant.opening_time} – ${viewingRestaurant.closing_time}`
           : "—"
         }
        />
        <InfoItem
         label="Active Days"
         value={viewingRestaurant.active_days?.join(", ") || "—"}
        />
        <InfoItem label="Owner ID" value={viewingRestaurant.owner_id || "—"} />
       </div>

       {viewingRestaurant.tags?.length > 0 && (
        <div>
         <p className="text-xs font-semibold text-slate-500 mb-2">Tags</p>
         <div className="flex flex-wrap gap-1.5">
          {viewingRestaurant.tags.map((tag) => (
           <span
            key={tag}
            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">
            {tag}
           </span>
          ))}
         </div>
        </div>
       )}

       <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
        <button
         onClick={() => {
          onToggleActive(
           viewingRestaurant.id,
           viewingRestaurant.is_active !== false,
          );
          setViewingRestaurant(null);
         }}
         className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
          viewingRestaurant.is_active === false
           ? "bg-emerald-600 text-white hover:bg-emerald-700"
           : "bg-red-600 text-white hover:bg-red-700"
         }`}>
         {viewingRestaurant.is_active === false ? (
          <>
           <ToggleLeft size={16} /> Activate Restaurant
          </>
         ) : (
          <>
           <ToggleRight size={16} /> Deactivate Restaurant
          </>
         )}
        </button>
        <a
         href={`/restaurant/${viewingRestaurant.id}`}
         target="_blank"
         rel="noopener noreferrer"
         className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
         <ExternalLink size={14} /> View Page
        </a>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}

function InfoItem({ label, value }) {
 return (
  <div className="bg-slate-50 rounded-lg p-3">
   <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
   <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
  </div>
 );
}

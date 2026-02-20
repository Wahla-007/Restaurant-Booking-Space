import { useState, useEffect, useMemo } from "react";
import {
 Search,
 Star,
 Trash2,
 ChevronLeft,
 ChevronRight,
 Store,
 MessageSquare,
 AlertTriangle,
 X,
 UserCircle,
 Filter,
} from "lucide-react";
import { supabase } from "../../supabase";
import { format } from "date-fns";

const PER_PAGE = 10;

export default function AdminReviews({ restaurants }) {
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [filterRestaurant, setFilterRestaurant] = useState("all");
 const [filterRating, setFilterRating] = useState("all");
 const [currentPage, setCurrentPage] = useState(1);
 const [confirmDelete, setConfirmDelete] = useState(null);
 const [deleting, setDeleting] = useState(false);

 const fetchReviews = async () => {
  setLoading(true);
  try {
   const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

   if (error) throw error;
   setReviews(data || []);
  } catch (err) {
   console.error("Error fetching reviews:", err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchReviews();
 }, []);

 const handleDeleteReview = async (reviewId) => {
  setDeleting(true);
  try {
   const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

   if (error) throw error;

   setReviews((prev) => prev.filter((r) => r.id !== reviewId));
   setConfirmDelete(null);
  } catch (err) {
   console.error("Delete review error:", err);
  } finally {
   setDeleting(false);
  }
 };

 // Stats per restaurant
 const restaurantStats = useMemo(() => {
  const map = {};
  reviews.forEach((r) => {
   const rid = r.restaurant_id;
   if (!map[rid]) {
    const rest = restaurants.find((res) => res.id === rid);
    map[rid] = {
     id: rid,
     name: rest?.name || r.restaurant_name || "Unknown Restaurant",
     count: 0,
     totalRating: 0,
    };
   }
   map[rid].count += 1;
   map[rid].totalRating += r.rating || 0;
  });
  return Object.values(map)
   .map((s) => ({
    ...s,
    avgRating: s.count > 0 ? (s.totalRating / s.count).toFixed(1) : "0",
   }))
   .sort((a, b) => b.count - a.count);
 }, [reviews, restaurants]);

 // Filtered reviews
 const filtered = reviews.filter((r) => {
  const matchesSearch =
   !search ||
   (r.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
   (r.comment || "").toLowerCase().includes(search.toLowerCase()) ||
   (r.restaurant_name || "").toLowerCase().includes(search.toLowerCase());

  const matchesRestaurant =
   filterRestaurant === "all" || r.restaurant_id === filterRestaurant;

  const matchesRating =
   filterRating === "all" || r.rating === parseInt(filterRating);

  return matchesSearch && matchesRestaurant && matchesRating;
 });

 const totalPages = Math.ceil(filtered.length / PER_PAGE);
 const paginated = filtered.slice(
  (currentPage - 1) * PER_PAGE,
  currentPage * PER_PAGE,
 );

 // Reset page when filters change
 useEffect(() => {
  setCurrentPage(1);
 }, [search, filterRestaurant, filterRating]);

 const avgOverall =
  reviews.length > 0
   ? (
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
     ).toFixed(1)
   : "0";

 if (loading) {
  return (
   <div className="flex items-center justify-center py-32">
    <div className="flex flex-col items-center gap-3">
     <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
     <p className="text-slate-500 text-sm font-medium">Loading reviews...</p>
    </div>
   </div>
  );
 }

 return (
  <div className="space-y-6">
   <div>
    <h2 className="text-2xl font-bold text-slate-800">All Reviews</h2>
    <p className="text-sm text-slate-500 mt-1">
     {reviews.length} total reviews across {restaurantStats.length} restaurants
     · {avgOverall} avg rating
    </p>
   </div>

   {/* Quick Stats Cards */}
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <QuickStat
     icon={MessageSquare}
     label="Total Reviews"
     value={reviews.length}
     color="indigo"
    />
    <QuickStat
     icon={Star}
     label="Avg Rating"
     value={avgOverall}
     color="amber"
    />
    <QuickStat
     icon={Star}
     label="5-Star Reviews"
     value={reviews.filter((r) => r.rating === 5).length}
     color="emerald"
    />
    <QuickStat
     icon={Star}
     label="1-Star Reviews"
     value={reviews.filter((r) => r.rating === 1).length}
     color="rose"
    />
   </div>

   {/* Reviews Per Restaurant Summary */}
   <div className="bg-white rounded-2xl border border-slate-200 p-5">
    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
     <Store size={16} className="text-slate-400" />
     Reviews by Restaurant
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
     {restaurantStats.map((stat) => (
      <button
       key={stat.id}
       onClick={() =>
        setFilterRestaurant(filterRestaurant === stat.id ? "all" : stat.id)
       }
       className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
        filterRestaurant === stat.id
         ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200"
         : "border-slate-100 hover:bg-slate-50"
       }`}>
       <div className="min-w-0">
        <p
         className="text-sm font-medium text-slate-700 truncate"
         style={{ textTransform: "capitalize" }}>
         {stat.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
         {stat.count} review{stat.count !== 1 ? "s" : ""}
        </p>
       </div>
       <div className="flex items-center gap-1 shrink-0 ml-3">
        <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
        <span className="text-sm font-semibold text-slate-700">
         {stat.avgRating}
        </span>
       </div>
      </button>
     ))}
     {restaurantStats.length === 0 && (
      <p className="text-sm text-slate-400 col-span-full text-center py-4">
       No reviews yet
      </p>
     )}
    </div>
   </div>

   {/* Filters */}
   <div className="flex flex-wrap items-center gap-3">
    <div className="relative flex-1 min-w-50 max-w-md">
     <Search
      size={16}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
     />
     <input
      type="text"
      placeholder="Search reviews by name, comment, restaurant..."
      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
     />
     {search && (
      <button
       onClick={() => setSearch("")}
       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
       <X size={14} />
      </button>
     )}
    </div>

    <div className="flex items-center gap-2">
     <Filter size={14} className="text-slate-400" />
     <select
      value={filterRating}
      onChange={(e) => setFilterRating(e.target.value)}
      className="text-sm text-slate-800 border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-indigo-200 outline-none">
      <option value="all">All Ratings</option>
      <option value="5">5 Stars</option>
      <option value="4">4 Stars</option>
      <option value="3">3 Stars</option>
      <option value="2">2 Stars</option>
      <option value="1">1 Star</option>
     </select>
    </div>

    {filterRestaurant !== "all" && (
     <button
      onClick={() => setFilterRestaurant("all")}
      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 px-3 py-2 bg-indigo-50 rounded-xl">
      <X size={12} />
      Clear restaurant filter
     </button>
    )}
   </div>

   {/* Reviews List */}
   <div className="space-y-3">
    {paginated.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
      <MessageSquare size={40} className="text-slate-200 mb-3" />
      <p className="text-slate-400 text-sm font-medium">No reviews found</p>
      <p className="text-slate-300 text-xs mt-1">
       Try adjusting your search or filters
      </p>
     </div>
    ) : (
     paginated.map((review) => (
      <div
       key={review.id}
       className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow group">
       <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
         <UserCircle size={40} className="text-slate-300" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
         <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
           <p className="text-sm font-semibold text-slate-800">
            {review.user_name || "Anonymous"}
           </p>
           <p
            className="text-xs text-slate-400 mt-0.5"
            style={{ textTransform: "capitalize" }}>
            {review.restaurant_name || "Unknown Restaurant"} ·{" "}
            {review.created_at
             ? format(new Date(review.created_at), "MMM d, yyyy 'at' hh:mm a")
             : "Unknown date"}
           </p>
          </div>
          <div className="flex items-center gap-1">
           {[1, 2, 3, 4, 5].map((star) => (
            <Star
             key={star}
             size={14}
             fill={star <= (review.rating || 0) ? "#fbbf24" : "none"}
             stroke={star <= (review.rating || 0) ? "#fbbf24" : "#cbd5e1"}
             strokeWidth={1.5}
            />
           ))}
          </div>
         </div>

         {review.comment && (
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
           {review.comment}
          </p>
         )}

         {/* Owner Reply */}
         {review.owner_reply && (
          <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3">
           <p className="text-xs font-semibold text-slate-500 mb-1">
            Owner Reply
           </p>
           <p className="text-sm text-slate-600">{review.owner_reply}</p>
          </div>
         )}
        </div>

        {/* Delete Button */}
        <button
         onClick={() => setConfirmDelete(review)}
         className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 shrink-0"
         title="Delete review">
         <Trash2 size={16} />
        </button>
       </div>
      </div>
     ))
    )}
   </div>

   {/* Pagination */}
   {totalPages > 1 && (
    <div className="flex items-center justify-between pt-2">
     <p className="text-sm text-slate-500">
      Showing {(currentPage - 1) * PER_PAGE + 1}–
      {Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
     </p>
     <div className="flex items-center gap-2">
      <button
       onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
       disabled={currentPage === 1}
       className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
       <ChevronLeft size={16} />
      </button>
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
       let page;
       if (totalPages <= 5) {
        page = i + 1;
       } else if (currentPage <= 3) {
        page = i + 1;
       } else if (currentPage >= totalPages - 2) {
        page = totalPages - 4 + i;
       } else {
        page = currentPage - 2 + i;
       }
       return (
        <button
         key={page}
         onClick={() => setCurrentPage(page)}
         className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
          currentPage === page
           ? "bg-indigo-600 text-white shadow-sm"
           : "text-slate-600 hover:bg-slate-100"
         }`}>
         {page}
        </button>
       );
      })}
      <button
       onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
       disabled={currentPage === totalPages}
       className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
       <ChevronRight size={16} />
      </button>
     </div>
    </div>
   )}

   {/* Delete Confirmation Modal */}
   {confirmDelete && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
     <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
      <div className="flex items-center gap-3">
       <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
        <AlertTriangle size={20} className="text-red-600" />
       </div>
       <div>
        <h3 className="font-semibold text-slate-800">Delete Review</h3>
        <p className="text-sm text-slate-500 mt-0.5">
         This action cannot be undone.
        </p>
       </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
       <p className="text-sm text-slate-600">
        <span className="font-medium">{confirmDelete.user_name}</span> —{" "}
        {confirmDelete.rating}★ review on{" "}
        <span className="font-medium" style={{ textTransform: "capitalize" }}>
         {confirmDelete.restaurant_name}
        </span>
       </p>
       {confirmDelete.comment && (
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
         "{confirmDelete.comment}"
        </p>
       )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
       <button
        onClick={() => setConfirmDelete(null)}
        disabled={deleting}
        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
        Cancel
       </button>
       <button
        onClick={() => handleDeleteReview(confirmDelete.id)}
        disabled={deleting}
        className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200 disabled:opacity-50 flex items-center gap-2">
        {deleting && (
         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        Delete Review
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
  indigo: "bg-indigo-50 text-indigo-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
 };

 return (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
   <div className={`p-2.5 rounded-xl ${colors[color]}`}>
    <Icon size={18} />
   </div>
   <div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
    <p className="text-xs text-slate-500 font-medium">{label}</p>
   </div>
  </div>
 );
}

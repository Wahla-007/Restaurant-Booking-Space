import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { useToast } from "../../context/ToastContext";
import { Star, Check, X, Trash2, Eye, EyeOff } from "lucide-react";

export default function AdminWebReviews() {
 const { addToast } = useToast();
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState("all"); // all | pending | approved

 const fetchReviews = async () => {
  setLoading(true);
  try {
   const { data, error } = await supabase
    .from("web_reviews")
    .select("*")
    .order("created_at", { ascending: false });

   if (error) throw error;
   setReviews(data || []);
  } catch (err) {
   console.error("Error fetching web reviews:", err);
   addToast("Failed to load web reviews", "error");
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchReviews();
 }, []);

 const handleApprove = async (id) => {
  try {
   const { error } = await supabase
    .from("web_reviews")
    .update({ is_approved: true })
    .eq("id", id);

   if (error) throw error;

   setReviews((prev) =>
    prev.map((r) => (r.id === id ? { ...r, is_approved: true } : r)),
   );
   addToast("Review approved and now visible on homepage", "success");
  } catch (err) {
   addToast("Failed to approve review", "error");
  }
 };

 const handleReject = async (id) => {
  try {
   const { error } = await supabase
    .from("web_reviews")
    .update({ is_approved: false })
    .eq("id", id);

   if (error) throw error;

   setReviews((prev) =>
    prev.map((r) => (r.id === id ? { ...r, is_approved: false } : r)),
   );
   addToast("Review hidden from homepage", "info");
  } catch (err) {
   addToast("Failed to reject review", "error");
  }
 };

 const handleDelete = async (id) => {
  if (!confirm("Are you sure you want to permanently delete this review?"))
   return;
  try {
   const { error } = await supabase.from("web_reviews").delete().eq("id", id);

   if (error) throw error;

   setReviews((prev) => prev.filter((r) => r.id !== id));
   addToast("Review deleted", "success");
  } catch (err) {
   addToast("Failed to delete review", "error");
  }
 };

 const filtered = reviews.filter((r) => {
  if (filter === "pending") return !r.is_approved;
  if (filter === "approved") return r.is_approved;
  return true;
 });

 const pendingCount = reviews.filter((r) => !r.is_approved).length;
 const approvedCount = reviews.filter((r) => r.is_approved).length;

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
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h2 className="text-2xl font-bold text-slate-800">Web Reviews</h2>
     <p className="text-slate-500 text-sm mt-1">
      Manage user reviews shown on the homepage
     </p>
    </div>
    <div className="flex items-center gap-3">
     <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
      {pendingCount} Pending
     </span>
     <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
      {approvedCount} Approved
     </span>
    </div>
   </div>

   {/* Filter Tabs */}
   <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
    {[
     { key: "all", label: `All (${reviews.length})` },
     { key: "pending", label: `Pending (${pendingCount})` },
     { key: "approved", label: `Approved (${approvedCount})` },
    ].map((tab) => (
     <button
      key={tab.key}
      onClick={() => setFilter(tab.key)}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
       filter === tab.key
        ? "bg-white text-slate-800 shadow-sm"
        : "text-slate-500 hover:text-slate-700"
      }`}>
      {tab.label}
     </button>
    ))}
   </div>

   {/* Reviews List */}
   {filtered.length === 0 ? (
    <div className="text-center py-16">
     <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
      <Star size={24} className="text-slate-300" />
     </div>
     <p className="text-slate-500 font-medium">No reviews found</p>
     <p className="text-slate-400 text-sm mt-1">
      {filter === "pending"
       ? "No pending reviews to approve"
       : filter === "approved"
         ? "No approved reviews yet"
         : "No web reviews submitted yet"}
     </p>
    </div>
   ) : (
    <div className="grid gap-4">
     {filtered.map((review) => (
      <div
       key={review.id}
       className={`bg-white rounded-xl border p-5 transition-all ${
        review.is_approved
         ? "border-emerald-200 bg-emerald-50/30"
         : "border-amber-200 bg-amber-50/20"
       }`}>
       <div className="flex items-start justify-between gap-4">
        {/* Left: Review content */}
        <div className="flex-1 min-w-0">
         <div className="flex items-center gap-3 mb-3">
          {review.user_avatar ? (
           <img
            src={review.user_avatar}
            alt={review.user_name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
           />
          ) : (
           <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-600">
             {review.user_name?.charAt(0)?.toUpperCase() || "?"}
            </span>
           </div>
          )}
          <div>
           <p className="text-sm font-bold text-slate-800">
            {review.user_name}
           </p>
           <p className="text-xs text-slate-400">
            {new Date(review.created_at).toLocaleDateString("en-US", {
             month: "short",
             day: "numeric",
             year: "numeric",
             hour: "2-digit",
             minute: "2-digit",
            })}
           </p>
          </div>
         </div>

         {/* Stars */}
         <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
           <Star
            key={i}
            size={14}
            className={
             i < review.rating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200"
            }
           />
          ))}
          <span className="text-xs text-slate-400 ml-1.5">
           {review.rating}/5
          </span>
         </div>

         <p className="text-sm text-slate-600 leading-relaxed">
          "{review.comment}"
         </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
         {review.is_approved ? (
          <button
           onClick={() => handleReject(review.id)}
           title="Hide from homepage"
           className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
           <EyeOff size={16} />
          </button>
         ) : (
          <button
           onClick={() => handleApprove(review.id)}
           title="Approve & show on homepage"
           className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
           <Check size={16} />
          </button>
         )}
         <button
          onClick={() => handleDelete(review.id)}
          title="Delete permanently"
          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors cursor-pointer">
          <Trash2 size={16} />
         </button>
        </div>
       </div>

       {/* Status badge */}
       <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
        {review.is_approved ? (
         <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <Eye size={12} /> Visible on homepage
         </span>
        ) : (
         <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
          <EyeOff size={12} /> Pending approval
         </span>
        )}
       </div>
      </div>
     ))}
    </div>
   )}
  </div>
 );
}

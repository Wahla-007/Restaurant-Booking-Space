import { useState, useEffect } from "react";
import {
 Star,
 MessageSquare,
 Send,
 ChevronLeft,
 ChevronRight,
 Search,
 Filter,
 ShieldCheck,
 Clock,
 User,
 X,
 MessageCircleReply,
} from "lucide-react";
import { supabase } from "../../supabase";

const REVIEWS_PER_PAGE = 5;

const StarRating = ({ rating, size = 16 }) => (
 <div className="flex items-center gap-0.5">
  {[1, 2, 3, 4, 5].map((star) => (
   <Star
    key={star}
    size={size}
    fill={star <= rating ? "#fbbf24" : "none"}
    stroke={star <= rating ? "#fbbf24" : "#cbd5e1"}
    strokeWidth={1.5}
   />
  ))}
 </div>
);

export default function ReviewsManagement({ restaurantId, onRefreshRef }) {
 const [reviews, setReviews] = useState([]);
 const [loading, setLoading] = useState(true);
 const [currentPage, setCurrentPage] = useState(1);
 const [searchQuery, setSearchQuery] = useState("");
 const [filterRating, setFilterRating] = useState("all");
 const [replyingTo, setReplyingTo] = useState(null);
 const [replyText, setReplyText] = useState("");
 const [replySaving, setReplySaving] = useState(false);
 const [verifiedUserIds, setVerifiedUserIds] = useState([]);

 // Fetch reviews
 const fetchReviews = async () => {
  if (!restaurantId) return;
  setLoading(true);
  try {
   const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

   if (error) throw error;
   setReviews(data || []);
  } catch (err) {
   console.error("Error fetching reviews:", err);
  } finally {
   setLoading(false);
  }
 };

 // Fetch verified user IDs (users with completed bookings)
 const fetchVerifiedUsers = async () => {
  if (!restaurantId) return;
  try {
   const { data } = await supabase
    .from("bookings")
    .select("user_id")
    .eq("restaurant_id", restaurantId)
    .eq("status", "completed");

   if (data) {
    setVerifiedUserIds([...new Set(data.map((b) => b.user_id))]);
   }
  } catch (err) {
   console.error("Error fetching verified users:", err);
  }
 };

 useEffect(() => {
  fetchReviews();
  fetchVerifiedUsers();
 }, [restaurantId]);

 // Expose fetchReviews via ref so parent can trigger refresh on real-time event
 useEffect(() => {
  if (onRefreshRef) {
   onRefreshRef.current = fetchReviews;
  }
  return () => {
   if (onRefreshRef) {
    onRefreshRef.current = null;
   }
  };
 }, [onRefreshRef, restaurantId]);

 // Submit reply
 const handleSubmitReply = async (reviewId) => {
  if (!replyText.trim()) return;
  setReplySaving(true);
  try {
   const { error } = await supabase
    .from("reviews")
    .update({
     owner_reply: replyText.trim(),
     replied_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

   if (error) throw error;

   // Update local state
   setReviews((prev) =>
    prev.map((r) =>
     r.id === reviewId
      ? {
         ...r,
         owner_reply: replyText.trim(),
         replied_at: new Date().toISOString(),
        }
      : r,
    ),
   );
   setReplyingTo(null);
   setReplyText("");
  } catch (err) {
   console.error("Error submitting reply:", err);
  } finally {
   setReplySaving(false);
  }
 };

 // Check if user is verified diner
 const isVerified = (review) => {
  if (!review.user_id) return false;
  return verifiedUserIds.some((vid) => String(vid) === String(review.user_id));
 };

 // Filter & search
 const filteredReviews = reviews.filter((review) => {
  const matchesSearch =
   !searchQuery ||
   review.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
   review.comment?.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesRating =
   filterRating === "all" || review.rating === Number(filterRating);

  return matchesSearch && matchesRating;
 });

 // Pagination
 const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
 const paginatedReviews = filteredReviews.slice(
  (currentPage - 1) * REVIEWS_PER_PAGE,
  currentPage * REVIEWS_PER_PAGE,
 );

 // Stats
 const avgRating =
  reviews.length > 0
   ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
   : "0.0";
 const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: reviews.filter((r) => r.rating === star).length,
  percentage:
   reviews.length > 0
    ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100
    : 0,
 }));
 const repliedCount = reviews.filter((r) => r.owner_reply).length;

 // Reset page when filters change
 useEffect(() => {
  setCurrentPage(1);
 }, [searchQuery, filterRating]);

 const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
   year: "numeric",
   month: "short",
   day: "numeric",
  });
 };

 const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
 };

 // Page numbers to display
 const getPageNumbers = () => {
  const pages = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
   for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
   pages.push(1);
   let start = Math.max(2, currentPage - 1);
   let end = Math.min(totalPages - 1, currentPage + 1);

   if (currentPage <= 2) {
    end = 4;
   } else if (currentPage >= totalPages - 1) {
    start = totalPages - 3;
   }

   if (start > 2) pages.push("...");
   for (let i = start; i <= end; i++) pages.push(i);
   if (end < totalPages - 1) pages.push("...");
   pages.push(totalPages);
  }
  return pages;
 };

 if (loading) {
  return (
   <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-800">Customer Reviews</h2>
    <div className="flex items-center justify-center py-20">
     <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-slate-500 text-sm font-medium">Loading reviews...</p>
     </div>
    </div>
   </div>
  );
 }

 return (
  <div className="space-y-6">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div>
     <h2 className="text-2xl font-bold text-slate-800">Customer Reviews</h2>
     <p className="text-sm text-slate-500 mt-1">
      Manage and respond to customer feedback
     </p>
    </div>
    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
     <MessageSquare className="w-5 h-5 text-emerald-600" />
     <span className="text-sm font-semibold text-emerald-700">
      {repliedCount}/{reviews.length} Replied
     </span>
    </div>
   </div>

   {/* Stats Cards Row */}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {/* Average Rating Card */}
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
     <div className="flex items-center gap-4">
      <div className="bg-amber-50 p-3 rounded-xl">
       <Star className="w-7 h-7 text-amber-500" fill="#f59e0b" />
      </div>
      <div>
       <p className="text-sm text-slate-500 font-medium">Average Rating</p>
       <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-slate-800">{avgRating}</span>
        <span className="text-sm text-slate-400">/ 5.0</span>
       </div>
      </div>
     </div>
    </div>

    {/* Total Reviews Card */}
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
     <div className="flex items-center gap-4">
      <div className="bg-blue-50 p-3 rounded-xl">
       <MessageSquare className="w-7 h-7 text-blue-500" />
      </div>
      <div>
       <p className="text-sm text-slate-500 font-medium">Total Reviews</p>
       <span className="text-3xl font-bold text-slate-800">
        {reviews.length}
       </span>
      </div>
     </div>
    </div>

    {/* Response Rate Card */}
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
     <div className="flex items-center gap-4">
      <div className="bg-emerald-50 p-3 rounded-xl">
       <MessageCircleReply className="w-7 h-7 text-emerald-500" />
      </div>
      <div>
       <p className="text-sm text-slate-500 font-medium">Response Rate</p>
       <span className="text-3xl font-bold text-slate-800">
        {reviews.length > 0
         ? Math.round((repliedCount / reviews.length) * 100)
         : 0}
        %
       </span>
      </div>
     </div>
    </div>
   </div>

   {/* Rating Breakdown */}
   <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
    <h3 className="text-sm font-semibold text-slate-700 mb-3">
     Rating Breakdown
    </h3>
    <div className="space-y-2">
     {ratingCounts.map(({ star, count, percentage }) => (
      <div key={star} className="flex items-center gap-3">
       <button
        onClick={() =>
         setFilterRating(filterRating === String(star) ? "all" : String(star))
        }
        className={`flex items-center gap-1 text-sm font-medium w-12 transition-colors cursor-pointer ${
         filterRating === String(star)
          ? "text-amber-600"
          : "text-slate-500 hover:text-slate-700"
        }`}>
        {star} <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
       </button>
       <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
         className="h-full bg-amber-400 rounded-full transition-all duration-500"
         style={{ width: `${percentage}%` }}
        />
       </div>
       <span className="text-xs text-slate-400 w-8 text-right font-medium">
        {count}
       </span>
      </div>
     ))}
    </div>
   </div>

   {/* Search & Filter Bar */}
   <div className="flex flex-col sm:flex-row gap-3">
    <div className="relative flex-1">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
     <input
      type="text"
      placeholder="Search by name or content..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
     />
     {searchQuery && (
      <button
       onClick={() => setSearchQuery("")}
       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
       <X size={16} />
      </button>
     )}
    </div>
    <div className="relative">
     <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
     <select
      value={filterRating}
      onChange={(e) => setFilterRating(e.target.value)}
      className="pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer">
      <option value="all">All Ratings</option>
      <option value="5">5 Stars</option>
      <option value="4">4 Stars</option>
      <option value="3">3 Stars</option>
      <option value="2">2 Stars</option>
      <option value="1">1 Star</option>
     </select>
    </div>
   </div>

   {/* Reviews List */}
   {filteredReviews.length === 0 ? (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
     <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
      <MessageSquare className="w-8 h-8 text-slate-400" />
     </div>
     <h3 className="text-lg font-semibold text-slate-700 mb-1">
      {reviews.length === 0 ? "No reviews yet" : "No matching reviews"}
     </h3>
     <p className="text-sm text-slate-500">
      {reviews.length === 0
       ? "Reviews will appear here once customers share their feedback."
       : "Try adjusting your search or filter criteria."}
     </p>
    </div>
   ) : (
    <div className="space-y-4">
     {paginatedReviews.map((review) => (
      <div
       key={review.id}
       className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
       {/* Review Header */}
       <div className="p-5 pb-0">
        <div className="flex items-start justify-between">
         <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
           <span className="text-white font-bold text-sm">
            {(review.user_name || "G").charAt(0).toUpperCase()}
           </span>
          </div>
          <div>
           <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-800 text-sm">
             {review.user_name || "Guest"}
            </h4>
            {isVerified(review) && (
             <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
              <ShieldCheck size={12} />
              Verified Diner
             </span>
            )}
           </div>
           <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={review.rating} size={14} />
            <span className="text-xs text-slate-400 flex items-center gap-1">
             <Clock size={11} />
             {timeAgo(review.created_at)}
            </span>
           </div>
          </div>
         </div>
         <span className="text-xs text-slate-400 hidden sm:block">
          {formatDate(review.created_at)}
         </span>
        </div>
       </div>

       {/* Review Body */}
       <div className="px-5 py-3">
        <p className="text-sm text-slate-600 leading-relaxed">
         {review.comment || "No comment provided."}
        </p>
       </div>

       {/* Owner Reply Section */}
       {review.owner_reply ? (
        <div className="mx-5 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
         <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
           <MessageCircleReply size={12} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-emerald-700">
           Owner Response
          </span>
          {review.replied_at && (
           <span className="text-xs text-emerald-500">
            • {timeAgo(review.replied_at)}
           </span>
          )}
         </div>
         <p className="text-sm text-emerald-800 leading-relaxed pl-8">
          {review.owner_reply}
         </p>
        </div>
       ) : replyingTo === review.id ? (
        <div className="mx-5 mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
         <div className="flex items-center gap-2 mb-3">
          <MessageCircleReply size={14} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-600">
           Write your reply
          </span>
         </div>
         <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type your response to this review..."
          rows={3}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none transition-all"
          autoFocus
         />
         <div className="flex items-center justify-end gap-2 mt-3">
          <button
           onClick={() => {
            setReplyingTo(null);
            setReplyText("");
           }}
           className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
           Cancel
          </button>
          <button
           onClick={() => handleSubmitReply(review.id)}
           disabled={!replyText.trim() || replySaving}
           className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm cursor-pointer">
           {replySaving ? (
            <>
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             Sending...
            </>
           ) : (
            <>
             <Send size={14} />
             Send Reply
            </>
           )}
          </button>
         </div>
        </div>
       ) : (
        <div className="px-5 pb-4">
         <button
          onClick={() => {
           setReplyingTo(review.id);
           setReplyText("");
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer">
          <MessageCircleReply size={14} />
          Reply to review
         </button>
        </div>
       )}
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
       {(currentPage - 1) * REVIEWS_PER_PAGE + 1}
      </span>
      –
      <span className="font-semibold text-slate-700">
       {Math.min(currentPage * REVIEWS_PER_PAGE, filteredReviews.length)}
      </span>{" "}
      of{" "}
      <span className="font-semibold text-slate-700">
       {filteredReviews.length}
      </span>{" "}
      reviews
     </p>

     <div className="flex items-center gap-1">
      <button
       onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
       disabled={currentPage === 1}
       className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">
       <ChevronLeft size={18} />
      </button>

      {getPageNumbers().map((page, idx) =>
       page === "..." ? (
        <span key={`dots-${idx}`} className="px-2 text-slate-400 text-sm">
         …
        </span>
       ) : (
        <button
         key={page}
         onClick={() => setCurrentPage(page)}
         className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
          currentPage === page
           ? "bg-emerald-600 text-white shadow-sm"
           : "text-slate-600 hover:bg-slate-100"
         }`}>
         {page}
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

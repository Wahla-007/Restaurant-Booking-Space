import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWidget from "../components/BookingWidget";
import ReviewModal from "../components/ReviewModal";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
 MapPin,
 ChefHat,
 Star,
 PenLine,
 ShieldCheck,
 CalendarCheck,
 X as XIcon,
 UserCircle,
 Clock,
 Heart,
 Share2,
 Camera,
 ChevronLeft,
 ChevronRight,
 Check,
} from "lucide-react";
import { trackView } from "../utils/analytics";

export default function RestaurantDetails() {
 const { id } = useParams();
 const navigate = useNavigate();
 const { user } = useAuth();

 // State
 const [restaurant, setRestaurant] = useState(null);
 const [loading, setLoading] = useState(true);
 const [dbReviews, setDbReviews] = useState([]);
 const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
 const [lightboxImage, setLightboxImage] = useState(null);
 const [lightboxIndex, setLightboxIndex] = useState(0);
 const [showEligibilityPopup, setShowEligibilityPopup] = useState(false);
 const [verifiedUserIds, setVerifiedUserIds] = useState([]);
 const [activeTab, setActiveTab] = useState("overview");
 const [saved, setSaved] = useState(false);

 const tabs = [
  { id: "overview", label: "Overview" },
  { id: "menu", label: "Menu" },
  { id: "location", label: "Location" },
  { id: "reviews", label: "Reviews" },
 ];

 // Fetch verified reviewers (users with completed bookings)
 const fetchVerifiedUsers = async (restaurantId) => {
  if (!restaurantId || typeof restaurantId === "number") return;
  try {
   const { data } = await supabase
    .from("bookings")
    .select("user_id")
    .eq("restaurant_id", restaurantId)
    .eq("status", "completed");

   if (data) {
    const ids = [...new Set(data.map((b) => b.user_id))];
    setVerifiedUserIds(ids);
   }
  } catch (err) {
   console.error("Error fetching verified users:", err);
  }
 };

 // Fetch Reviews
 const fetchReviews = async (restaurantId) => {
  if (!restaurantId || typeof restaurantId === "number") return;
  try {
   const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

   if (!error) {
    setDbReviews(data || []);
   }
  } catch (err) {
   console.error("Error fetching reviews:", err);
  }
 };

 // Initial Load
 useEffect(() => {
  const fetchRestaurant = async () => {
   setLoading(true);
   try {
    const { data, error } = await supabase
     .from("restaurants")
     .select("*")
     .eq("id", id)
     .single();

    if (error) throw error;
    setRestaurant(data);

    if (data?.id) trackView(data.id);

    if (data) {
     await fetchReviews(data.id);
     await fetchVerifiedUsers(data.id);
    }
   } catch (err) {
    console.error("Error fetching restaurant:", err);
   } finally {
    setLoading(false);
   }
  };

  if (id) fetchRestaurant();
 }, [id]);

 const averageRating =
  dbReviews.length > 0
   ? (
      dbReviews.reduce((acc, r) => acc + r.rating, 0) / dbReviews.length
     ).toFixed(1)
   : 0;

 const reviewCount = dbReviews.length;

 // Rating distribution
 const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
  stars,
  count: dbReviews.filter((r) => r.rating === stars).length,
 }));

 const getRatingLabel = (rating) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Very Good";
  if (rating >= 3.5) return "Good";
  if (rating >= 3.0) return "Average";
  if (rating >= 2.0) return "Poor";
  return "Terrible";
 };

 const ratingLabels = ["Excellent", "Good", "Average", "Poor", "Terrible"];

 const handleWriteReviewClick = async () => {
  if (!user) {
   navigate("/login");
   return;
  }

  const isUUID = restaurant.id && String(restaurant.id).length > 20;
  if (!isUUID) {
   setIsReviewFormOpen(true);
   return;
  }

  try {
   let query = supabase
    .from("bookings")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .eq("status", "completed")
    .limit(1);

   const parsedUserId = Number(user.id);
   if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
    query = query.eq("user_id", parsedUserId);
   } else {
    query = query.eq("user_id", user.id);
   }

   const { data, error } = await query;

   if (error) throw error;

   if (data && data.length > 0) {
    setIsReviewFormOpen(true);
   } else {
    setShowEligibilityPopup(true);
   }
  } catch (err) {
   console.error("Error checking booking:", err);
   setShowEligibilityPopup(true);
  }
 };

 const scrollToSection = (tabId) => {
  setActiveTab(tabId);
  const el = document.getElementById(`section-${tabId}`);
  if (el) {
   el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
 };

 const images =
  restaurant?.images?.length > 0
   ? restaurant.images
   : ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"];

 if (loading)
  return (
   <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
     <div className="w-8 h-8 border-3 border-[#00aa6c] border-t-transparent rounded-full animate-spin" />
     <span className="text-sm text-gray-400">Loading restaurant...</span>
    </div>
   </div>
  );

 if (!restaurant)
  return (
   <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
     <h2 className="text-2xl font-bold text-[#002b11] mb-2">
      Restaurant not found
     </h2>
     <button
      onClick={() => navigate("/")}
      className="text-[#00aa6c] font-semibold hover:underline cursor-pointer">
      Back to home
     </button>
    </div>
   </div>
  );

 return (
  <div className="min-h-screen bg-white pt-[68px]">
   {/* ── Restaurant Header ── */}
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
    <h1 className="text-[28px] sm:text-[34px] font-black text-[#002b11] tracking-tight capitalize leading-tight mb-1">
     {restaurant.name}
    </h1>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
     {/* Rating bubbles */}
     {averageRating > 0 && (
      <div className="flex items-center gap-1.5">
       <span className="font-bold text-[#002b11]">{averageRating}</span>
       <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
         <div
          key={i}
          className={`w-[14px] h-[14px] rounded-full ${
           i < Math.round(averageRating) ? "bg-[#00aa6c]" : "bg-gray-200"
          }`}
         />
        ))}
       </div>
       <span className="text-gray-500">({reviewCount} reviews)</span>
      </div>
     )}
     {restaurant.cuisine && (
      <span className="text-gray-500">{restaurant.cuisine}</span>
     )}
     {restaurant.city && (
      <span className="text-gray-500 flex items-center gap-1">
       <MapPin size={13} /> {restaurant.city}
      </span>
     )}
    </div>
   </div>

   {/* ── Image Gallery ── */}
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[360px] sm:h-[420px]">
     {/* Main large image */}
     <div
      className="col-span-4 sm:col-span-3 row-span-2 relative cursor-pointer group"
      onClick={() => {
       setLightboxImage(images[0]);
       setLightboxIndex(0);
      }}>
      <img
       src={images[0]}
       alt={restaurant.name}
       className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
      />
     </div>
     {/* Side thumbnails */}
     {images.slice(1, 3).map((img, i) => (
      <div
       key={i}
       className="hidden sm:block relative cursor-pointer group overflow-hidden"
       onClick={() => {
        setLightboxImage(img);
        setLightboxIndex(i + 1);
       }}>
       <img
        src={img}
        alt={`${restaurant.name} ${i + 2}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
       />
       {/* Photo count badge on last thumbnail */}
       {i === 1 && images.length > 3 && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
         <div className="flex items-center gap-1.5 text-white font-bold text-sm">
          <Camera size={16} />
          <span>{images.length}</span>
         </div>
        </div>
       )}
      </div>
     ))}
    </div>
   </div>

   {/* ── Action Buttons Row ── */}
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center gap-4 py-3 border-b border-gray-100">
     <button
      onClick={handleWriteReviewClick}
      className="flex items-center gap-1.5 text-sm font-semibold text-[#002b11] hover:text-[#00aa6c] transition-colors cursor-pointer">
      <PenLine size={15} /> Review
     </button>
     <button
      onClick={() => setSaved(!saved)}
      className="flex items-center gap-1.5 text-sm font-semibold text-[#002b11] hover:text-[#00aa6c] transition-colors cursor-pointer">
      <Heart size={15} className={saved ? "fill-red-500 text-red-500" : ""} />{" "}
      Save
     </button>
    </div>
   </div>

   {/* ── Tabs Navigation ── */}
   <div className="sticky top-[68px] z-30 bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="flex gap-6">
      {tabs.map((tab) => (
       <button
        key={tab.id}
        onClick={() => scrollToSection(tab.id)}
        className={`py-3.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
         activeTab === tab.id
          ? "border-[#002b11] text-[#002b11]"
          : "border-transparent text-gray-400 hover:text-gray-600"
        }`}>
        {tab.label}
       </button>
      ))}
     </div>
    </div>
   </div>

   {/* ── Main Content ── */}
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
     {/* Left Column */}
     <div>
      {/* ── Overview Section ── */}
      <section id="section-overview" className="mb-12">
       <h2 className="text-[22px] font-black text-[#002b11] mb-4">
        At a glance
       </h2>
       <div className="space-y-3">
        {/* Hours */}
        {(restaurant.opening_time || restaurant.closing_time) && (
         <div className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-[#00aa6c] shrink-0" />
          <span className="text-[#00aa6c] font-semibold">
           Open {restaurant.opening_time && `from ${restaurant.opening_time}`}
           {restaurant.closing_time && ` until ${restaurant.closing_time}`}
          </span>
         </div>
        )}
        {/* Location */}
        {restaurant.location && (
         <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-gray-400 shrink-0" />
          <span>{restaurant.location}</span>
         </div>
        )}
        {/* Cuisine */}
        {restaurant.cuisine && (
         <div className="flex items-center gap-2 text-sm text-gray-600">
          <ChefHat size={16} className="text-gray-400 shrink-0" />
          <span>{restaurant.cuisine}</span>
         </div>
        )}
       </div>

       {/* About */}
       {restaurant.description && (
        <div className="mt-8">
         <h3 className="text-lg font-bold text-[#002b11] mb-2">About</h3>
         <p className="text-[15px] text-gray-600 leading-relaxed">
          {restaurant.description}
         </p>
        </div>
       )}

       {/* Tags / Features */}
       {restaurant.tags && restaurant.tags.length > 0 && (
        <div className="mt-6">
         <h4 className="text-sm font-bold text-[#002b11] mb-3">Features</h4>
         <div className="flex flex-wrap gap-2">
          {restaurant.tags.map((tag) => (
           <span
            key={tag}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#f7f7f7] rounded-full text-xs font-semibold text-gray-600">
            <Check size={12} className="text-[#00aa6c]" />
            {tag}
           </span>
          ))}
         </div>
        </div>
       )}

       {/* Hours Table */}
       {restaurant.active_days && restaurant.active_days.length > 0 && (
        <div className="mt-8 p-5 border border-gray-200 rounded-xl">
         <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-[#002b11]">Hours</h4>
         </div>
         {(restaurant.opening_time || restaurant.closing_time) && (
          <p className="text-sm text-[#00aa6c] font-semibold mb-3">
           Open {restaurant.opening_time || ""} -{" "}
           {restaurant.closing_time || ""}
          </p>
         )}
         <div className="space-y-2">
          {restaurant.active_days.map((day) => (
           <div key={day} className="flex justify-between text-sm">
            <span className="font-semibold text-[#002b11]">{day}</span>
            <span className="text-gray-500">
             {restaurant.opening_time || "—"} - {restaurant.closing_time || "—"}
            </span>
           </div>
          ))}
         </div>
        </div>
       )}
      </section>

      {/* ── Menu Section ── */}
      <section id="section-menu" className="mb-12">
       <h2 className="text-[22px] font-black text-[#002b11] mb-6">
        Menu Highlights
       </h2>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {restaurant.menu?.highlights?.map((item, i) => (
         <div
          key={i}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
          {item.image ? (
           <div
            onClick={() => setLightboxImage(item.image)}
            className="h-44 overflow-hidden cursor-pointer">
            <img
             src={item.image}
             alt={item.name}
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
           </div>
          ) : (
           <div className="h-32 bg-[#f7f7f7] flex items-center justify-center">
            <ChefHat size={28} className="text-gray-300" />
           </div>
          )}
          <div className="p-4">
           <div className="flex justify-between items-start mb-1">
            <span className="font-bold text-[#002b11] text-[15px]">
             {item.name}
            </span>
            {item.price && (
             <span className="text-[#00aa6c] font-bold text-sm shrink-0 ml-3">
              Rs. {item.price}
             </span>
            )}
           </div>
           {item.description && (
            <p className="text-sm text-gray-500 leading-relaxed mt-1">
             {item.description}
            </p>
           )}
           {item.category && (
            <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#00aa6c]/10 text-[#00aa6c]">
             {item.category}
            </span>
           )}
          </div>
         </div>
        )) || (
         <p className="text-gray-400 text-sm col-span-2">
          No menu highlights available yet.
         </p>
        )}
       </div>
      </section>

      {/* ── Location Section ── */}
      <section id="section-location" className="mb-12">
       <h2 className="text-[22px] font-black text-[#002b11] mb-4">Location</h2>
       <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-4 items-start">
        {/* Map */}
        <div className="h-[200px] sm:h-full rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
         {restaurant.location_link ? (
          <iframe
           src={(() => {
            const link = restaurant.location_link;
            if (link.includes("/embed")) return link;
            const coordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordMatch) {
             return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${coordMatch[2]}!3d${coordMatch[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1`;
            }
            const q = encodeURIComponent(restaurant.location || link);
            return `https://www.google.com/maps?q=${q}&output=embed`;
           })()}
           width="100%"
           height="100%"
           style={{ border: 0 }}
           allowFullScreen
           loading="lazy"
           referrerPolicy="no-referrer-when-downgrade"
          />
         ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
           <MapPin size={28} className="mb-1" />
           <span className="text-xs">Map unavailable</span>
          </div>
         )}
        </div>

        {/* Address Details */}
        <div className="space-y-3">
         {restaurant.location && (
          <div className="flex items-start gap-2">
           <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
           <span className="text-sm text-gray-700">{restaurant.location}</span>
          </div>
         )}
         {restaurant.location_link && (
          <a
           href={restaurant.location_link}
           target="_blank"
           rel="noopener noreferrer"
           className="inline-flex items-center gap-1.5 text-sm text-[#00aa6c] font-semibold hover:underline">
           <MapPin size={14} /> Open in Google Maps
          </a>
         )}
        </div>
       </div>
      </section>

      {/* ── Reviews Section ── */}
      <section id="section-reviews" className="mb-12">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-[22px] font-black text-[#002b11]">Reviews</h2>
        <button
         onClick={handleWriteReviewClick}
         className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#002b11] text-white text-sm font-bold hover:bg-[#004d1f] transition-colors cursor-pointer">
         <PenLine size={15} />
         Write a review
        </button>
       </div>

       {/* Rating Summary */}
       {reviewCount > 0 && (
        <div className="flex flex-col sm:flex-row gap-8 mb-8 p-6 bg-[#f7f7f7] rounded-xl">
         {/* Left - Big Rating */}
         <div className="text-center sm:text-left shrink-0">
          <p className="text-5xl font-black text-[#002b11] leading-none">
           {averageRating}
          </p>
          <p className="text-sm font-bold text-[#002b11] mt-1">
           {getRatingLabel(Number(averageRating))}
          </p>
          <div className="flex gap-0.5 mt-2 justify-center sm:justify-start">
           {[...Array(5)].map((_, i) => (
            <div
             key={i}
             className={`w-[14px] h-[14px] rounded-full ${
              i < Math.round(averageRating) ? "bg-[#00aa6c]" : "bg-gray-200"
             }`}
            />
           ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">({reviewCount})</p>
         </div>

         {/* Right - Distribution Bars */}
         <div className="flex-1 space-y-1.5">
          {ratingDistribution.map((item, i) => (
           <div key={item.stars} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500 w-16 text-right">
             {ratingLabels[i]}
            </span>
            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
             <div
              className="h-full bg-[#00aa6c] rounded-full"
              style={{
               width:
                reviewCount > 0 ? `${(item.count / reviewCount) * 100}%` : "0%",
              }}
             />
            </div>
            <span className="text-xs text-gray-400 w-6">{item.count}</span>
           </div>
          ))}
         </div>
        </div>
       )}

       {/* Individual Reviews */}
       <div className="space-y-0">
        {dbReviews.map((review, i) => (
         <div
          key={`db-${i}`}
          className="py-5 border-b border-gray-100 last:border-0">
          <div className="flex items-start gap-3">
           {/* Avatar */}
           <div className="w-10 h-10 rounded-full bg-[#f7f7f7] flex items-center justify-center shrink-0">
            <UserCircle size={28} className="text-gray-300" />
           </div>

           <div className="flex-1 min-w-0">
            {/* Name + Badge */}
            <div className="flex items-center gap-2 mb-0.5">
             <span className="font-bold text-[#002b11] text-sm">
              {review.user_name}
             </span>
             {review.user_id &&
              verifiedUserIds.some(
               (vid) => String(vid) === String(review.user_id),
              ) && (
               <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#00aa6c]/10 text-[#00aa6c] text-[10px] font-bold">
                <ShieldCheck size={10} /> Verified
               </span>
              )}
            </div>

            {/* Date */}
            <p className="text-xs text-gray-400 mb-2">
             {review.created_at
              ? new Date(review.created_at).toLocaleDateString("en-US", {
                 year: "numeric",
                 month: "long",
                 day: "numeric",
                })
              : "Recently"}
            </p>

            {/* Stars */}
            <div className="flex gap-0.5 mb-2">
             {[...Array(5)].map((_, idx) => (
              <div
               key={idx}
               className={`w-[13px] h-[13px] rounded-full ${
                idx < review.rating ? "bg-[#00aa6c]" : "bg-gray-200"
               }`}
              />
             ))}
            </div>

            {/* Comment */}
            <p className="text-sm text-gray-700 leading-relaxed">
             {review.comment}
            </p>

            {/* Owner Reply */}
            {review.owner_reply && (
             <div className="mt-3 ml-3 pl-4 border-l-2 border-gray-200">
              <div className="bg-[#f7f7f7] rounded-lg p-3">
               <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-[#00aa6c]">
                 {restaurant?.name || "Restaurant"} replied
                </span>
                {review.replied_at && (
                 <span className="text-[10px] text-gray-400">
                  · {new Date(review.replied_at).toLocaleDateString()}
                 </span>
                )}
               </div>
               <p className="text-sm text-gray-600 leading-relaxed">
                {review.owner_reply}
               </p>
              </div>
             </div>
            )}
           </div>
          </div>
         </div>
        ))}

        {dbReviews.length === 0 && (
         <div className="text-center py-10">
          <p className="text-gray-400 text-sm mb-3">
           No reviews yet. Be the first to review!
          </p>
          <button
           onClick={handleWriteReviewClick}
           className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#002b11] text-white text-sm font-bold hover:bg-[#004d1f] transition-colors cursor-pointer">
           <PenLine size={15} /> Write a review
          </button>
         </div>
        )}
       </div>
      </section>
     </div>

     {/* ── Right Sidebar ── */}
     <div className="hidden lg:block">
      <div className="sticky top-[130px] space-y-5">
       {/* Booking Widget */}
       <BookingWidget restaurant={restaurant} />

       {/* Save Card */}
       {/* <div className="border border-gray-200 rounded-xl p-5">
        <h4 className="text-lg font-bold text-[#002b11] mb-3">
         Save this restaurant
        </h4>
        <button
         onClick={() => setSaved(!saved)}
         className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 font-semibold text-sm transition-all cursor-pointer ${
          saved
           ? "border-red-200 bg-red-50 text-red-500"
           : "border-gray-200 text-[#002b11] hover:border-gray-300"
         }`}>
         <Heart size={16} className={saved ? "fill-red-500" : ""} />
         {saved ? "Saved" : "Save"}
        </button>
       </div> */}
      </div>
     </div>
    </div>
   </div>

   {/* ── Image Lightbox ── */}
   <AnimatePresence>
    {lightboxImage && (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setLightboxImage(null)}
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center cursor-zoom-out">
      <button
       onClick={() => setLightboxImage(null)}
       className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer">
       <XIcon size={20} />
      </button>

      {/* Nav arrows */}
      {images.length > 1 && (
       <>
        <button
         onClick={(e) => {
          e.stopPropagation();
          const prev = (lightboxIndex - 1 + images.length) % images.length;
          setLightboxIndex(prev);
          setLightboxImage(images[prev]);
         }}
         className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer">
         <ChevronLeft size={22} />
        </button>
        <button
         onClick={(e) => {
          e.stopPropagation();
          const next = (lightboxIndex + 1) % images.length;
          setLightboxIndex(next);
          setLightboxImage(images[next]);
         }}
         className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer">
         <ChevronRight size={22} />
        </button>
       </>
      )}

      <img
       src={lightboxImage}
       alt="Full preview"
       onClick={(e) => e.stopPropagation()}
       className="max-w-[90vw] max-h-[85vh] object-contain cursor-default"
      />

      {/* Image counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold">
       {lightboxIndex + 1} / {images.length}
      </div>
     </motion.div>
    )}
   </AnimatePresence>

   <ReviewModal
    isOpen={isReviewFormOpen}
    onClose={() => setIsReviewFormOpen(false)}
    restaurantId={restaurant.id}
    onReviewSubmitted={() => {
     fetchReviews(restaurant.id);
     fetchVerifiedUsers(restaurant.id);
    }}
   />

   {/* Eligibility Popup */}
   <AnimatePresence>
    {showEligibilityPopup && (
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowEligibilityPopup(false)}
      className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <motion.div
       initial={{ scale: 0.95, opacity: 0 }}
       animate={{ scale: 1, opacity: 1 }}
       exit={{ scale: 0.95, opacity: 0 }}
       onClick={(e) => e.stopPropagation()}
       className="bg-white w-full max-w-[400px] rounded-2xl p-8 text-center relative">
       <button
        onClick={() => setShowEligibilityPopup(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer">
        <XIcon size={18} />
       </button>

       <div className="w-16 h-16 rounded-full bg-[#00aa6c]/10 flex items-center justify-center mx-auto mb-5">
        <CalendarCheck size={30} className="text-[#00aa6c]" />
       </div>

       <h3 className="text-xl font-bold text-[#002b11] mb-2">
        Reservation Required
       </h3>
       <p className="text-sm text-gray-500 leading-relaxed mb-6">
        You can write a review only after completing a reservation at this
        restaurant. Book a table and dine with us first!
       </p>
       <button
        onClick={() => setShowEligibilityPopup(false)}
        className="w-full py-3 rounded-full bg-[#002b11] hover:bg-[#004d1f] text-white font-bold text-sm transition-colors cursor-pointer">
        Got it
       </button>
      </motion.div>
     </motion.div>
    )}
   </AnimatePresence>
  </div>
 );
}

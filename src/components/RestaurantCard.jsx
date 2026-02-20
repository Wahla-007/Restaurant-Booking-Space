import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { trackImpression } from "../utils/analytics";
import { motion } from "framer-motion";
import { Star, Heart, MapPin, Clock } from "lucide-react";

export default function RestaurantCard({ restaurant, index = 0 }) {
 const navigate = useNavigate();
 const cardRef = useRef(null);
 const [liked, setLiked] = useState(false);

 useEffect(() => {
  const el = cardRef.current;
  if (!el || !restaurant?.id) return;

  const observer = new IntersectionObserver(
   ([entry]) => {
    if (entry.isIntersecting) {
     trackImpression(restaurant.id);
     observer.disconnect();
    }
   },
   { threshold: 0.5 },
  );
  observer.observe(el);
  return () => observer.disconnect();
 }, [restaurant?.id]);

 const ratingNum = parseFloat(restaurant.rating);
 const fullDots = !isNaN(ratingNum) ? Math.round(ratingNum) : 0;

 return (
  <motion.div
   ref={cardRef}
   initial={{ opacity: 0, y: 24 }}
   whileInView={{ opacity: 1, y: 0 }}
   viewport={{ once: true, margin: "-40px" }}
   transition={{
    duration: 0.45,
    delay: index * 0.06,
    ease: [0.22, 1, 0.36, 1],
   }}
   className="group cursor-pointer"
   onClick={() => navigate(`/restaurant/${restaurant.id}`)}>
   <div className="h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
    {/* Image */}
    <div className="relative h-56 overflow-hidden">
     <img
      src={restaurant.images[0]}
      alt={restaurant.name}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
     />

     {/* Wishlist Heart */}
     <button
      onClick={(e) => {
       e.stopPropagation();
       setLiked(!liked);
      }}
      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-colors">
      <Heart
       size={18}
       className={`transition-colors ${liked ? "text-red-500 fill-red-500" : "text-[#002b11]/60"}`}
      />
     </button>

     {/* Featured Badge */}
     {restaurant.is_featured && (
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#002b11] shadow-md">
       <svg width="13" height="13" viewBox="0 0 40 40" fill="none">
        <path
         d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094z"
         fill="#fff"
        />
        <path
         d="M17.204 27.822l-6.904-6.904 2.828-2.828 4.076 4.076 8.876-8.876 2.828 2.828-11.704 11.704z"
         fill="#002b11"
        />
       </svg>
       <span className="text-[11px] font-bold text-white tracking-wider uppercase">
        Featured
       </span>
      </div>
     )}
    </div>

    {/* Content */}
    <div className="p-4">
     {/* Location Tag */}
     {restaurant.location && (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f0f0f0] text-[11px] font-semibold text-[#002b11]/70 mb-2 w-full">
       <MapPin size={10} className="shrink-0" />
       <span className="truncate">{restaurant.location}</span>
      </span>
     )}

     {/* Name */}
     <h3 className="text-[15px] font-bold text-[#002b11] leading-snug mb-1.5 group-hover:text-[#004d1f] transition-colors">
      {restaurant.name}
     </h3>

     {/* Rating Row - TripAdvisor bubble style */}
     <div className="flex items-center gap-1.5 mb-1.5">
      {restaurant.rating && restaurant.rating !== "New" && (
       <>
        <span className="text-[13px] font-bold text-[#002b11]">
         {restaurant.rating}
        </span>
        <div className="flex items-center gap-[2px]">
         {[...Array(5)].map((_, i) => (
          <span
           key={i}
           className={`w-[14px] h-[14px] rounded-full ${
            i < fullDots ? "bg-[#00aa6c]" : "bg-[#00aa6c]/20"
           }`}
          />
         ))}
        </div>
        <span className="text-[12px] text-gray-400">
         ({restaurant.reviewCount.toLocaleString()}) reviews
        </span>
       </>
      )}
      {restaurant.rating === "New" && (
       <>
        <span className="text-[11px] font-semibold text-[#00aa6c] bg-[#00aa6c]/10 px-2 py-0.5 rounded-full">
         New
        </span>
        <span className="text-[12px] text-gray-400">
         ({restaurant.reviewCount || 0}) reviews
        </span>
       </>
      )}
     </div>

     {/* Cuisine & City */}
     <div className="flex items-center text-[13px] text-gray-500 mb-3">
      <span className="font-medium text-[#002b11]/60">
       {restaurant.cuisine}
       {restaurant.city ? ` | ${restaurant.city}` : ""}
      </span>
     </div>

     {/* Time Slots */}
     <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
      <Clock size={12} className="text-gray-300 shrink-0" />
      <div className="flex gap-1.5 flex-1">
       {["17:00", "17:30", "18:00"].map((t) => (
        <button
         key={t}
         onClick={(e) => {
          e.stopPropagation();
          navigate(`/restaurant/${restaurant.id}`);
         }}
         className="flex-1 py-1.5 text-[11px] font-semibold text-[#002b11] bg-[#002b11]/[0.04] hover:bg-[#002b11]/[0.08] border border-[#002b11]/10 hover:border-[#002b11]/20 rounded-lg transition-all duration-200">
         {t}
        </button>
       ))}
      </div>
     </div>
    </div>
   </div>
  </motion.div>
 );
}

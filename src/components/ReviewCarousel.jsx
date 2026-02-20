import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

export default function ReviewCarousel({ reviews }) {
 const scrollRef = useRef(null);
 const animationRef = useRef(null);

 // Duplicate reviews for seamless infinite loop
 const items = reviews.length > 0 ? [...reviews, ...reviews, ...reviews] : [];

 useEffect(() => {
  const container = scrollRef.current;
  if (!container || items.length === 0) return;

  let scrollPos = 0;
  const speed = 0.5; // px per frame

  const animate = () => {
   scrollPos += speed;
   // Reset when we've scrolled through one full set
   const singleSetWidth = container.scrollWidth / 3;
   if (scrollPos >= singleSetWidth) {
    scrollPos = 0;
   }
   container.scrollLeft = scrollPos;
   animationRef.current = requestAnimationFrame(animate);
  };

  animationRef.current = requestAnimationFrame(animate);

  // Pause on hover
  const handleMouseEnter = () => {
   if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };
  const handleMouseLeave = () => {
   animationRef.current = requestAnimationFrame(animate);
  };

  container.addEventListener("mouseenter", handleMouseEnter);
  container.addEventListener("mouseleave", handleMouseLeave);

  return () => {
   if (animationRef.current) cancelAnimationFrame(animationRef.current);
   container.removeEventListener("mouseenter", handleMouseEnter);
   container.removeEventListener("mouseleave", handleMouseLeave);
  };
 }, [items.length]);

 if (items.length === 0) return null;

 return (
  <div
   ref={scrollRef}
   className="flex gap-5 overflow-hidden"
   style={{
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
   }}>
   {items.map((review, index) => (
    <div
     key={`${review.id}-${index}`}
     className="flex-shrink-0 w-[340px] bg-white p-7 rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
     {/* Stars */}
     <div className="flex items-center gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
       <Star
        key={i}
        size={14}
        className={
         i < review.rating ? "text-[#00aa6c] fill-[#00aa6c]" : "text-gray-200"
        }
       />
      ))}
     </div>

     {/* Comment */}
     <p className="text-[#002b11]/70 text-sm leading-relaxed mb-5 line-clamp-4">
      "{review.comment}"
     </p>

     {/* Author */}
     <div className="border-t border-gray-50 pt-4 flex items-center gap-3">
      {review.user_avatar ? (
       <img
        src={review.user_avatar}
        alt={review.user_name}
        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
       />
      ) : (
       <div className="w-8 h-8 rounded-full bg-[#002b11]/10 flex items-center justify-center">
        <span className="text-xs font-bold text-[#002b11]">
         {review.user_name?.charAt(0)?.toUpperCase() || "?"}
        </span>
       </div>
      )}
      <div>
       <p className="text-sm font-bold text-[#002b11]">{review.user_name}</p>
       <p className="text-[11px] text-gray-400">
        {new Date(review.created_at).toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric",
        })}
       </p>
      </div>
     </div>
    </div>
   ))}
  </div>
 );
}

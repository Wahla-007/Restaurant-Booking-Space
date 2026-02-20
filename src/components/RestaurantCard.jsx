import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { trackImpression } from "../utils/analytics";

export default function RestaurantCard({ restaurant }) {
 const navigate = useNavigate();
 const cardRef = useRef(null);

 // Track impression when card becomes visible
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

 return (
  <div
   ref={cardRef}
   className="card glass"
   style={{
    borderRadius: "var(--radius)",
    overflow: "hidden",
    cursor: "pointer",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    transition: "var(--transition)",
   }}
   onClick={() => navigate(`/restaurant/${restaurant.id}`)}
   onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
   onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
   <div style={{ height: "220px", overflow: "hidden", position: "relative" }}>
    <img
     src={restaurant.images[0]}
     alt={restaurant.name}
     style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    {restaurant.is_featured && (
     <div
      style={{
       position: "absolute",
       top: "10px",
       left: "10px",
       background: "rgba(0, 0, 0, 0.65)",
       backdropFilter: "blur(8px)",
       WebkitBackdropFilter: "blur(8px)",
       padding: "5px 12px",
       borderRadius: "8px",
       display: "flex",
       alignItems: "center",
       gap: "6px",
       fontSize: "0.72rem",
       fontWeight: 700,
       color: "#fff",
       boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
       letterSpacing: "0.6px",
       textTransform: "uppercase",
      }}>
      <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
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
    <div
     style={{
      position: "absolute",
      top: "12px",
      right: "12px",
      background: "rgba(0,0,0,0.7)",
      padding: "4px 8px",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      backdropFilter: "blur(4px)",
      fontSize: "0.9rem",
     }}>
     <span style={{ color: "#fbbf24" }}>★</span>
     <span style={{ fontWeight: 600 }}>{restaurant.rating}</span>
     <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
      ({restaurant.reviewCount})
     </span>
    </div>
   </div>

   <div
    style={{
     padding: "1.25rem",
     flex: 1,
     display: "flex",
     flexDirection: "column",
    }}>
    <h3
     style={{
      margin: "0 0 0.5rem 0",
      fontSize: "1.2rem",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "6px",
      textTransform: "capitalize",
     }}>
     {restaurant.name}
     {restaurant.is_featured && (
      <svg
       width="18"
       height="18"
       viewBox="0 0 40 40"
       fill="none"
       style={{ flexShrink: 0 }}>
       <path
        d="M19.998 3.094L14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v6.354h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.905 20 40 14.641l-5.436-3.137V5.15h-6.234L25.358 0l-5.36 3.094z"
        fill="#1DA1F2"
       />
       <path
        d="M17.204 27.822l-6.904-6.904 2.828-2.828 4.076 4.076 8.876-8.876 2.828 2.828-11.704 11.704z"
        fill="#fff"
       />
      </svg>
     )}
    </h3>

    <div
     style={{
      display: "flex",
      gap: "1rem",
      marginBottom: "0.75rem",
      fontSize: "0.9rem",
      color: "var(--text-muted)",
     }}>
     <span>{restaurant.cuisine}</span>
     <span>•</span>
     <span>{restaurant.price}</span>
     <span>•</span>
     <span>{restaurant.location}</span>
    </div>

    <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
     {["17:00", "17:30", "18:00"].map((time) => (
      <button
       key={time}
       className="btn-secondary"
       style={{
        padding: "0.4rem 0.8rem",
        fontSize: "0.85rem",
        flex: 1,
        borderRadius: "6px",
       }}>
       {time}
      </button>
     ))}
    </div>
   </div>
  </div>
 );
}

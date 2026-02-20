import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookingWidget from "../components/BookingWidget";
import ReviewModal from "../components/ReviewModal";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import {
 MapPin,
 ChefHat,
 Star,
 PenLine,
 ShieldCheck,
 CalendarCheck,
 X as XIcon,
 UserCircle,
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
 const [showEligibilityPopup, setShowEligibilityPopup] = useState(false);
 const [verifiedUserIds, setVerifiedUserIds] = useState([]);

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
    // Store both raw and string versions for flexible matching
    const ids = [...new Set(data.map((b) => b.user_id))];
    setVerifiedUserIds(ids);
   }
  } catch (err) {
   console.error("Error fetching verified users:", err);
  }
 };

 // Fetch Reviews Function (for initial load and refresh)
 const fetchReviews = async (restaurantId) => {
  if (!restaurantId || typeof restaurantId === "number") return; // Skip for static/numeric IDs
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
    // Fetch from DB
    const { data, error } = await supabase
     .from("restaurants")
     .select("*")
     .eq("id", id)
     .single();

    if (error) throw error;
    setRestaurant(data);

    // Track page view
    if (data?.id) trackView(data.id);

    // Fetch reviews once restaurant is loaded
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
   : 0; // Default to 0 or 'New' logic

 const reviewCount = dbReviews.length;

 const handleWriteReviewClick = async () => {
  if (!user) {
   navigate("/login");
   return;
  }

  // Check if restaurant is from DB (UUID)
  const isUUID = restaurant.id && String(restaurant.id).length > 20;
  if (!isUUID) {
   // Static restaurant — allow review for demo
   setIsReviewFormOpen(true);
   return;
  }

  // Check if user has a completed booking at this restaurant
  try {
   let query = supabase
    .from("bookings")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .eq("status", "completed")
    .limit(1);

   // user.id may be UUID or bigint depending on DB — safely filter
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

 if (loading)
  return (
   <div className="container" style={{ paddingTop: "6rem" }}>
    Loading restaurant details...
   </div>
  );
 if (!restaurant)
  return (
   <div className="container" style={{ paddingTop: "6rem" }}>
    Restaurant not found.
   </div>
  );

 return (
  <div>
   {/* Banner */}
   <div style={{ height: "400px", position: "relative" }}>
    <img
     src={
      (restaurant.images && restaurant.images[0]) ||
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"
     }
     alt={restaurant.name}
     style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <div
     style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "150px",
      background: "linear-gradient(to top, var(--bg-app), transparent)",
     }}
    />
   </div>

   <main
    className="container"
    style={{
     transform: "translateY(-60px)",
     position: "relative",
     zIndex: 10,
    }}>
    <div
     style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "3rem" }}>
     {/* Main Info */}
     <div
      className="glass"
      style={{ padding: "2rem", borderRadius: "var(--radius)" }}>
      <div
       style={{
        borderBottom: "1px solid var(--glass-border)",
        paddingBottom: "2rem",
        marginBottom: "2rem",
       }}>
       <h1
        style={{
         fontSize: "3rem",
         margin: "0 0 1rem 0",
         display: "flex",
         alignItems: "center",
         gap: "12px",
         textTransform: "capitalize",
        }}>
        {restaurant.name}
        {restaurant.is_featured && (
         <svg
          width="32"
          height="32"
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
       </h1>

       <div
        style={{
         display: "flex",
         gap: "1.5rem",
         alignItems: "center",
         color: "var(--text-muted)",
        }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
         <Star size={20} color="#fbbf24" fill="#fbbf24" />
         <span style={{ color: "white", fontWeight: 600 }}>
          {averageRating > 0 ? averageRating : "New"}
         </span>{" "}
         ({reviewCount} reviews)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
         <ChefHat size={20} />
         {restaurant.cuisine}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
         <MapPin size={20} />
         {restaurant.location}
        </span>
       </div>
      </div>

      <div style={{ marginBottom: "3rem" }}>
       <h3 style={{ fontSize: "1.5rem" }}>About</h3>
       <p
        style={{
         lineHeight: 1.8,
         fontSize: "1.1rem",
         color: "var(--text-muted)",
        }}>
        {restaurant.description}
       </p>
      </div>

      <div style={{ marginBottom: "3rem" }}>
       <h3 style={{ fontSize: "1.5rem" }}>Menu Highlights</h3>
       <div
        style={{
         display: "grid",
         gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
         gap: "1.5rem",
        }}>
        {restaurant.menu?.highlights?.map((item, i) => (
         <div
          key={i}
          style={{
           border: "1px solid var(--glass-border)",
           borderRadius: "12px",
           overflow: "hidden",
           background: "rgba(255,255,255,0.03)",
           transition: "transform 0.2s, box-shadow 0.2s",
          }}>
          {item.image ? (
           <div
            onClick={() => setLightboxImage(item.image)}
            style={{
             width: "100%",
             height: "180px",
             overflow: "hidden",
             cursor: "pointer",
            }}>
            <img
             src={item.image}
             alt={item.name}
             style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.3s",
             }}
             onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
             }
             onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
           </div>
          ) : (
           <div
            style={{
             width: "100%",
             height: "120px",
             background: "rgba(148, 163, 184, 0.1)",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
            }}>
            <ChefHat
             size={32}
             style={{ color: "var(--text-muted)", opacity: 0.4 }}
            />
           </div>
          )}
          <div style={{ padding: "1rem" }}>
           <div
            style={{
             display: "flex",
             justifyContent: "space-between",
             alignItems: "flex-start",
             marginBottom: "0.5rem",
            }}>
            <span style={{ fontWeight: 600, fontSize: "1rem" }}>
             {item.name}
            </span>
            {item.price && (
             <span
              style={{
               color: "var(--secondary)",
               fontWeight: 700,
               fontSize: "0.95rem",
               flexShrink: 0,
               marginLeft: "0.75rem",
              }}>
              Rs. {item.price}
             </span>
            )}
           </div>
           {item.description && (
            <p
             style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              lineHeight: 1.5,
             }}>
             {item.description}
            </p>
           )}
           {item.category && (
            <span
             style={{
              display: "inline-block",
              marginTop: "0.5rem",
              padding: "0.2rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: "999px",
              background: "rgba(139, 92, 246, 0.15)",
              color: "var(--primary)",
             }}>
             {item.category}
            </span>
           )}
          </div>
         </div>
        )) || <p className="text-muted">No menu highlights available.</p>}
       </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
       <div
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}>
        <h3 style={{ fontSize: "1.5rem", margin: 0 }}>
         What people are saying
        </h3>
        <button
         className="btn btn-primary"
         onClick={handleWriteReviewClick}
         style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1.2rem",
         }}>
         <PenLine size={18} />
         Write a Review
        </button>
       </div>
       <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* DB Reviews */}
        {dbReviews.map((review, i) => (
         <div
          key={`db-${i}`}
          style={{
           padding: "1.5rem",
           background: "rgba(255,255,255,0.03)",
           borderRadius: "12px",
          }}>
          <div
           style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
           }}>
           <div
            style={{
             width: "40px",
             height: "40px",
             borderRadius: "50%",
             background: "rgba(255,255,255,0.08)",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
            }}>
            <UserCircle
             size={36}
             style={{ color: "var(--text-muted)", opacity: 0.7 }}
            />
           </div>
           <div>
            <div
             style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
             <span style={{ fontWeight: 600 }}>{review.user_name}</span>
             {review.user_id &&
              verifiedUserIds.some(
               (vid) => String(vid) === String(review.user_id),
              ) && (
               <span
                style={{
                 display: "inline-flex",
                 alignItems: "center",
                 gap: "3px",
                 background: "rgba(16, 185, 129, 0.15)",
                 color: "#10b981",
                 fontSize: "0.7rem",
                 fontWeight: 700,
                 padding: "2px 8px",
                 borderRadius: "999px",
                 letterSpacing: "0.02em",
                }}>
                <ShieldCheck size={12} />
                Verified
               </span>
              )}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
             {review.created_at
              ? new Date(review.created_at).toLocaleDateString()
              : "Recently"}
            </div>
           </div>
           <div style={{ marginLeft: "auto", display: "flex", gap: "2px" }}>
            {[...Array(5)].map((_, idx) => (
             <Star
              key={idx}
              size={16}
              fill={idx < review.rating ? "#fbbf24" : "none"}
              color={idx < review.rating ? "#fbbf24" : "#666"}
             />
            ))}
           </div>
          </div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{review.comment}</p>

          {/* Owner Reply — Play Store style */}
          {review.owner_reply && (
           <div
            style={{
             marginTop: "0.75rem",
             marginLeft: "1rem",
             paddingLeft: "1rem",
             borderLeft: "3px solid rgba(255,255,255,0.1)",
            }}>
            <div
             style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              padding: "0.85rem 1rem",
             }}>
             <div
              style={{
               display: "flex",
               alignItems: "center",
               gap: "0.5rem",
               marginBottom: "0.4rem",
              }}>
              <span
               style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "var(--primary, #8b5cf6)",
               }}>
               {restaurant?.name || "Restaurant"} replied
              </span>
              {review.replied_at && (
               <span
                style={{
                 fontSize: "0.7rem",
                 color: "var(--text-muted)",
                }}>
                · {new Date(review.replied_at).toLocaleDateString()}
               </span>
              )}
             </div>
             <p
              style={{
               margin: 0,
               fontSize: "0.88rem",
               lineHeight: 1.55,
               color: "rgba(255,255,255,0.7)",
              }}>
              {review.owner_reply}
             </p>
            </div>
           </div>
          )}
         </div>
        ))}

        {dbReviews.length === 0 && (
         <p className="text-muted">No reviews yet. Be the first to review!</p>
        )}
       </div>
      </div>
     </div>

     {/* Sidebar */}
     <div>
      <BookingWidget restaurant={restaurant} />
      <div
       style={{
        marginTop: "2rem",
        padding: "1.5rem",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
       }}>
       <h4 style={{ margin: "0 0 1rem 0" }}>Location</h4>
       <div
        style={{
         height: "200px",
         background: "#334155",
         borderRadius: "8px",
         overflow: "hidden",
         position: "relative",
        }}>
        {restaurant.location_link ? (
         <iframe
          src={(() => {
           const link = restaurant.location_link;
           // If it's already an embed link, use as-is
           if (link.includes("/embed")) return link;
           // Extract coordinates or query from Google Maps link
           const coordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
           if (coordMatch) {
            return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${coordMatch[2]}!3d${coordMatch[1]}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1`;
           }
           // Fallback: use the link as a search query embed
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
         <div
          style={{
           height: "100%",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           flexDirection: "column",
          }}>
          <MapPin
           size={32}
           className="text-muted"
           style={{ marginBottom: "0.5rem" }}
          />
          <span className="text-muted">Map view unavailable</span>
         </div>
        )}
       </div>
       {restaurant.location_link && (
        <a
         href={restaurant.location_link}
         target="_blank"
         rel="noopener noreferrer"
         style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          marginTop: "0.75rem",
          fontSize: "0.85rem",
          color: "#60a5fa",
          textDecoration: "none",
         }}>
         <MapPin size={14} />
         Open in Google Maps
        </a>
       )}
       {restaurant.location && (
        <p
         style={{
          marginTop: "0.75rem",
          fontSize: "0.9rem",
          color: "var(--text-muted)",
         }}>
         {restaurant.location}
        </p>
       )}
      </div>
     </div>
    </div>
   </main>
   {/* Image Lightbox */}
   {lightboxImage && (
    <div
     onClick={() => setLightboxImage(null)}
     style={{
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "zoom-out",
      animation: "fadeIn 0.2s ease-out",
     }}>
     <button
      onClick={() => setLightboxImage(null)}
      style={{
       position: "absolute",
       top: "1.5rem",
       right: "1.5rem",
       background: "rgba(255,255,255,0.15)",
       border: "none",
       color: "white",
       width: "44px",
       height: "44px",
       borderRadius: "50%",
       fontSize: "1.5rem",
       cursor: "pointer",
       display: "flex",
       alignItems: "center",
       justifyContent: "center",
       transition: "background 0.2s",
      }}
      onMouseOver={(e) =>
       (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
      }
      onMouseOut={(e) =>
       (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
      }>
      ✕
     </button>
     <img
      src={lightboxImage}
      alt="Full preview"
      onClick={(e) => e.stopPropagation()}
      style={{
       width: "100vw",
       height: "100vh",
       objectFit: "contain",
       padding: "1rem",
       cursor: "default",
      }}
     />
    </div>
   )}

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
   {showEligibilityPopup && (
    <div
     onClick={() => setShowEligibilityPopup(false)}
     style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(5px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
     }}>
     <div
      className="glass"
      onClick={(e) => e.stopPropagation()}
      style={{
       width: "100%",
       maxWidth: "420px",
       padding: "2.5rem",
       borderRadius: "16px",
       textAlign: "center",
       border: "1px solid rgba(255,255,255,0.1)",
       position: "relative",
      }}>
      <button
       onClick={() => setShowEligibilityPopup(false)}
       style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        background: "none",
        border: "none",
        color: "var(--text-muted)",
        cursor: "pointer",
       }}>
       <XIcon size={20} />
      </button>

      <div
       style={{
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        background: "rgba(251, 191, 36, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 1.5rem",
       }}>
       <CalendarCheck size={32} style={{ color: "#fbbf24" }} />
      </div>

      <h3
       style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.75rem" }}>
       Reservation Required
      </h3>
      <p
       style={{
        color: "var(--text-muted)",
        lineHeight: 1.7,
        fontSize: "0.95rem",
        marginBottom: "1.5rem",
       }}>
       You can write a review only after completing a reservation at this
       restaurant. Book a table and dine with us first!
      </p>
      <button
       onClick={() => setShowEligibilityPopup(false)}
       className="btn btn-primary"
       style={{ width: "100%" }}>
       Got it
      </button>
     </div>
    </div>
   )}
  </div>
 );
}

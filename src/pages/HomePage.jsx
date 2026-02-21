import HeroSearch from "../components/HeroSearch";
import RestaurantCard from "../components/RestaurantCard";
import WebReviewForm from "../components/WebReviewForm";
import ReviewCarousel from "../components/ReviewCarousel";
import { fuzzyMatch } from "../utils/searchUtils";
import useDebounce from "../hooks/useDebounce";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AppDownloadPopup from "../components/AppDownloadPopup";
import AdBanner from "../components/AdBanner";
import {
 Utensils,
 Wine,
 Flame,
 Fish,
 Leaf,
 ChefHat,
 ArrowRight,
 ChevronLeft,
 ChevronRight,
 Star,
 Shield,
 Zap,
 Heart,
 CircleCheck,
 MapPin,
} from "lucide-react";

const cuisineCategories = [
 { name: "Fast Food", icon: Utensils },
 { name: "Fine Dining", icon: Wine },
 { name: "Desi Food", icon: Flame },
 { name: "Fish", icon: Fish },
 { name: "Hotels", icon: Leaf },
 { name: "OutDoor", icon: ChefHat },
];

function FeaturedCarousel({ featuredRestaurants, userCity }) {
 const scrollRef = useRef(null);
 const [canScrollLeft, setCanScrollLeft] = useState(false);
 const [canScrollRight, setCanScrollRight] = useState(false);
 const showArrows = featuredRestaurants.length > 1;

 const checkScroll = () => {
  const el = scrollRef.current;
  if (!el) return;
  setCanScrollLeft(el.scrollLeft > 2);
  setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
 };

 useEffect(() => {
  checkScroll();
  const el = scrollRef.current;
  if (el) el.addEventListener("scroll", checkScroll, { passive: true });
  window.addEventListener("resize", checkScroll);
  return () => {
   if (el) el.removeEventListener("scroll", checkScroll);
   window.removeEventListener("resize", checkScroll);
  };
 }, [featuredRestaurants]);

 const scroll = (direction) => {
  const el = scrollRef.current;
  if (!el) return;
  const cardWidth = el.querySelector(":scope > div")?.offsetWidth || 300;
  const gap = 20;
  const scrollAmount = (cardWidth + gap) * (direction === "left" ? -1 : 1);
  el.scrollBy({ left: scrollAmount, behavior: "smooth" });
 };

 return (
  <section className="py-10 sm:py-10">
   <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <motion.div
     initial={{ opacity: 0, y: 16 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true }}
     transition={{ duration: 0.5 }}
     className="flex items-end justify-between mb-8">
     <div>
      <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-1 block">
       {userCity ? `Popular in ${userCity}` : "Handpicked for you"}
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight">
       Featured Restaurants
      </h2>
      {userCity && (
       <div className="flex items-center gap-1.5 mt-1">
        <MapPin size={13} className="text-[#00aa6c]" />
        <p className="text-[#002b11]/40 text-xs font-medium">
         Based on your location
        </p>
       </div>
      )}
     </div>
     <div className="flex items-center gap-2">
      {showArrows && (
       <>
        <button
         onClick={() => scroll("left")}
         disabled={!canScrollLeft}
         className={`hidden sm:flex w-9 h-9 rounded-full border border-[#002b11]/10 items-center justify-center transition-all duration-200 cursor-pointer ${
          canScrollLeft
           ? "bg-white hover:bg-[#002b11] hover:text-white hover:border-[#002b11] text-[#002b11]"
           : "bg-gray-50 text-[#002b11]/20 cursor-not-allowed"
         }`}>
         <ChevronLeft size={18} />
        </button>
        <button
         onClick={() => scroll("right")}
         disabled={!canScrollRight}
         className={`hidden sm:flex w-9 h-9 rounded-full border border-[#002b11]/10 items-center justify-center transition-all duration-200 cursor-pointer ${
          canScrollRight
           ? "bg-white hover:bg-[#002b11] hover:text-white hover:border-[#002b11] text-[#002b11]"
           : "bg-gray-50 text-[#002b11]/20 cursor-not-allowed"
         }`}>
         <ChevronRight size={18} />
        </button>
       </>
      )}
     </div>
    </motion.div>

    <div className="relative">
     {/* Left fade gradient */}
     {canScrollLeft && (
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
     )}

     {/* Mobile left arrow overlay */}
     {showArrows && canScrollLeft && (
      <button
       onClick={() => scroll("left")}
       className="sm:hidden absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 shadow-md border border-[#002b11]/10 flex items-center justify-center text-[#002b11] active:scale-90 transition-transform cursor-pointer">
       <ChevronLeft size={16} />
      </button>
     )}

     {/* Scrollable container */}
     <div
      ref={scrollRef}
      className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {featuredRestaurants.map((restaurant, index) => (
       <div
        key={restaurant.id}
        className="min-w-[280px] sm:min-w-[300px] lg:min-w-[calc(25%-15px)] lg:max-w-[calc(25%-15px)] flex-shrink-0">
        <RestaurantCard restaurant={restaurant} index={index} />
       </div>
      ))}
     </div>

     {/* Right fade gradient */}
     {canScrollRight && (
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
     )}

     {/* Mobile right arrow overlay */}
     {showArrows && canScrollRight && (
      <button
       onClick={() => scroll("right")}
       className="sm:hidden absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 shadow-md border border-[#002b11]/10 flex items-center justify-center text-[#002b11] active:scale-90 transition-transform cursor-pointer">
       <ChevronRight size={16} />
      </button>
     )}
    </div>
   </div>
  </section>
 );
}

export default function HomePage() {
 const { user } = useAuth();
 const { addToast } = useToast();
 const navigate = useNavigate();
 const [allRestaurants, setAllRestaurants] = useState([]);
 const [filteredRestaurants, setFilteredRestaurants] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [webReviews, setWebReviews] = useState([]);
 const [reviewFormOpen, setReviewFormOpen] = useState(false);
 const [userCity, setUserCity] = useState("");
 const [activeTab, setActiveTab] = useState("all");
 const debouncedQuery = useDebounce(searchQuery, 1000);

 // Helper to detect city from geolocation
 const detectCity = () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
   async (position) => {
    try {
     const { latitude, longitude } = position.coords;
     const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
     );
     const data = await resp.json();
     const city =
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.county ||
      "";
     if (city) {
      setUserCity(city);
      localStorage.setItem("user-city", city);
     }
    } catch (err) {
     console.error("Reverse geocoding failed:", err);
    }
   },
   (err) => {
    console.log("Geolocation denied or unavailable:", err.message);
   },
   { timeout: 10000, maximumAge: 300000 },
  );
 };

 // Auto-detect user's city on mount (only if permission already granted)
 useEffect(() => {
  const cachedCity = localStorage.getItem("user-city");
  if (cachedCity) {
   setUserCity(cachedCity);
  } else if (navigator.permissions) {
   // Only auto-request if user previously granted permission
   navigator.permissions
    .query({ name: "geolocation" })
    .then((result) => {
     if (result.state === "granted") {
      detectCity();
     }
    })
    .catch(() => {
     // permissions API not supported, skip auto-detect
    });
  }
 }, []);

 useEffect(() => {
  if (user && user.role === "admin") {
   navigate("/super-admin");
  } else if (user && user.role === "business") {
   navigate("/business-dashboard");
  }
 }, [user, navigate]);

 useEffect(() => {
  const loadData = async () => {
   try {
    const { data: dbRestaurants, error: restError } = await supabase
     .from("restaurants")
     .select("*");

    const { data: reviews, error: revError } = await supabase
     .from("reviews")
     .select("restaurant_id, rating");

    if (restError) console.error("Error fetching restaurants:", restError);
    if (revError) console.error("Error fetching reviews:", revError);

    const stats = {};
    if (reviews) {
     reviews.forEach((r) => {
      if (!stats[r.restaurant_id]) {
       stats[r.restaurant_id] = { sum: 0, count: 0 };
      }
      stats[r.restaurant_id].sum += r.rating;
      stats[r.restaurant_id].count += 1;
     });
    }

    const formattedDbRestaurants = (dbRestaurants || [])
     .filter((r) => r.is_active !== false)
     .map((r) => {
      const s = stats[r.id];

      let images = [];
      if (r.images && Array.isArray(r.images) && r.images.length > 0) {
       images = r.images;
      } else {
       images = [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
       ];
      }

      return {
       id: r.id,
       name: r.name || "Untitled Restaurant",
       cuisine: r.cuisine || "Restaurant",
       city: r.city || "",
       price: r.price || "$$",
       location: r.location || "",
       description: r.description || "",
       images: images,
       tags: r.tags || [],
       rating: s ? (s.sum / s.count).toFixed(1) : "New",
       reviewCount: s ? s.count : 0,
       is_featured: r.is_featured === true,
      };
     });

    const final = [...formattedDbRestaurants].sort(
     (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0),
    );

    setAllRestaurants(final);
    setFilteredRestaurants(final);
   } catch (err) {
    console.error("Critical error loading homepage:", err);
    setAllRestaurants([]);
    setFilteredRestaurants([]);
   } finally {
    setLoading(false);
   }
  };

  loadData();
 }, []);

 // Fetch approved web reviews
 const fetchWebReviews = async () => {
  try {
   const { data, error } = await supabase
    .from("web_reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

   if (data) setWebReviews(data);
   if (error) console.error("Error fetching web reviews:", error);
  } catch (err) {
   console.error("Error fetching web reviews:", err);
  }
 };

 useEffect(() => {
  fetchWebReviews();
 }, []);

 useEffect(() => {
  let pool = allRestaurants;

  // Filter by city when Near Me tab is active
  if (activeTab === "nearby" && userCity) {
   pool = pool.filter((r) => r.city?.toLowerCase() === userCity.toLowerCase());
  }

  if (!debouncedQuery) {
   setFilteredRestaurants(pool);
   return;
  }

  const q = debouncedQuery.toLowerCase();
  const results = pool.filter(
   (r) =>
    fuzzyMatch(r.name, q) ||
    fuzzyMatch(r.cuisine, q) ||
    fuzzyMatch(r.location, q),
  );
  setFilteredRestaurants(results);
 }, [debouncedQuery, allRestaurants, activeTab, userCity]);

 const handleSearch = ({ query }) => {
  setSearchQuery(query || "");
 };

 const handleCuisineClick = (cuisineName) => {
  setSearchQuery(cuisineName);
 };

 // Featured restaurants: filter by user city if detected
 const featuredRestaurants = allRestaurants.filter((r) => {
  if (!r.is_featured) return false;
  if (userCity) {
   return r.city?.toLowerCase() === userCity.toLowerCase();
  }
  return true;
 });

 // Fallback: if no featured in user's city, show all featured
 const displayFeatured =
  featuredRestaurants.length > 0
   ? featuredRestaurants
   : allRestaurants.filter((r) => r.is_featured);

 if (loading) {
  return (
   <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
     <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-[#002b11]/10 animate-ping" />
      <div className="absolute inset-0 rounded-full border-t-2 border-[#002b11] animate-spin" />
     </div>
     <p className="text-[#002b11]/40 text-sm font-medium tracking-wide animate-pulse">
      Loading...
     </p>
    </div>
   </div>
  );
 }

 return (
  <div className="min-h-screen bg-white">
   {/* App Download Popup */}
   <AppDownloadPopup />

   {/* Hero Section */}
   <HeroSearch
    onSearch={handleSearch}
    restaurants={allRestaurants}
    userCity={userCity}
    onTabChange={(tab) => setActiveTab(tab)}
    onRequestLocation={detectCity}
   />

   {/* Business CTA Banner */}
   <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
    <motion.div
     initial={{ opacity: 0, y: 20 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true }}
     transition={{ duration: 0.5 }}
     onClick={() => navigate("/business")}
     className="relative bg-[#002b11] rounded-2xl overflow-hidden flex flex-col md:flex-row cursor-pointer group hover:shadow-xl transition-shadow duration-300">
     {/* Left — Image (50%) */}
     <div className="relative w-full md:w-1/2 min-h-[260px] md:min-h-[340px] p-5 md:p-6">
      <div className="relative w-full h-full rounded-xl overflow-hidden">
       <img
        src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
        alt="Restaurant business"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
       />
      </div>
     </div>

     {/* Right — Content (50%) */}
     <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:py-12 md:px-10">
      <div className="flex items-center gap-2 mb-5">
       <img
        src="/logo/logo.svg"
        alt="ReserveKaru"
        className="w-8 h-8 brightness-0 invert"
       />
       <span className="text-white/70 text-[20px] font-bold tracking-wide">
        ReserveKaru Insights
       </span>
      </div>

      <h2 className="text-4xl sm:text-5xl md:text-[56px] lg:text-[82px] font-[900] text-white leading-[0.8] tracking-tight mb-5">
       Grow Your <br /> Restaurant <br /> Business
      </h2>

      <p className="text-white/60 text-base mb-8 max-w-md leading-relaxed">
       List your restaurant, manage reservations, and reach thousands of diners.
      </p>

      <div>
       <span className="inline-block px-7 py-3.5 bg-white text-[#002b11] text-sm font-bold rounded-full group-hover:shadow-lg transition-all duration-200">
        Get Started
       </span>
      </div>
     </div>
    </motion.div>
   </div>

   {/* Divider */}
   <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="h-px bg-gray-100" />
   </div>

   {/* Featured Restaurants */}
   {displayFeatured.length > 0 && (
    <FeaturedCarousel
     featuredRestaurants={displayFeatured}
     userCity={userCity}
    />
   )}

   {/* Cuisine Categories */}
   <section id="cuisines" className="py-16 sm:py-12 bg-[#f7f7f7]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12">
      <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-1 block">
       Explore
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight">
       Browse by Cuisine
      </h2>
      <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
       From intimate chef's tables to grand dining halls
      </p>
     </motion.div>

     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cuisineCategories.map((cat, index) => {
       const Icon = cat.icon;
       return (
        <motion.button
         key={cat.name}
         initial={{ opacity: 0, y: 16 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         transition={{ duration: 0.35, delay: index * 0.06 }}
         whileHover={{ y: -4, transition: { duration: 0.2 } }}
         onClick={() => handleCuisineClick(cat.name)}
         className="group cursor-pointer flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 hover:border-[#002b11]/15 hover:shadow-md transition-all duration-250">
         <div className="w-12 h-12 rounded-full bg-[#002b11]/[0.05] flex items-center justify-center group-hover:bg-[#002b11]/[0.08] transition-colors">
          <Icon
           size={22}
           className="text-[#002b11]/50 group-hover:text-[#002b11]/70 transition-colors"
          />
         </div>
         <span className="text-sm font-semibold text-[#002b11]/70 group-hover:text-[#002b11] transition-colors">
          {cat.name}
         </span>
        </motion.button>
       );
      })}
     </div>
    </div>
   </section>

   {/* All Restaurants */}
   <section id="discover" className="py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8">
      <div>
       <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-1 block">
        {debouncedQuery
         ? "Search Results"
         : activeTab === "nearby" && userCity
           ? "Near You"
           : "Tonight"}
       </span>
       <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight">
        {debouncedQuery
         ? `Results for "${debouncedQuery}"`
         : activeTab === "nearby" && userCity
           ? `Restaurants in ${userCity}`
           : "Available for Dinner Tonight"}
       </h2>
       {activeTab === "nearby" && userCity && (
        <div className="flex items-center gap-1.5 mt-1.5">
         <MapPin size={13} className="text-[#00aa6c]" />
         <p className="text-[#00aa6c] text-sm font-medium">
          Showing results near {userCity}
         </p>
        </div>
       )}
       <p className="text-gray-400 mt-1 text-sm">
        {filteredRestaurants.length} restaurant
        {filteredRestaurants.length !== 1 ? "s" : ""} found
       </p>
      </div>
      {!debouncedQuery && (
       <motion.button
        whileHover={{ x: 3 }}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#002b11]/60 hover:text-[#002b11] transition-colors mt-3 sm:mt-0">
        View all restaurants
        <ArrowRight size={15} />
       </motion.button>
      )}
     </motion.div>

     {filteredRestaurants.length === 0 ? (
      <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="text-center py-20">
       <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-5">
        <Utensils size={24} className="text-gray-300" />
       </div>
       <h3 className="text-lg font-bold text-[#002b11]/70 mb-1">
        No restaurants found
       </h3>
       <p className="text-gray-400 text-sm max-w-sm mx-auto">
        Try adjusting your search or explore our cuisine categories
       </p>
      </motion.div>
     ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
       {filteredRestaurants.map((restaurant, index) => (
        <RestaurantCard
         key={restaurant.id}
         restaurant={restaurant}
         index={index}
        />
       ))}
      </div>
     )}
    </div>
   </section>

   {/* Why Choose Us */}
   <section id="about" className="py-16 sm:py-16 bg-[#f7f7f7]">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-14">
      <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-1 block">
       Why ReserveKaru
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight">
       Dining, Elevated
      </h2>
      <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
       We redefine the way you discover and experience the finest restaurants
      </p>
     </motion.div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
       {
        icon: Shield,
        title: "Verified Venues",
        description:
         "Every restaurant is personally vetted for quality, ambiance, and exceptional culinary standards.",
       },
       {
        icon: Zap,
        title: "Instant Booking",
        description:
         "Secure your table in seconds with real-time availability and instant confirmations.",
       },
       {
        icon: Heart,
        title: "Curated For You",
        description:
         "Personalized recommendations powered by your dining preferences and history.",
       },
      ].map((feature, index) => {
       const Icon = feature.icon;
       return (
        <motion.div
         key={feature.title}
         initial={{ opacity: 0, y: 20 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         transition={{ duration: 0.4, delay: index * 0.1 }}
         className="group bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
         <div className="w-12 h-12 rounded-xl bg-[#002b11]/[0.05] flex items-center justify-center mb-5 group-hover:bg-[#002b11]/[0.08] transition-colors">
          <Icon size={22} className="text-[#002b11]/60" />
         </div>
         <h3 className="text-lg font-bold text-[#002b11] mb-2">
          {feature.title}
         </h3>
         <p className="text-sm text-gray-500 leading-relaxed">
          {feature.description}
         </p>
        </motion.div>
       );
      })}
     </div>
    </div>
   </section>

   {/* Ad Banner */}
   <AdBanner />

   {/* Testimonials — Infinite Carousel */}
   <section id="reviews" className="py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-end justify-between mb-10">
      <div>
       <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-1 block">
        Testimonials
       </span>
       <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight">
        Loved by Diners
       </h2>
      </div>
      <motion.button
       whileHover={{ scale: 1.03 }}
       whileTap={{ scale: 0.97 }}
       onClick={() => {
        if (!user) {
         addToast("Please sign in to write a review.", "error");
         navigate("/login");
         return;
        }
        setReviewFormOpen(true);
       }}
       className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#002b11] text-white text-sm font-bold hover:bg-[#004d1f] transition-colors shadow-sm cursor-pointer">
       <Star size={14} className="fill-white" />
       Write a Review
      </motion.button>
     </motion.div>
    </div>

    {/* Full-width carousel (no max-w constraint) */}
    <div className="pl-6 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
     {webReviews.length > 0 ? (
      <ReviewCarousel reviews={webReviews} />
     ) : (
      <div className="text-center py-12">
       <p className="text-gray-400 text-sm">
        No reviews yet. Be the first to share your experience!
       </p>
      </div>
     )}
    </div>

    {/* Mobile write button */}
    <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-8 sm:hidden">
     <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
       if (!user) {
        addToast("Please sign in to write a review.", "error");
        navigate("/login");
        return;
       }
       setReviewFormOpen(true);
      }}
      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#002b11] text-white text-sm font-bold hover:bg-[#004d1f] transition-colors shadow-sm cursor-pointer">
      <Star size={14} className="fill-white" />
      Write a Review
     </motion.button>
    </div>
   </section>

   {/* Review Form Modal */}
   <WebReviewForm
    isOpen={reviewFormOpen}
    onClose={() => setReviewFormOpen(false)}
    onSubmitted={fetchWebReviews}
   />

   {/* CTA Section */}
   <section className="py-20 sm:py-28 bg-[#002b11]">
    <div className="max-w-3xl mx-auto px-6 text-center">
     <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
       Ready for an unforgettable evening?
      </h2>
      <p className="text-white/60 mb-10 max-w-lg mx-auto">
       Join thousands of discerning diners who trust LuxeTable for their most
       memorable dining moments.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
       <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="px-8 cursor-pointer py-3.5 rounded-full bg-white  text-[#002b11] font-bold transition-all duration-200 shadow-lg text-sm">
        Reserve a Table
       </motion.button>
       <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/signup")}
        className="px-8 cursor-pointer py-3.5 rounded-full bg-[#00bd49]  text-white font-bold transition-all duration-200 shadow-lg text-sm">
        Create Account
       </motion.button>
      </div>
     </motion.div>
    </div>
   </section>

   {/* Footer */}
   <footer className="border-t border-gray-100 py-12 bg-white">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2.5">
       <img src="/logo/logo.svg" alt="logo bookkaru" className="h-8 w-8" />

       <span className="text-lg font-bold tracking-tight text-[#002b11]">
        ReserveKaru
       </span>
      </div>
      <div className="flex items-center gap-8">
       {[
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/terms" },
        { label: "Advertise", to: "/advertise" },
        { label: "Contact", to: "/contact" },
       ].map((link) => (
        <Link
         key={link.label}
         to={link.to}
         className="text-xs cursor-pointer text-gray-400 hover:text-[#002b11] transition-colors font-medium">
         {link.label}
        </Link>
       ))}
      </div>
      <p className="text-xs text-[#002b11]">
       © 2026 ReserveKaru. All rights reserved.
      </p>
     </div>
    </div>
   </footer>
  </div>
 );
}

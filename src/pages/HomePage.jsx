import HeroSearch from "../components/HeroSearch";
import RestaurantCard from "../components/RestaurantCard";
import { fuzzyMatch } from "../utils/searchUtils";
import useDebounce from "../hooks/useDebounce";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AppDownloadPopup from "../components/AppDownloadPopup";
import {
 Utensils,
 Wine,
 Flame,
 Fish,
 Leaf,
 ChefHat,
 ArrowRight,
 Star,
 Shield,
 Zap,
 Heart,
 CircleCheck,
} from "lucide-react";

const cuisineCategories = [
 { name: "Fast Food", icon: Utensils },
 { name: "Fine Dining", icon: Wine },
 { name: "Desi Food", icon: Flame },
 { name: "Fish", icon: Fish },
 { name: "Hotels", icon: Leaf },
 { name: "OutDoor", icon: ChefHat },
];

const testimonials = [
 {
  quote:
   "ReserveKaru completely transformed how we discover restaurants. The experience is seamless and the quality is unmatched.",
  author: "Sarah Mitchell",
  title: "Food Critic, The Gourmet Times",
  rating: 5,
 },
 {
  quote:
   "Every reservation has been flawless. From Michelin-starred gems to hidden local treasures — this platform delivers.",
  author: "James Chen",
  title: "Executive, Tech Ventures",
  rating: 5,
 },
 {
  quote:
   "The attention to detail is extraordinary. It's like having a personal concierge for dining experiences.",
  author: "Priya Sharma",
  title: "Lifestyle Blogger",
  rating: 5,
 },
];

export default function HomePage() {
 const { user } = useAuth();
 const navigate = useNavigate();
 const [allRestaurants, setAllRestaurants] = useState([]);
 const [filteredRestaurants, setFilteredRestaurants] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const debouncedQuery = useDebounce(searchQuery, 1000);

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

 useEffect(() => {
  if (!debouncedQuery) {
   setFilteredRestaurants(allRestaurants);
   return;
  }

  const q = debouncedQuery.toLowerCase();
  const results = allRestaurants.filter(
   (r) =>
    fuzzyMatch(r.name, q) ||
    fuzzyMatch(r.cuisine, q) ||
    fuzzyMatch(r.location, q),
  );
  setFilteredRestaurants(results);
 }, [debouncedQuery, allRestaurants]);

 const handleSearch = ({ query }) => {
  setSearchQuery(query || "");
 };

 const handleCuisineClick = (cuisineName) => {
  setSearchQuery(cuisineName);
 };

 const featuredRestaurants = allRestaurants.filter((r) => r.is_featured);

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
   <HeroSearch onSearch={handleSearch} restaurants={allRestaurants} />

   {/* Divider */}
   <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="h-px bg-gray-100" />
   </div>

   {/* Featured Restaurants */}
   {featuredRestaurants.length > 0 && (
    <section className="py-16 sm:py-20">
     <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <motion.div
       initial={{ opacity: 0, y: 16 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ duration: 0.5 }}
       className="flex items-end justify-between mb-8">
       <div>
        <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-1 block">
         Handpicked for you
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight">
         Featured Restaurants
        </h2>
       </div>
       <motion.button
        whileHover={{ x: 3 }}
        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#002b11]/60 hover:text-[#002b11] transition-colors">
        View all
        <ArrowRight size={15} />
       </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
       {featuredRestaurants.slice(0, 4).map((restaurant, index) => (
        <RestaurantCard
         key={restaurant.id}
         restaurant={restaurant}
         index={index}
        />
       ))}
      </div>
     </div>
    </section>
   )}

   {/* Cuisine Categories */}
   <section id="cuisines" className="py-16 sm:py-20 bg-[#f7f7f7]">
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
        {debouncedQuery ? "Search Results" : "Tonight"}
       </span>
       <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight">
        {debouncedQuery
         ? `Results for "${debouncedQuery}"`
         : "Available for Dinner Tonight"}
       </h2>
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
   <section id="about" className="py-16 sm:py-20 bg-[#f7f7f7]">
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

   {/* Testimonials */}
   <section id="reviews" className="py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
     <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-14">
      <span className="text-xs font-bold tracking-widest text-[#00aa6c] uppercase mb-1 block">
       Testimonials
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002b11] tracking-tight">
       Loved by Diners
      </h2>
     </motion.div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((t, index) => (
       <motion.div
        key={t.author}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
        <div className="flex items-center gap-0.5 mb-5">
         {[...Array(t.rating)].map((_, i) => (
          <Star key={i} size={16} className="text-[#00aa6c] fill-[#00aa6c]" />
         ))}
        </div>
        <p className="text-[#002b11]/70 text-sm leading-relaxed mb-6">
         "{t.quote}"
        </p>
        <div className="border-t border-gray-50 pt-4">
         <p className="text-sm font-bold text-[#002b11]">{t.author}</p>
         <p className="text-xs text-gray-400 mt-0.5">{t.title}</p>
        </div>
       </motion.div>
      ))}
     </div>
    </div>
   </section>

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
        className="px-8 py-3.5 rounded-full bg-white  text-[#002b11] font-bold transition-all duration-200 shadow-lg text-sm">
        Reserve a Table
       </motion.button>
       <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/signup")}
        className="px-8 py-3.5 rounded-full bg-[#00bd49]  text-white font-bold transition-all duration-200 shadow-lg text-sm">
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
       <div className="w-8 h-8 rounded-full bg-[#002b11] flex items-center justify-center">
        <span className="text-white font-bold text-xs">LT</span>
       </div>
       <span className="text-lg font-bold tracking-tight text-[#002b11]">
        LuxeTable
       </span>
      </div>
      <div className="flex items-center gap-8">
       {["Privacy", "Terms", "Support", "Contact"].map((link) => (
        <button
         key={link}
         className="text-xs text-gray-400 hover:text-[#002b11] transition-colors font-medium">
         {link}
        </button>
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

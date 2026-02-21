import { useState, useRef, useEffect, useMemo } from "react";
import {
 Calendar,
 Clock,
 Users,
 Search,
 Utensils,
 Star,
 TrendingUp,
 MapPin,
 ArrowLeft,
 X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { fuzzyMatch } from "../utils/searchUtils";

const categories = [
 { key: "all", label: "Search All", icon: Search },
 { key: "trending", label: "Trending", icon: TrendingUp },
 { key: "top-rated", label: "Top Rated", icon: Star },
 { key: "restaurants", label: "Restaurants", icon: Utensils },
 { key: "nearby", label: "Near Me", icon: MapPin },
];

export default function HeroSearch({
 onSearch,
 restaurants = [],
 userCity = "",
 onTabChange,
 onRequestLocation,
}) {
 const navigate = useNavigate();
 const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
 const [time, setTime] = useState("19:00");
 const [people, setPeople] = useState(2);
 const [query, setQuery] = useState("");
 const [activeTab, setActiveTab] = useState("all");
 const [isFocused, setIsFocused] = useState(false);
 const [highlightedIndex, setHighlightedIndex] = useState(-1);
 const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
 const [mobileQuery, setMobileQuery] = useState("");
 const dropdownRef = useRef(null);
 const inputRef = useRef(null);
 const mobileInputRef = useRef(null);
 const wrapperRef = useRef(null);
 const dateRef = useRef(null);
 const timeRef = useRef(null);

 // Check if mobile viewport
 const isMobile = () => window.innerWidth < 640;

 // Lock body scroll when mobile overlay is open
 useEffect(() => {
  if (mobileSearchOpen) {
   document.body.style.overflow = "hidden";
  } else {
   document.body.style.overflow = "";
  }
  return () => {
   document.body.style.overflow = "";
  };
 }, [mobileSearchOpen]);

 // Focus mobile input when overlay opens
 useEffect(() => {
  if (mobileSearchOpen && mobileInputRef.current) {
   setTimeout(() => mobileInputRef.current?.focus(), 100);
  }
 }, [mobileSearchOpen]);

 // Close dropdown when clicking outside
 useEffect(() => {
  const handleClickOutside = (e) => {
   if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
    setIsFocused(false);
   }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 // Tab labels & placeholders
 const tabConfig = {
  all: {
   label: "Popular Restaurants",
   placeholder: "Places to go, restaurants, cuisines...",
  },
  trending: {
   label: "Trending Restaurants",
   placeholder: "Search trending restaurants...",
  },
  "top-rated": {
   label: "Top Rated Restaurants",
   placeholder: "Search top rated restaurants...",
  },
  restaurants: {
   label: "All Restaurants",
   placeholder: "Search all restaurants...",
  },
  nearby: {
   label: userCity ? `Restaurants in ${userCity}` : "Restaurants Near You",
   placeholder: userCity
    ? `Search restaurants in ${userCity}...`
    : "Search nearby restaurants...",
  },
 };

 // Compute dropdown results based on active tab + query
 const dropdownResults = useMemo(() => {
  if (!restaurants.length) return [];
  const q = query.trim().toLowerCase();

  // First apply tab-based sorting/filtering
  let pool = [...restaurants];

  switch (activeTab) {
   case "trending":
    // Sort by review count (popularity proxy) descending
    pool.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    break;
   case "top-rated":
    // Sort by rating descending, exclude unrated
    pool = pool
     .filter((r) => r.rating && r.rating !== "New")
     .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    break;
   case "restaurants":
    // All restaurants alphabetically
    pool.sort((a, b) => a.name.localeCompare(b.name));
    break;
   case "nearby":
    // Filter by user's detected city
    if (userCity) {
     pool = pool.filter(
      (r) => r.city?.toLowerCase() === userCity.toLowerCase(),
     );
    }
    break;
   case "all":
   default:
    // Featured first, then rest
    pool.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    break;
  }

  // Then apply search query filter if any
  if (q) {
   pool = pool.filter(
    (r) =>
     fuzzyMatch(r.name, q) ||
     fuzzyMatch(r.cuisine, q) ||
     fuzzyMatch(r.location, q),
   );
  }

  return pool.slice(0, 12);
 }, [query, restaurants, activeTab, userCity]);

 const showDropdown = isFocused && dropdownResults.length > 0;

 // Mobile search results (uses mobileQuery + activeTab filtering)
 const mobileResults = useMemo(() => {
  if (!restaurants.length) return [];
  const q = mobileQuery.trim().toLowerCase();
  let pool = [...restaurants];

  // Apply tab-based sorting/filtering (same logic as desktop)
  switch (activeTab) {
   case "trending":
    pool.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    break;
   case "top-rated":
    pool = pool
     .filter((r) => r.rating && r.rating !== "New")
     .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    break;
   case "restaurants":
    pool.sort((a, b) => a.name.localeCompare(b.name));
    break;
   case "nearby":
    if (userCity) {
     pool = pool.filter(
      (r) => r.city?.toLowerCase() === userCity.toLowerCase(),
     );
    }
    break;
   case "all":
   default:
    pool.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    break;
  }

  if (q) {
   pool = pool.filter(
    (r) =>
     fuzzyMatch(r.name, q) ||
     fuzzyMatch(r.cuisine, q) ||
     fuzzyMatch(r.location, q),
   );
  }
  return pool.slice(0, 20);
 }, [mobileQuery, restaurants, activeTab, userCity]);

 // Open mobile overlay
 const openMobileSearch = () => {
  if (isMobile()) {
   setMobileQuery(query);
   setMobileSearchOpen(true);
   return true;
  }
  return false;
 };

 // Close mobile overlay
 const closeMobileSearch = () => {
  setMobileSearchOpen(false);
  setMobileQuery("");
 };

 // Navigate from mobile overlay
 const mobileNavigate = (restaurant) => {
  closeMobileSearch();
  navigate(`/restaurant/${restaurant.id}`);
 };

 // Keyboard navigation
 const handleKeyDown = (e) => {
  if (!showDropdown) return;

  if (e.key === "ArrowDown") {
   e.preventDefault();
   setHighlightedIndex((prev) =>
    prev < dropdownResults.length - 1 ? prev + 1 : 0,
   );
  } else if (e.key === "ArrowUp") {
   e.preventDefault();
   setHighlightedIndex((prev) =>
    prev > 0 ? prev - 1 : dropdownResults.length - 1,
   );
  } else if (e.key === "Enter" && highlightedIndex >= 0) {
   e.preventDefault();
   navigateToRestaurant(dropdownResults[highlightedIndex]);
  } else if (e.key === "Escape") {
   setIsFocused(false);
   inputRef.current?.blur();
  }
 };

 // Scroll highlighted item into view
 useEffect(() => {
  if (highlightedIndex >= 0 && dropdownRef.current) {
   const items = dropdownRef.current.querySelectorAll("[data-dropdown-item]");
   items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
  }
 }, [highlightedIndex]);

 // Reset highlight when query changes
 useEffect(() => {
  setHighlightedIndex(-1);
 }, [query]);

 const navigateToRestaurant = (restaurant) => {
  setIsFocused(false);
  setQuery("");
  navigate(`/restaurant/${restaurant.id}`);
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  if (highlightedIndex >= 0 && showDropdown) {
   navigateToRestaurant(dropdownResults[highlightedIndex]);
   return;
  }
  setIsFocused(false);
  onSearch({ date, time, people, query });
 };

 return (
  <section className="relative bg-white pt-28 pb-14 sm:pb-6">
   {/* Content */}
   <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
    {/* Heading */}
    <motion.h1
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.5, delay: 0.15 }}
     className="text-5xl sm:text-6xl lg:text-[50px] font-extrabold tracking-tight text-[#002b11] leading-[1.05] mb-10">
     Where to?
    </motion.h1>

    {/* Category Tabs */}
    <motion.div
     initial={{ opacity: 0, y: 16 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.4, delay: 0.3 }}
     className="flex items-center justify-center gap-1 sm:gap-2 mb-8 flex-wrap">
     {categories.map((cat) => {
      const Icon = cat.icon;
      const isActive = activeTab === cat.key;
      return (
       <button
        key={cat.key}
        onClick={() => {
         setActiveTab(cat.key);
         onTabChange?.(cat.key);
         if (cat.key === "nearby" && !userCity) {
          onRequestLocation?.();
         }
         setIsFocused(true);
         inputRef.current?.focus();
        }}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
         isActive
          ? "text-[#002b11] border-b-[3px] border-[#002b11] rounded-none px-4 pb-2"
          : "text-[#002b11]/50 hover:text-[#002b11]/80 hover:bg-[#002b11]/[0.03]"
        }`}>
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        <span className="hidden sm:inline">{cat.label}</span>
       </button>
      );
     })}
    </motion.div>

    {/* Search Bar + Dropdown */}
    <motion.div
     ref={wrapperRef}
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.5, delay: 0.45 }}
     className="relative max-w-3xl mx-auto">
     <form onSubmit={handleSubmit}>
      <div
       className={`flex items-center bg-white border-2 ${
        showDropdown
         ? "border-[#002b11] rounded-t-[28px] rounded-b-none shadow-[0_6px_24px_rgba(0,0,0,0.1)]"
         : "border-gray-200 hover:border-gray-300 focus-within:border-[#002b11] rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)]"
       } transition-all duration-200 pl-4 pr-1.5 py-1`}>
       <Search size={22} className="text-gray-400 shrink-0 mr-3" />
       <input
        ref={inputRef}
        type="text"
        placeholder={
         tabConfig[activeTab]?.placeholder ||
         "Places to go, restaurants, cuisines..."
        }
        value={query}
        onFocus={(e) => {
         if (openMobileSearch()) {
          e.target.blur();
          return;
         }
         setIsFocused(true);
        }}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
         const newQuery = e.target.value;
         setQuery(newQuery);
         setIsFocused(true);
         onSearch({ date, time, people, query: newQuery });
        }}
        className="flex-1 bg-transparent border-none outline-none text-[16px] text-[#1a1a1a] placeholder:text-gray-400 py-3.5 px-0 focus:ring-0 focus:shadow-none"
       />
       <motion.button
        type="submit"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{ border: "1.5px solid #00ab42" }}
        className="ml-4 px-6 py-2.5 cursor-pointer rounded-full tracking-tight bg-[#00eb5b] hover:bg-[#00d753] text-[#002b11] text-[17px] font-[500] transition-all duration-200 shadow-sm whitespace-nowrap">
        Search
       </motion.button>
      </div>
     </form>

     {/* Dropdown */}
     <AnimatePresence>
      {showDropdown && (
       <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
        className="absolute left-0 right-0 top-full z-50 bg-white border-2 border-t-0 border-[#002b11] rounded-b-[20px] shadow-[0_16px_48px_rgba(0,0,0,0.12)] overflow-hidden">
        {/* Section Label */}
        <div className="px-6 pt-4 pb-2">
         <p className="text-xs font-bold text-[#002b11]/80 tracking-wide uppercase">
          {query.trim()
           ? "Matching Restaurants"
           : tabConfig[activeTab]?.label || "Popular Restaurants"}
         </p>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-gray-100" />

        {/* Results List — fixed height, hidden scrollbar */}
        <div className="py-2 h-[340px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
         {dropdownResults.map((restaurant, index) => (
          <button
           key={restaurant.id}
           data-dropdown-item
           onClick={() => navigateToRestaurant(restaurant)}
           onMouseEnter={() => setHighlightedIndex(index)}
           className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-colors duration-100 ${
            highlightedIndex === index ? "bg-[#f7f7f7]" : "hover:bg-[#f7f7f7]"
           }`}>
           {/* Restaurant Image */}
           <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
            <img
             src={
              restaurant.images?.[0] ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=60"
             }
             alt={restaurant.name}
             className="w-full h-full object-cover"
             loading="lazy"
            />
           </div>

           {/* Restaurant Info */}
           <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#002b11] truncate">
             {restaurant.name}
            </p>
            <p className="text-[13px] text-gray-500 truncate mt-0.5">
             {restaurant.cuisine}
             {restaurant.location && ` · ${restaurant.location}`}
            </p>
           </div>

           {/* Rating Badge */}
           {restaurant.rating && restaurant.rating !== "New" && (
            <div className="flex items-center gap-1 shrink-0 bg-[#00aa6c]/10 px-2.5 py-1 rounded-full">
             <Star size={12} className="text-[#00aa6c] fill-[#00aa6c]" />
             <span className="text-xs font-bold text-[#00aa6c]">
              {restaurant.rating}
             </span>
            </div>
           )}
          </button>
         ))}
        </div>

        {/* Footer hint */}
        {query.trim() && (
         <div className="border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-400">
           Press{" "}
           <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono text-[11px]">
            ↵
           </kbd>{" "}
           to search all results
          </p>
         </div>
        )}
       </motion.div>
      )}
     </AnimatePresence>
    </motion.div>

    {/* Booking Filters Row */}
    <motion.div
     initial={{ opacity: 0, y: 14 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.4, delay: 0.6 }}
     className="flex flex-wrap items-center justify-center gap-3 mt-6">
     {/* Date Picker */}
     <button
      type="button"
      onClick={() => dateRef.current?.showPicker?.()}
      className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:border-[#002b11]/30 transition-colors cursor-pointer">
      <Calendar size={16} className="text-[#002b11]/50 shrink-0" />
      <span className="text-sm font-medium text-[#002b11]">
       {new Date(date + "T00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
       })}
      </span>
      <input
       ref={dateRef}
       type="date"
       value={date}
       onChange={(e) => setDate(e.target.value)}
       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
       tabIndex={-1}
      />
     </button>

     {/* Time Picker */}
     <button
      type="button"
      onClick={() => timeRef.current?.showPicker?.()}
      className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:border-[#002b11]/30 transition-colors cursor-pointer">
      <Clock size={16} className="text-[#002b11]/50 shrink-0" />
      <span className="text-sm font-medium text-[#002b11]">
       {new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
       })}
      </span>
      <input
       ref={timeRef}
       type="time"
       value={time}
       onChange={(e) => setTime(e.target.value)}
       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-none"
       tabIndex={-1}
      />
     </button>

     {/* Guest Picker */}
     <label className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:border-[#002b11]/30 transition-colors cursor-pointer">
      <Users size={16} className="text-[#002b11]/50 shrink-0" />
      <span className="text-sm font-medium text-[#002b11]">
       {people} {Number(people) === 1 ? "guest" : "guests"}
      </span>
      <svg
       width="12"
       height="12"
       viewBox="0 0 12 12"
       className="text-[#002b11]/40 shrink-0 ml-0.5">
       <path
        d="M3 5l3 3 3-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
       />
      </svg>
      <select
       value={people}
       onChange={(e) => setPeople(e.target.value)}
       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
       {[...Array(20)].map((_, i) => (
        <option key={i + 1} value={i + 1}>
         {i + 1} {i === 0 ? "guest" : "guests"}
        </option>
       ))}
      </select>
     </label>
    </motion.div>
   </div>

   {/* Mobile Full-Screen Search Overlay */}
   <AnimatePresence>
    {mobileSearchOpen && (
     <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed inset-0 z-[9999] bg-white flex flex-col sm:hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3 border-b border-gray-100">
       <button
        onClick={closeMobileSearch}
        className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label="Close search">
        <ArrowLeft size={22} className="text-[#002b11]" />
       </button>
       <div className="flex-1 relative">
        <input
         ref={mobileInputRef}
         type="text"
         placeholder="Places to go, restaurants, cuisines..."
         value={mobileQuery}
         onChange={(e) => setMobileQuery(e.target.value)}
         className="w-full bg-transparent text-[16px] text-[#1a1a1a] placeholder:text-gray-400 py-2 pr-8 outline-none border-none focus:ring-0"
        />
        {mobileQuery && (
         <button
          onClick={() => {
           setMobileQuery("");
           mobileInputRef.current?.focus();
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100">
          <X size={16} className="text-gray-400" />
         </button>
        )}
       </div>
       <Search size={20} className="text-gray-400 shrink-0" />
      </div>

      {/* Green accent line */}
      <div className="h-[3px] bg-gradient-to-r from-[#00eb5b] via-[#00aa6c] to-[#002b11]" />

      {/* Results area */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
       {/* Section Header */}
       <div className="px-5 pt-5 pb-2">
        <p className="text-xs font-bold text-[#002b11]/70 tracking-[0.08em] uppercase">
         {mobileQuery.trim()
          ? "Matching Restaurants"
          : tabConfig[activeTab]?.label || "Popular Restaurants"}
        </p>
       </div>

       {mobileResults.length > 0 ? (
        <div className="pb-6">
         {mobileResults.map((restaurant) => (
          <button
           key={restaurant.id}
           onClick={() => mobileNavigate(restaurant)}
           className="w-full flex items-center gap-4 px-5 py-3.5 text-left active:bg-gray-50 transition-colors">
           {/* Restaurant Image */}
           <div className="w-[60px] h-[60px] rounded-2xl overflow-hidden shrink-0 bg-gray-100 shadow-sm">
            <img
             src={
              restaurant.images?.[0] ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=60"
             }
             alt={restaurant.name}
             className="w-full h-full object-cover"
             loading="lazy"
            />
           </div>

           {/* Info */}
           <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#002b11] truncate leading-snug">
             {restaurant.name}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
             <MapPin size={12} className="text-gray-400 shrink-0" />
             <p className="text-[13px] text-gray-500 truncate">
              {restaurant.location || restaurant.cuisine}
             </p>
            </div>
            {restaurant.cuisine && restaurant.location && (
             <p className="text-[12px] text-gray-400 truncate mt-0.5">
              {restaurant.cuisine}
             </p>
            )}
           </div>

           {/* Rating */}
           {restaurant.rating && restaurant.rating !== "New" && (
            <div className="flex items-center gap-1 shrink-0 bg-[#00aa6c]/10 px-2.5 py-1.5 rounded-full">
             <Star size={12} className="text-[#00aa6c] fill-[#00aa6c]" />
             <span className="text-xs font-bold text-[#00aa6c]">
              {restaurant.rating}
             </span>
            </div>
           )}
          </button>
         ))}
        </div>
       ) : mobileQuery.trim() ? (
        <div className="flex flex-col items-center justify-center py-16 px-6">
         <Search size={40} className="text-gray-200 mb-4" />
         <p className="text-sm text-gray-400 text-center">
          No restaurants found for "{mobileQuery}"
         </p>
        </div>
       ) : null}
      </div>
     </motion.div>
    )}
   </AnimatePresence>
  </section>
 );
}

import HeroSearch from "../components/HeroSearch";
import RestaurantCard from "../components/RestaurantCard";
import { fuzzyMatch } from "../utils/searchUtils";
import useDebounce from "../hooks/useDebounce";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
    // 1. Fetch Key Data
    const { data: dbRestaurants, error: restError } = await supabase
     .from("restaurants")
     .select("*");

    const { data: reviews, error: revError } = await supabase
     .from("reviews")
     .select("restaurant_id, rating");

    if (restError) console.error("Error fetching restaurants:", restError);
    if (revError) console.error("Error fetching reviews:", revError);

    // 2. Process Reviews Stats
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

    // 3. Format DB Restaurants (exclude deactivated)
    const formattedDbRestaurants = (dbRestaurants || [])
     .filter((r) => r.is_active !== false)
     .map((r) => {
      const s = stats[r.id];

      // Safe image handling
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

    // 4. Sort featured restaurants to top
    const final = [...formattedDbRestaurants].sort(
     (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0),
    );

    setAllRestaurants(final);
    setFilteredRestaurants(final);
   } catch (err) {
    console.error("Critical error loading homepage:", err);
    // Fallback
    setAllRestaurants([]);
    setFilteredRestaurants([]);
   } finally {
    setLoading(false);
   }
  };

  loadData();
 }, []);

 // Effect to handle search filtering when debounced query changes
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

 if (loading) {
  return (
   <div className="container" style={{ padding: "4rem", textAlign: "center" }}>
    <p>Loading restaurants...</p>
   </div>
  );
 }

 return (
  <div>
   <HeroSearch onSearch={handleSearch} />

   <main className="container" style={{ paddingBottom: "4rem" }}>
    <div
     style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
     }}>
     <h3 style={{ fontSize: "1.5rem", margin: 0 }}>
      Available for dinner tonight
     </h3>
     <button className="btn-secondary" style={{ padding: "0.5rem 1rem" }}>
      View all
     </button>
    </div>

    {filteredRestaurants.length === 0 ? (
     <div
      style={{
       textAlign: "center",
       padding: "2rem",
       color: "var(--text-muted)",
      }}>
      No restaurants found.
     </div>
    ) : (
     <div
      style={{
       display: "grid",
       gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
       gap: "2rem",
      }}>
      {filteredRestaurants.map((restaurant) => (
       <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
     </div>
    )}
   </main>
  </div>
 );
}

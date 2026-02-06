import HeroSearch from '../components/HeroSearch';
import RestaurantCard from '../components/RestaurantCard';
import { restaurants } from '../data/restaurants';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function HomePage() {
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);

    useEffect(() => {
        const fetchReviewsAndCalculateStats = async () => {
            try {
                const { data: reviews, error } = await supabase.from('reviews').select('restaurant_id, rating');

                if (error) {
                    console.error("Error fetching reviews:", error);
                    // Fallback to static data if error
                    setAllRestaurants(restaurants);
                    setFilteredRestaurants(restaurants);
                    return;
                }

                // Calculate stats
                const restaurantStats = {};
                reviews.forEach(review => {
                    const id = review.restaurant_id;
                    if (!restaurantStats[id]) {
                        restaurantStats[id] = { sum: 0, count: 0 };
                    }
                    restaurantStats[id].sum += review.rating;
                    restaurantStats[id].count += 1;
                });

                // Merge with static data
                const updatedRestaurants = restaurants.map(r => {
                    const stats = restaurantStats[r.id];
                    return {
                        ...r,
                        rating: stats ? (stats.sum / stats.count).toFixed(1) : 'New', // Or 0
                        reviewCount: stats ? stats.count : 0
                    };
                });

                setAllRestaurants(updatedRestaurants);
                setFilteredRestaurants(updatedRestaurants);

            } catch (err) {
                console.error("Failed to load restaurant stats:", err);
                setAllRestaurants(restaurants);
                setFilteredRestaurants(restaurants);
            }
        };

        fetchReviewsAndCalculateStats();
    }, []);

    const handleSearch = ({ query }) => {
        const q = query.toLowerCase();
        const results = allRestaurants.filter(r =>
            r.name.toLowerCase().includes(q) ||
            r.cuisine.toLowerCase().includes(q) ||
            r.location.toLowerCase().includes(q)
        );
        setFilteredRestaurants(results);
    };

    return (
        <div>
            <HeroSearch onSearch={handleSearch} />

            <main className="container" style={{ paddingBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Available for dinner tonight</h3>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>View all</button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredRestaurants.map(restaurant => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
            </main>
        </div>
    );
}

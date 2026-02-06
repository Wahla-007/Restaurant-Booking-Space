import HeroSearch from '../components/HeroSearch';
import RestaurantCard from '../components/RestaurantCard';
import { restaurants } from '../data/restaurants';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);

    useEffect(() => {
        if (user && user.role === 'business') {
            navigate('/business-dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch DB Restaurants
                const { data: dbRestaurants, error: restError } = await supabase
                    .from('restaurants')
                    .select('*');

                if (restError) console.error("Error fetching restaurants:", restError);

                // 2. Fetch All Reviews
                const { data: reviews, error: revError } = await supabase
                    .from('reviews')
                    .select('restaurant_id, rating');

                if (revError) console.error("Error fetching reviews:", revError);

                // 3. Process Reviews Stats
                const restaurantStats = {};
                (reviews || []).forEach(review => {
                    const id = review.restaurant_id;
                    if (!restaurantStats[id]) {
                        restaurantStats[id] = { sum: 0, count: 0 };
                    }
                    restaurantStats[id].sum += review.rating;
                    restaurantStats[id].count += 1;
                });

                // 4. Combine Static + DB Restaurants
                // Normalize DB data to match component structure
                const normalizedDbRestaurants = (dbRestaurants || []).map(r => ({
                    id: r.id, // Keep UUID
                    name: r.name,
                    cuisine: r.cuisine,
                    rating: 'New', // Will be overwritten by stats
                    reviewCount: 0,
                    price: r.price,
                    location: r.location,
                    description: r.description,
                    images: r.images && r.images.length > 0 ? r.images : ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"], // Fallback
                    tags: r.tags || []
                }));

                const combinedList = [...restaurants, ...normalizedDbRestaurants];

                // 5. Apply Stats to All
                const finalRestaurants = combinedList.map(r => {
                    const stats = restaurantStats[r.id];
                    return {
                        ...r,
                        rating: stats ? (stats.sum / stats.count).toFixed(1) : (r.rating || 'New'),
                        reviewCount: stats ? stats.count : (r.reviewCount || 0)
                    };
                });

                setAllRestaurants(finalRestaurants);
                setFilteredRestaurants(finalRestaurants);

            } catch (err) {
                console.error("Failed to load data:", err);
                setAllRestaurants(restaurants);
                setFilteredRestaurants(restaurants);
            }
        };

        fetchData();
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

import HeroSearch from '../components/HeroSearch';
import RestaurantCard from '../components/RestaurantCard';
import { restaurants as staticRestaurants } from '../data/restaurants';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'business') {
            navigate('/business-dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Fetch Key Data
                const { data: dbRestaurants, error: restError } = await supabase
                    .from('restaurants')
                    .select('*');

                const { data: reviews, error: revError } = await supabase
                    .from('reviews')
                    .select('restaurant_id, rating');

                if (restError) console.error("Error fetching restaurants:", restError);
                if (revError) console.error("Error fetching reviews:", revError);

                // 2. Process Reviews Stats
                const stats = {};
                if (reviews) {
                    reviews.forEach(r => {
                        if (!stats[r.restaurant_id]) {
                            stats[r.restaurant_id] = { sum: 0, count: 0 };
                        }
                        stats[r.restaurant_id].sum += r.rating;
                        stats[r.restaurant_id].count += 1;
                    });
                }

                // 3. Format DB Restaurants
                const formattedDbRestaurants = (dbRestaurants || []).map(r => {
                    const s = stats[r.id];

                    // Safe image handling
                    let images = [];
                    if (r.images && Array.isArray(r.images) && r.images.length > 0) {
                        images = r.images;
                    } else {
                        images = ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"];
                    }

                    return {
                        id: r.id,
                        name: r.name || 'Untitled Restaurant',
                        cuisine: r.cuisine || 'Restaurant',
                        price: r.price || '$$',
                        location: r.location || '',
                        description: r.description || '',
                        images: images,
                        tags: r.tags || [],
                        rating: s ? (s.sum / s.count).toFixed(1) : 'New',
                        reviewCount: s ? s.count : 0
                    };
                });

                // 4. Combine (Static + DB) - Ensure staticRestaurants is an array
                const safeStatic = Array.isArray(staticRestaurants) ? staticRestaurants : [];
                const final = [...safeStatic, ...formattedDbRestaurants];

                setAllRestaurants(final);
                setFilteredRestaurants(final);

            } catch (err) {
                console.error("Critical error loading homepage:", err);
                // Fallback
                setAllRestaurants(staticRestaurants || []);
                setFilteredRestaurants(staticRestaurants || []);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSearch = ({ query }) => {
        const q = (query || '').toLowerCase();
        const results = allRestaurants.filter(r =>
            (r.name && r.name.toLowerCase().includes(q)) ||
            (r.cuisine && r.cuisine.toLowerCase().includes(q)) ||
            (r.location && r.location.toLowerCase().includes(q))
        );
        setFilteredRestaurants(results);
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <p>Loading restaurants...</p>
            </div>
        );
    }

    return (
        <div>
            <HeroSearch onSearch={handleSearch} />

            <main className="container" style={{ paddingBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Available for dinner tonight</h3>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>View all</button>
                </div>

                {filteredRestaurants.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No restaurants found.
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '2rem'
                    }}>
                        {filteredRestaurants.map(restaurant => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

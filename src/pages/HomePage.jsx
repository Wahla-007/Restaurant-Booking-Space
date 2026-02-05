import HeroSearch from '../components/HeroSearch';
import RestaurantCard from '../components/RestaurantCard';
import { restaurants } from '../data/restaurants';
import { useState } from 'react';

export default function HomePage() {
    const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);

    const handleSearch = ({ query }) => {
        const q = query.toLowerCase();
        const results = restaurants.filter(r =>
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

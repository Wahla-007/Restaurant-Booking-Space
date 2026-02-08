import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { restaurants as staticRestaurants } from '../data/restaurants';
import BookingWidget from '../components/BookingWidget';
import ReviewModal from '../components/ReviewModal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { MapPin, ChefHat, Star, PenLine } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


export default function RestaurantDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dbReviews, setDbReviews] = useState([]);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    // Fetch Reviews Function (for initial load and refresh)
    const fetchReviews = async (restaurantId) => {
        if (!restaurantId || typeof restaurantId === 'number') return; // Skip for static/numeric IDs
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('restaurant_id', restaurantId)
                .order('created_at', { ascending: false });

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
                // Check if ID is likely a UUID (length check is usually sufficient here)
                // UUIDs are 36 chars. Static IDs are 1, 2, 3...
                const isUUID = id && id.length > 20;

                if (!isUUID) {
                    // It's likely a static ID
                    const found = staticRestaurants.find(r => r.id == id);
                    if (found) {
                        // Normalize static data to match DB Schema
                        const normalized = {
                            ...found,
                            latitude: found.coordinates?.lat || null,
                            longitude: found.coordinates?.lng || null,
                            images: found.images || [],
                            menu: found.menu || { highlights: [] }
                        };
                        setRestaurant(normalized);

                        // Adapt static reviews if they exist
                        if (found.reviews && Array.isArray(found.reviews)) {
                            const adaptedReviews = found.reviews.map(r => ({
                                user_name: r.user,
                                rating: r.rating,
                                comment: r.text,
                                created_at: new Date().toISOString()
                            }));
                            setDbReviews(adaptedReviews);
                        } else {
                            setDbReviews([]);
                        }
                    } else {
                        console.error("Restaurant not found in static data");
                        setRestaurant(null);
                    }
                } else {
                    // It's a UUID, fetch from DB
                    const { data, error } = await supabase
                        .from('restaurants')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) throw error;
                    setRestaurant(data);

                    // Fetch reviews once restaurant is loaded
                    if (data) {
                        await fetchReviews(data.id);
                    }
                }
            } catch (err) {
                console.error("Error fetching restaurant:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchRestaurant();
    }, [id]);

    const averageRating = dbReviews.length > 0
        ? (dbReviews.reduce((acc, r) => acc + r.rating, 0) / dbReviews.length).toFixed(1)
        : 0; // Default to 0 or 'New' logic

    const reviewCount = dbReviews.length;

    const handleWriteReviewClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsReviewFormOpen(true);
    };

    if (loading) return <div className="container" style={{ paddingTop: '6rem' }}>Loading restaurant details...</div>;
    if (!restaurant) return <div className="container" style={{ paddingTop: '6rem' }}>Restaurant not found.</div>;

    return (
        <div>
            {/* Banner */}
            <div style={{ height: '400px', position: 'relative' }}>
                <img
                    src={(restaurant.images && restaurant.images[0]) || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
                    alt={restaurant.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '150px', background: 'linear-gradient(to top, var(--bg-app), transparent)'
                }} />
            </div>

            <main className="container" style={{ transform: 'translateY(-60px)', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem' }}>

                    {/* Main Info */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                        <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                            <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>{restaurant.name}</h1>

                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Star size={20} color="#fbbf24" fill="#fbbf24" />
                                    <span style={{ color: 'white', fontWeight: 600 }}>{averageRating > 0 ? averageRating : 'New'}</span> ({reviewCount} reviews)
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ChefHat size={20} />
                                    {restaurant.cuisine}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={20} />
                                    {restaurant.location}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.5rem' }}>About</h3>
                            <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                                {restaurant.description}
                            </p>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.5rem' }}>Menu Highlights</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {restaurant.menu?.highlights?.map((item, i) => (
                                    <div key={i} style={{ border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                                            <span style={{ color: 'var(--secondary)' }}>${item.price}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.description}</p>
                                    </div>
                                )) || <p className="text-muted">No menu highlights available.</p>}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>What people are saying</h3>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleWriteReviewClick}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
                                >
                                    <PenLine size={18} />
                                    Write a Review
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* DB Reviews */}
                                {dbReviews.map((review, i) => (
                                    <div key={`db-${i}`} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                            }}>
                                                {review.user_name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{review.user_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recently'}
                                                </div>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                                                {[...Array(5)].map((_, idx) => (
                                                    <Star key={idx} size={16} fill={idx < review.rating ? "#fbbf24" : "none"} color={idx < review.rating ? "#fbbf24" : "#666"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, lineHeight: 1.6 }}>{review.comment}</p>
                                    </div>
                                ))}

                                {dbReviews.length === 0 && <p className="text-muted">No reviews yet. Be the first to review!</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <BookingWidget restaurant={restaurant} />
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Location</h4>
                            <div style={{ height: '200px', background: '#334155', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                {restaurant.latitude && restaurant.longitude ? (
                                    <MapContainer
                                        center={[restaurant.latitude, restaurant.longitude]}
                                        zoom={15}
                                        scrollWheelZoom={false}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={[restaurant.latitude, restaurant.longitude]} />
                                    </MapContainer>
                                ) : (
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <MapPin size={32} className="text-muted" style={{ marginBottom: '0.5rem' }} />
                                        <span className="text-muted">Map view unavailable</span>
                                    </div>
                                )}
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {restaurant.location}
                            </p>
                        </div>
                    </div>

                </div>
            </main>
            <ReviewModal
                isOpen={isReviewFormOpen}
                onClose={() => setIsReviewFormOpen(false)}
                restaurantId={restaurant.id}
                onReviewSubmitted={() => fetchReviews(restaurant.id)}
            />
        </div>
    );
}

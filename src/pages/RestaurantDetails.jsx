import { useParams } from 'react-router-dom';
import { restaurants } from '../data/restaurants';
import BookingWidget from '../components/BookingWidget';
import { MapPin, ChefHat, Star } from 'lucide-react';

export default function RestaurantDetails() {
    const { id } = useParams();
    const restaurant = restaurants.find(r => r.id === parseInt(id));

    if (!restaurant) return <div className="container" style={{ paddingTop: '4rem' }}>Restaurant not found</div>;

    return (
        <div>
            {/* Banner */}
            <div style={{ height: '400px', position: 'relative' }}>
                <img
                    src={restaurant.images[0]}
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
                                    <span style={{ color: 'white', fontWeight: 600 }}>{restaurant.rating}</span> ({restaurant.reviewCount} reviews)
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
                                {restaurant.menu.highlights.map((item, i) => (
                                    <div key={i} style={{ border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 600 }}>{item.name}</span>
                                            <span style={{ color: 'var(--secondary)' }}>${item.price}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem' }}>What people are saying</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {restaurant.reviews.map((review, i) => (
                                    <div key={i} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                            }}>
                                                {review.initial}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{review.user}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{review.date}</div>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                                                {[...Array(5)].map((_, idx) => (
                                                    <Star key={idx} size={16} fill={idx < review.rating ? "#fbbf24" : "none"} color={idx < review.rating ? "#fbbf24" : "#666"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p style={{ margin: 0, lineHeight: 1.6 }}>{review.text}</p>
                                    </div>
                                ))}
                                {restaurant.reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <BookingWidget restaurant={restaurant} />
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Location</h4>
                            <div style={{ height: '200px', background: '#334155', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Map View
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                123 Culinary Ave, {restaurant.location}
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

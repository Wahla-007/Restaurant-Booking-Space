import { useNavigate } from 'react-router-dom';

export default function RestaurantCard({ restaurant }) {
    const navigate = useNavigate();

    return (
        <div
            className="card glass"
            style={{
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'var(--transition)'
            }}
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                <img
                    src={restaurant.images[0]}
                    alt={restaurant.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '6px',
                    display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)',
                    fontSize: '0.9rem'
                }}>
                    <span style={{ color: '#fbbf24' }}>★</span>
                    <span style={{ fontWeight: 600 }}>{restaurant.rating}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({restaurant.reviewCount})</span>
                </div>
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 600 }}>{restaurant.name}</h3>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span>{restaurant.cuisine}</span>
                    <span>•</span>
                    <span>{restaurant.price}</span>
                    <span>•</span>
                    <span>{restaurant.location}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    {["17:00", "17:30", "18:00"].map(time => (
                        <button key={time} className="btn-secondary" style={{
                            padding: '0.4rem 0.8rem', fontSize: '0.85rem', flex: 1, borderRadius: '6px'
                        }}>
                            {time}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

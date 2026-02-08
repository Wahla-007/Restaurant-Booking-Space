import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, Clock, Calendar, MapPin, Tag, Type, DollarSign, List, Trash2, Plus, Eye, Save, ChefHat, Star, PenLine, Upload, LayoutGrid, LayoutTemplate, Bell, ArrowLeft, Users } from 'lucide-react';
import RestaurantCard from '../components/RestaurantCard';
import BookingWidget from '../components/BookingWidget';
import LocationPicker from '../components/LocationPicker';

export default function BusinessDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState({});
    const [message, setMessage] = useState('');

    // View States
    const [viewMode, setViewMode] = useState('notifications'); // 'notifications' | 'editor'
    const [previewMode, setPreviewMode] = useState(false); // false, 'full', 'card'

    // Data States
    const [reviews, setReviews] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [showMapPicker, setShowMapPicker] = useState(false);


    // Form State
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        price: '$$',
        location: '',
        latitude: '',
        longitude: '',
        description: '',
        images: ['', '', '', ''],
        active_days: [],
        opening_time: '12:00',
        closing_time: '23:00',
        tags: '',
        menu_highlights: []
    });

    // Derived state for preview (Safe access to simple variables)
    const previewData = restaurant || {
        name: 'Restaurant Name (Not Saved)',
        cuisine: 'Cuisine',
        price: '$$',
        location: 'Location',
        description: 'No description saved.',
        images: [],
        active_days: [],
        opening_time: '12:00',
        closing_time: '23:00',
        tags: [],
        menu: { highlights: [] }
    };

    useEffect(() => {
        fetchRestaurant();
    }, [user]);

    const fetchRestaurant = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (data) {
                setRestaurant(data);

                // Fetch reviews
                const { data: reviewsData } = await supabase
                    .from('reviews')
                    .select('*')
                    .eq('restaurant_id', data.id)
                    .order('created_at', { ascending: false });

                setReviews(reviewsData || []);

                // Fetch Bookings
                fetchBookings(data.id);

                setFormData({
                    name: data.name || '',
                    cuisine: data.cuisine || '',
                    price: data.price || '$$',
                    location: data.location || '',
                    latitude: data.latitude || '',
                    longitude: data.longitude || '',
                    description: data.description || '',
                    images: (data.images && data.images.length > 0) ? [...data.images, '', '', '', ''].slice(0, 4) : ['', '', '', ''],
                    active_days: data.active_days || [],
                    opening_time: data.opening_time || '12:00',
                    closing_time: data.closing_time || '23:00',
                    tags: (data.tags || []).join(', '),
                    menu_highlights: data.menu?.highlights || []
                });
            }
        } catch (err) {
            console.log('No existing restaurant found or load error', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async (restaurantId) => {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    users ( name, email, avatar )
                `)
                .eq('restaurant_id', restaurantId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (err) {
            console.error("Error fetching bookings:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (index, event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File size too large (max 5MB)');
            return;
        }

        setUploading(prev => ({ ...prev, [index]: true }));

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('restaurant-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('restaurant-images')
                .getPublicUrl(filePath);

            const newImages = [...formData.images];
            newImages[index] = data.publicUrl;
            setFormData(prev => ({ ...prev, images: newImages }));

        } catch (error) {
            console.error('Error uploading image:', error);
            alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(prev => ({ ...prev, [index]: false }));
        }
    };

    const toggleDay = (day) => {
        setFormData(prev => {
            const days = prev.active_days.includes(day)
                ? prev.active_days.filter(d => d !== day)
                : [...prev.active_days, day];
            return { ...prev, active_days: days };
        });
    };

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const addMenuItem = () => {
        setFormData(prev => ({
            ...prev,
            menu_highlights: [...prev.menu_highlights, { name: '', price: '', description: '' }]
        }));
    };

    const updateMenuItem = (index, field, value) => {
        const newMenu = [...formData.menu_highlights];
        newMenu[index][field] = value;
        setFormData(prev => ({ ...prev, menu_highlights: newMenu }));
    };

    const removeMenuItem = (index) => {
        setFormData(prev => ({
            ...prev,
            menu_highlights: prev.menu_highlights.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        try {
            const payload = {
                owner_id: user.id,
                name: formData.name,
                cuisine: formData.cuisine,
                price: formData.price,
                location: formData.location,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                description: formData.description,
                images: formData.images.filter(img => img.trim() !== ''),
                active_days: formData.active_days,
                opening_time: formData.opening_time,
                closing_time: formData.closing_time,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                menu: { highlights: formData.menu_highlights }
            };

            let error;
            if (restaurant) {
                const { error: updateError } = await supabase.from('restaurants').update(payload).eq('id', restaurant.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('restaurants').insert([payload]);
                error = insertError;
            }

            if (error) throw error;
            setMessage('Saved successfully!');
            fetchRestaurant();
        } catch (err) {
            console.error(err);
            setMessage('Failed to save. ' + (err.message || ''));
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="container" style={{ paddingTop: '5rem' }}>Loading...</div>;

    // --- DASHBOARD / NOTIFICATIONS MODE ---
    if (viewMode === 'notifications') {
        return (
            <div className="container" style={{ paddingTop: '2rem' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2rem' }}>Dashboard</h1>
                        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
                            Welcome back, {restaurant ? restaurant.name : 'Partner'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setViewMode('editor')}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <PenLine size={18} /> Edit Restaurant
                        </button>
                        <button onClick={handleLogout} className="btn-secondary">Logout</button>
                    </div>
                </div>

                {/* Notifications / Bookings List */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>

                    {/* Main Feed */}
                    <div>
                        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Bell size={20} /> Booking Notifications
                        </h3>

                        {bookings.length === 0 ? (
                            <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius)' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                    <Bell size={24} className="text-muted" />
                                </div>
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>No bookings yet</h3>
                                <p style={{ color: 'var(--text-muted)' }}>When customers make a reservation, they will appear here.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {bookings.map((booking) => {
                                    const isCancelled = booking.status === 'cancelled';
                                    return (
                                        <div key={booking.id} className="glass" style={{
                                            padding: '1.5rem',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            gap: '1.5rem',
                                            alignItems: 'center',
                                            opacity: isCancelled ? 0.6 : 1,
                                            border: isCancelled ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)'
                                        }}>
                                            {/* Date Box */}
                                            <div style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                background: 'rgba(255,255,255,0.05)', borderRadius: '8px', width: '80px', height: '80px', flexShrink: 0
                                            }}>
                                                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                                    {new Date(booking.date).toLocaleDateString(undefined, { month: 'short' })}
                                                </span>
                                                <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                                                    {new Date(booking.date).getDate()}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <h4 style={{ margin: 0, fontSize: '1.1rem', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                                                        {booking.users?.name || booking.user_name || 'Guest User'}
                                                    </h4>
                                                    {booking.booking_code && (
                                                        <span style={{ fontFamily: 'monospace', background: isCancelled ? '#333' : 'var(--primary)', color: isCancelled ? '#888' : 'black', padding: '2px 6px', borderRadius: '4px', code: '0.8rem', fontWeight: 'bold' }}>
                                                            {booking.booking_code}
                                                        </span>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Clock size={14} /> {booking.time}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <Users size={14} /> {booking.party_size} People
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions / Status */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {!isCancelled ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Are you sure you want to cancel this booking?')) return;
                                                                const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
                                                                if (error) alert(error.message);
                                                                else fetchBookings(restaurant.id);
                                                            }}
                                                            className="btn-secondary"
                                                            style={{ padding: '0.5rem', color: '#ef4444', border: '1px solid #ef4444' }}
                                                            title="Cancel Booking"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.8rem' }}>CANCELLED</span>
                                                )}

                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '60px' }}>
                                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isCancelled ? '#ef4444' : '#10b981', boxShadow: isCancelled ? 'none' : '0 0 10px #10b981' }} />
                                                    <span style={{ fontSize: '0.7rem', color: isCancelled ? '#ef4444' : '#10b981' }}>{isCancelled ? 'Cancelled' : 'Confirmed'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats / Sidebar */}
                    <div>
                        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                            <h4 style={{ margin: '0 0 1rem 0' }}>Quick Stats</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Total Bookings</span>
                                    <span style={{ fontWeight: 'bold' }}>{bookings.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Average Rating</span>
                                    <span style={{ fontWeight: 'bold' }}>
                                        {reviews.length > 0
                                            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Total Reviews</span>
                                    <span style={{ fontWeight: 'bold' }}>{reviews.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }

    // --- PREVIEW MODE RENDER ---
    if (previewMode) {
        return (
            <div>
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* View Switcher */}
                        <div className="glass" style={{ display: 'flex', padding: '0.25rem', borderRadius: '8px', background: 'rgba(0,0,0,0.8)' }}>
                            <button
                                onClick={() => setPreviewMode('full')}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '6px',
                                    background: previewMode === 'full' ? 'var(--primary)' : 'transparent',
                                    color: previewMode === 'full' ? 'black' : 'white',
                                    border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center'
                                }}
                            >
                                <LayoutTemplate size={16} /> Full Page
                            </button>
                            <button
                                onClick={() => setPreviewMode('card')}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '6px',
                                    background: previewMode === 'card' ? 'var(--primary)' : 'transparent',
                                    color: previewMode === 'card' ? 'black' : 'white',
                                    border: 'none', cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center'
                                }}
                            >
                                <LayoutGrid size={16} /> Card
                            </button>
                        </div>

                        <button
                            onClick={() => setPreviewMode(false)}
                            className="btn btn-primary"
                            style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <PenLine size={20} /> Back to Editor
                        </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--text-muted)', display: 'inline-block', paddingBottom: '2px', cursor: 'help' }}>
                            Previewing Public Version (Unsaved changes hidden)
                        </span>
                    </div>
                </div>

                {previewMode === 'card' ? (
                    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)' }}>
                        <div style={{ width: '350px', pointerEvents: 'none' }}> {/* pointerEvents none prevents navigation */}
                            <RestaurantCard restaurant={{
                                id: previewData.id || 'preview',
                                name: previewData.name,
                                cuisine: previewData.cuisine,
                                price: previewData.price,
                                location: previewData.location,
                                images: previewData.images || [],
                                rating: 'New',
                                reviewCount: 0
                            }} />
                            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                                This is how your restaurant appears in search results.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Banner */}
                        <div style={{ height: '400px', position: 'relative' }}>
                            <img
                                src={(previewData.images && previewData.images[0]) || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
                                alt="Resturant Cover"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(to top, var(--bg-app), transparent)' }} />
                        </div>

                        <main className="container" style={{ transform: 'translateY(-60px)', position: 'relative', zIndex: 10 }}>
                            {/* ... Content ... */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem' }}>
                                <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
                                    <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                                        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>{previewData.name}</h1>
                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Star size={20} color="#fbbf24" fill="#fbbf24" />
                                                <span style={{ color: 'white', fontWeight: 600 }}>
                                                    {reviews.length > 0
                                                        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                                                        : '4.7'}
                                                </span>
                                                ({reviews.length > 0 ? reviews.length : 3} reviews)
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <ChefHat size={20} /> {previewData.cuisine}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <MapPin size={20} /> {previewData.location}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '3rem' }}>
                                        <h3 style={{ fontSize: '1.5rem' }}>About</h3>
                                        <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                                            {previewData.description || 'No description saved.'}
                                        </p>
                                    </div>
                                    <div style={{ marginBottom: '3rem' }}>
                                        <h3 style={{ fontSize: '1.5rem' }}>Menu Highlights</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            {(previewData.menu?.highlights || []).map((item, i) => (
                                                <div key={i} style={{ border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                                                        <span style={{ color: 'var(--secondary)' }}>${item.price}</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.description}</p>
                                                </div>
                                            ))}
                                            {(previewData.menu?.highlights || []).length === 0 && <p className="text-muted">No menu items saved.</p>}
                                        </div>
                                    </div>

                                    {/* Reviews Section for Preview */}
                                    <div style={{ marginBottom: '3rem' }}>
                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Reviews</h3>
                                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                                            {(reviews.length > 0 ? reviews : [
                                                { id: 'p1', user_name: 'Sarah Jenkins', rating: 5, comment: 'Absolutely loved this place! The atmosphere was perfect.', created_at: new Date().toISOString() },
                                                { id: 'p2', user_name: 'Mike Ross', rating: 4, comment: 'Great food, but service was a bit slow during rush hour.', created_at: new Date().toISOString() },
                                                { id: 'p3', user_name: 'Emily Chen', rating: 5, comment: 'The best dining experience I have had in a long time.', created_at: new Date().toISOString() }
                                            ]).slice(0, 3).map((review) => (
                                                <div key={review.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                            {(review.user_name || '?').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{review.user_name || 'Anonymous'}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                {new Date(review.created_at || Date.now()).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={16} fill={i < review.rating ? '#fbbf24' : 'none'} color={i < review.rating ? '#fbbf24' : '#666'} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p style={{ margin: 0, lineHeight: 1.6 }}>{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Sidebar for Preview */}
                                <div>
                                    <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                        {/* Booking Widget */}
                                        <div style={{ pointerEvents: restaurant ? 'auto' : 'none', opacity: restaurant ? 1 : 0.7 }}>
                                            <BookingWidget restaurant={{
                                                ...previewData,
                                                id: previewData.id || 0
                                            }} />
                                            {!restaurant && (
                                                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                                    (Widget is interactive after saving)
                                                </p>
                                            )}

                                            {/* Tags (Small Underlined) */}
                                            {previewData.tags && previewData.tags.length > 0 && (
                                                <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                                                        {previewData.tags.map((tag, i) => (
                                                            <span key={i} style={{ textDecoration: 'underline', cursor: 'pointer' }}>#{tag}</span>
                                                        ))}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Location */}
                                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                            <h4 style={{ margin: '0 0 1rem 0' }}>Location</h4>
                                            <div style={{ height: '200px', background: '#334155', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                                {previewData.latitude && previewData.longitude ? (
                                                    <MapContainer
                                                        center={[previewData.latitude, previewData.longitude]}
                                                        zoom={15}
                                                        scrollWheelZoom={false}
                                                        style={{ height: '100%', width: '100%' }}
                                                        key={`${previewData.latitude}-${previewData.longitude}`} // Force re-render on change
                                                    >
                                                        <TileLayer
                                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                        />
                                                        <Marker position={[previewData.latitude, previewData.longitude]} />
                                                    </MapContainer>
                                                ) : (
                                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', padding: '1rem', textAlign: 'center' }}>
                                                        <MapPin size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                                        <span style={{ fontSize: '0.8rem' }}>Set coordinates in Editor to see Map</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                {previewData.location || 'Location Address'}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </main>
                    </>
                )}
            </div>
        );
    }

    // --- EDITOR MODE RENDER (WYSIWYG-ish) ---
    return (
        <div>
            {/* Controls */}
            <div style={{
                position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100,
                display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'flex-end'
            }}>
                {message && (
                    <div style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'black', borderRadius: '8px', fontWeight: 'bold' }}>
                        {message}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setPreviewMode('full')}
                        className="btn glass"
                        style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--glass-border)' }}
                    >
                        <Eye size={20} /> Preview
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        disabled={saving}
                    >
                        <Save size={20} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Logout/Top Nav */}
            <div className="container" style={{ paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={() => setViewMode('notifications')}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.9rem' }}>Logout</button>
            </div>


            {/* EDITABLE Banner */}
            <div style={{ height: '400px', position: 'relative', marginTop: '1rem' }}>
                <img
                    src={formData.images[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
                    alt="Cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <label className="btn glass" style={{ cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Camera size={20} /> Change Cover Image
                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(0, e)} />
                    </label>
                    {uploading[0] && <span style={{ marginTop: '0.5rem', background: 'black', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Uploading...</span>}
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(to top, var(--bg-app), transparent)' }} />
            </div>

            <main className="container" style={{ transform: 'translateY(-60px)', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '3rem' }}>

                    {/* Main Info Editor */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>

                        {/* Title & Stats */}
                        <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                            <input
                                className="input-transparent"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Restaurant Name"
                                style={{ fontSize: '3rem', fontWeight: 'bold', width: '100%', marginBottom: '1rem' }}
                            />

                            {/* Cuisine & Price Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                                    <ChefHat size={18} className="text-muted" />
                                    <input
                                        name="cuisine"
                                        value={formData.cuisine}
                                        onChange={handleInputChange}
                                        placeholder="Cuisine Type (e.g. Italian, Sushi)"
                                        className="input-transparent"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                                    <DollarSign size={18} className="text-muted" />
                                    <select
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="input-transparent"
                                        style={{ width: '100%', cursor: 'pointer' }}
                                    >
                                        <option value="$">$ (Cheap)</option>
                                        <option value="$$">$$ (Moderate)</option>
                                        <option value="$$$">$$$ (Expensive)</option>
                                        <option value="$$$$">$$$$ (Luxury)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Location Row (Full Width) */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                    <MapPin size={18} className="text-muted" />
                                    <input
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="Enter full address..."
                                        className="input-transparent"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowMapPicker(true)}
                                    className="btn btn-primary"
                                    style={{ whiteSpace: 'nowrap', display: 'flex', gap: '0.5rem', items: 'center' }}
                                >
                                    <MapPin size={18} /> Select on Map
                                </button>
                            </div>

                            {/* Coordinates Input (Hidden by default or expert mode? User said "give cords") */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lat:</span>
                                    <input
                                        name="latitude"
                                        value={formData.latitude || ''}
                                        onChange={handleInputChange}
                                        placeholder="0.0000"
                                        className="input-transparent"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lng:</span>
                                    <input
                                        name="longitude"
                                        value={formData.longitude || ''}
                                        onChange={handleInputChange}
                                        placeholder="0.0000"
                                        className="input-transparent"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Map Picker Modal (Free OpenStreetMap) */}
                        {showMapPicker && (
                            <LocationPicker
                                initialLat={parseFloat(formData.latitude)}
                                initialLng={parseFloat(formData.longitude)}
                                onClose={() => setShowMapPicker(false)}
                                onConfirm={async (pos) => {
                                    // 1. Set coords immediately
                                    setFormData(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }));

                                    // 2. Try to fetch address (Reverse Geocoding)
                                    try {
                                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`);
                                        const data = await response.json();

                                        if (data && data.display_name) {
                                            // Extract a cleaner address if possible, or use display_name
                                            // box usually has: House Number, Road, Suburb, City, State, Postcode, Country
                                            // We usually want: Road, City (or similar)
                                            // But display_name is the full string. Let's use it for now or try to shorten.
                                            // display_name is often very long.
                                            // Let's try to grab header parts if available in 'address' object
                                            const addr = data.address || {};
                                            const street = addr.road || addr.pedestrian || addr.suburb || '';
                                            const city = addr.city || addr.town || addr.village || addr.county || '';
                                            const state = addr.state || '';

                                            // Construct a shorter, readable address
                                            let shortAddr = data.display_name;
                                            if (street && city) {
                                                shortAddr = `${street}, ${city}`;
                                            } else if (city) {
                                                shortAddr = city;
                                            }

                                            // Update location field with the fetched address
                                            setFormData(prev => ({ ...prev, location: shortAddr }));
                                            alert(`Location updated to: ${shortAddr}`);
                                        }
                                    } catch (err) {
                                        console.error("Failed to fetch address", err);
                                        // Silent fail or let user know manual entry is needed
                                    }

                                    setShowMapPicker(false);
                                }}
                            />
                        )}

                        {/* About Editor */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>About</h3>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your restaurant..."
                                className="input-transparent"
                                rows={5}
                                style={{ width: '100%', lineHeight: 1.6, resize: 'vertical', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}
                            />
                        </div>

                        {/* Gallery Grid */}
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Gallery</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                {formData.images.map((img, i) => (
                                    <div key={i} style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', position: 'relative', overflow: 'hidden', border: '1px dashed var(--glass-border)' }}>
                                        {img ? (
                                            <>
                                                <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    onClick={() => {
                                                        const newImages = [...formData.images];
                                                        newImages[i] = '';
                                                        setFormData(prev => ({ ...prev, images: newImages }));
                                                    }}
                                                    style={{ position: 'absolute', top: 5, right: 5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                                {uploading[i] ? <span style={{ fontSize: '0.8rem' }}>Uploading...</span> : <Upload size={20} className="text-muted" />}
                                                <input
                                                    type="file"
                                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                                    onChange={(e) => handleImageChange(i, e)}
                                                />
                                            </div>
                                        )}
                                        {i === 0 && <span style={{ position: 'absolute', bottom: 5, left: 5, background: 'var(--primary)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', color: 'black', fontWeight: 'bold' }}>MAIN</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Menu Editor */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Menu Highlights</h3>
                                <button onClick={addMenuItem} className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
                                    <Plus size={16} /> Add Item
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {formData.menu_highlights.map((item, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', alignItems: 'start' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <input
                                                className="input-transparent"
                                                placeholder="Dish Name"
                                                value={item.name}
                                                onChange={(e) => updateMenuItem(i, 'name', e.target.value)}
                                                style={{ fontWeight: 'bold' }}
                                            />
                                            <input
                                                className="input-transparent"
                                                placeholder="Description..."
                                                value={item.description}
                                                onChange={(e) => updateMenuItem(i, 'description', e.target.value)}
                                                style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ marginRight: '4px', color: 'var(--text-muted)' }}>$</span>
                                            <input
                                                className="input-transparent"
                                                type="number"
                                                placeholder="0.00"
                                                value={item.price}
                                                onChange={(e) => updateMenuItem(i, 'price', e.target.value)}
                                                style={{ color: 'var(--secondary)', fontWeight: 'bold' }}
                                            />
                                        </div>
                                        <button onClick={() => removeMenuItem(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Settings Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>



                        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={18} /> Operation Hours
                            </h4>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Opens</label>
                                    <input
                                        type="time"
                                        name="opening_time"
                                        value={formData.opening_time}
                                        onChange={handleInputChange}
                                        className="input"
                                        style={{ padding: '0.5rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Closes</label>
                                    <input
                                        type="time"
                                        name="closing_time"
                                        value={formData.closing_time}
                                        onChange={handleInputChange}
                                        className="input"
                                        style={{ padding: '0.5rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={18} /> Active Days
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {daysOfWeek.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => toggleDay(day)}
                                        style={{
                                            padding: '0.5rem 0.8rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            background: formData.active_days.includes(day) ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                            color: formData.active_days.includes(day) ? 'black' : 'var(--text-muted)',
                                            fontWeight: formData.active_days.includes(day) ? 'bold' : 'normal',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Tag size={18} /> Tags
                            </h4>
                            <input
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                placeholder="e.g. Romantic, Outdoor SE..."
                                className="input"
                                style={{ width: '100%' }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Comma separated values</p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function BookingWidget({ restaurant }) {
    const { user, requestLoginOTP, verifyLoginOTP } = useAuth();
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [partySize, setPartySize] = useState(2);
    const [time, setTime] = useState('');

    // Flow States: 'select' -> 'guest_email' -> 'guest_otp' -> 'success'
    const [view, setView] = useState('select');

    const [guestEmail, setGuestEmail] = useState('');
    const [guestOtp, setGuestOtp] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Mock available slots
    const slots = ["17:00", "17:15", "17:30", "19:00", "19:15", "20:30"];

    const executeBooking = async (userId) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .insert([
                    {
                        user_id: userId,
                        restaurant_id: restaurant.id,
                        restaurant_name: restaurant.name,
                        date: selectedDate,
                        time: time,
                        party_size: partySize
                    }
                ]);

            if (error) throw error;
            setView('success');
        } catch (error) {
            alert(`Booking failed: ${error.message}`);
            setView('select');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialClick = async () => {
        if (!time) {
            alert("Please select a time.");
            return;
        }

        if (user) {
            setLoading(true);
            await executeBooking(user.id);
        } else {
            // Not logged in -> Guest Flow
            setView('guest_email');
        }
    };

    const handleGuestEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const result = await requestLoginOTP(guestEmail);
        setLoading(false);

        if (result.success) {
            setView('guest_otp');
        } else {
            setMessage(result.message);
        }
    };

    const handleGuestOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const result = await verifyLoginOTP(guestEmail, guestOtp);

        if (result.success) {
            // User is now logged in context, but we need the ID from the result ideally, 
            // or we might need to wait for context to update. 
            // Better: fetch user id via the email we just verified to be safe/fast 
            // or rely on the auth context updating mechanism. 
            // Let's refetch user ID to be 100% sure for the booking.
            const { data: users, error: userError } = await supabase.from('users').select('id').eq('email', guestEmail).single();
            if (userError) throw userError;

            if (users) {
                await executeBooking(users.id);
            } else {
                setLoading(false);
                alert("Error finding your account after verification.");
            }
        } else {
            setLoading(false);
            setMessage(result.message);
        }
    };

    if (view === 'success') {
        return (
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', textAlign: 'center', boxShadow: 'var(--shadow-lg)', position: 'sticky', top: '100px' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <span style={{ fontSize: '1.5rem' }}>🎉</span>
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>Booking Confirmed!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    You are booked at <strong>{restaurant.name}</strong><br />
                    for {partySize} people on {selectedDate} at {time}.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => setView('select')}>Make Another Booking</button>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
                </div>
            </div>
        );
    }

    if (view === 'guest_email') {
        return (
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', position: 'sticky', top: '100px' }}>
                <h3 style={{ textAlign: 'center', margin: '0 0 1rem 0' }}>One Last Step</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Enter your email to confirm this booking. We'll send you a code.
                </p>
                <form onSubmit={handleGuestEmailSubmit}>
                    <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={guestEmail}
                        onChange={e => setGuestEmail(e.target.value)}
                        style={{ width: '100%', marginBottom: '1rem' }}
                        autoFocus
                    />
                    {message && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{message}</p>}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setView('select')} style={{ flex: 1 }}>Back</button>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 2 }}>
                            {loading ? 'Sending...' : 'Send Code'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    if (view === 'guest_otp') {
        return (
            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', position: 'sticky', top: '100px' }}>
                <h3 style={{ textAlign: 'center', margin: '0 0 1rem 0' }}>Verify Identity</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Enter the 4-digit code sent to <strong>{guestEmail}</strong>
                </p>
                <form onSubmit={handleGuestOtpSubmit}>
                    <input
                        type="text"
                        required
                        placeholder="0000"
                        maxLength="4"
                        value={guestOtp}
                        onChange={e => setGuestOtp(e.target.value)}
                        style={{ width: '100%', marginBottom: '1rem', letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.5rem' }}
                        autoFocus
                    />
                    {message && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{message}</p>}
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Confirming...' : 'Verify & Book'}
                    </button>
                    <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setView('guest_email')}>
                        Wrong email? Go back
                    </p>
                </form>
            </div>
        );
    }

    return (
        <div className="glass" style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            position: 'sticky',
            top: '100px',
            boxShadow: 'var(--shadow-lg)'
        }}>
            <h3 style={{ marginTop: 0, textAlign: 'center', marginBottom: '1.5rem' }}>Make a reservation</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Party Size</label>
                    <select
                        value={partySize}
                        onChange={(e) => setPartySize(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        {[...Array(20)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} people</option>
                        ))}
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Time</label>
                        <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        >
                            <option value="">Select time</option>
                            {slots.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 1rem 0', fontWeight: 600 }}>Available times:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {slots.map(s => (
                        <button
                            key={s}
                            className={`btn ${time === s ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                            onClick={() => setTime(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={!time || loading}
                onClick={handleInitialClick}
            >
                {loading ? 'Processing...' : (time ? 'Confirm Reservation' : 'Select a Time')}
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                <span role="img" aria-label="chart">📈</span> Booked 42 times today
            </p>
        </div>
    );
}

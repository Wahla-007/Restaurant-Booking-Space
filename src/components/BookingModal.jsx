import { useState } from 'react';

export default function BookingModal({ isOpen, onClose, restaurant, onConfirm }) {
    if (!isOpen) return null;

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [guests, setGuests] = useState(2);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({ restaurant, date, time, guests });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
            <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{
                padding: '2rem', width: '90%', maxWidth: '500px', borderRadius: '16px',
                position: 'relative'
            }}>
                <h2 style={{ marginTop: 0 }}>Book a Table</h2>
                <h3 className="title-gradient" style={{ marginBottom: '1.5rem' }}>{restaurant?.name}</h3>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Time</label>
                            <input
                                type="time"
                                required
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Guests</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                required
                                value={guests}
                                onChange={e => setGuests(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Booking</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { useState } from 'react';

export default function BookingWidget({ restaurant }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [partySize, setPartySize] = useState(2);
    const [time, setTime] = useState('');

    // Mock available slots
    const slots = ["17:00", "17:15", "17:30", "19:00", "19:15", "20:30"];

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

            <button className="btn btn-primary" style={{ width: '100%' }} disabled={!time}>
                Find a Table
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                <span role="img" aria-label="chart">📈</span> Booked 42 times today
            </p>
        </div>
    );
}

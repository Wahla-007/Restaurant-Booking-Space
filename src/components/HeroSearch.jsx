import { useState } from 'react';
import { Calendar, Clock, Users, Search } from 'lucide-react';

export default function HeroSearch({ onSearch }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('19:00');
    const [people, setPeople] = useState(2);
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ date, time, people, query });
    };

    return (
        <div style={{
            padding: '4rem 0 6rem 0',
            textAlign: 'center',
            background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, rgba(15, 23, 42, 0) 70%)'
        }}>
            <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.1 }}>
                Find your table for <span className="title-gradient">any occasion</span>
            </h2>

            <form onSubmit={handleSubmit} className="glass" style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: '100px',
                maxWidth: '900px',
                margin: '2rem auto 0 auto',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', borderRight: '1px solid var(--glass-border)' }}>
                    <Calendar size={20} className="text-muted" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ border: 'none', background: 'transparent', width: '130px', padding: '0.5rem 0', cursor: 'pointer' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', borderRight: '1px solid var(--glass-border)' }}>
                    <Clock size={20} className="text-muted" />
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        style={{ border: 'none', background: 'transparent', width: '100px', padding: '0.5rem 0', cursor: 'pointer' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', borderRight: '1px solid var(--glass-border)' }}>
                    <Users size={20} className="text-muted" />
                    <select
                        value={people}
                        onChange={(e) => setPeople(e.target.value)}
                        style={{ border: 'none', background: 'transparent', width: '100px', padding: '0.5rem 0', cursor: 'pointer' }}
                    >
                        {[...Array(20)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} people</option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem' }}>
                    <Search size={20} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Location, Restaurant, or Cuisine"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', padding: '0.5rem 0' }}
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '100px' }}>
                    Let's go
                </button>
            </form>
        </div>
    );
}

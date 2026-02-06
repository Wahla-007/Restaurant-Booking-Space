
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BusinessDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '2rem', paddingTop: '6rem' }} className="container">
            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="title-gradient" style={{ margin: 0 }}>Business Dashboard</h1>
                        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary">Logout</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* Stats Cards */}
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ marginTop: 0 }}>Total Bookings</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: 'var(--primary)' }}>0</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>This month</p>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ marginTop: 0 }}>Total Reviews</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#fbbf24' }}>0</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Average Rating: 0.0</p>
                </div>

                <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ marginTop: 0 }}>Revenue</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#10b981' }}>$0</p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Estimated</p>
                </div>
            </div>

            <div className="glass" style={{ marginTop: '2rem', padding: '2rem', borderRadius: '16px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <h3>Manage Your Restaurant</h3>
                <p style={{ color: 'var(--text-muted)' }}>You haven't listed a restaurant yet.</p>
                <button className="btn btn-primary">Create Listing</button>
            </div>
        </div>
    );
}

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';

export default function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--glass-border)' }}>
            <div className="container" style={{ height: '72px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1
                    className="title-gradient"
                    style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '-0.5px', cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    LuxeTable
                </h1>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', overflow: 'hidden' }}>
                                    <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%' }} />
                                </div>
                                <span style={{ fontWeight: 600 }}>{user.name}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', color: 'var(--text-muted)' }}
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                className="btn btn-secondary"
                                style={{ border: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}
                                onClick={() => navigate('/signup')}
                            >
                                Sign up
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                onClick={() => navigate('/login')}
                            >
                                Sign in
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

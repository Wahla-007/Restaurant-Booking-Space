import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Briefcase } from 'lucide-react';

export default function Signup() {
    const [accountType, setAccountType] = useState('customer'); // 'customer' | 'business'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            const result = await signup(name, email, password, accountType);
            if (result.success) {
                navigate(`/verify-email?email=${encodeURIComponent(email)}`);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{
            minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass" style={{
                padding: '3rem', width: '100%', maxWidth: '480px', borderRadius: 'var(--radius)'
            }}>
                <h2 className="title-gradient" style={{ textAlign: 'center', fontWeight: 800, fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Choose your account type</p>

                {/* Account Type Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '12px' }}>
                    <button
                        type="button"
                        onClick={() => setAccountType('customer')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '8px',
                            background: accountType === 'customer' ? 'var(--primary)' : 'transparent',
                            color: accountType === 'customer' ? 'black' : 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease',
                            fontWeight: accountType === 'customer' ? '600' : '400'
                        }}
                    >
                        <Users size={24} />
                        <span>Customer</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setAccountType('business')}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '8px',
                            background: accountType === 'business' ? 'var(--primary)' : 'transparent',
                            color: accountType === 'business' ? 'black' : 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease',
                            fontWeight: accountType === 'business' ? '600' : '400'
                        }}
                    >
                        <Briefcase size={24} />
                        <span>Business</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            {accountType === 'business' ? 'Restaurant/Business Name' : 'Full Name'}
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={accountType === 'business' ? 'Tasty Bites Inc.' : 'John Doe'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                            {accountType === 'business' ? 'Business Email' : 'Email'}
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={accountType === 'business' ? 'owner@restaurant.com' : 'you@example.com'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Creating Account...' : accountType === 'business' ? 'Register Business' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            const result = await signup(name, email, password);
            if (result.success) {
                // Navigate only after successful email send
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
                padding: '3rem', width: '100%', maxWidth: '400px', borderRadius: 'var(--radius)'
            }}>
                <h2 className="title-gradient" style={{ textAlign: 'center', fontWeight: 800, fontSize: '2rem', marginBottom: '2rem' }}>Create Account</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
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
                        {loading ? 'Sending Code...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Log in</Link>
                </p>
            </div>
        </div>
    );
}

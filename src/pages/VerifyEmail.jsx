import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyAccount } = useAuth();

    const email = searchParams.get('email');

    const [code, setCode] = useState(['', '', '', '']);
    const [status, setStatus] = useState('pending'); // pending, success, error
    const [message, setMessage] = useState('');
    const inputRefs = useRef([]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        const otp = code.join('');
        if (otp.length !== 4) return;

        setLoading(true);
        setStatus('pending'); // Keep/reset status

        try {
            const result = await verifyAccount(email, otp);
            if (result.success) {
                setStatus('success');
                // Auto-redirect after 2 seconds
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(result.message);
            }
        } catch (err) {
            setStatus('error');
            setMessage('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass" style={{ padding: '3rem', maxWidth: '450px', width: '100%', borderRadius: 'var(--radius)', textAlign: 'center' }}>

                {status === 'pending' || status === 'error' ? (
                    <div className="animate-fade-in">
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <Mail size={32} color="var(--primary)" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Verify your email</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                            We've sent a 4-digit code to <strong>{email}</strong>.
                        </p>

                        <form onSubmit={handleVerify}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        style={{
                                            width: '3.5rem', height: '3.5rem', fontSize: '1.5rem', textAlign: 'center',
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                            borderRadius: '12px', color: 'white'
                                        }}
                                    />
                                ))}
                            </div>

                            {status === 'error' && (
                                <p style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{message}</p>
                            )}

                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify Account'}
                            </button>
                        </form>

                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                            Didn't receive code? <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Resend</span>
                        </p>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto' }}>
                            <CheckCircle size={40} color="#22c55e" />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Success!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Your account has been verified. Redirecting...
                        </p>
                        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ width: '100%' }}>
                            Go to Home
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

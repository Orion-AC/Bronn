import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { registerWithEmail, loginWithGoogle, verifyTokenWithBackend } from '../lib/firebase';
import { AuthLayout } from '../components/auth/AuthLayout';

interface RegisterProps {
    onLogin: (token: string, user: any) => void;
}

export const Register: React.FC<RegisterProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const displayName = `${firstName} ${lastName}`.trim();
            const { idToken } = await registerWithEmail(email, password, displayName || undefined);
            const data = await verifyTokenWithBackend(idToken);
            localStorage.setItem('token', idToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin(idToken, data.user);
            navigate('/');
        } catch (err: any) {
            console.error('Registration error:', err);
            if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists');
            else if (err.code === 'auth/invalid-email') setError('Invalid email address');
            else if (err.code === 'auth/weak-password') setError('Password is too weak. Please use at least 6 characters.');
            else setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError('');
        setLoading(true);
        try {
            const { idToken } = await loginWithGoogle();
            const data = await verifyTokenWithBackend(idToken);
            localStorage.setItem('token', idToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin(idToken, data.user);
            navigate('/');
        } catch (err: any) {
            console.error('Google signup error:', err);
            if (err.code === 'auth/popup-closed-by-user') setError('Sign-up cancelled');
            else setError(err.message || 'Google sign-up failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start building modular apps with Bronn Studio."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400">First Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-10 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                                placeholder="Jane"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400">Last Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-10 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-10 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-10 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                            placeholder="Create password"
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-white/10 rounded-lg px-10 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
                            placeholder="Confirm password"
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black font-bold h-11 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050505] px-2 text-zinc-500">Or continue with</span></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    className="w-full bg-zinc-900 border border-white/10 h-11 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white disabled:opacity-50 font-medium text-sm"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>

                <p className="text-center text-sm text-zinc-500 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white hover:underline">Sign in</Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default Register;

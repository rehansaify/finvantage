import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client';
import { Landmark } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  // If already authenticated, redirect to /app
  if (!isPending && session) {
    return <Navigate to="/app" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message || 'Failed to login');
      return;
    }

    if (data) {
      // Redirect to app shell which will handle role-based routing
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-finvantage-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center flex flex-col items-center">
          <Link to="/" className="inline-flex bg-finvantage-navy p-3 rounded-xl mb-6 shadow-md">
            <Landmark className="w-8 h-8 text-finvantage-accent" />
          </Link>
          <h2 className="text-3xl font-extrabold text-finvantage-navy tracking-tight">
            Sign in to FinVantage
          </h2>
          <p className="mt-2 text-sm text-finvantage-slate">
            Or{' '}
            <Link to="/register" className="font-semibold text-finvantage-accent hover:text-emerald-700 transition-colors">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-100 text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-finvantage-navy mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-finvantage-accent focus:border-transparent outline-none transition-shadow"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-finvantage-navy mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-finvantage-accent focus:border-transparent outline-none transition-shadow"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-finvantage-navy hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-finvantage-accent transition-colors disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      // Route appropriately based on user role or previous destination
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else {
        navigate('/questions', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16 px-6">
      <Card className="p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>

        <p className="mt-2 text-slate-600">
          Log in to continue learning, asking questions, and helping peers.
        </p>

        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <Input
            label="Email Address"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 hover:text-indigo-700 underline"
          >
            Create student account
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Login;
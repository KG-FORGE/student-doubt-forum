import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import * as authService from '../../services/authService.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { KeyRound, CheckCircle2 } from 'lucide-react';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword({
        token,
        password,
        confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Password reset failed. The link may have expired.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16 px-6">
      <Card className="p-8 shadow-sm border border-slate-200">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <KeyRound className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Set new password
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Create a new, strong password to regain access to your DoubtForum account.
        </p>

        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Password updated successfully!
            </div>
            <p className="mt-1 text-xs">
              Redirecting you to the login page in 3 seconds...
            </p>
            <div className="mt-3">
              <Link to="/login" className="text-xs font-bold text-indigo-600 underline">
                Click here to sign in now →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="New Password"
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />

            <Input
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
            />

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Updating password...' : 'Save New Password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export default ResetPassword;

import { useState } from 'react';
import { Link } from 'react-router';
import * as authService from '../../services/authService.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import { Mail, CheckCircle2, AlertTriangle } from 'lucide-react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'dev_info'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [devToken, setDevToken] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.data.data?.emailConfigured === false) {
        setStatus('dev_info');
        setDevToken(res.data.data.devToken || '');
      } else {
        setStatus('success');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process password reset request.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16 px-6">
      <Card className="p-8 shadow-sm border border-slate-200">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <Mail className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Reset password
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Enter your registered email and we'll send you a secure link to reset your account credentials.
        </p>

        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Reset email dispatched
            </div>
            <p className="mt-1 text-xs">
              If an account with this email exists, instructions have been sent to your inbox. Check your spam folder if you do not see it within a few minutes.
            </p>
          </div>
        )}

        {status === 'dev_info' && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-center gap-2 font-semibold text-amber-800">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              SMTP Not Configured (Development Mode)
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              Email delivery is optional in local development. In production, configure SMTP credentials in <code className="bg-amber-100 px-1 py-0.5 rounded">server/.env</code>.
            </p>
            {devToken && (
              <div className="mt-3">
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="inline-block text-xs font-semibold text-indigo-600 underline hover:text-indigo-800"
                >
                  👉 Click here to test password reset with development token
                </Link>
              </div>
            )}
          </div>
        )}

        {!status && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
            />

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Sending instructions...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            ← Return to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
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

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      navigate('/questions', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
        'Registration failed. Please check your information and try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16 px-6">
      <Card className="p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Create student account
        </h1>

        <p className="mt-2 text-slate-600 text-sm">
          Join the learning community to ask doubts, collaborate, and share knowledge.
        </p>

        <div className="mt-4 rounded-lg bg-indigo-50/70 border border-indigo-100 p-3 text-xs text-indigo-700">
          💡 <strong>Student Access:</strong> Public registration creates a Student account. Teacher and TA accounts are designated by forum administrators.
        </div>

        {error && (
          <div className="mt-4">
            <ErrorMessage message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Full Name"
            name="name"
            required
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Alex Smith"
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="alex@university.edu"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min. 8 chars, 1 upper, 1 number"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            required
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat password"
          />

          <div className="pt-2">
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating account...' : 'Complete Registration'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-700 underline"
          >
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default Register;

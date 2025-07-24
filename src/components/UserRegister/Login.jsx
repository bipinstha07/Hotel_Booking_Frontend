import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';

function Login() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        // Store token or user data in localStorage/context if needed
        navigate('/'); // Redirect to home page after successful login
      } catch (err) {
        setServerError(err.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
    <Header/>
  
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-blue-100 p-10 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-extrabold text-blue-800 mb-2 tracking-tight drop-shadow">Welcome Back</h2>
          <p className="text-gray-500 text-lg">Login to your account</p>
        </div>

        {serverError && <div className="text-red-500 text-center font-semibold mb-2">{serverError}</div>}

        <div>
          <label className="block text-sm font-semibold mb-1 text-blue-900">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-blue-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50/50"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-blue-900">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-blue-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50/50"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold py-3 rounded-2xl text-lg shadow-lg transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="text-center text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Register
          </button>
        </div>
      </form>
    </div>
    </>
  );
}

export default Login;

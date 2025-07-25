import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialState = {
  email: '',
  password: '',
  confirmPassword: '',
};

function Register() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email required';
    } else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/.test(form.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!form.password) {
      newErrors.password = 'Password required';
    } else if (form.password.length < 5) {
      newErrors.password = 'Min 5 chars';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setServerError('');
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('userDto', JSON.stringify({
          email: form.email,
          password: form.password,
        }));
        const response = await fetch('http://localhost:8080/user/create', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Registration failed');
        }
        setSuccess(true);
        setForm(initialState);
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } catch (err) {
        setServerError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-6 md:p-8">
        <div className="text-center mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-blue-800 mb-1 tracking-tight">Create Account</h2>
          <p className="text-gray-500 text-base">Join Private Hotel</p>
        </div>
        {success && <div className="text-green-600 text-center font-semibold mb-2">Registered! Redirecting...</div>}
        {serverError && <div className="text-red-500 text-center font-semibold mb-2">{serverError}</div>}
        <div className="grid grid-cols-1 gap-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-blue-900">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-blue-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50/50 text-sm"
              placeholder="Email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-blue-900">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-blue-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50/50 text-sm"
              placeholder="Password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-blue-900">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border border-blue-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50/50 text-sm"
              placeholder="Confirm Password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-4 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold py-2 rounded-xl text-base shadow-lg transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default Register;
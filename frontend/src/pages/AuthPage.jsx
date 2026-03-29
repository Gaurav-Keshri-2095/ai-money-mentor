import React, { useState } from 'react';
import { authAPI, setAuthToken } from '../services/api';
import { Loader2 } from 'lucide-react';

const AuthPage = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }

      setAuthToken(response.access_token);
      onLogin(response.user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex items-center justify-center relative overflow-hidden">
      {/* Background ET Branding */}
      <div className="absolute top-8 left-8 flex items-center gap-2 cursor-pointer" onClick={onBack}>
        <div className="bg-[#ed1c24] text-white font-serif font-bold text-2xl px-2 py-1 flex items-center justify-center tracking-tighter">
          ET
        </div>
        <h1 className="text-2xl font-serif font-black tracking-tighter text-black leading-none" style={{ color: '#000000' }}>
          The Economic Times
        </h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md relative z-10 border-t-8 border-[#013366]">
        <h2 className="text-3xl font-serif font-bold text-center mb-2 text-[#013366]" style={{ color: '#000000' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          Access your AI Money Mentor and premium ET insights.
        </p>

        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            className={`flex-1 py-2 text-sm font-bold rounded-md transition cursor-pointer ${isLogin ? 'bg-white shadow text-[#013366]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 text-sm font-bold rounded-md transition cursor-pointer ${!isLogin ? 'bg-white shadow text-[#013366]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-[#ed1c24] focus:ring-1 focus:ring-[#ed1c24]" 
                placeholder="John Doe" 
                required={!isLogin} 
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-[#ed1c24] focus:ring-1 focus:ring-[#ed1c24]" 
              placeholder="name@example.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:border-[#ed1c24] focus:ring-1 focus:ring-[#ed1c24]" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center items-center bg-[#ed1c24] hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition mt-6 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {isLogin && (
          <p className="text-center text-xs text-[#013366] mt-4 font-semibold cursor-pointer hover:underline">
            Forgot your password?
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthPage;

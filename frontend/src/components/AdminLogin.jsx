import React, { useState } from 'react';

const AdminLogin = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    email: 'admin@gandharaofficial.org',
    password: 'Admin@2025!'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Enhanced debugging with environment checks
      console.log('\n🔍 FRONTEND LOGIN DEBUG');
      console.log('=========================');
      console.log('Current window.location:', window.location.href);
      console.log('Environment Variables:');
      console.log('- import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('- import.meta.env.MODE:', import.meta.env.MODE);
      console.log('- import.meta.env.DEV:', import.meta.env.DEV);
      
      // For development, use proxy. For production, use full URL
      const isDev = import.meta.env.DEV;
      const loginUrl = isDev 
        ? '/api/auth/login'  // Use proxy in development
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`; // Full URL in production
      
      console.log('URL Strategy:');
      console.log('- isDev:', isDev);
      console.log('- Using proxy:', isDev);
      console.log('- Final loginUrl:', loginUrl);
      console.log('- Credentials:', { email: credentials.email, password: '***' });
      console.log('=========================\n');
      
      console.log('🚀 Making fetch request to:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      console.log('\n📡 RESPONSE DEBUG');
      console.log('=================');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response ok:', response.ok);
      console.log('Response url:', response.url);
      console.log('Response type:', response.type);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('=================\n');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }
        
        console.log('Response data:', errorData);
        setError(errorData.message || `Login failed with status ${response.status}`);
        return;
      }

      const result = await response.json();

      if (result.success) {
        // Store token in localStorage
        localStorage.setItem('adminToken', result.token);
        console.log('✅ Admin login successful!');
        alert('Login successful! You can now add products.');
        if (onLoginSuccess) onLoginSuccess(result);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  // Check if already logged in
  const existingToken = localStorage.getItem('adminToken');
  if (existingToken) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <strong>✅ Already logged in!</strong> You can add products now.
        <button 
          onClick={() => localStorage.removeItem('adminToken')}
          className="ml-4 bg-red-500 text-white px-2 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Default Credentials:</strong></p>
        <p>Email: admin@gandharaofficial.org</p>
        <p>Password: Admin@2025!</p>
      </div>
    </div>
  );
};

export default AdminLogin;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: 'demo@admin.com',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 500));

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="decorative-circle-1"></div>
        <div className="decorative-circle-2"></div>
        
        <div className="login-hero">
          <h1 className="hero-title">
            Welcome to<br />
            SnackShows Admin
          </h1>
          <p className="hero-subtitle">
            Manage your video streaming platform with powerful tools and insights
          </p>
          
          <div className="hero-features">
            <div className="hero-feature-item">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <div className="feature-title">Real-time Analytics</div>
                <div className="feature-description">Track performance and user engagement</div>
              </div>
            </div>
            
            <div className="hero-feature-item">
              <div className="feature-icon">🎬</div>
              <div className="feature-text">
                <div className="feature-title">Content Management</div>
                <div className="feature-description">Organize videos, series, and episodes</div>
              </div>
            </div>
            
            <div className="hero-feature-item">
              <div className="feature-icon">👥</div>
              <div className="feature-text">
                <div className="feature-title">User Management</div>
                <div className="feature-description">Manage users and permissions easily</div>
              </div>
            </div>
          </div>
          
          <div className="hero-illustration">
            <div className="illustration-circle">
              <div className="illustration-icon">🎯</div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-logo">
            <div className="logo-icon-circle">
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          <h2 className="login-title">Login to your account</h2>
          <p className="login-subtitle">
            Let's connect, chat, and spark real connections.<br />
            Enter your credentials to continue your journey on<br />
            SnacksShows.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="demo@admin.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* <div className="forgot-password">
              <a href="/forgot-password">Forgot Password ?</a>
            </div> */}

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import './App.css';
import logo from './assets/logo.png';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (formData.email && formData.password) {
        setIsAuthenticated(true);
      } else {
        setError('Please enter email and password');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
      } else if (formData.email && formData.password) {
        setIsAuthenticated(true);
      } else {
        setError('Please fill in all fields');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };


  if (isAuthenticated) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="logo-text">Mad City Miles</h1>
            <button onClick={handleLogout} className="logout-btn">
              Sign Out
            </button>
          </div>
        </nav>
        <main className="dashboard">
          <div className="dashboard-content">

          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo-text">Mad City Miles</h1>
        </div>
      </nav>

      <main className="auth-main">

        <div className="logo-wrapper">
          <img src={logo} alt="Mad City Miles Logo" className="auth-logo" />
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <button
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          {error && <div className="error-bubble">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>Full name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder="••••••••"
                />
              </div>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {isLogin && (
            <div className="auth-footer">
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
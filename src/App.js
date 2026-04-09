import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import logo from './assets/logo.png';
import NavbarComponent from './components/NavbarComponent';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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
        setUser({ email: formData.email, name: formData.email.split('@')[0] });
        setIsAuthenticated(true);
      } else {
        setError('Please enter email and password');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
      } else if (formData.email && formData.password) {
        setUser({ email: formData.email, name: formData.name || formData.email.split('@')[0] });
        setIsAuthenticated(true);
      } else {
        setError('Please fill in all fields');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  // If authenticated, show the main app with router
  if (isAuthenticated) {
    return (
      <Router basename="/p129">
        <div className="app">
          <NavbarComponent user={user} handleLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    );
  }

  // Modern Login/Signup Page
  return (
    <div className="auth-app">
      <div className="auth-container-modern">
        <div className="auth-left">
          <div className="auth-left-content">
            <img src={logo} alt="Mad City Miles" className="auth-logo-modern" />
            <h1>Mad City Miles</h1>
            <p>Connect with runners in Madison. Track routes, join events, and hit the pavement together.</p>
            <div className="auth-features">
              <div className="feature-item">🏃 Find running partners</div>
              <div className="feature-item">🗺️ Discover local routes</div>
              <div className="feature-item">📅 RSVP to group runs</div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card-modern">
            <div className="auth-tabs-modern">
              <button
                className={`tab-btn-modern ${isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
              >
                Sign In
              </button>
              <button
                className={`tab-btn-modern ${!isLogin ? 'active' : ''}`}
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
              >
                Create Account
              </button>
            </div>

            {error && <div className="error-modern">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-modern">
              {!isLogin && (
                <div className="form-group-modern">
                  <label>Full Name</label>
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

              <div className="form-group-modern">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group-modern">
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
                <div className="form-group-modern">
                  <label>Confirm Password</label>
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

              <button type="submit" className="submit-btn-modern">
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {isLogin && (
              <div className="auth-footer-modern">
                <a href="#" className="forgot-link-modern">Forgot password?</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
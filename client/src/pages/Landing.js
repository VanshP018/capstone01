import React, { useState } from 'react';
import authService from '../services/authService';
import './Landing.css';
import codeClashLogo from '../assets/codeClashLogo.png';
import codeClashTitle from '../assets/codeClashTitle.png';

const Landing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnterArena = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
    setError('');
  };

  const handleGetStarted = () => {
    setAuthMode('login');
    setShowAuthModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowAuthModal(false);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        console.log('Attempting signup with:', { username: formData.username, email: formData.email });
        const response = await authService.signup(
          formData.username,
          formData.email,
          formData.password
        );
        console.log('Signup response:', response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Navigating to dashboard...');
        // Force a page reload to update App.js state
        window.location.href = '/dashboard';
      } else {
        console.log('Attempting login with:', { email: formData.email });
        const response = await authService.login(formData.email, formData.password);
        console.log('Login response:', response.data);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Navigating to dashboard...');
        // Force a page reload to update App.js state
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || `Error ${authMode === 'login' ? 'logging in' : 'signing up'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={closeModal}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header">
              <img src={codeClashLogo} alt="CodeClash" className="modal-logo-image" />
              <img src={codeClashTitle} alt="CodeClash" className="modal-logo-title" />
            </div>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>

            {error && <div className="error-message" style={{color: '#FF6A2F', marginBottom: '10px', textAlign: 'center'}}>{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              {authMode === 'signup' && (
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username" 
                    style={{background: '#000000'}}
                    required
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email" 
                  style={{background: '#000000'}}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password" 
                  style={{background: '#000000'}}
                  required
                />
              </div>

              {authMode === 'signup' && (
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password" 
                    style={{background: '#000000'}}
                    required
                  />
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (authMode === 'login' ? 'Signing In...' : 'Creating Account...') : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="auth-footer-modal">
              {authMode === 'login' ? (
                <p>Don't have an account? <button onClick={() => setAuthMode('signup')}>Sign up</button></p>
              ) : (
                <p>Already have an account? <button onClick={() => setAuthMode('login')}>Sign in</button></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="gradient-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <img src={codeClashLogo} alt="CodeClash" className="logo-image" />
          <img src={codeClashTitle} alt="CodeClash" className="logo-title" />
        </div>
        <div className="nav-buttons">
          <button className="nav-about">
            About
          </button>
          <button className="nav-get-started" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">
              Turn their codebase
              <br />
              <span className="gradient-text"> into ashes</span>
            </h1>

            <p className="hero-subtitle">
              A brutal 1v1 coding arena where you face a rival, fight the clock, and prove your dominance through pure logic and speed.
            </p>

            <div className="cta-buttons">
              <button className="btn-primary" onClick={handleEnterArena}>
                Enter Arena
                <svg className="arrow-through" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20 L35 20 M28 13 L35 20 L28 27" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Metrics */}
            {/* <div className="metrics-row">
              <div className="metric">
                <div className="metric-value">10K+</div>
                <div className="metric-label">Active Users</div>
              </div>
              <div className="metric-divider"></div>
              <div className="metric">
                <div className="metric-value">50K+</div>
                <div className="metric-label">Coding Sessions</div>
              </div>
              <div className="metric-divider"></div>
              <div className="metric">
                <div className="metric-value">99.9%</div>
                <div className="metric-label">Uptime</div>
              </div>
            </div> */}
          </div>

          {/* 3D Illustration */}
          <div className="hero-right">
            <div className="illustration-container">
              <div className="developer-setup">
                {/* PC Tower */}
                <div className="pc-tower">
                  <div className="tower-front">
                    <div className="power-button"></div>
                    <div className="led-strip led-1"></div>
                    <div className="led-strip led-2"></div>
                    <div className="drive-bay"></div>
                    <div className="drive-bay"></div>
                    <div className="vent-panel"></div>
                  </div>
                  <div className="tower-side"></div>
                </div>

                {/* Monitor with Python Code */}
                <div className="pc-monitor">
                  <div className="monitor-frame">
                    <div className="monitor-screen python-screen">
                      <div className="terminal-header">
                        <div className="terminal-button red"></div>
                        <div className="terminal-button yellow"></div>
                        <div className="terminal-button green"></div>
                        <span className="terminal-title"></span>
                      </div>
                      <div className="python-code">
                        <div className="code-line cpp-include">
                          <span style={{animationDelay: '0s'}}>#</span>
                          <span style={{animationDelay: '0.05s'}}>i</span>
                          <span style={{animationDelay: '0.1s'}}>n</span>
                          <span style={{animationDelay: '0.15s'}}>c</span>
                          <span style={{animationDelay: '0.2s'}}>l</span>
                          <span style={{animationDelay: '0.25s'}}>u</span>
                          <span style={{animationDelay: '0.3s'}}>d</span>
                          <span style={{animationDelay: '0.35s'}}>e</span>
                          <span style={{animationDelay: '0.4s'}}> </span>
                          <span style={{animationDelay: '0.45s'}}>&lt;</span>
                          <span className="cpp-lib" style={{animationDelay: '0.5s'}}>i</span>
                          <span className="cpp-lib" style={{animationDelay: '0.55s'}}>o</span>
                          <span className="cpp-lib" style={{animationDelay: '0.6s'}}>s</span>
                          <span className="cpp-lib" style={{animationDelay: '0.65s'}}>t</span>
                          <span className="cpp-lib" style={{animationDelay: '0.7s'}}>r</span>
                          <span className="cpp-lib" style={{animationDelay: '0.75s'}}>e</span>
                          <span className="cpp-lib" style={{animationDelay: '0.8s'}}>a</span>
                          <span className="cpp-lib" style={{animationDelay: '0.85s'}}>m</span>
                          <span style={{animationDelay: '0.9s'}}>&gt;</span>
                        </div>
                        <div className="code-line cpp-using">
                          <span className="cpp-keyword" style={{animationDelay: '1.05s'}}>u</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.1s'}}>s</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.15s'}}>i</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.2s'}}>n</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.25s'}}>g</span>
                          <span style={{animationDelay: '1.3s'}}> </span>
                          <span className="cpp-keyword" style={{animationDelay: '1.35s'}}>n</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.4s'}}>a</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.45s'}}>m</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.5s'}}>e</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.55s'}}>s</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.6s'}}>p</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.65s'}}>a</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.7s'}}>c</span>
                          <span className="cpp-keyword" style={{animationDelay: '1.75s'}}>e</span>
                          <span style={{animationDelay: '1.8s'}}> </span>
                          <span style={{animationDelay: '1.85s'}}>s</span>
                          <span style={{animationDelay: '1.9s'}}>t</span>
                          <span style={{animationDelay: '1.95s'}}>d</span>
                          <span style={{animationDelay: '2s'}}>;</span>
                        </div>
                        <div className="code-line py-blank"></div>
                        <div className="code-line cpp-func">
                          <span className="cpp-keyword" style={{animationDelay: '2.15s'}}>i</span>
                          <span className="cpp-keyword" style={{animationDelay: '2.2s'}}>n</span>
                          <span className="cpp-keyword" style={{animationDelay: '2.25s'}}>t</span>
                          <span style={{animationDelay: '2.3s'}}> </span>
                          <span className="py-func" style={{animationDelay: '2.35s'}}>m</span>
                          <span className="py-func" style={{animationDelay: '2.4s'}}>a</span>
                          <span className="py-func" style={{animationDelay: '2.45s'}}>i</span>
                          <span className="py-func" style={{animationDelay: '2.5s'}}>n</span>
                          <span style={{animationDelay: '2.55s'}}>(</span>
                          <span style={{animationDelay: '2.6s'}}>)</span>
                          <span style={{animationDelay: '2.65s'}}> </span>
                          <span style={{animationDelay: '2.7s'}}>{'{'}</span>
                        </div>
                        <div className="code-line py-indent">
                          <span style={{animationDelay: '2.85s'}}>c</span>
                          <span style={{animationDelay: '2.9s'}}>o</span>
                          <span style={{animationDelay: '2.95s'}}>u</span>
                          <span style={{animationDelay: '3s'}}>t</span>
                          <span style={{animationDelay: '3.05s'}}> </span>
                          <span style={{animationDelay: '3.1s'}}>&lt;</span>
                          <span style={{animationDelay: '3.15s'}}>&lt;</span>
                          <span style={{animationDelay: '3.2s'}}> </span>
                          <span className="py-str" style={{animationDelay: '3.25s'}}>"</span>
                          <span className="py-str" style={{animationDelay: '3.3s'}}>H</span>
                          <span className="py-str" style={{animationDelay: '3.35s'}}>e</span>
                          <span className="py-str" style={{animationDelay: '3.4s'}}>l</span>
                          <span className="py-str" style={{animationDelay: '3.45s'}}>l</span>
                          <span className="py-str" style={{animationDelay: '3.5s'}}>o</span>
                          <span className="py-str" style={{animationDelay: '3.55s'}}>,</span>
                          <span className="py-str" style={{animationDelay: '3.6s'}}> </span>
                          <span className="py-str" style={{animationDelay: '3.65s'}}>W</span>
                          <span className="py-str" style={{animationDelay: '3.7s'}}>o</span>
                          <span className="py-str" style={{animationDelay: '3.75s'}}>r</span>
                          <span className="py-str" style={{animationDelay: '3.8s'}}>l</span>
                          <span className="py-str" style={{animationDelay: '3.85s'}}>d</span>
                          <span className="py-str" style={{animationDelay: '3.9s'}}>!</span>
                          <span className="py-str" style={{animationDelay: '3.95s'}}>"</span>
                          <span style={{animationDelay: '4s'}}>;</span>
                        </div>
                        <div className="code-line py-indent">
                          <span className="cpp-keyword" style={{animationDelay: '4.15s'}}>r</span>
                          <span className="cpp-keyword" style={{animationDelay: '4.2s'}}>e</span>
                          <span className="cpp-keyword" style={{animationDelay: '4.25s'}}>t</span>
                          <span className="cpp-keyword" style={{animationDelay: '4.3s'}}>u</span>
                          <span className="cpp-keyword" style={{animationDelay: '4.35s'}}>r</span>
                          <span className="cpp-keyword" style={{animationDelay: '4.4s'}}>n</span>
                          <span style={{animationDelay: '4.45s'}}> </span>
                          <span style={{animationDelay: '4.5s'}}>0</span>
                          <span style={{animationDelay: '4.55s'}}>;</span>
                        </div>
                        <div className="code-line">
                          <span style={{animationDelay: '4.7s'}}>{'}'}</span>
                        </div>
                        <div className="code-line py-blank"></div>
                        <div className="code-line py-comment">
                          <span style={{animationDelay: '4.85s'}}>/</span>
                          <span style={{animationDelay: '4.9s'}}>/</span>
                          <span style={{animationDelay: '4.95s'}}> </span>
                          <span style={{animationDelay: '5s'}}>B</span>
                          <span style={{animationDelay: '5.05s'}}>a</span>
                          <span style={{animationDelay: '5.1s'}}>t</span>
                          <span style={{animationDelay: '5.15s'}}>t</span>
                          <span style={{animationDelay: '5.2s'}}>l</span>
                          <span style={{animationDelay: '5.25s'}}>e</span>
                          <span style={{animationDelay: '5.3s'}}> </span>
                          <span style={{animationDelay: '5.35s'}}>R</span>
                          <span style={{animationDelay: '5.4s'}}>e</span>
                          <span style={{animationDelay: '5.45s'}}>a</span>
                          <span style={{animationDelay: '5.5s'}}>d</span>
                          <span style={{animationDelay: '5.55s'}}>y</span>
                          <span style={{animationDelay: '5.6s'}}>!</span>
                        </div>
                        <div className="code-line py-cursor">█</div>
                      </div>
                    </div>
                    <div className="monitor-base">
                      <div className="monitor-stand"></div>
                      <div className="monitor-foot"></div>
                    </div>
                  </div>
                </div>

                {/* Keyboard */}
                <div className="keyboard">
                  <div className="keyboard-keys"></div>
                </div>

                {/* Mouse */}
                <div className="mouse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

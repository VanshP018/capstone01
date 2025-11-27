import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Leaderboard from './pages/Leaderboard';
import Battle from './pages/Battle';
import Stats from './pages/Stats';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App mounted, checking localStorage...');
    const user = localStorage.getItem('user');
    console.log('User from localStorage:', user);
    
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleSignUp = (user) => {
    console.log('Sign up successful:', user);
    setCurrentUser(user);
  };

  const handleLogin = (user) => {
    console.log('Login successful:', user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        const updatedUser = data.user;
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Landing />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignUp onSignUp={handleSignUp} />
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            currentUser ? (
              <Dashboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/room/:code" 
          element={
            currentUser ? (
              <Room user={currentUser} refreshUser={refreshUser} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/leaderboard" 
          element={
            currentUser ? (
              <Leaderboard user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/battle/:code" 
          element={
            currentUser ? (
              <Battle user={currentUser} refreshUser={refreshUser} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
        <Route 
          path="/stats" 
          element={
            currentUser ? (
              <Stats user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

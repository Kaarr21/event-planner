// src/components/common/Navbar.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationAPI, inviteAPI } from '../../utils/api';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotificationCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotificationCount = async () => {
    try {
      const [notificationsRes, invitesRes] = await Promise.all([
        notificationAPI.getNotifications(),
        inviteAPI.getUserInvites()
      ]);
      
      const unreadNotifications = notificationsRes.data.filter(n => !n.read).length;
      const pendingInvites = invitesRes.data.filter(i => i.status === 'pending').length;
      
      setNotificationCount(unreadNotifications + pendingInvites);
    } catch (err) {
      // Silently fail - notification count is not critical
      console.error('Failed to fetch notification count:', err);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            EventPlanner
          </Link>
          
          {isAuthenticated ? (
            <ul className="navbar-nav">
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/past-events">Past Events</Link></li>
              <li><Link to="/create-event">Create Event</Link></li>
              <li>
                <Link to="/notifications" style={{ position: 'relative' }}>
                  Notifications
                  {notificationCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: 'var(--danger)',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '20px'
                    }}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <button className="theme-toggle" onClick={toggleTheme}>
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>
              <li><Link to="/profile">Profile</Link></li>
              <li>
                <span>Hi, {user?.username}!</span>
              </li>
              <li>
                <button className="btn btn-outline" onClick={logout}>
                  Logout
                </button>
              </li>
            </ul>
          ) : (
            <ul className="navbar-nav">
              <li>
                <button className="theme-toggle" onClick={toggleTheme}>
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// src/components/common/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
                <button className="theme-toggle" onClick={toggleTheme}>
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>
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

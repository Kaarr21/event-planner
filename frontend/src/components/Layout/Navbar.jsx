// frontend/src/components/Layout/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-container">
          <Link to="/" style={{ fontSize: '20px', fontWeight: 'bold', textDecoration: 'none', color: 'var(--text-primary)' }}>
            EventPlanner
          </Link>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ul className="nav-links">
                <li><Link to="/events" className="nav-link">Events</Link></li>
                <li><Link to="/past-events" className="nav-link">Past Events</Link></li>
                <li><Link to="/create-event" className="nav-link">Create Event</Link></li>
              </ul>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Hello, {user.username}</span>
                <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
                <ThemeToggle />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

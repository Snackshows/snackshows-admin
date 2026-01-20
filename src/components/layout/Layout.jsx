import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaUserTie, 
  FaFilm, 
  FaList, 
  FaVideo,
  FaCrown,
  FaBars,
  FaTimes,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaLanguage
} from 'react-icons/fa';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ← ADD THIS FUNCTION
  const handleProfileClick = () => {
    navigate('/profile');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button 
          className="hamburger-btn" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <div className="mobile-logo">
          <FaVideo className="logo-icon" />
          <span className="logo-text">SnackShows</span>
        </div>

        <div className="mobile-header-actions">
          <button className="notification-btn">
            <FaBell />
            <span className="notification-badge">2</span>
          </button>
          {/* ← ADD onClick HERE TOO */}
          <button className="profile-btn" onClick={handleProfileClick}>
            <FaUserCircle />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <FaVideo className="logo-icon" />
            <span className="logo-text">SnackShows</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">MENU</h3>
            <Link
              to="/dashboard"
              className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaHome className="nav-icon" />
              <span className="nav-label">Dashboard</span>
            </Link>
            <Link
              to="/users"
              className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaUsers className="nav-icon" />
              <span className="nav-label">User</span>
            </Link>
            <Link
              to="/employee"
              className={`nav-item ${location.pathname === '/employee' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaUserTie className="nav-icon" />
              <span className="nav-label">Employee</span>
            </Link>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">FILM MANAGEMENT</h3>
            <Link
              to="/film-category"
              className={`nav-item ${location.pathname === '/film-category' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaFilm className="nav-icon" />
              <span className="nav-label">Series Category</span>
            </Link>
            <Link
              to="/film-list"
              className={`nav-item ${location.pathname === '/film-list' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaList className="nav-icon" />
              <span className="nav-label">Series List</span>
            </Link>
            {/* <Link
              to="/episode-list"
              className={`nav-item ${location.pathname === '/episode-list' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaTv className="nav-icon" />
              <span className="nav-label">Episode List</span>
            </Link> */}
            <Link
              to="/content"
              className={`nav-item ${location.pathname === '/content' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaVideo className="nav-icon" />
              <span className="nav-label">Content</span>
            </Link>

            
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Language</h3>
            <Link
              to="/language"
              className={`nav-item ${location.pathname === '/language' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaLanguage className="nav-icon" />
              <span className="nav-label">Language</span>
            </Link>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">PACKAGE</h3>
            <Link
              to="/vip-plan"
              className={`nav-item ${location.pathname === '/vip-plan' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaCrown className="nav-icon" />
              <span className="nav-label">VIP Plan</span>
            </Link>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">SYSTEM</h3>
            <Link
              to="/settings"
              className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaCog className="nav-icon" />
              <span className="nav-label">Settings</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="content-header">
          <div className="header-left">
            <h1 className="page-greeting">Welcome Admin !</h1>
            <p className="page-title">Dashboard</p>
          </div>
          <div className="header-right">
            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">2</span>
            </button>
            {/* ← ADD onClick HERE */}
            <div 
              className="user-profile"
              onClick={handleProfileClick}
              style={{ cursor: 'pointer' }}
            >
              <FaUserCircle className="user-avatar" />
              <span className="user-name">Admin User</span>
            </div>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
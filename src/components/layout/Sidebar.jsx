import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUser, FaUserTie, FaFilm, FaList, FaTv, FaVideo, 
  FaCoins, FaCrown, FaHistory, FaLanguage, FaGift, 
  FaCog, FaUserCircle, FaSignOutAlt,FaGlobe
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { 
      title: 'MENU', 
      items: [
        { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/users', icon: FaUser, label: 'User' },
        { path: '/employee', icon: FaUserTie, label: 'Employee' },
      ]
    },
    { 
      title: 'FILM MANAGEMENT', 
      items: [
        { path: '/film-category', icon: FaFilm, label: 'Film Category' },
        { path: '/film-list', icon: FaList, label: 'Film List' },
        { path: '/episode-list', icon: FaTv, label: 'Episode List' },
        { path: '/content', icon: FaVideo, label: 'Content' },
        { path: '/language', name: 'Language', icon: <FaGlobe /> },
      ]
    },
    { 
      title: 'PACKAGE', 
      items: [
        { path: '/vip-plan', icon: FaCrown, label: 'VIP Plan' },
        { path: '/order-history', icon: FaHistory, label: 'Order History' },
      ]
    },
    { 
      title: 'GENERAL', 
      items: [
        { path: '/settings', icon: FaCog, label: 'Setting' },
        { path: '/profile', icon: FaUserCircle, label: 'Profile' },
      ]
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <FaVideo className="logo-icon" />
          <span className="logo-text">StoryBox</span>
        </div>

        {/* Menu */}
        <nav className="sidebar-menu">
          {menuItems.map((section, index) => (
            <div key={index} className="menu-section">
              <div className="menu-title">{section.title}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <Icon className="menu-icon" />
                    <span className="menu-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Logout */}
          <div className="menu-section">
            <Link to="/logout" className="menu-item logout-item">
              <FaSignOutAlt className="menu-icon" />
              <span className="menu-label">Log Out</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

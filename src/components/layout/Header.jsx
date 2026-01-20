import React from 'react';
import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  // Navigate to profile page
  const handleProfileClick = () => {
    window.location.href = '/profile';
  };

  return (
    <header className="header">
      {/* Left Side - Menu Toggle */}
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Toggle Menu">
          <FaBars />
        </button>
      </div>

      {/* Right Side - Notifications & Profile */}
      <div className="header-right">
        {/* Notification Button */}
        <button className="notification-btn" aria-label="Notifications">
          <FaBell />
          <span className="notification-badge">3</span>
        </button>

        {/* User Profile - CLICKABLE */}
        <div 
          className="user-profile" 
          onClick={handleProfileClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleProfileClick();
            }
          }}
          aria-label="Go to Profile"
        >
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name || 'User'} 
              className="user-avatar" 
            />
          ) : (
            <FaUserCircle className="user-avatar-icon" />
          )}
          <span className="user-name">{user?.name || 'Admin User'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
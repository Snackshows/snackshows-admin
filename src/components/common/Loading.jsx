import React from 'react';
import './Loading.css';

// Main Loading Spinner
export const Loading = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loading-fullscreen">{content}</div>;
  }

  return content;
};

// Skeleton Loader for Cards
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-text"></div>
    <div className="skeleton skeleton-text short"></div>
  </div>
);

// Skeleton Loader for Table
export const SkeletonTable = ({ rows = 5, columns = 6 }) => (
  <div className="skeleton-table">
    <div className="skeleton-table-header">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="skeleton skeleton-header"></div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="skeleton-table-row">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="skeleton skeleton-cell"></div>
        ))}
      </div>
    ))}
  </div>
);

// Skeleton Loader for Dashboard Stats
export const SkeletonStats = ({ count = 5 }) => (
  <div className="skeleton-stats-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-stat-card">
        <div className="skeleton skeleton-stat-value"></div>
        <div className="skeleton skeleton-stat-label"></div>
        <div className="skeleton skeleton-progress"></div>
      </div>
    ))}
  </div>
);

// Button Loading State
export const ButtonLoading = () => (
  <div className="button-loading">
    <div className="button-spinner"></div>
  </div>
);

export default Loading;

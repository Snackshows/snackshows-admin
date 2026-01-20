import React from 'react';
import './Toggle.css';

const Toggle = ({ checked, onChange, disabled = false }) => {
  return (
    <div 
      className={`toggle-switch ${checked ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
    />
  );
};

export default Toggle;

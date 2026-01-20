import React, { useState } from 'react';
import { FaSave, FaCog, FaEnvelope, FaBell, FaLock, FaKey, FaTools, FaDatabase } from 'react-icons/fa';
import Toggle from '../components/common/Toggle';
import { useToast } from '../components/common/Toast';
import './Settings.css';

const Settings = () => {
  const toast = useToast();
  const [settings, setSettings] = useState({
    appName: 'StoryBox',
    appEmail: 'admin@storybox.com',
    adminEmail: 'admin@storybox.com',
    supportEmail: 'support@storybox.com',
    emailNotifications: true,
    pushNotifications: true,
    maintenanceMode: false,
    twoFactorAuth: true,
    sessionTimeout: 30,
    apiKey: 'sk_live_xxxxxxxxxxxxxxxx',
    cacheEnabled: true,
    debugMode: false
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">App Settings</h2>
        <button className="btn btn-primary" onClick={handleSave}>
          <FaSave /> Save Changes
        </button>
      </div>

      <div className="settings-sections">
        <div className="settings-section">
          <div className="section-header">
            <FaCog className="section-icon" />
            <h3>General Settings</h3>
          </div>
          <div className="setting-row">
            <label>App Name</label>
            <input className="input-field" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} />
          </div>
          <div className="setting-row">
            <label>App Email</label>
            <input className="input-field" type="email" value={settings.appEmail} onChange={e => setSettings({...settings, appEmail: e.target.value})} />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <FaEnvelope className="section-icon" />
            <h3>Email Configuration</h3>
          </div>
          <div className="setting-row">
            <label>Admin Email</label>
            <input className="input-field" type="email" value={settings.adminEmail} onChange={e => setSettings({...settings, adminEmail: e.target.value})} />
          </div>
          <div className="setting-row">
            <label>Support Email</label>
            <input className="input-field" type="email" value={settings.supportEmail} onChange={e => setSettings({...settings, supportEmail: e.target.value})} />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <FaBell className="section-icon" />
            <h3>Notification Settings</h3>
          </div>
          <div className="setting-row">
            <label>Email Notifications</label>
            <Toggle checked={settings.emailNotifications} onChange={v => setSettings({...settings, emailNotifications: v})} />
          </div>
          <div className="setting-row">
            <label>Push Notifications</label>
            <Toggle checked={settings.pushNotifications} onChange={v => setSettings({...settings, pushNotifications: v})} />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <FaLock className="section-icon" />
            <h3>Security & Privacy</h3>
          </div>
          <div className="setting-row">
            <label>Two-Factor Authentication</label>
            <Toggle checked={settings.twoFactorAuth} onChange={v => setSettings({...settings, twoFactorAuth: v})} />
          </div>
          <div className="setting-row">
            <label>Session Timeout (minutes)</label>
            <input className="input-field" type="number" value={settings.sessionTimeout} onChange={e => setSettings({...settings, sessionTimeout: e.target.value})} />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <FaKey className="section-icon" />
            <h3>API Configuration</h3>
          </div>
          <div className="setting-row">
            <label>API Key</label>
            <input className="input-field" type="password" value={settings.apiKey} onChange={e => setSettings({...settings, apiKey: e.target.value})} />
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <FaTools className="section-icon" />
            <h3>Maintenance Mode</h3>
          </div>
          <div className="setting-row">
            <label>Enable Maintenance Mode</label>
            <Toggle checked={settings.maintenanceMode} onChange={v => setSettings({...settings, maintenanceMode: v})} />
          </div>
          {settings.maintenanceMode && (
            <div className="warning-box">⚠️ Maintenance mode is ON. Users cannot access the app.</div>
          )}
        </div>

        <div className="settings-section">
          <div className="section-header">
            <FaDatabase className="section-icon" />
            <h3>Cache & Performance</h3>
          </div>
          <div className="setting-row">
            <label>Enable Cache</label>
            <Toggle checked={settings.cacheEnabled} onChange={v => setSettings({...settings, cacheEnabled: v})} />
          </div>
          <div className="setting-row">
            <label>Debug Mode</label>
            <Toggle checked={settings.debugMode} onChange={v => setSettings({...settings, debugMode: v})} />
          </div>
          <button className="btn btn-outline" onClick={() => toast.success('Cache cleared!')}>
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
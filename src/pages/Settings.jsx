import React, { useState, useEffect } from 'react';
import { 
  FaSave, FaCog, FaEnvelope, FaBell, FaLock, FaKey, FaTools, FaDatabase,
  FaServer, FaShieldAlt, FaChartLine, FaDownload, FaUpload, FaHistory,
   FaCloudUploadAlt, FaExclamationTriangle, FaCheckCircle,
   FaCode, FaSync, FaTrash, FaEye, FaEyeSlash
} from 'react-icons/fa';
import Toggle from '../components/common/Toggle';
import { useToast } from '../components/common/Toast';
import { useConfirm } from '../components/common/ConfirmDialog';
import './Settings.css';

const Settings = () => {
  const toast = useToast();
  const confirm = useConfirm();
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [settings, setSettings] = useState({
    // General Settings
    appName: 'SnackShows',
    appTagline: 'Your Entertainment Hub',
    appUrl: 'https://snackshows.com',
    appLogo: '',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    
    // Email Configuration
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'admin@snackshows.com',
    smtpPassword: '',
    smtpEncryption: 'TLS',
    adminEmail: 'admin@snackshows.com',
    supportEmail: 'support@snackshows.com',
    noReplyEmail: 'noreply@snackshows.com',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    webhookNotifications: false,
    notifyOnNewUser: true,
    notifyOnPayment: true,
    notifyOnError: true,
    
    // Security
    twoFactorAuth: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    ipWhitelist: '',
    corsOrigins: '*',
    
    // API Configuration
    apiKey: 'your-api-key-here',
    apiRateLimit: 100,
    apiRateLimitWindow: 60,
    webhookSecret: '',
    
    // Storage & Media
    storageProvider: 'local',
    maxFileSize: 10,
    allowedFileTypes: 'jpg,jpeg,png,gif,pdf,mp4,mov',
    s3Bucket: '',
    s3Region: 'us-east-1',
    s3AccessKey: '',
    s3SecretKey: '',
    
    // Performance
    cacheEnabled: true,
    cacheDriver: 'redis',
    cacheTTL: 3600,
    compressionEnabled: true,
    cdnEnabled: false,
    cdnUrl: '',
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance.',
    allowedIPs: '',
    
    // Advanced
    debugMode: false,
    logLevel: 'info',
    enableAnalytics: true,
    enableCrashReporting: true,
    backupEnabled: true,
    backupFrequency: 'daily',
    backupRetention: 30,
  });

  const [systemInfo] = useState({
    version: '2.1.0',
    environment: 'production',
    uptime: '15 days, 4 hours',
    diskUsage: '45%',
    memoryUsage: '62%',
    cpuUsage: '23%',
    lastBackup: '2 hours ago',
    databaseSize: '2.4 GB',
  });

  useEffect(() => {
    // Load settings from API
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Simulated API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulated API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
      setUnsavedChanges(false);
    } catch (error) {
      toast.error('Failed to save settings',error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    const confirmed = await confirm({
      title: 'Clear Cache',
      message: 'Are you sure you want to clear all cached data? This action cannot be undone.'
    });
    
    if (confirmed) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        toast.success('Cache cleared successfully!');
      }, 1000);
    }
  };

  const handleBackupNow = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Backup created successfully!');
    }, 2000);
  };

  const handleTestEmail = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Test email sent successfully!');
    }, 1500);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FaCog },
    { id: 'email', label: 'Email', icon: FaEnvelope },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'api', label: 'API', icon: FaKey },
    { id: 'storage', label: 'Storage', icon: FaDatabase },
    { id: 'performance', label: 'Performance', icon: FaChartLine },
    { id: 'maintenance', label: 'Maintenance', icon: FaTools },
    { id: 'advanced', label: 'Advanced', icon: FaServer },
  ];

  return (
    <div className="settings-page-pro">
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="settings-title">
              <FaCog className="title-icon" />
              Application Settings
            </h1>
            <p className="settings-subtitle">Configure and manage your application</p>
          </div>
          <div className="header-actions">
            {unsavedChanges && (
              <span className="unsaved-badge">
                <FaExclamationTriangle /> Unsaved changes
              </span>
            )}
            <button 
              className="btn-settings btn-save" 
              onClick={handleSave}
              disabled={loading || !unsavedChanges}
            >
              {loading ? (
                <>
                  <FaSync className="spinning" /> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-section-pro">
            <div className="section-header-pro">
              <FaCog className="section-icon-pro" />
              <div>
                <h2>General Settings</h2>
                <p>Basic application configuration</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">
                  Application Name
                  <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="setting-input"
                  value={settings.appName}
                  onChange={(e) => handleChange('appName', e.target.value)}
                  placeholder="Enter app name"
                />
                <span className="setting-hint">Display name of your application</span>
              </div>

              <div className="setting-group">
                <label className="setting-label">Tagline</label>
                <input
                  type="text"
                  className="setting-input"
                  value={settings.appTagline}
                  onChange={(e) => handleChange('appTagline', e.target.value)}
                  placeholder="Your Entertainment Hub"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">Application URL</label>
                <input
                  type="url"
                  className="setting-input"
                  value={settings.appUrl}
                  onChange={(e) => handleChange('appUrl', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">Timezone</label>
                <select
                  className="setting-select"
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">Language</label>
                <select
                  className="setting-select"
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">Date Format</label>
                <select
                  className="setting-select"
                  value={settings.dateFormat}
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">Currency</label>
                <select
                  className="setting-select"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Email Configuration */}
        {activeTab === 'email' && (
          <div className="settings-section-pro">
            <div className="section-header-pro">
              <FaEnvelope className="section-icon-pro" />
              <div>
                <h2>Email Configuration</h2>
                <p>SMTP and email settings</p>
              </div>
              <button className="btn-settings btn-test" onClick={handleTestEmail}>
                <FaEnvelope /> Send Test Email
              </button>
            </div>

            <div className="settings-grid">
              <div className="setting-group full-width">
                <div className="info-banner info">
                  <FaCheckCircle />
                  <span>Configure SMTP settings to enable email notifications</span>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">SMTP Host</label>
                <input
                  type="text"
                  className="setting-input"
                  value={settings.smtpHost}
                  onChange={(e) => handleChange('smtpHost', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">SMTP Port</label>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.smtpPort}
                  onChange={(e) => handleChange('smtpPort', e.target.value)}
                  placeholder="587"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">SMTP Username</label>
                <input
                  type="email"
                  className="setting-input"
                  value={settings.smtpUser}
                  onChange={(e) => handleChange('smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">SMTP Password</label>
                <input
                  type="password"
                  className="setting-input"
                  value={settings.smtpPassword}
                  onChange={(e) => handleChange('smtpPassword', e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">Encryption</label>
                <select
                  className="setting-select"
                  value={settings.smtpEncryption}
                  onChange={(e) => handleChange('smtpEncryption', e.target.value)}
                >
                  <option value="TLS">TLS</option>
                  <option value="SSL">SSL</option>
                  <option value="NONE">None</option>
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">Admin Email</label>
                <input
                  type="email"
                  className="setting-input"
                  value={settings.adminEmail}
                  onChange={(e) => handleChange('adminEmail', e.target.value)}
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">Support Email</label>
                <input
                  type="email"
                  className="setting-input"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">No-Reply Email</label>
                <input
                  type="email"
                  className="setting-input"
                  value={settings.noReplyEmail}
                  onChange={(e) => handleChange('noReplyEmail', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="settings-section-pro">
            <div className="section-header-pro">
              <FaBell className="section-icon-pro" />
              <div>
                <h2>Notification Settings</h2>
                <p>Configure notification channels and preferences</p>
              </div>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Email Notifications</div>
                  <div className="setting-description">Receive notifications via email</div>
                </div>
                <Toggle
                  checked={settings.emailNotifications}
                  onChange={(v) => handleChange('emailNotifications', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Push Notifications</div>
                  <div className="setting-description">Browser push notifications</div>
                </div>
                <Toggle
                  checked={settings.pushNotifications}
                  onChange={(v) => handleChange('pushNotifications', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">SMS Notifications</div>
                  <div className="setting-description">Critical alerts via SMS</div>
                </div>
                <Toggle
                  checked={settings.smsNotifications}
                  onChange={(v) => handleChange('smsNotifications', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Webhook Notifications</div>
                  <div className="setting-description">Send events to webhook URL</div>
                </div>
                <Toggle
                  checked={settings.webhookNotifications}
                  onChange={(v) => handleChange('webhookNotifications', v)}
                />
              </div>

              <div className="divider"></div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Notify on New User</div>
                  <div className="setting-description">Alert when new user registers</div>
                </div>
                <Toggle
                  checked={settings.notifyOnNewUser}
                  onChange={(v) => handleChange('notifyOnNewUser', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Notify on Payment</div>
                  <div className="setting-description">Alert on successful payments</div>
                </div>
                <Toggle
                  checked={settings.notifyOnPayment}
                  onChange={(v) => handleChange('notifyOnPayment', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Notify on Error</div>
                  <div className="setting-description">Alert on system errors</div>
                </div>
                <Toggle
                  checked={settings.notifyOnError}
                  onChange={(v) => handleChange('notifyOnError', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="settings-section-pro">
            <div className="section-header-pro">
              <FaShieldAlt className="section-icon-pro" />
              <div>
                <h2>Security & Privacy</h2>
                <p>Protect your application and user data</p>
              </div>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Two-Factor Authentication</div>
                  <div className="setting-description">Require 2FA for admin accounts</div>
                </div>
                <Toggle
                  checked={settings.twoFactorAuth}
                  onChange={(v) => handleChange('twoFactorAuth', v)}
                />
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">Session Timeout (minutes)</label>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                  min="5"
                  max="1440"
                />
                <span className="setting-hint">Auto logout after inactivity</span>
              </div>

              <div className="setting-group">
                <label className="setting-label">Max Login Attempts</label>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleChange('maxLoginAttempts', e.target.value)}
                  min="3"
                  max="10"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">Lockout Duration (minutes)</label>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.lockoutDuration}
                  onChange={(e) => handleChange('lockoutDuration', e.target.value)}
                  min="5"
                  max="60"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">Password Min Length</label>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleChange('passwordMinLength', e.target.value)}
                  min="6"
                  max="32"
                />
              </div>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Require Uppercase</div>
                  <div className="setting-description">Password must contain uppercase letters</div>
                </div>
                <Toggle
                  checked={settings.passwordRequireUppercase}
                  onChange={(v) => handleChange('passwordRequireUppercase', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Require Numbers</div>
                  <div className="setting-description">Password must contain numbers</div>
                </div>
                <Toggle
                  checked={settings.passwordRequireNumbers}
                  onChange={(v) => handleChange('passwordRequireNumbers', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Require Symbols</div>
                  <div className="setting-description">Password must contain special characters</div>
                </div>
                <Toggle
                  checked={settings.passwordRequireSymbols}
                  onChange={(v) => handleChange('passwordRequireSymbols', v)}
                />
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-group full-width">
                <label className="setting-label">IP Whitelist</label>
                <textarea
                  className="setting-textarea"
                  value={settings.ipWhitelist}
                  onChange={(e) => handleChange('ipWhitelist', e.target.value)}
                  placeholder="Enter IP addresses (one per line)"
                  rows="3"
                />
                <span className="setting-hint">Only these IPs can access admin panel</span>
              </div>

              <div className="setting-group full-width">
                <label className="setting-label">CORS Origins</label>
                <input
                  type="text"
                  className="setting-input"
                  value={settings.corsOrigins}
                  onChange={(e) => handleChange('corsOrigins', e.target.value)}
                  placeholder="https://example.com, https://app.example.com"
                />
                <span className="setting-hint">Allowed origins for API requests</span>
              </div>
            </div>
          </div>
        )}

        {/* API Configuration */}
        {activeTab === 'api' && (
          <div className="settings-section-pro">
            <div className="section-header-pro">
              <FaKey className="section-icon-pro" />
              <div>
                <h2>API Configuration</h2>
                <p>Manage API keys and rate limiting</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-group full-width">
                <div className="info-banner warning">
                  <FaExclamationTriangle />
                  <span>Keep your API keys secure. Never share them publicly.</span>
                </div>
              </div>

              <div className="setting-group full-width">
                <label className="setting-label">API Key</label>
                <div className="input-with-icon">
                  <input
                    type={showApiKey ? "text" : "password"}
                    className="setting-input"
                    value={settings.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    readOnly
                  />
                  <button
                    className="icon-btn"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <span className="setting-hint">Use this key for API authentication</span>
              </div>

              <div className="setting-group">
                <label className="setting-label">Rate Limit (requests)</label>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.apiRateLimit}
                  onChange={(e) => handleChange('apiRateLimit', e.target.value)}
                  min="10"
                  max="10000"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">Rate Limit Window (seconds)</label>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.apiRateLimitWindow}
                  onChange={(e) => handleChange('apiRateLimitWindow', e.target.value)}
                  min="1"
                  max="3600"
                />
              </div>

              <div className="setting-group full-width">
                <label className="setting-label">Webhook Secret</label>
                <input
                  type="password"
                  className="setting-input"
                  value={settings.webhookSecret}
                  onChange={(e) => handleChange('webhookSecret', e.target.value)}
                  placeholder="Enter webhook secret"
                />
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-settings btn-secondary">
                <FaSync /> Regenerate API Key
              </button>
              <button className="btn-settings btn-secondary">
                <FaCode /> View API Documentation
              </button>
            </div>
          </div>
        )}

        {/* Storage */}
        {activeTab === 'storage' && (
          <div className="settings-section-pro">
            <div className="section-header-pro">
              <FaCloudUploadAlt className="section-icon-pro" />
              <div>
                <h2>Storage & Media</h2>
                <p>Configure file storage settings</p>
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">Storage Provider</label>
                <select
                  className="setting-select"
                  value={settings.storageProvider}
                  onChange={(e) => handleChange('storageProvider', e.target.value)}
                >
                  <option value="local">Local Storage</option>
                  <option value="s3">Amazon S3</option>
                  <option value="gcs">Google Cloud Storage</option>
                  <option value="azure">Azure Blob Storage</option>
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">Max File Size (MB)</label>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.maxFileSize}
                  onChange={(e) => handleChange('maxFileSize', e.target.value)}
                  min="1"
                  max="500"
                />
              </div>

              <div className="setting-group full-width">
                <label className="setting-label">Allowed File Types</label>
                <input
                  type="text"
                  className="setting-input"
                  value={settings.allowedFileTypes}
                  onChange={(e) => handleChange('allowedFileTypes', e.target.value)}
                  placeholder="jpg,png,pdf,mp4"
                />
                <span className="setting-hint">Comma-separated file extensions</span>
              </div>

              {settings.storageProvider === 's3' && (
                <>
                  <div className="setting-group">
                    <label className="setting-label">S3 Bucket</label>
                    <input
                      type="text"
                      className="setting-input"
                      value={settings.s3Bucket}
                      onChange={(e) => handleChange('s3Bucket', e.target.value)}
                      placeholder="my-bucket"
                    />
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">S3 Region</label>
                    <input
                      type="text"
                      className="setting-input"
                      value={settings.s3Region}
                      onChange={(e) => handleChange('s3Region', e.target.value)}
                      placeholder="us-east-1"
                    />
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">Access Key</label>
                    <input
                      type="text"
                      className="setting-input"
                      value={settings.s3AccessKey}
                      onChange={(e) => handleChange('s3AccessKey', e.target.value)}
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                    />
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">Secret Key</label>
                    <input
                      type="password"
                      className="setting-input"
                      value={settings.s3SecretKey}
                      onChange={(e) => handleChange('s3SecretKey', e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Performance */}
        {activeTab === 'performance' && (
          <div className="settings-section-pro">
            <div className="section-header-pro">
              <FaChartLine className="section-icon-pro" />
              <div>
                <h2>Performance & Optimization</h2>
                <p>Optimize application performance</p>
              </div>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Enable Cache</div>
                  <div className="setting-description">Cache frequently accessed data</div>
                </div>
                <Toggle
                  checked={settings.cacheEnabled}
                  onChange={(v) => handleChange('cacheEnabled', v)}
                />
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">Cache Driver</label>
                <select
                  className="setting-select"
                  value={settings.cacheDriver}
                  onChange={(e) => handleChange('cacheDriver', e.target.value)}
                  disabled={!settings.cacheEnabled}
                >
                  <option value="redis">Redis</option>
                  <option value="memcached">Memcached</option>
                  <option value="file">File</option>
                </select>
              </div>

              <div className="setting-group">
                <label className="setting-label">Cache TTL (seconds)</label>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.cacheTTL}
                  onChange={(e) => handleChange('cacheTTL', e.target.value)}
                  disabled={!settings.cacheEnabled}
                  min="60"
                  max="86400"
                />
              </div>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Compression</div>
                  <div className="setting-description">Compress responses to reduce bandwidth</div>
                </div>
                <Toggle
                  checked={settings.compressionEnabled}
                  onChange={(v) => handleChange('compressionEnabled', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">CDN</div>
                  <div className="setting-description">Serve assets via CDN</div>
                </div>
                <Toggle
                  checked={settings.cdnEnabled}
                  onChange={(v) => handleChange('cdnEnabled', v)}
                />
              </div>
            </div>

            {settings.cdnEnabled && (
              <div className="settings-grid">
                <div className="setting-group full-width">
                  <label className="setting-label">CDN URL</label>
                  <input
                    type="url"
                    className="setting-input"
                    value={settings.cdnUrl}
                    onChange={(e) => handleChange('cdnUrl', e.target.value)}
                    placeholder="https://cdn.example.com"
                  />
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn-settings btn-danger" onClick={handleClearCache}>
                <FaTrash /> Clear All Cache
              </button>
              <button className="btn-settings btn-secondary">
                <FaSync /> Optimize Database
              </button>
            </div>
          </div>
        )}

        {/* Maintenance */}
        {activeTab === 'maintenance' && (
          <div className="settings-section-pro">
            <div className="section-header-pro">
              <FaTools className="section-icon-pro" />
              <div>
                <h2>Maintenance Mode</h2>
                <p>Put your application in maintenance mode</p>
              </div>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Enable Maintenance Mode</div>
                  <div className="setting-description">Display maintenance page to users</div>
                </div>
                <Toggle
                  checked={settings.maintenanceMode}
                  onChange={(v) => handleChange('maintenanceMode', v)}
                />
              </div>
            </div>

            {settings.maintenanceMode && (
              <>
                <div className="info-banner warning">
                  <FaExclamationTriangle />
                  <span>Maintenance mode is ON. Users cannot access the application.</span>
                </div>

                <div className="settings-grid">
                  <div className="setting-group full-width">
                    <label className="setting-label">Maintenance Message</label>
                    <textarea
                      className="setting-textarea"
                      value={settings.maintenanceMessage}
                      onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                      rows="3"
                    />
                  </div>

                  <div className="setting-group full-width">
                    <label className="setting-label">Allowed IPs</label>
                    <textarea
                      className="setting-textarea"
                      value={settings.allowedIPs}
                      onChange={(e) => handleChange('allowedIPs', e.target.value)}
                      placeholder="Enter IP addresses that can bypass maintenance (one per line)"
                      rows="3"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Enable Automatic Backups</div>
                  <div className="setting-description">Schedule automatic database backups</div>
                </div>
                <Toggle
                  checked={settings.backupEnabled}
                  onChange={(v) => handleChange('backupEnabled', v)}
                />
              </div>
            </div>

            {settings.backupEnabled && (
              <div className="settings-grid">
                <div className="setting-group">
                  <label className="setting-label">Backup Frequency</label>
                  <select
                    className="setting-select"
                    value={settings.backupFrequency}
                    onChange={(e) => handleChange('backupFrequency', e.target.value)}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label className="setting-label">Retention (days)</label>
                  <input
                    type="number"
                    className="setting-input"
                    value={settings.backupRetention}
                    onChange={(e) => handleChange('backupRetention', e.target.value)}
                    min="1"
                    max="365"
                  />
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button className="btn-settings btn-primary" onClick={handleBackupNow}>
                <FaDownload /> Backup Now
              </button>
              <button className="btn-settings btn-secondary">
                <FaUpload /> Restore from Backup
              </button>
              <button className="btn-settings btn-secondary">
                <FaHistory /> View Backup History
              </button>
            </div>
          </div>
        )}

        {/* Advanced */}
        {activeTab === 'advanced' && (
          <div className="settings-section-pro">
            <div className="section-header-pro">
              <FaServer className="section-icon-pro" />
              <div>
                <h2>Advanced Settings</h2>
                <p>System configuration and developer options</p>
              </div>
            </div>

            <div className="info-banner warning">
              <FaExclamationTriangle />
              <span>Caution: Modifying these settings may affect application stability</span>
            </div>

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Debug Mode</div>
                  <div className="setting-description">Show detailed error messages</div>
                </div>
                <Toggle
                  checked={settings.debugMode}
                  onChange={(v) => handleChange('debugMode', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Enable Analytics</div>
                  <div className="setting-description">Track user behavior and metrics</div>
                </div>
                <Toggle
                  checked={settings.enableAnalytics}
                  onChange={(v) => handleChange('enableAnalytics', v)}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">Crash Reporting</div>
                  <div className="setting-description">Send crash reports to monitoring service</div>
                </div>
                <Toggle
                  checked={settings.enableCrashReporting}
                  onChange={(v) => handleChange('enableCrashReporting', v)}
                />
              </div>
            </div>

            <div className="settings-grid">
              <div className="setting-group">
                <label className="setting-label">Log Level</label>
                <select
                  className="setting-select"
                  value={settings.logLevel}
                  onChange={(e) => handleChange('logLevel', e.target.value)}
                >
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
            </div>

            {/* System Information */}
            <div className="system-info-card">
              <h3>System Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Version</span>
                  <span className="info-value">{systemInfo.version}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Environment</span>
                  <span className={`badge badge-${systemInfo.environment}`}>
                    {systemInfo.environment}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Uptime</span>
                  <span className="info-value">{systemInfo.uptime}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">CPU Usage</span>
                  <span className="info-value">{systemInfo.cpuUsage}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Memory Usage</span>
                  <span className="info-value">{systemInfo.memoryUsage}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Disk Usage</span>
                  <span className="info-value">{systemInfo.diskUsage}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Database Size</span>
                  <span className="info-value">{systemInfo.databaseSize}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Backup</span>
                  <span className="info-value">{systemInfo.lastBackup}</span>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-settings btn-secondary">
                <FaDownload /> Download Logs
              </button>
              <button className="btn-settings btn-secondary">
                <FaSync /> Check for Updates
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

 





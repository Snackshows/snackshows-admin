import React, { useState, useEffect, useCallback } from 'react';  // ← ADD useCallback
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCamera, FaSave, FaTimes } from 'react-icons/fa';
import { profileAPI } from '../services/api';
import { useToast } from '../components/common/Toast';
import { Loading } from '../components/common/Loading';
import './Profile.css';

const Profile = () => {
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Profile Data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    image: ''
  });
  
  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Password Change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Profile Picture
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ← WRAP fetchProfile IN useCallback
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await profileAPI.getProfile();
      
      if (response.success && response.data) {
        const data = response.data;
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          image: data.image || ''
        });
        setImagePreview(data.image || null);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [toast]);  // ← ADD dependencies here

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);  // ← NOW fetchProfile is in the dependency array

  const handleEditClick = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const response = await profileAPI.updateProfile({
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        bio: editData.bio
      });
      
      if (response.success) {
        setProfileData(editData);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      
      const response = await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      if (response.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
        toast.success('Password changed successfully');
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }

    try {
      setUploading(true);
      
      // Step 1: Get presigned URL
      const presignResponse = await profileAPI.getProfilePictureUploadUrl({
        fileName: imageFile.name,
        contentType: imageFile.type
      });
      
      if (!presignResponse.success || !presignResponse.data) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadUrl, publicS3Url } = presignResponse.data;
      
      // Step 2: Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: imageFile,
        headers: { 'Content-Type': imageFile.type }
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      // Step 3: Save profile picture URL
      const saveResponse = await profileAPI.saveProfilePicture({
        imageUrl: publicS3Url,
        imageKey: `profile-pictures/${imageFile.name}`
      });
      
      if (saveResponse.success) {
        setProfileData({ ...profileData, image: publicS3Url });
        setImageFile(null);
        toast.success('Profile picture updated successfully');
      } else {
        toast.error(saveResponse.message || 'Failed to save profile picture');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(profileData.image || null);
  };

  if (loading) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <h2 className="profile-title">My Profile</h2>
          {!isEditing && (
            <button className="btn-edit" onClick={handleEditClick}>
              <FaUser /> Edit Profile
            </button>
          )}
        </div>

        <div className="profile-content">
          {/* Left Side - Profile Picture */}
          <div className="profile-sidebar">
            <div className="profile-picture-section">
              <div className="profile-picture-wrapper">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="profile-picture" />
                ) : (
                  <div className="profile-picture-placeholder">
                    <FaUser />
                  </div>
                )}
                
                <label className="profile-picture-overlay">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="file-input-hidden"
                  />
                  <FaCamera />
                  <span>Change Photo</span>
                </label>
              </div>
              
              {imageFile && (
                <div className="image-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleImageUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleRemoveImage}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              <div className="profile-name-display">
                <h3>{profileData.name || 'Admin User'}</h3>
                <p>{profileData.email}</p>
              </div>
            </div>
          </div>

          {/* Right Side - Profile Info */}
          <div className="profile-main">
            {/* Profile Information */}
            <div className="profile-section">
              <h3 className="section-title">Profile Information</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="info-display">
                      <FaUser className="info-icon" />
                      <span>{profileData.name || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="info-display">
                      <FaEnvelope className="info-icon" />
                      <span>{profileData.email || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="info-display">
                      <FaPhone className="info-icon" />
                      <span>{profileData.phone || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editData.bio || ''}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      className="input-field"
                      rows="4"
                    />
                  ) : (
                    <div className="info-display">
                      <span>{profileData.bio || 'Not set'}</span>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Change Password */}
            {!isEditing && (
              <div className="profile-section">
                <div className="section-header">
                  <h3 className="section-title">Security</h3>
                  {!showPasswordForm && (
                    <button
                      className="btn-link"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordChange} className="password-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        <FaLock /> {saving ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
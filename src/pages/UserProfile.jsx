import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useToast } from "../components/common/Toast";
import { usersAPI } from "../services/api";
import "./UserProfile.css";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUserProfile(id);

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        toast.error("Failed to load user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error(error.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error-state">
          <h2>User not found</h2>
          <button onClick={() => navigate("/users")} className="btn-back">
            <FaArrowLeft /> Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Back Button */}
      <button onClick={() => navigate("/users")} className="btn-back">
        <FaArrowLeft /> Back
      </button>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <div className="avatar-letter">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          {!user.isBlocked && <FaCheckCircle className="verified" />}
        </div>
        <div className="user-info">
          <h1>{user.name || "Guest User"}</h1>
          <p>{user.email || "No email provided"}</p>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="sections-grid">
        {/* Personal Information */}
        <div className="info-section">
          <h2 className="section-title">Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <span>{user.name || "Not provided"}</span>
            </div>
            <div className="info-item">
              <label>Gender</label>
              <span>
                {user.gender
                  ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                  : "Not specified"}
              </span>
            </div>
            <div className="info-item">
              <label>Age</label>
              <span>{user.age ? `${user.age} years` : "Not provided"}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="info-section">
          <h2 className="section-title">Contact Info</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>E-mail</label>
              <span>{user.email || "Not provided"}</span>
            </div>
            <div className="info-item">
              <label>User ID</label>
              <span className="user-id-text">{user.id}</span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="info-section full-width">
          <h2 className="section-title">Account Info</h2>
          <div className="info-grid cols-3">
            <div className="info-item">
              <label>Plan</label>
              <span className="badge plan">{user.plan || "Free"}</span>
            </div>
            <div className="info-item">
              <label>Coins</label>
              <span className="badge coins">{user.coins || 0}</span>
            </div>
            <div className="info-item">
              <label>Account Status</label>
              <span
                className={`badge ${user.isBlocked ? "blocked" : "active"}`}
              >
                {user.isBlocked ? "Blocked" : "Active"}
              </span>
            </div>
            <div className="info-item">
              <label>Member Since</label>
              <span>
                {user.joinedOn
                  ? new Date(user.joinedOn).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Unknown"}
              </span>
            </div>
            <div className="info-item">
              <label>Country Blocked</label>
              <span>{user.countryBlocked ? "Yes" : "No"}</span>
            </div>
            <div className="info-item">
              <label>Spam Blocked</label>
              <span>{user.spamBlocked ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

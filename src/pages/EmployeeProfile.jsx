import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { useToast } from "../components/common/Toast";
import { employeeAPI } from "../services/api";
import "./EmployeeProfile.css";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployeeProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getEmployeeDetails(id);

      if (response.success && response.data) {
        setEmployee(response.data);
      } else {
        toast.error("Failed to load employee profile");
      }
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      toast.error(error.message || "Failed to load employee profile");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchEmployeeProfile();
  }, [fetchEmployeeProfile]);

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

  if (!employee) {
    return (
      <div className="profile-page">
        <div className="error-state">
          <h2>Employee not found</h2>
          <button onClick={() => navigate("/employee")} className="btn-back">
            <FaArrowLeft /> Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "E"
    );
  };

  return (
    <div className="profile-page">
      {/* Back Button */}
      <button onClick={() => navigate("/employee")} className="btn-back">
        <FaArrowLeft /> Back
      </button>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="user-avatar">
          {employee.image ? (
            <img src={employee.image} alt={employee.name} />
          ) : (
            <div className="avatar-letter">{getInitials(employee.name)}</div>
          )}
          {!employee.isBlocked && <FaCheckCircle className="verified" />}
        </div>
        <div className="user-info">
          <h1>{employee.name || "Employee"}</h1>
          <p>{employee.email || "No email provided"}</p>
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
              <span>{employee.name || "Not provided"}</span>
            </div>
            <div className="info-item">
              <label>Role</label>
              <span>{employee.role || "Not specified"}</span>
            </div>
            <div className="info-item">
              <label>Bio</label>
              <span>{employee.bio || "No bio provided"}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="info-section">
          <h2 className="section-title">Contact Info</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>E-mail</label>
              <span>{employee.email || "Not provided"}</span>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <span>{employee.phone || "Not provided"}</span>
            </div>
            <div className="info-item">
              <label>Employee ID</label>
              <span className="user-id-text">{employee.id}</span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="info-section full-width">
          <h2 className="section-title">Account Info</h2>
          <div className="info-grid cols-3">
            <div className="info-item">
              <label>Status</label>
              <span
                className={`badge ${employee.isBlocked ? "blocked" : "active"}`}
              >
                {employee.isBlocked ? "Blocked" : "Active"}
              </span>
            </div>
            <div className="info-item">
              <label>Joining Date</label>
              <span>
                {employee.joiningDate
                  ? new Date(employee.joiningDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Unknown"}
              </span>
            </div>
            <div className="info-item">
              <label>Created At</label>
              <span>
                {employee.createdAt
                  ? new Date(employee.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Unknown"}
              </span>
            </div>
            <div className="info-item">
              <label>Updated At</label>
              <span>
                {employee.updatedAt
                  ? new Date(employee.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Unknown"}
              </span>
            </div>
            <div className="info-item">
              <label>Is Ban</label>
              <span>{employee.isBan ? "Yes" : "No"}</span>
            </div>
            <div className="info-item">
              <label>Is Blocked</label>
              <span>{employee.isBlocked ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;

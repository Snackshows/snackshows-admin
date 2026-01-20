import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaUserTie,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import Modal from "../components/common/Modal";
import Table from "../components/common/Table";
import Toggle from "../components/common/Toggle";
import { useToast } from "../components/common/Toast";
import { useConfirm } from "../components/common/ConfirmDialog";
import { SkeletonTable } from "../components/common/Loading";
import { employeeAPI } from "../services/api";
import "./Employee.css";

const Employee = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    bio: "",
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAllEmployees();

      if (response.success && response.data) {
        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAdd = () => {
    setCurrentEmployee(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "",
      bio: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      bio: employee.bio || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (employeeId) => {
    const confirmed = await confirm({
      title: "Delete Employee",
      message:
        "Are you sure you want to delete this employee? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await employeeAPI.deleteEmployee(employeeId);

      if (response.success) {
        setEmployees(employees.filter((e) => e.id !== employeeId));
        toast.success("Employee deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (currentEmployee) {
        // Edit existing employee
        response = await employeeAPI.updateEmployee(formData);

        if (response.success) {
          await fetchEmployees(); // Refresh list
          toast.success("Employee updated successfully");
        } else {
          toast.error(response.message || "Failed to update employee");
        }
      } else {
        // Create new employee
        response = await employeeAPI.createEmployee(formData);

        if (response.success) {
          await fetchEmployees(); // Refresh list
          toast.success("Employee created successfully");
        } else {
          toast.error(response.message || "Failed to create employee");
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
      toast.error(error.message || "Failed to save employee");
    }
  };

  const handleToggleBlock = async (employeeId, currentStatus) => {
    const confirmed = await confirm({
      title: currentStatus ? "Unblock Employee" : "Block Employee",
      message: currentStatus
        ? "This will unblock the employee."
        : "This will block the employee.",
      confirmText: currentStatus ? "Unblock" : "Block",
      type: "warning",
    });

    if (!confirmed) return;

    try {
      const response = await employeeAPI.changePermission({
        id: employeeId,
        isBlocked: !currentStatus,
      });

      if (response.success) {
        await fetchEmployees(); // Refresh list
        toast.success(
          currentStatus ? "Employee unblocked" : "Employee blocked",
        );
      } else {
        toast.error(response.message || "Failed to update employee status");
      }
    } catch (error) {
      console.error("Error toggling block status:", error);
      toast.error("Failed to update employee status");
    }
  };

  const roles = [...new Set(employees.map((e) => e.role))];

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const columns = [
    {
      header: "EMPLOYEE",
      render: (row) => (
        <div className="employee-info-cell">
          <div className="employee-avatar">
            {row.image ? (
              <img src={row.image} alt={row.name} />
            ) : (
              getInitials(row.name)
            )}
          </div>
          <div>
            <div className="employee-name">{row.name}</div>
            <div className="employee-position">{row.role}</div>
          </div>
        </div>
      ),
    },
    {
      header: "CONTACT",
      render: (row) => (
        <div className="contact-cell">
          <div className="contact-item">
            <FaEnvelope className="contact-icon" />
            <span>{row.email}</span>
          </div>
          <div className="contact-item">
            <FaPhone className="contact-icon" />
            <span>{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      header: "ROLE",
      accessor: "role",
      render: (row) => <span className="department-badge">{row.role}</span>,
    },
    {
      header: "JOINED DATE",
      accessor: "joiningDate",
      render: (row) =>
        row.joiningDate
          ? new Date(row.joiningDate).toLocaleDateString()
          : "N/A",
    },
    {
      header: "STATUS",
      render: (row) => (
        <Toggle
          checked={!row.isBlocked}
          onChange={() => handleToggleBlock(row.id, row.isBlocked)}
        />
      ),
    },
    {
      header: "ACTION",
      render: (row) => (
        <div className="action-buttons">
          <button
            className="action-btn view-btn"
            title="View Details"
            onClick={() => navigate(`/employee-profile/${row.id}`)}
          >
            <FaEye />
          </button>
          <button
            className="action-btn edit-btn"
            title="Edit"
            onClick={() => handleEdit(row)}
          >
            <FaEdit />
          </button>
          <button
            className="action-btn delete-btn"
            title="Delete"
            onClick={() => handleDelete(row.id)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || employee.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="employee-page">
      <div className="page-header">
        <h2 className="page-title">Employee Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FaUserTie /> Add New Employee
        </button>
      </div>

      <div className="employee-stats">
        <div className="employee-stat-card">
          <FaUserTie className="stat-icon" />
          <div className="stat-value">{employees.length}</div>
          <div className="stat-label">Total Employees</div>
        </div>
        <div className="employee-stat-card">
          <div className="stat-value">
            {employees.filter((e) => !e.isBlocked).length}
          </div>
          <div className="stat-label">Active</div>
        </div>
        <div className="employee-stat-card">
          <div className="stat-value">
            {employees.filter((e) => e.isBlocked).length}
          </div>
          <div className="stat-label">Blocked</div>
        </div>
        <div className="employee-stat-card">
          <div className="stat-value">{roles.length}</div>
          <div className="stat-label">Roles</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterRole === "all" ? "active" : ""}`}
            onClick={() => setFilterRole("all")}
          >
            All Roles ({employees.length})
          </button>
          {roles.map((role) => (
            <button
              key={role}
              className={`filter-btn ${filterRole === role ? "active" : ""}`}
              onClick={() => setFilterRole(role)}
            >
              {role} ({employees.filter((e) => e.role === role).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} columns={7} />
      ) : (
        <Table columns={columns} data={filteredEmployees} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEmployee ? "Edit Employee" : "Add New Employee"}
        size="large"
      >
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="input-field"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            {!currentEmployee && (
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., EMPLOYEE, ADMIN"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="input-field"
              rows="3"
              placeholder="Short bio..."
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentEmployee ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employee;

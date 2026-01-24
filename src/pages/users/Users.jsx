import { useState, useEffect, useCallback } from "react";
import { FaEye, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Table from "../../components/common/Table";
import Toggle from "../../components/common/Toggle";
import { useToast } from "../../components/common/Toast";
import { useConfirm } from "../../components/common/ConfirmDialog";
import { SkeletonTable } from "../../components/common/Loading";
import { usersAPI } from "../../services/api";
import "./Users.css";

const Users = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await usersAPI.getAllUsers();
      console.log(response);

      if (response.success && response.data) {
        const usersData = response.data.user || response.data;

        const transformedUsers = usersData.map((user) => ({
          id: user.id,
          name: user.name || "Guest",
          uniqueId: user.id.substring(0, 8),
          email: user.email,
          coins: user.coins || 0,
          plan: user.plan || "free",
          date: user.joinedOn
            ? new Date(user.joinedOn).toLocaleDateString("en-GB")
            : user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-GB")
              : new Date().toLocaleDateString("en-GB"),
          blocked: user.isBlocked || false,
          isActive: user.isActive !== false,
        }));

        setUsers(transformedUsers);

        console.log("Users loaded:", transformedUsers.length);
      } else {
        console.error("API response:", response);
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBlockToggle = async (userId, currentStatus) => {
    const confirmed = await confirm({
      title: currentStatus ? "Unblock User" : "Block User",
      message: currentStatus
        ? "Are you sure you want to unblock this user?"
        : "Are you sure you want to block this user? They will not be able to access the platform.",
      confirmText: currentStatus ? "Unblock" : "Block",
      type: "warning",
    });

    if (!confirmed) return;

    try {
      await usersAPI.changeUserPermission({
        id: userId,
        isBlocked: !currentStatus,
      });

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, blocked: !currentStatus } : user,
        ),
      );

      toast.success(
        currentStatus
          ? "User unblocked successfully"
          : "User blocked successfully",
      );
    } catch (error) {
      console.error("Error toggling user block status:", error);
      toast.error(error.message || "Failed to update user status");
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.uniqueId.includes(searchQuery),
  );

  const numberedUsers = filteredUsers.map((user, index) => ({
    ...user,
    rowNumber: index + 1,
  }));

  const columns = [
    {
      header: "NO",
      accessor: "rowNumber",
      width: "60px",
    },
    {
      header: "USER NAME",
      accessor: "name",
      render: (row) => (
        <div className="user-cell">
          <div className="user-avatar">{row.name.charAt(0)}</div>
          <span>{row.name}</span>
        </div>
      ),
    },
    {
      header: "UNIQUE ID",
      accessor: "uniqueId",
    },
    {
      header: "PLAN",
      accessor: "plan",
    },
    {
      header: "DATE",
      accessor: "date",
    },
    {
      header: "BLOCK",
      render: (row) => (
        <Toggle
          checked={row.blocked}
          onChange={() => handleBlockToggle(row.id, row.blocked)}
        />
      ),
    },
    {
      header: "ACTION",
      render: (row) => (
        <div className="action-buttons">
          <button
            className="action-btn view-btn"
            onClick={() => handleViewProfile(row.id)}
            title="View Profile"
          >
            <FaEye />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="users-page">
      <div className="page-header">
        <h2 className="page-title">User</h2>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={8} columns={7} />
      ) : (
        <Table columns={columns} data={numberedUsers} />
      )}
    </div>
  );
};

export default Users;

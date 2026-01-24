import React, { useState, useEffect, useCallback } from "react";
import { FaUsers, FaFilm, FaVideo, FaDollarSign } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
// import { SkeletonStats } from ".././components/common/Loading";
// import { useToast } from "../components/common/Toast";
import "./Dashboard.css";
import { dashboardAPI } from "../../services/api";
import { SkeletonStats } from "../../components/common/Loading";
import { useToast } from "../../components/common/Toast";

const Dashboard = () => {
  const toast = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategory: 0,
    totalSeries: 0,
    totalVideos: 0,
    totalRevenue: 0,
  });
  // const [latestUsers, setLatestUsers] = useState([]);
  // const [latestVideos, setLatestVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chartData = [
    { name: "Jan", users: 10, revenue: 250 },
    { name: "Feb", users: 11, revenue: 270 },
    { name: "Mar", users: 12, revenue: 290 },
    { name: "Apr", users: 13, revenue: 310 },
    { name: "May", users: 14, revenue: 330 },
    { name: "Jun", users: 15, revenue: 350 },
    { name: "Jul", users: stats.totalUsers, revenue: stats.totalRevenue },
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call real API
      const response = await dashboardAPI.getDashboardInfo();

      if (response.success && response.data) {
        // Update stats from API
        if (response.data.stats) {
          setStats({
            totalUsers: response.data.stats.totalUsers || 0,
            totalCategory: response.data.stats.totalCategory || 0,
            totalSeries: response.data.stats.totalSeries || 0,
            totalVideos: response.data.stats.totalVideos || 0,
            totalRevenue: response.data.stats.totalRevenue || 0,
          });
        }

        // Update latest users
        // if (response.data.latestUsers) {
        //   setLatestUsers(response.data.latestUsers);
        // }

        // Update latest videos
        // if (response.data.latestVideos) {
        //   setLatestVideos(response.data.latestVideos);
        // }

        console.log("Dashboard data loaded:", response.data);
      } else {
        console.error("API response:", response);
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message || "Failed to load dashboard data");
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const statCards = [
    {
      title: "Total User",
      value: stats.totalUsers,
      icon: FaUsers,
      color: "#FF0080",
    },
    {
      title: "Total Film Category",
      value: stats.totalCategory,
      icon: FaFilm,
      color: "#FF0080",
    },
    {
      title: "Total Videos",
      value: stats.totalVideos,
      icon: FaVideo,
      color: "#FF0080",
    },
    {
      title: "Total Series",
      value: stats.totalSeries,
      icon: FaVideo,
      color: "#FF0080",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue}`,
      icon: FaDollarSign,
      color: "#FF0080",
    },
  ];

  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    // Get user data from localStorage
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        // Get username specifically
        setUserName(userData.username);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUserName("Admin");
      }
    }
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Welcome {userName} !</h1>
          <h2 className="section-title">Dashboard</h2>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-outline" onClick={handleRefresh}>
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button onClick={handleRefresh} className="btn-link">
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <SkeletonStats count={5} />
      ) : (
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-title">{stat.title}</div>
                  <div className="stat-progress">
                    <div
                      className="stat-progress-bar"
                      style={{ width: "70%", background: stat.color }}
                    ></div>
                  </div>
                </div>
                <div className="stat-icon" style={{ color: stat.color }}>
                  <stat.icon />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Chart */}
      {!loading && (
        <div className="analytics-section">
          <h3 className="section-title">Data Analytics</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#FF0080"
                  name="Total User"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6B7280"
                  name="Total Revenue"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

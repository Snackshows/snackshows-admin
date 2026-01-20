import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import Modal from "../components/common/Modal";
import Table from "../components/common/Table";
import Toggle from "../components/common/Toggle";
import { useToast } from "../components/common/Toast";
import { useConfirm } from "../components/common/ConfirmDialog";
import { SkeletonTable } from "../components/common/Loading";
import { episodesAPI, seriesAPI } from "../services/api";
import "./EpisodeList.css";

const EpisodeList = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [episodes, setEpisodes] = useState([]);
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    seriesId: "",
    episodeNumber: "",
    videoUrl: "",
    videoImage: "",
    duration: "",
    coin: "",
    isLocked: false,
    releaseDate: "",
  });

  const fetchSeries = useCallback(async () => {
    try {
      const response = await seriesAPI.getAllSeries();

      if (response.success && response.data) {
        const seriesData = Array.isArray(response.data)
          ? response.data
          : response.data.series
            ? response.data.series
            : [];
        setSeries(seriesData);
        console.log("Series loaded:", seriesData.length);
      }
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error(error.message || "Failed to load series");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchEpisodes = useCallback(
    async (seriesId) => {
      try {
        setLoading(true);

        const response = await episodesAPI.getAllEpisodes({ seriesId });

        if (response.success && response.data) {
          const episodesData = Array.isArray(response.data)
            ? response.data
            : response.data.episodes
              ? response.data.episodes
              : [];

          const transformedEpisodes = episodesData.map((item) => ({
            id: item.id,
            seriesId: item.seriesId,
            episodeNumber: item.episodeNumber,
            videoUrl: item.videoUrl || "",
            videoImage: item.videoImage || "",
            duration: item.duration || 0,
            coin: item.coin || 0,
            isLocked: item.isLocked || false,
            releaseDate: item.releaseDate
              ? new Date(item.releaseDate).toLocaleDateString("en-GB")
              : "",
            createdAt: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-GB")
              : "",
          }));

          setEpisodes(transformedEpisodes);
          console.log("Episodes loaded:", transformedEpisodes.length);
        }
      } catch (error) {
        console.error("Error fetching episodes:", error);
        toast.error(error.message || "Failed to load episodes");
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  useEffect(() => {
    if (selectedSeries) {
      fetchEpisodes(selectedSeries);
    }
  }, [selectedSeries, fetchEpisodes]);

  const handleAdd = () => {
    if (!selectedSeries) {
      toast.error("Please select a series first");
      return;
    }

    setCurrentEpisode(null);
    setFormData({
      seriesId: selectedSeries,
      episodeNumber: "",
      videoUrl: "",
      videoImage: "",
      duration: "",
      coin: "",
      isLocked: false,
      releaseDate: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (episode) => {
    setCurrentEpisode(episode);
    setFormData({
      seriesId: episode.seriesId,
      episodeNumber: episode.episodeNumber,
      videoUrl: episode.videoUrl,
      videoImage: episode.videoImage,
      duration: episode.duration,
      coin: episode.coin,
      isLocked: episode.isLocked,
      releaseDate: episode.releaseDate,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Episode",
      message:
        "Are you sure you want to delete this episode? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      await episodesAPI.deleteEpisode(id);
      setEpisodes(episodes.filter((item) => item.id !== id));
      toast.success("Episode deleted successfully");
    } catch (error) {
      console.error("Error deleting episode:", error);
      toast.error(error.message || "Failed to delete episode");
    }
  };

  const handleToggleLock = async (id, currentStatus) => {
    try {
      await episodesAPI.updateEpisode({
        id: id,
        isLocked: !currentStatus,
      });

      setEpisodes(
        episodes.map((item) =>
          item.id === id ? { ...item, isLocked: !currentStatus } : item,
        ),
      );

      toast.success(
        `Episode ${!currentStatus ? "locked" : "unlocked"} successfully`,
      );
    } catch (error) {
      console.error("Error toggling lock:", error);
      toast.error(error.message || "Failed to update episode");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.episodeNumber || !formData.videoUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (currentEpisode) {
        await episodesAPI.updateEpisode({
          id: currentEpisode.id,
          ...formData,
        });
        toast.success("Episode updated successfully");
      } else {
        await episodesAPI.createEpisode(formData);
        toast.success("Episode created successfully");
      }

      setIsModalOpen(false);
      fetchEpisodes(selectedSeries);
    } catch (error) {
      console.error("Error saving episode:", error);
      toast.error(error.message || "Failed to save episode");
    }
  };

  const filteredEpisodes = episodes.filter((item) =>
    item.episodeNumber.toString().includes(searchQuery),
  );

  const columns = [
    { header: "NO", render: (row, index) => index + 1, width: "60px" },
    { header: "EPISODE #", accessor: "episodeNumber" },
    {
      header: "THUMBNAIL",
      render: (row) => (
        <div className="episode-thumbnail">
          {row.videoImage ? (
            <img src={row.videoImage} alt={`Episode ${row.episodeNumber}`} />
          ) : (
            <div className="no-thumbnail">No Image</div>
          )}
        </div>
      ),
    },
    {
      header: "DURATION",
      render: (row) =>
        `${Math.floor(row.duration / 60)}:${(row.duration % 60).toString().padStart(2, "0")}`,
    },
    { header: "COINS", accessor: "coin" },
    {
      header: "LOCKED",
      render: (row) => (
        <Toggle
          checked={row.isLocked}
          onChange={() => handleToggleLock(row.id, row.isLocked)}
        />
      ),
    },
    { header: "RELEASE DATE", accessor: "releaseDate" },
    {
      header: "ACTION",
      render: (row) => (
        <div className="action-buttons">
          <button
            className="action-btn edit-btn"
            onClick={() => handleEdit(row)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            className="action-btn delete-btn"
            onClick={() => handleDelete(row.id)}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="episode-list-page">
      <div className="page-header">
        <h2 className="page-title">Episode List</h2>
        <div className="header-actions">
          <div className="series-selector">
            <select
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className="series-select"
            >
              <option value="">Select Series</option>
              {series.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search episode number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={!selectedSeries}
          >
            <FaPlus /> Add New Episode
          </button>
        </div>
      </div>

      {!selectedSeries ? (
        <div className="empty-state">
          <p>Please select a series to view episodes</p>
        </div>
      ) : loading ? (
        <SkeletonTable rows={5} columns={8} />
      ) : (
        <Table
          columns={columns}
          data={filteredEpisodes}
          emptyMessage="No episodes found for this series"
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentEpisode ? "Edit Episode" : "Add New Episode"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Episode Number *</label>
            <input
              type="number"
              value={formData.episodeNumber}
              onChange={(e) =>
                setFormData({ ...formData, episodeNumber: e.target.value })
              }
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Video URL *</label>
            <input
              type="text"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
              required
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="text"
              value={formData.videoImage}
              onChange={(e) =>
                setFormData({ ...formData, videoImage: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Duration (seconds)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Coins Required</label>
            <input
              type="number"
              value={formData.coin}
              onChange={(e) =>
                setFormData({ ...formData, coin: e.target.value })
              }
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Release Date</label>
            <input
              type="date"
              value={formData.releaseDate}
              onChange={(e) =>
                setFormData({ ...formData, releaseDate: e.target.value })
              }
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isLocked}
                onChange={(e) =>
                  setFormData({ ...formData, isLocked: e.target.checked })
                }
              />
              Locked (requires coins to unlock)
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {currentEpisode ? "Update" : "Create"} Episode
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EpisodeList;

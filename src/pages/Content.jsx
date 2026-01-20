import React, { useState, useEffect, useCallback } from "react";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaLock,
  FaUnlock,
  FaPlay,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaFileAlt,
} from "react-icons/fa";
import Modal from "../components/common/Modal";
import Table from "../components/common/Table";
import { useToast } from "../components/common/Toast";
import { useConfirm } from "../components/common/ConfirmDialog";
import { SkeletonTable } from "../components/common/Loading";
import { episodeAPI, seriesAPI } from "../services/api";
import "./Content.css";

const Episode = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [episodes, setEpisodes] = useState([]);
  const [series, setSeries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeries, setFilterSeries] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(false);

  const [formData, setFormData] = useState({
    seriesId: "",
    title: "",
    description: "",
    episodeNumber: 1,
    requiredPlan: "FREE",
    duration: 0,
    isLocked: false,
    releaseDate: new Date().toISOString().split("T")[0],
    thumbnailFile: null,
    videoFile: null,
  });

  const [uploadProgress, setUploadProgress] = useState({
    thumbnail: 0,
    video: 0,
  });

  const fetchEpisodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await episodeAPI.getAllEpisodes();

      if (response.success && response.data) {
        const episodesData = Array.isArray(response.data)
          ? response.data
          : response.data.episodes || [];
        setEpisodes(episodesData);
        console.log("Episodes loaded:", episodesData.length);
      }
    } catch (error) {
      console.error("Error fetching episodes:", error);
      toast.error("Failed to load episodes");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSeries = useCallback(async () => {
    try {
      setLoadingSeries(true);
      const response = await seriesAPI.getAllSeries();

      if (response.success && response.data) {
        const seriesData = Array.isArray(response.data)
          ? response.data
          : response.data.series || response.data.videoSeries || [];

        const transformedSeries = seriesData.map((item) => ({
          id: item.id,
          name: item.name || "Untitled Series",
          totalEpisodes: item.totalEpisodes || 0,
        }));

        setSeries(transformedSeries);
        console.log("Series loaded:", transformedSeries.length);
      }
    } catch (error) {
      console.error("Error fetching series:", error);
      toast.error("Failed to load series list");
    } finally {
      setLoadingSeries(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEpisodes();
    fetchSeries();
  }, [fetchEpisodes, fetchSeries]);

  const handleAdd = () => {
    setCurrentEpisode(null);
    setFormData({
      seriesId: "",
      title: "",
      description: "",
      episodeNumber: 1,
      requiredPlan: "FREE",
      duration: 0,
      isLocked: false,
      releaseDate: new Date().toISOString().split("T")[0],
      thumbnailFile: null,
      videoFile: null,
    });
    setUploadProgress({ thumbnail: 0, video: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (episode) => {
    setCurrentEpisode(episode);
    setFormData({
      seriesId: episode.seriesId || "",
      title: episode.title || "",
      description: episode.description || "",
      episodeNumber: episode.episodeNumber || 1,
      requiredPlan: episode.requiredPlan || "FREE",
      duration: episode.duration || 0,
      isLocked: episode.isLocked || false,
      releaseDate:
        episode.releaseDate?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      thumbnailFile: null,
      videoFile: null,
    });
    setUploadProgress({ thumbnail: 0, video: 0 });
    setIsModalOpen(true);
  };

  const handleDelete = async (episodeId) => {
    const confirmed = await confirm({
      title: "Delete Episode",
      message:
        "Are you sure you want to delete this episode? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await episodeAPI.deleteEpisode(episodeId);

      if (response.success) {
        setEpisodes(episodes.filter((e) => e.id !== episodeId));
        toast.success("Episode deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete episode");
      }
    } catch (error) {
      console.error("Error deleting episode:", error);
      toast.error("Failed to delete episode");
    }
  };

  const uploadThumbnail = async (file) => {
    try {
      setUploadProgress((prev) => ({ ...prev, thumbnail: 10 }));

      const presignResponse = await episodeAPI.getThumbnailPresignedUrl({
        fileName: file.name,
        contentType: file.type,
      });

      if (!presignResponse.success || !presignResponse.data) {
        throw new Error("Failed to get thumbnail upload URL");
      }

      const { uploadUrl, publicFileUrl, key } = presignResponse.data;
      setUploadProgress((prev) => ({ ...prev, thumbnail: 30 }));

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload thumbnail to S3");
      }

      setUploadProgress((prev) => ({ ...prev, thumbnail: 100 }));

      return { publicFileUrl, key };
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      throw error;
    }
  };

  const uploadVideo = async (file, episodeId) => {
    try {
      setUploadProgress((prev) => ({ ...prev, video: 10 }));

      const presignResponse = await episodeAPI.getVideoPresignedUrl({
        episodeId: episodeId,
        fileName: file.name,
        contentType: file.type,
      });

      if (!presignResponse.success || !presignResponse.data) {
        throw new Error("Failed to get video upload URL");
      }

      const { uploadUrl, publicFileUrl, key } = presignResponse.data;
      setUploadProgress((prev) => ({ ...prev, video: 30 }));

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload video to S3");
      }

      setUploadProgress((prev) => ({ ...prev, video: 100 }));

      return { publicFileUrl, key };
    } catch (error) {
      console.error("Error uploading video:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.seriesId) {
      toast.error("Please select a series");
      return;
    }

    try {
      setUploading(true);

      let thumbnailUrl = currentEpisode?.thumbnail || "";
      let videoUrl = currentEpisode?.videoUrl || "";

      if (formData.thumbnailFile) {
        toast.info("Uploading thumbnail...");
        const thumbnailResult = await uploadThumbnail(formData.thumbnailFile);
        thumbnailUrl = thumbnailResult.publicFileUrl;
      }

      const episodeData = {
        seriesId: formData.seriesId,
        title: formData.title,
        description: formData.description,
        episodeNumber: parseInt(formData.episodeNumber),
        requiredPlan: formData.requiredPlan,
        thumbnail: thumbnailUrl,
        duration: parseInt(formData.duration),
        isLocked: formData.isLocked,
        releaseDate: formData.releaseDate,
      };

      let episodeId = currentEpisode?.id;

      if (currentEpisode) {
        const updateResponse = await episodeAPI.updateEpisode(
          episodeId,
          episodeData,
        );

        if (!updateResponse.success) {
          throw new Error(updateResponse.message || "Failed to update episode");
        }
      } else {
        const createResponse = await episodeAPI.createEpisode(episodeData);

        if (!createResponse.success || !createResponse.data) {
          throw new Error(createResponse.message || "Failed to create episode");
        }

        episodeId = createResponse.data.id;
      }

      if (formData.videoFile && episodeId) {
        toast.info("Uploading video...");
        const videoResult = await uploadVideo(formData.videoFile, episodeId);
        videoUrl = videoResult.publicFileUrl;

        await episodeAPI.updateEpisode(episodeId, {
          ...episodeData,
          videoUrl: videoUrl,
        });
      }

      toast.success(
        currentEpisode
          ? "Episode updated successfully"
          : "Episode created successfully",
      );
      setIsModalOpen(false);
      fetchEpisodes();
    } catch (error) {
      console.error("Error saving episode:", error);
      toast.error(error.message || "Failed to save episode");
    } finally {
      setUploading(false);
      setUploadProgress({ thumbnail: 0, video: 0 });
    }
  };

  const handleToggleLock = async (episodeId, currentStatus) => {
    try {
      const episode = episodes.find((e) => e.id === episodeId);

      const response = await episodeAPI.updateEpisode(episodeId, {
        ...episode,
        isLocked: !currentStatus,
      });

      if (response.success) {
        setEpisodes(
          episodes.map((e) =>
            e.id === episodeId ? { ...e, isLocked: !currentStatus } : e,
          ),
        );
        toast.success(currentStatus ? "Episode unlocked" : "Episode locked");
      }
    } catch (error) {
      console.error("Error toggling lock:", error);
      toast.error("Failed to update lock status");
    }
  };

  const getSeriesName = (seriesId) => {
    const seriesItem = series.find((s) => s.id === seriesId);
    return seriesItem?.name || "Unknown Series";
  };

  const columns = [
    {
      header: "EP #",
      accessor: "episodeNumber",
      width: "70px",
      render: (row) => (
        <div className="episode-number">#{row.episodeNumber}</div>
      ),
    },
    {
      header: "EPISODE",
      render: (row) => (
        <div className="episode-title-cell">
          <div className="episode-thumbnail-small">
            {row.thumbnail ? (
              <img src={row.thumbnail} alt={row.title} />
            ) : (
              <div className="thumbnail-placeholder">
                <FaPlay />
              </div>
            )}
            <div className="duration-badge">{formatDuration(row.duration)}</div>
          </div>
          <div>
            <div className="episode-name">{row.title}</div>
            <div className="episode-meta">{getSeriesName(row.seriesId)}</div>
          </div>
        </div>
      ),
    },
    {
      header: "PLAN",
      accessor: "requiredPlan",
      render: (row) => (
        <span className={`plan-badge ${row.requiredPlan?.toLowerCase()}`}>
          {row.requiredPlan || "FREE"}
        </span>
      ),
    },
    {
      header: "DURATION",
      accessor: "duration",
      render: (row) => formatDuration(row.duration),
    },
    {
      header: "Upload Status",
      accessor: "uploadstatus",
      render: (row) => {
        const getStatusConfig = (status) => {
          const statusLower = status?.toLowerCase() || "";

          if (
            statusLower === "done" ||
            statusLower === "completed" ||
            statusLower === "success"
          ) {
            return {
              icon: <FaCheckCircle />,
              className: "status-done",
              text: "Done",
            };
          }
          if (statusLower === "pending") {
            return {
              icon: <FaClock />,
              className: "status-pending",
              text: "Pending",
            };
          }
          if (statusLower === "processing" || statusLower === "uploading") {
            return {
              icon: <FaSpinner />,
              className: "status-processing",
              text: "Processing",
            };
          }
          if (statusLower === "draft") {
            return {
              icon: <FaFileAlt />,
              className: "status-draft",
              text: "Draft",
            };
          }
          return {
            icon: <FaFileAlt />,
            className: "status-unknown",
            text: status || "Unknown",
          };
        };

        const config = getStatusConfig(row.status);
        return (
          <span className={`upload-status-badge ${config.className}`}>
            {config.icon}
            <span>{config.text}</span>
          </span>
        );
      },
    },
    {
      header: "RELEASE DATE",
      accessor: "releaseDate",
      render: (row) => new Date(row.releaseDate).toLocaleDateString(),
    },
    {
      header: "LOCKED",
      render: (row) => (
        <button
          className={`lock-btn ${row.isLocked ? "locked" : "unlocked"}`}
          onClick={() => handleToggleLock(row.id, row.isLocked)}
          title={row.isLocked ? "Locked" : "Unlocked"}
        >
          {row.isLocked ? <FaLock /> : <FaUnlock />}
        </button>
      ),
    },
    {
      header: "ACTION",
      render: (row) => (
        <div className="action-buttons">
          <button
            className="action-btn view-btn"
            title="View"
            onClick={() => window.open(row.videoUrl, "_blank")}
            disabled={!row.videoUrl}
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

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredEpisodes = episodes.filter((episode) => {
    const matchesSearch =
      episode.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episode.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeries =
      filterSeries === "all" || episode.seriesId === filterSeries;
    return matchesSearch && matchesSeries;
  });

  return (
    <div className="episode-page">
      <div className="page-header">
        <h2 className="page-title">Episodes Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add New Episode
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-card-mini">
          <div className="stat-value">{episodes.length}</div>
          <div className="stat-label">Total Episodes</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-value">
            {episodes.filter((e) => e.isLocked).length}
          </div>
          <div className="stat-label">Locked</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-value">
            {episodes.filter((e) => !e.isLocked).length}
          </div>
          <div className="stat-label">Unlocked</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-value">{series.length}</div>
          <div className="stat-label">Series</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search episodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterSeries === "all" ? "active" : ""}`}
            onClick={() => setFilterSeries("all")}
          >
            All Series ({episodes.length})
          </button>
          {series.map((s) => (
            <button
              key={s.id}
              className={`filter-btn ${filterSeries === s.id ? "active" : ""}`}
              onClick={() => setFilterSeries(s.id)}
            >
              {s.name} ({episodes.filter((e) => e.seriesId === s.id).length})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} columns={7} />
      ) : (
        <Table columns={columns} data={filteredEpisodes} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !uploading && setIsModalOpen(false)}
        title={currentEpisode ? "Edit Episode" : "Add New Episode"}
      >
        <form onSubmit={handleSubmit} className="episode-form">
          <div className="form-group">
            <label className="form-label">Series *</label>
            <select
              className="input-field"
              value={formData.seriesId}
              onChange={(e) =>
                setFormData({ ...formData, seriesId: e.target.value })
              }
              required
              disabled={uploading || loadingSeries}
            >
              <option value="">
                {loadingSeries ? "Loading series..." : "Select Series"}
              </option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{" "}
                  {s.totalEpisodes > 0 && `(${s.totalEpisodes} episodes)`}
                </option>
              ))}
            </select>
            {series.length === 0 && !loadingSeries && (
              <small className="form-hint error-text">
                No series available. Please create a series first.
              </small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Episode Title *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter episode title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="input-field"
              rows="4"
              placeholder="Episode description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={uploading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Episode Number *</label>
              <input
                type="number"
                className="input-field"
                min="1"
                value={formData.episodeNumber}
                onChange={(e) =>
                  setFormData({ ...formData, episodeNumber: e.target.value })
                }
                required
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Required Plan *</label>
              <select
                className="input-field"
                value={formData.requiredPlan}
                onChange={(e) =>
                  setFormData({ ...formData, requiredPlan: e.target.value })
                }
                required
                disabled={uploading}
              >
                <option value="FREE">Free</option>
                <option value="PREMIUM">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Duration (seconds) *</label>
              <input
                type="number"
                className="input-field"
                min="0"
                placeholder="e.g., 2500 for 41:40"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                required
                disabled={uploading}
              />
              <small className="form-hint">
                {formData.duration > 0 &&
                  `≈ ${formatDuration(parseInt(formData.duration))}`}
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Release Date *</label>
              <input
                type="date"
                className="input-field"
                value={formData.releaseDate}
                onChange={(e) =>
                  setFormData({ ...formData, releaseDate: e.target.value })
                }
                required
                disabled={uploading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.isLocked}
                onChange={(e) =>
                  setFormData({ ...formData, isLocked: e.target.checked })
                }
                disabled={uploading}
              />
              <span style={{ marginLeft: "8px" }}>
                Lock this episode (Premium/VIP only)
              </span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">
              Thumbnail Image {!currentEpisode && "*"}
            </label>
            <input
              type="file"
              className="file-input"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, thumbnailFile: e.target.files[0] })
              }
              disabled={uploading}
              required={!currentEpisode}
            />
            <small className="form-hint">
              Recommended: 1080x1920px (9:16 ratio). Max 5MB.
            </small>
            {uploadProgress.thumbnail > 0 && uploadProgress.thumbnail < 100 && (
              <div className="upload-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${uploadProgress.thumbnail}%` }}
                >
                  {uploadProgress.thumbnail}%
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Video File {!currentEpisode && "*"}
            </label>
            <input
              type="file"
              className="file-input"
              accept="video/*"
              onChange={(e) =>
                setFormData({ ...formData, videoFile: e.target.files[0] })
              }
              disabled={uploading}
              required={!currentEpisode}
            />
            <small className="form-hint">
              Recommended: MP4, H.264. Max 500MB.
            </small>
            {uploadProgress.video > 0 && uploadProgress.video < 100 && (
              <div className="upload-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${uploadProgress.video}%` }}
                >
                  {uploadProgress.video}%
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || loadingSeries}
            >
              {uploading
                ? "Uploading..."
                : currentEpisode
                  ? "Update Episode"
                  : "Create Episode"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Episode;

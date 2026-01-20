import React, { useState, useEffect, useCallback } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaImage,
  FaTimes,
  FaFilm,
} from "react-icons/fa";
import Modal from "../components/common/Modal";
import Table from "../components/common/Table";
import { useToast } from "../components/common/Toast";
import { useConfirm } from "../components/common/ConfirmDialog";
import { SkeletonTable } from "../components/common/Loading";
import { seriesAPI, categoryAPI, languageAPI } from "../services/api";
import "./FilmList.css";

const FilmList = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryIds: [],
    languageId: "",
    releaseDate: "",
    isTrending: false,
    isActive: true,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const params = { page: currentPage, limit: itemsPerPage };

      const [seriesResponse, categoriesResponse, languagesResponse] =
        await Promise.all([
          seriesAPI.getAllSeries(params),
          categoryAPI.getAllCategories(),
          languageAPI.getAllLanguages(),
        ]);

      if (seriesResponse.success && seriesResponse.data) {
        const seriesData = Array.isArray(seriesResponse.data)
          ? seriesResponse.data
          : seriesResponse.data.series || seriesResponse.data.videoSeries || [];

        const transformedSeries = seriesData.map((item, index) => ({
          id: item.id,
          uniqueId: item.uniqueId || `#SER${item.id?.substring(0, 6) || index}`,
          name: item.name || "Untitled",
          description: item.description || "",
          categoryIds:
            item.categoryIds || item.categoryId ? [item.categoryId] : [],
          languageId: item.languageId || "",
          banner: item.banner || "",
          thumbnail: item.thumbnail || "",
          releaseDate: item.releaseDate
            ? new Date(item.releaseDate).toLocaleDateString("en-GB")
            : "",
          isTrending: item.isTrending || false,
          isActive: item.isActive !== false,
          totalEpisodes: item.totalEpisodes || 0,
          createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB"),
        }));

        setSeries(transformedSeries);

        const total =
          seriesResponse.data.total ||
          seriesResponse.data.totalSeries ||
          seriesData.length;
        setTotalPages(Math.ceil(total / itemsPerPage));
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data.categories || [];
        setCategories(categoriesData.filter((cat) => cat.isActive !== false));
      }

      if (languagesResponse.success && languagesResponse.data) {
        const languagesData = Array.isArray(languagesResponse.data)
          ? languagesResponse.data
          : languagesResponse.data.languages || [];
        setLanguages(languagesData.filter((lang) => lang.isActive !== false));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [toast, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCategoryNames = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return "N/A";
    const names = categoryIds
      .map((id) => categories.find((cat) => cat.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "N/A";
  };

  const getLanguageName = (languageId) => {
    if (!languageId) return "N/A";
    const language = languages.find((lang) => lang.id === languageId);
    return language?.name || "N/A";
  };

  const handleImageSelect = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "thumbnail") {
        setThumbnailFile(file);
        setThumbnailPreview(reader.result);
      } else {
        setBannerFile(file);
        setBannerPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearImage = (type) => {
    if (type === "thumbnail") {
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setThumbnailUrl(null);
    } else {
      setBannerFile(null);
      setBannerPreview(null);
      setBannerUrl(null);
    }
  };

  const uploadImage = async (file, type) => {
    try {
      const presignResponse =
        type === "thumbnail"
          ? await seriesAPI.getThumbnailUploadUrl({
              fileName: file.name,
              contentType: file.type,
            })
          : await seriesAPI.getBannerUploadUrl({
              fileName: file.name,
              contentType: file.type,
            });

      if (!presignResponse.success || !presignResponse.data) {
        throw new Error(`Failed to get ${type} upload URL`);
      }

      const { uploadUrl, publicS3Url } = presignResponse.data;

      const uploadSuccess = await seriesAPI.uploadToS3(uploadUrl, file);

      if (!uploadSuccess) {
        throw new Error(`Failed to upload ${type}`);
      }

      return publicS3Url;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw error;
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData((prev) => {
      const categoryIds = [...prev.categoryIds];
      const index = categoryIds.indexOf(categoryId);

      if (index > -1) {
        categoryIds.splice(index, 1);
      } else {
        categoryIds.push(categoryId);
      }

      return { ...prev, categoryIds };
    });
  };

  const handleAdd = () => {
    setCurrentSeries(null);
    setFormData({
      name: "",
      description: "",
      categoryIds: [],
      languageId: "",
      releaseDate: "",
      isTrending: false,
      isActive: true,
    });
    clearImage("thumbnail");
    clearImage("banner");
    setIsModalOpen(true);
  };

  const handleEdit = (seriesItem) => {
    setCurrentSeries(seriesItem);
    setFormData({
      name: seriesItem.name,
      description: seriesItem.description,
      categoryIds: seriesItem.categoryIds || [],
      languageId: seriesItem.languageId || "",
      releaseDate: seriesItem.releaseDate,
      isTrending: seriesItem.isTrending,
      isActive: seriesItem.isActive,
    });

    setThumbnailPreview(seriesItem.thumbnail);
    setThumbnailUrl(seriesItem.thumbnail);
    setBannerPreview(seriesItem.banner);
    setBannerUrl(seriesItem.banner);

    setThumbnailFile(null);
    setBannerFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Series",
      message:
        "Are you sure you want to delete this series? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await seriesAPI.deleteSeries(id);

      if (response.success) {
        setSeries(series.filter((item) => item.id !== id));
        toast.success("Series deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete series");
      }
    } catch (error) {
      console.error("Error deleting series:", error);
      toast.error(error.message || "Failed to delete series");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Series name is required");
      return;
    }

    if (formData.categoryIds.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    if (!formData.languageId) {
      toast.error("Please select a language");
      return;
    }

    try {
      setUploading(true);

      let finalThumbnailUrl = thumbnailUrl;
      let finalBannerUrl = bannerUrl;

      if (thumbnailFile) {
        finalThumbnailUrl = await uploadImage(thumbnailFile, "thumbnail");
      }

      if (bannerFile) {
        finalBannerUrl = await uploadImage(bannerFile, "banner");
      }

      const seriesData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryIds: formData.categoryIds,
        languageId: formData.languageId,
        thumbnail: finalThumbnailUrl || "",
        banner: finalBannerUrl || "",
        releaseDate: formData.releaseDate || null,
        isTrending: formData.isTrending,
        isActive: formData.isActive,
      };

      if (currentSeries) {
        seriesData.id = currentSeries.id;
        const response = await seriesAPI.updateSeries(seriesData);

        if (response.success) {
          toast.success("Series updated successfully");
          fetchData();
        } else {
          toast.error(response.message || "Failed to update series");
        }
      } else {
        const response = await seriesAPI.createSeries(seriesData);

        if (response.success) {
          toast.success("Series created successfully");
          fetchData();
        } else {
          toast.error(response.message || "Failed to create series");
        }
      }

      setIsModalOpen(false);
      clearImage("thumbnail");
      clearImage("banner");
    } catch (error) {
      console.error("Error saving series:", error);
      toast.error(error.message || "Failed to save series");
    } finally {
      setUploading(false);
    }
  };

  const filteredSeries = series.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.uniqueId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const numberedSeries = filteredSeries.map((item, index) => ({
    ...item,
    rowNumber: (currentPage - 1) * itemsPerPage + index + 1,
  }));

  const columns = [
    {
      header: "NO",
      accessor: "rowNumber",
      width: "60px",
    },
    {
      header: "THUMBNAIL",
      render: (row) => (
        <div className="series-thumbnail">
          {row.thumbnail ? (
            <img src={row.thumbnail} alt={row.name} />
          ) : (
            <div className="no-image">
              <FaImage />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "BANNER",
      render: (row) => (
        <div className="series-banner-mini">
          {row.banner ? (
            <img src={row.banner} alt={row.name} />
          ) : (
            <div className="no-image">
              <FaFilm />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "SERIES INFO",
      render: (row) => (
        <div className="series-info-cell">
          <div className="series-name">{row.name}</div>
          {row.description && (
            <div className="series-desc">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      header: "CATEGORIES",
      render: (row) => {
        const categoryNames = getCategoryNames(row.categoryIds);
        return (
          <div className="category-badges">
            {categoryNames.split(", ").map((name, idx) => (
              <span key={idx} className="category-badge">
                {name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      header: "LANGUAGE",
      render: (row) => (
        <span className="language-badge">
          {getLanguageName(row.languageId)}
        </span>
      ),
    },
    {
      header: "EPISODES",
      render: (row) => (
        <span className="episode-count">{row.totalEpisodes}</span>
      ),
    },

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
    <div className="film-list-page">
      <div className="page-header">
        <h2 className="page-title">Film / Series List</h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleAdd}>
            <FaPlus /> Add New Series
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} columns={11} />
      ) : (
        <Table
          columns={columns}
          data={numberedSeries}
          emptyMessage="No series found"
        />
      )}

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <span>
            Showing {currentPage} out of {totalPages} pages
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = idx + 1;
              } else if (currentPage <= 3) {
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + idx;
              } else {
                pageNum = currentPage - 2 + idx;
              }

              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className="pagination-btn"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          clearImage("thumbnail");
          clearImage("banner");
        }}
        title={currentSeries ? "Edit Series" : "Add New Series"}
        size="large"
      >
        <form onSubmit={handleSubmit} className="series-form">
          <div className="form-group">
            <label className="form-label">Thumbnail Image *</label>
            <div className="image-upload-section">
              {thumbnailPreview ? (
                <div className="image-preview-container">
                  <div className="image-preview thumbnail-preview">
                    <img src={thumbnailPreview} alt="Thumbnail" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => clearImage("thumbnail")}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect("thumbnail", e)}
                    className="file-input-hidden"
                  />
                  <div className="upload-placeholder">
                    <FaImage className="upload-icon" />
                    <span className="upload-text">Upload Thumbnail</span>
                    <span className="upload-hint">Portrait • Max 5MB</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Banner Image *</label>
            <div className="image-upload-section">
              {bannerPreview ? (
                <div className="image-preview-container">
                  <div className="image-preview banner-preview">
                    <img src={bannerPreview} alt="Banner" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => clearImage("banner")}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect("banner", e)}
                    className="file-input-hidden"
                  />
                  <div className="upload-placeholder">
                    <FaFilm className="upload-icon" />
                    <span className="upload-text">Upload Banner</span>
                    <span className="upload-hint">Landscape • Max 5MB</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Series Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter series name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Categories * (Select Multiple)</label>
            <div className="category-checkboxes">
              {categories.map((cat) => (
                <label key={cat.id} className="category-checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Language *</label>
            <select
              value={formData.languageId}
              onChange={(e) =>
                setFormData({ ...formData, languageId: e.target.value })
              }
              required
            >
              <option value="">Select Language</option>
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter series description"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Release Date</label>
            <input
              type="date"
              value={formData.releaseDate}
              onChange={(e) =>
                setFormData({ ...formData, releaseDate: e.target.value })
              }
            />
          </div>

          <div className="checkbox-row">
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isTrending}
                  onChange={(e) =>
                    setFormData({ ...formData, isTrending: e.target.checked })
                  }
                />
                <span>Mark as Trending</span>
              </label>
            </div>

            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <span>Active Status</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsModalOpen(false);
                clearImage("thumbnail");
                clearImage("banner");
              }}
              disabled={uploading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading
                ? "Uploading..."
                : currentSeries
                  ? "Update Series"
                  : "Create Series"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FilmList;

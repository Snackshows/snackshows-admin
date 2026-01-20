import React, { useState, useEffect, useCallback } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaImage,
  FaTimes,
} from "react-icons/fa";
import Table from "../components/common/Table";
import Toggle from "../components/common/Toggle";
import Modal from "../components/common/Modal";
import { categoryAPI } from "../services/api";
import { useToast } from "../components/common/Toast";
import { useConfirm } from "../components/common/ConfirmDialog";
import { SkeletonTable } from "../components/common/Loading";
import "./FilmCategory.css";

const FilmCategory = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      const response = await categoryAPI.getAllCategories(params);

      if (response.success && response.data) {
        const categoriesData = Array.isArray(response.data)
          ? response.data
          : response.data.categories || [];

        setCategories(categoriesData);
        setFilteredCategories(categoriesData);

        const total =
          response.data.total ||
          response.data.totalCategories ||
          categoriesData.length;
        setTotalPages(Math.ceil(total / itemsPerPage));

        console.log("Categories loaded:", categoriesData.length);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(error.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [currentPage, toast]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter(
      (cat) =>
        cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: null });
  };

  const uploadImage = async (file) => {
    try {
      const presignResponse = await categoryAPI.getThumbnailUploadUrl({
        fileName: file.name,
        contentType: file.type,
      });

      if (!presignResponse.success || !presignResponse.data) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, publicS3Url } = presignResponse.data;

      const uploadSuccess = await categoryAPI.uploadToS3(uploadUrl, file);

      if (!uploadSuccess) {
        throw new Error("Failed to upload image");
      }

      return publicS3Url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleAdd = () => {
    setCurrentCategory(null);
    setFormData({ name: "", description: "", isActive: true, image: null });
    setImagePreview(null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive !== false,
      image: category.image || category.thumbnail,
    });
    setImagePreview(category.image || category.thumbnail);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Category",
      message:
        "Are you sure you want to delete this category? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await categoryAPI.deleteCategory(id);

      if (response.success) {
        setCategories(categories.filter((cat) => cat.id !== id));
        toast.success("Category deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const response = await categoryAPI.changeIsActive({
        id: id,
        isActive: !currentStatus,
      });

      if (response.success) {
        setCategories(
          categories.map((cat) =>
            cat.id === id ? { ...cat, isActive: !currentStatus } : cat,
          ),
        );
        toast.success(
          `Category ${!currentStatus ? "activated" : "deactivated"} successfully`,
        );
      } else {
        toast.error(response.message || "Failed to update category status");
      }
    } catch (error) {
      console.error("Error toggling category:", error);
      toast.error(error.message || "Failed to update category status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setUploading(true);

      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        image: imageUrl || "",
      };

      if (currentCategory) {
        categoryData.id = currentCategory.id;
        const response = await categoryAPI.updateCategory(categoryData);

        if (response.success) {
          toast.success("Category updated successfully");
          fetchCategories();
        } else {
          toast.error(response.message || "Failed to update category");
        }
      } else {
        const response = await categoryAPI.createCategory(categoryData);

        if (response.success) {
          toast.success("Category created successfully");
          fetchCategories();
        } else {
          toast.error(response.message || "Failed to create category");
        }
      }

      setIsModalOpen(false);
      clearImage();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.message || "Failed to save category");
    } finally {
      setUploading(false);
    }
  };

  const numberedCategories = filteredCategories.map((category, index) => ({
    ...category,
    rowNumber: (currentPage - 1) * itemsPerPage + index + 1,
  }));

  const columns = [
    {
      header: "NO",
      accessor: "rowNumber",
      width: "60px",
    },

    {
      header: "CATEGORY IMAGE",
      render: (row) => (
        <div className="category-image">
          {row.image || row.thumbnail ? (
            <img src={row.image || row.thumbnail} alt={row.name} />
          ) : (
            <div className="no-image">
              <FaImage />
            </div>
          )}
        </div>
      ),
    },
    {
      header: "CATEGORY NAME",
      accessor: "name",
      render: (row) => (
        <div className="category-name-cell">
          <div className="category-name">{row.name}</div>
          {row.description && (
            <div className="category-desc">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      header: "TOTAL SERIES",
      render: (row) => (
        <span className="total-count">
          {row.totalSeries || row.totalMovies || 0}
        </span>
      ),
    },
    {
      header: "DATE",
      render: (row) => {
        const date = row.createdAt ? new Date(row.createdAt) : new Date();
        return date.toLocaleDateString("en-GB");
      },
    },
    {
      header: "ACTIVE",
      render: (row) => (
        <Toggle
          checked={row.isActive !== false}
          onChange={() => handleToggle(row.id, row.isActive !== false)}
        />
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
    <div className="film-category-page">
      <div className="page-header">
        <h2 className="page-title">Film Category</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FaPlus /> New Category
        </button>
      </div>

      <div className="search-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={5} columns={8} />
      ) : (
        <Table columns={columns} data={numberedCategories} />
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
          clearImage();
        }}
        title={currentCategory ? "Edit Film Category" : "Add Film Category"}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label className="form-label">Category Image</label>
            <div className="file-input-container">
              {imagePreview ? (
                <div className="preview-wrapper">
                  <div className="preview-image">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={clearImage}
                      title="Remove image"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="file-input-hidden"
                  />
                  <div className="file-input-placeholder">
                    <FaImage className="upload-icon" />
                    <span>Click to upload image</span>
                    <span className="file-hint">Max size: 5MB</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-field"
              placeholder="Enter category description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <span>Active Category</span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setIsModalOpen(false);
                clearImage();
              }}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading}
            >
              {uploading
                ? "Uploading..."
                : currentCategory
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FilmCategory;

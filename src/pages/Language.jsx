import React, { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaGlobe } from "react-icons/fa";
import Table from "../components/common/Table";
import Toggle from "../components/common/Toggle";
import Modal from "../components/common/Modal";
import { languageAPI } from "../services/api";
import { useToast } from "../components/common/Toast";
import { useConfirm } from "../components/common/ConfirmDialog";
import { SkeletonTable } from "../components/common/Loading";
import "./Language.css";

const Language = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [languages, setLanguages] = useState([]);
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
  });

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchLanguages = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      const response = await languageAPI.getAllLanguages(params);

      if (response.success && response.data) {
        const languagesData = Array.isArray(response.data)
          ? response.data
          : response.data.languages || [];

        const transformedLanguages = languagesData.map((lang, index) => ({
          id: lang.id,
          uniqueId:
            lang.uniqueId || `#LANG${(index + 1).toString().padStart(3, "0")}`,
          name: lang.name || "Unnamed",
          isActive: lang.isActive !== false,
          totalSeries: lang.totalseries || lang.totalSeries || 0,
          createdAt: lang.createdAt
            ? new Date(lang.createdAt).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB"),
          updatedAt: lang.updatedAt
            ? new Date(lang.updatedAt).toLocaleDateString("en-GB")
            : "",
        }));

        setLanguages(transformedLanguages);
        setFilteredLanguages(transformedLanguages);

        const total =
          response.data.total ||
          response.data.totalLanguages ||
          languagesData.length;
        setTotalPages(Math.ceil(total / itemsPerPage));

        console.log("Languages loaded:", transformedLanguages.length);
      } else {
        toast.error("Failed to load languages");
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      toast.error(error.message || "Failed to load languages");
    } finally {
      setLoading(false);
    }
  }, [currentPage, toast]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredLanguages(languages);
      return;
    }

    const filtered = languages.filter(
      (lang) =>
        lang.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.uniqueId?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    setFilteredLanguages(filtered);
  }, [searchQuery, languages]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  const handleAdd = () => {
    setCurrentLanguage(null);
    setFormData({ name: "", isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (language) => {
    setCurrentLanguage(language);
    setFormData({
      name: language.name,
      isActive: language.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Language",
      message:
        "Are you sure you want to delete this language? This action cannot be undone.",
      confirmText: "Delete",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const response = await languageAPI.deleteLanguage(id);

      if (response.success) {
        setLanguages(languages.filter((lang) => lang.id !== id));
        toast.success("Language deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete language");
      }
    } catch (error) {
      console.error("Error deleting language:", error);
      toast.error(error.message || "Failed to delete language");
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const response = await languageAPI.setIsActive({
        id: id,
        isActive: !currentStatus,
      });

      if (response.success) {
        setLanguages(
          languages.map((lang) =>
            lang.id === id ? { ...lang, isActive: !currentStatus } : lang,
          ),
        );
        toast.success(
          `Language ${!currentStatus ? "activated" : "deactivated"} successfully`,
        );
      } else {
        toast.error(response.message || "Failed to update language status");
      }
    } catch (error) {
      console.error("Error toggling language:", error);
      toast.error(error.message || "Failed to update language status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Language name is required");
      return;
    }

    try {
      const languageData = {
        name: formData.name.trim(),
        isActive: formData.isActive,
      };

      if (currentLanguage) {
        // Update existing language
        languageData.id = currentLanguage.id;
        const response = await languageAPI.updateLanguage(languageData);

        if (response.success) {
          toast.success("Language updated successfully");
          fetchLanguages();
        } else {
          toast.error(response.message || "Failed to update language");
        }
      } else {
        // Create new language
        const response = await languageAPI.createLanguage(languageData);

        if (response.success) {
          toast.success("Language created successfully");
          fetchLanguages();
        } else {
          toast.error(response.message || "Failed to create language");
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving language:", error);
      toast.error(error.message || "Failed to save language");
    }
  };

  const columns = [
    {
      header: "NO",
      render: (row, index) => (currentPage - 1) * itemsPerPage + index + 1,
      width: "60px",
    },
    {
      header: "UNIQUE ID",
      render: (row) => <span className="unique-id">{row.uniqueId}</span>,
    },
    {
      header: "LANGUAGE NAME",
      render: (row) => (
        <div className="language-name-cell">
          <FaGlobe className="language-icon" />
          <span className="language-name">{row.name}</span>
        </div>
      ),
    },
    {
      header: "TOTAL SERIES",
      render: (row) => (
        <span className="total-series-count">{row.totalSeries}</span>
      ),
    },
    {
      header: "CREATED DATE",
      accessor: "createdAt",
    },
    {
      header: "UPDATED DATE",
      render: (row) => <span>{row.updatedAt || "-"}</span>,
    },
    {
      header: "ACTIVE",
      render: (row) => (
        <Toggle
          checked={row.isActive}
          onChange={() => handleToggle(row.id, row.isActive)}
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
    <div className="language-page">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Language Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleAdd}>
            <FaPlus /> Add Language
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={5} columns={8} />
      ) : (
        <Table
          columns={columns}
          data={filteredLanguages}
          emptyMessage="No languages found"
        />
      )}

      {/* Pagination */}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentLanguage ? "Edit Language" : "Add New Language"}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="language-form">
          {/* Language Name */}
          <div className="form-group">
            <label className="form-label">Language Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="Enter language name (e.g., English, Hindi, Gujarati)"
              required
            />
          </div>

          {/* Active Status */}
          <div className="form-group">
            <label className="form-checkbox">
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

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentLanguage ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Language;

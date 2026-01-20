import React, { useState, useEffect, useCallback } from "react";
import {
  FaCrown,
  FaCheck,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaStar,
  FaBolt,
} from "react-icons/fa";
import { useToast } from "../components/common/Toast";
import { useConfirm } from "../components/common/ConfirmDialog";
import { subscriptionAPI } from "../services/api";
import "./VIPPlan.css";

const VIPPlan = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // const [currentPlan, setCurrentPlan] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    featuresList: [""],
    prices: [
      {
        duration: "",
        price: "",
        comparedPrice: "",
        currency: "USD",
      },
    ],
    isActive: true,
  });

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionAPI.getAllSubscriptions();

      if (response.success) {
        setPlans(response.data || []);
      } else {
        toast.error(response.message || "Failed to fetch subscriptions");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleAddNew = () => {
    setEditMode(false);
    // setCurrentPlan(null);
    setFormData({
      name: "",
      description: "",
      featuresList: [""],
      prices: [
        {
          duration: "",
          price: "",
          comparedPrice: "",
          currency: "USD",
        },
      ],
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = async (plan) => {
    try {
      const response = await subscriptionAPI.getSubscriptionById(plan.id);

      if (response.success) {
        const planData = response.data;
        setEditMode(true);
        // setCurrentPlan(planData);

        setFormData({
          id: planData.id,
          name: planData.name,
          description: planData.description,
          featuresList: planData.features.map((f) => f.label),
          prices: planData.prices.map((p) => ({
            duration: p.duration,
            price: p.price,
            comparedPrice: p.comparedPrice,
            currency: p.currency,
          })),
          isActive: planData.isActive,
        });

        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
      toast.error("Failed to load plan details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (formData.featuresList.filter((f) => f.trim()).length === 0) {
      toast.error("At least one feature is required");
      return;
    }

    if (formData.prices.length === 0) {
      toast.error("At least one price is required");
      return;
    }

    const cleanData = {
      ...formData,
      featuresList: formData.featuresList.filter((f) => f.trim()),
      prices: formData.prices.filter((p) => p.duration && p.price),
    };

    try {
      let response;

      if (editMode) {
        response = await subscriptionAPI.updateSubscription(cleanData);
      } else {
        response = await subscriptionAPI.createSubscription(cleanData);
      }

      if (response.success) {
        toast.success(
          response.message ||
            `Subscription ${editMode ? "updated" : "created"} successfully`,
        );
        setShowModal(false);
        fetchSubscriptions();
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving subscription:", error);
      toast.error(error.message || "Failed to save subscription");
    }
  };

  const handleDelete = async (planId, planName) => {
    const confirmed = await confirm({
      title: "Delete Subscription Plan",
      message: `Are you sure you want to delete "${planName}"? This action cannot be undone.`,
    });

    if (confirmed) {
      try {
        const response = await subscriptionAPI.deleteSubscription(planId);

        if (response.success) {
          toast.success("Subscription deleted successfully");
          fetchSubscriptions();
        } else {
          toast.error(response.message || "Failed to delete subscription");
        }
      } catch (error) {
        console.error("Error deleting subscription:", error);
        toast.error("Failed to delete subscription");
      }
    }
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      featuresList: [...prev.featuresList, ""],
    }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      featuresList: prev.featuresList.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      featuresList: prev.featuresList.map((f, i) => (i === index ? value : f)),
    }));
  };

  const addPrice = () => {
    setFormData((prev) => ({
      ...prev,
      prices: [
        ...prev.prices,
        {
          duration: "",
          price: "",
          comparedPrice: "",
          currency: "USD",
        },
      ],
    }));
  };

  const removePrice = (index) => {
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.filter((_, i) => i !== index),
    }));
  };

  const updatePrice = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      prices: prev.prices.map((p, i) =>
        i === index ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const getPlanIcon = (planName) => {
    const name = planName?.toLowerCase() || "";
    if (name.includes("premium") || name.includes("pro")) return <FaCrown />;
    if (name.includes("basic") || name.includes("starter")) return <FaStar />;
    if (name.includes("ultimate") || name.includes("enterprise"))
      return <FaBolt />;
    return <FaStar />;
  };

  const getPlanGradient = (index) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    ];
    return gradients[index % gradients.length];
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const calculateSavings = (price, comparedPrice) => {
    if (!comparedPrice || comparedPrice <= price) return 0;
    return (((comparedPrice - price) / comparedPrice) * 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="vip-plan-page">
        <div className="loading-container">
          <div className="modern-spinner"></div>
          <p className="loading-text">Loading your subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vip-plan-page">
      <div className="page-header-modern">
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="page-title-modern">
              {/* <FaCrown className="title-icon" />
              VIP Subscription Plans */}
            </h1>
            <p className="page-subtitle">
              Manage your subscription tiers and pricing
            </p>
          </div>
          <button
            className="btn-modern btn-primary-modern"
            onClick={handleAddNew}
          >
            <FaPlus /> Add New Plan
          </button>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state-modern">
          <div className="empty-icon">
            <FaCrown />
          </div>
          <h3>No Subscription Plans Yet</h3>
          <p>
            Create your first subscription plan to start offering premium
            content to your users
          </p>
          <button
            className="btn-modern btn-primary-modern"
            onClick={handleAddNew}
          >
            <FaPlus /> Create Your First Plan
          </button>
        </div>
      ) : (
        <div className="plans-grid-modern">
          {plans.map((plan, index) => {
            const primaryPrice = plan.prices && plan.prices[0];
            const savingsPercent = primaryPrice
              ? calculateSavings(primaryPrice.price, primaryPrice.comparedPrice)
              : 0;

            return (
              <div
                key={plan.id}
                className={`plan-card-modern ${!plan.isActive ? "inactive-plan" : ""}`}
                style={{ "--card-gradient": getPlanGradient(index) }}
              >
                {/* Card Header with Gradient */}
                <div className="plan-card-header">
                  <div className="plan-icon-wrapper">
                    {getPlanIcon(plan.name)}
                  </div>
                  <span
                    className={`status-pill ${plan.isActive ? "active" : "inactive"}`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Plan Name */}
                <h3 className="plan-name-modern">{plan.name}</h3>

                {/* Plan Description */}
                <p className="plan-description-modern">{plan.description}</p>

                {/* Pricing Section */}
                {primaryPrice && (
                  <div className="pricing-section-modern">
                    <div className="price-main">
                      <span className="currency-symbol">
                        {primaryPrice.currency === "USD" ? "$" : "€"}
                      </span>
                      <span className="price-amount">{primaryPrice.price}</span>
                      <span className="price-period">
                        /{primaryPrice.duration}{" "}
                        {primaryPrice.duration > 1 ? "months" : "month"}
                      </span>
                    </div>

                    {primaryPrice.comparedPrice > primaryPrice.price && (
                      <div className="price-compared">
                        <span className="original-price">
                          {formatCurrency(
                            primaryPrice.comparedPrice,
                            primaryPrice.currency,
                          )}
                        </span>
                        {savingsPercent > 0 && (
                          <span className="savings-badge">
                            Save {savingsPercent}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Pricing Tiers */}
                {plan.prices && plan.prices.length > 1 && (
                  <div className="additional-prices">
                    <p className="pricing-options-title">Available Options:</p>
                    {plan.prices.map((price, idx) => (
                      <div key={idx} className="price-option-item">
                        <span className="option-duration">
                          {price.duration}{" "}
                          {price.duration > 1 ? "months" : "month"}
                        </span>
                        <span className="option-price">
                          {formatCurrency(price.price, price.currency)}
                        </span>
                        {price.comparedPrice > price.price && (
                          <span className="option-savings">
                            -
                            {calculateSavings(price.price, price.comparedPrice)}
                            %
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Features List */}
                <div className="features-section-modern">
                  <h4 className="features-title">What's Included:</h4>
                  <ul className="features-list-modern">
                    {plan.features &&
                      plan.features.slice(0, 5).map((feature, idx) => (
                        <li key={feature.id || idx}>
                          <FaCheck className="feature-check" />
                          <span>{feature.label}</span>
                        </li>
                      ))}
                    {plan.features && plan.features.length > 5 && (
                      <li className="more-features">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="card-actions-modern">
                  <button
                    className="btn-modern btn-edit"
                    onClick={() => handleEdit(plan)}
                    title="Edit Plan"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="btn-modern btn-delete"
                    onClick={() => handleDelete(plan.id, plan.name)}
                    title="Delete Plan"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay-modern"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-container-modern"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-modern">
              <h3>
                {editMode
                  ? "Edit Subscription Plan"
                  : "Create New Subscription Plan"}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-modern">
              <div className="form-section-modern">
                <h4 className="section-title-modern">Basic Information</h4>

                <div className="form-group-modern">
                  <label>Plan Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Premium, Basic, Ultimate"
                    required
                  />
                </div>

                <div className="form-group-modern">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe this subscription plan"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group-modern checkbox-group">
                  <label className="checkbox-label-modern">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    <span>Active Plan</span>
                  </label>
                </div>
              </div>

              <div className="form-section-modern">
                <div className="section-header-modern">
                  <h4 className="section-title-modern">Features</h4>
                  <button
                    type="button"
                    className="btn-modern btn-add-small"
                    onClick={addFeature}
                  >
                    <FaPlus /> Add Feature
                  </button>
                </div>

                <div className="features-input-list">
                  {formData.featuresList.map((feature, index) => (
                    <div key={index} className="feature-input-row">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Enter feature"
                      />
                      {formData.featuresList.length > 1 && (
                        <button
                          type="button"
                          className="btn-modern btn-remove-small"
                          onClick={() => removeFeature(index)}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section-modern">
                <div className="section-header-modern">
                  <h4 className="section-title-modern">Pricing Tiers</h4>
                  <button
                    type="button"
                    className="btn-modern btn-add-small"
                    onClick={addPrice}
                  >
                    <FaPlus /> Add Price
                  </button>
                </div>

                <div className="prices-input-list">
                  {formData.prices.map((price, index) => (
                    <div key={index} className="price-input-card">
                      <div className="price-card-header">
                        <h5>Price Tier {index + 1}</h5>
                        {formData.prices.length > 1 && (
                          <button
                            type="button"
                            className="btn-modern btn-remove-small"
                            onClick={() => removePrice(index)}
                          >
                            <FaTimes /> Remove
                          </button>
                        )}
                      </div>

                      <div className="price-inputs-row">
                        <div className="form-group-modern">
                          <label>Duration (months) *</label>
                          <input
                            type="number"
                            min="1"
                            value={price.duration}
                            onChange={(e) =>
                              updatePrice(
                                index,
                                "duration",
                                parseInt(e.target.value) || "",
                              )
                            }
                            placeholder="e.g., 1, 3, 12"
                            required
                          />
                        </div>

                        <div className="form-group-modern">
                          <label>Price *</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price.price}
                            onChange={(e) =>
                              updatePrice(
                                index,
                                "price",
                                parseFloat(e.target.value) || "",
                              )
                            }
                            placeholder="e.g., 9.99"
                            required
                          />
                        </div>
                      </div>

                      <div className="price-inputs-row">
                        <div className="form-group-modern">
                          <label>Compared Price</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price.comparedPrice}
                            onChange={(e) =>
                              updatePrice(
                                index,
                                "comparedPrice",
                                parseFloat(e.target.value) || "",
                              )
                            }
                            placeholder="e.g., 19.99"
                          />
                        </div>

                        <div className="form-group-modern">
                          <label>Currency</label>
                          <select
                            value={price.currency}
                            onChange={(e) =>
                              updatePrice(index, "currency", e.target.value)
                            }
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="INR">INR (₹)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer-modern">
                <button
                  type="button"
                  className="btn-modern btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modern btn-primary-modern">
                  {editMode ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VIPPlan;

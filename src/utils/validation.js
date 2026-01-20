/**
 * Form Validation Utilities
 * Production-ready validation helpers
 */

// Email validation
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!regex.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

// Password validation
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false,
  } = options;

  if (!password) {
    return 'Password is required';
  }

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long`;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (requireNumber && !/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return '';
};

// Required field validation
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return '';
  } catch {
    return 'Please enter a valid URL';
  }
};

// Phone number validation
export const validatePhone = (phone) => {
  const regex = /^[\d\s\-+()]+$/;
  if (!phone) {
    return 'Phone number is required';
  }
  if (!regex.test(phone) || phone.length < 10) {
    return 'Please enter a valid phone number';
  }
  return '';
};

// Number validation
export const validateNumber = (value, { min, max } = {}) => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  
  if (min !== undefined && num < min) {
    return `Value must be at least ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `Value must not exceed ${max}`;
  }
  
  return '';
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [],
  } = options;

  if (!file) {
    return 'Please select a file';
  }

  if (file.size > maxSize) {
    return `File size must not exceed ${Math.round(maxSize / 1024 / 1024)}MB`;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }

  return '';
};

// Date validation
export const validateDate = (date, { min, max } = {}) => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Please enter a valid date';
  }
  
  if (min && dateObj < new Date(min)) {
    return `Date must be after ${new Date(min).toLocaleDateString()}`;
  }
  
  if (max && dateObj > new Date(max)) {
    return `Date must be before ${new Date(max).toLocaleDateString()}`;
  }
  
  return '';
};

// Match validation (for password confirmation)
export const validateMatch = (value1, value2, fieldName = 'Fields') => {
  if (value1 !== value2) {
    return `${fieldName} do not match`;
  }
  return '';
};

// Length validation
export const validateLength = (value, { min, max } = {}) => {
  const length = value ? value.length : 0;
  
  if (min !== undefined && length < min) {
    return `Must be at least ${min} characters`;
  }
  
  if (max !== undefined && length > max) {
    return `Must not exceed ${max} characters`;
  }
  
  return '';
};

// Array validation
export const validateArray = (arr, { minLength, maxLength } = {}) => {
  if (!Array.isArray(arr)) {
    return 'Invalid array';
  }
  
  if (minLength !== undefined && arr.length < minLength) {
    return `Must have at least ${minLength} items`;
  }
  
  if (maxLength !== undefined && arr.length > maxLength) {
    return `Must not exceed ${maxLength} items`;
  }
  
  return '';
};

// Sanitize input (remove dangerous characters)
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

// Validate entire form
export const validateForm = (values, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = values[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Example usage:
/*
const validationRules = {
  email: [validateRequired, validateEmail],
  password: [
    validateRequired,
    (value) => validatePassword(value, { minLength: 8, requireNumber: true })
  ],
  phone: [validatePhone],
  age: [(value) => validateNumber(value, { min: 18, max: 100 })],
};

const { isValid, errors } = validateForm(formData, validationRules);
*/

export default {
  validateEmail,
  validatePassword,
  validateRequired,
  validateURL,
  validatePhone,
  validateNumber,
  validateFile,
  validateDate,
  validateMatch,
  validateLength,
  validateArray,
  sanitizeInput,
  validateForm,
};

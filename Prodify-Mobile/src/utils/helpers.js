// Utility helper functions for Prodify Mobile

/**
 * Format a date for display in Portuguese format
 * @param {Date|string|object} dateValue - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export const formatDate = (dateValue, includeTime = false) => {
  if (!dateValue) return '-';

  let date;

  // Handle Firestore timestamps
  if (dateValue._seconds) {
    date = new Date(dateValue._seconds * 1000);
  } else if (dateValue.seconds) {
    date = new Date(dateValue.seconds * 1000);
  } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    date = new Date(dateValue);
  } else if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    return '-';
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '-';
  }

  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return date.toLocaleDateString('pt-PT', options);
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param {Date|string|object} dateValue - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';

  let date;

  if (dateValue._seconds) {
    date = new Date(dateValue._seconds * 1000);
  } else if (dateValue.seconds) {
    date = new Date(dateValue.seconds * 1000);
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
};

/**
 * Calculate days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number|null} Number of days or null
 */
export const calculateDaysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return null;
  }

  const diffTime = Math.abs(end - start);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return Number(diffDays.toFixed(1));
};

/**
 * Check if a date is in the past
 * @param {Date|string} dateValue - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isDateInPast = (dateValue) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const now = new Date();

  return date < now;
};

/**
 * Get relative time description
 * @param {Date|string} dateValue - Date to describe
 * @returns {string} Relative time description
 */
export const getRelativeTime = (dateValue) => {
  if (!dateValue) return '-';

  const date = new Date(dateValue);
  const now = new Date();

  if (isNaN(date.getTime())) return '-';

  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays === -1) return 'Amanhã';
  if (diffDays > 0 && diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 0 && diffDays > -7) return `Em ${Math.abs(diffDays)} dias`;

  return formatDate(date);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password é obrigatória' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password deve ter pelo menos 6 caracteres' };
  }
  return { isValid: true, message: '' };
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format number with decimal places
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (num, decimals = 1) => {
  if (num === null || num === undefined) return '-';
  return Number(num).toFixed(decimals);
};

/**
 * Get state display name in Portuguese
 * @param {string} state - State code (ToDo, Doing, Done)
 * @returns {string} Portuguese state name
 */
export const getStateDisplayName = (state) => {
  const stateNames = {
    'ToDo': 'A Fazer',
    'Doing': 'Em Curso',
    'Done': 'Concluído',
  };
  return stateNames[state] || state || '-';
};

/**
 * Get state color
 * @param {string} state - State code
 * @returns {string} Hex color code
 */
export const getStateColor = (state) => {
  const stateColors = {
    'ToDo': '#3498db',
    'Doing': '#f39c12',
    'Done': '#27ae60',
  };
  return stateColors[state] || '#95a5a6';
};

/**
 * Get department display name
 * @param {string} department - Department code
 * @returns {string} Department name
 */
export const getDepartmentDisplayName = (department) => {
  const departments = {
    'IT': 'IT',
    'Marketing': 'Marketing',
    'Administração': 'Administração',
  };
  return departments[department] || department || '-';
};

/**
 * Get experience level display name in Portuguese
 * @param {string} level - Experience level code
 * @returns {string} Portuguese experience level name
 */
export const getExperienceLevelDisplayName = (level) => {
  const levels = {
    'Junior': 'Júnior',
    'Senior': 'Sénior',
  };
  return levels[level] || level || '-';
};

/**
 * Get user role display name in Portuguese
 * @param {boolean} isManager - Whether user is manager
 * @returns {string} Role name
 */
export const getRoleDisplayName = (isManager) => {
  return isManager ? 'Gestor' : 'Programador';
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export default {
  formatDate,
  formatDateForInput,
  calculateDaysBetween,
  isDateInPast,
  getRelativeTime,
  isValidEmail,
  validatePassword,
  truncateText,
  getInitials,
  capitalizeFirst,
  formatNumber,
  getStateDisplayName,
  getStateColor,
  getDepartmentDisplayName,
  getExperienceLevelDisplayName,
  getRoleDisplayName,
  debounce,
  deepClone,
  isEmpty,
  generateId,
};

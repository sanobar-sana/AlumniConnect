/**
 * Combines multiple CSS class names into a single string.
 * Helpful for conditional tailwind styling.
 * @param {...(string|boolean|undefined|null)} classes 
 * @returns {string}
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Formats a Date object or ISO string into a readable format.
 * @param {Date|string} dateVal 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export const formatDate = (dateVal, includeTime = false) => {
  if (!dateVal) return '';
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return '';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Returns the initials for a given user name.
 * @param {string} name 
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Truncates a string to a specified length and appends an ellipsis.
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Simulates a delay (useful for testing loaders).
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  cn,
  formatDate,
  getInitials,
  truncateText,
  delay
};

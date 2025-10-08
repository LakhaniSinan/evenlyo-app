// Utility functions

export const formatDate = (date, format = 'short') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    default:
      return dateObj.toLocaleDateString();
  }
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = password => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const debounce = (func, wait) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;

  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getInitials = name => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const calculateTime = messageDate => {
  const now = moment();
  const messageTime = moment(messageDate, 'MM-DD-YYYY h:mm A');
  const duration = moment.duration(now.diff(messageTime));
  const secondsAgo = duration.asSeconds();
  const minutesAgo = duration.asMinutes();
  const hoursAgo = duration.asHours();

  if (secondsAgo < 60) {
    return 'Just now';
  } else if (minutesAgo < 2) {
    return '1 min ago';
  } else if (minutesAgo < 60) {
    return `${Math.floor(minutesAgo)} mins ago`;
  } else if (hoursAgo < 24) {
    return `${Math.floor(hoursAgo)} hours ago`;
  } else if (hoursAgo < 48) {
    return '1 day ago';
  } else if (hoursAgo < 72) {
    return '2 days ago';
  } else {
    return messageTime.format('DD/MM/YYYY');
  }
};

export const findMajorityRating = reviews => {
  let highestRating = 0;

  reviews?.forEach(review => {
    const rating = review.rating;
    if (rating > highestRating) {
      highestRating = rating;
    }
  });

  return highestRating;
};

export const calculateRatingsPercentage = (reviews, star) => {
  const totalReviews = reviews.length;
  const starCount = reviews.filter(
    review => Math.floor(review.rating) === star,
  ).length;
  const percentage = (starCount / totalReviews) * 100;
  return {starCount, percentage};
};

// utils/formatRelativeTime.js

export function formatRelativeTime(isoDateString) {
  if (!isoDateString) return '';

  const date = new Date(isoDateString);
  const now = new Date();
  const diffMs = now - date; // milliseconds
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;

  if (diffDay === 1) return 'Yesterday';

  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}
export const getDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) {
    return {distance: '0 km away'};
  }

  const toRad = value => (value * Math.PI) / 180;

  const R = 6371;
  const lat1 = coords1.latitude;
  const lon1 = coords1.longitude;
  const lat2 = coords2.latitude;
  const lon2 = coords2.longitude;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // ✅ Distance in KM

  return {
    distance: d.toFixed(2),
  };
};

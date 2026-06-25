// Utility functions

import moment from "moment";

const DAY_KEY_ALIASES = {
  mon: 'mon',
  monday: 'mon',
  maandag: 'mon',
  tue: 'tue',
  tues: 'tue',
  tuesday: 'tue',
  dinsdag: 'tue',
  wed: 'wed',
  wednesday: 'wed',
  woensdag: 'wed',
  thu: 'thu',
  thur: 'thu',
  thurs: 'thu',
  thursday: 'thu',
  donderdag: 'thu',
  fri: 'fri',
  friday: 'fri',
  vrijdag: 'fri',
  sat: 'sat',
  saturday: 'sat',
  zaterdag: 'sat',
  sun: 'sun',
  sunday: 'sun',
  zondag: 'sun',
};

const normalizeDayKey = day => {
  const key = String(day || '').trim().toLowerCase();
  return DAY_KEY_ALIASES[key] || null;
};

const ALL_WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const getDayKeyFromMoment = dateMoment => {
  const isoDay = dateMoment.isoWeekday();
  return ALL_WEEK_DAYS[isoDay - 1] || null;
};

export const resolveAvailableDays = (availability, fallbackDays) => {
  if (availability == null) {
    return [...ALL_WEEK_DAYS];
  }

  const days = availability?.availableDays ?? fallbackDays;
  if (!Array.isArray(days) || days.length === 0) {
    return [...ALL_WEEK_DAYS];
  }

  return days.map(normalizeDayKey).filter(Boolean);
};

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

const NL_PRICE_FORMATTER = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NL_PRICE_FORMATTER_WHOLE = new Intl.NumberFormat('nl-NL', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Netherlands number format: 1.000,00 */
export const formatPrice = (amount, options = {}) => {
  const {decimals = 2} = options;
  const value = Number(amount) || 0;
  if (decimals === 0) {
    return NL_PRICE_FORMATTER_WHOLE.format(value);
  }
  return NL_PRICE_FORMATTER.format(value);
};

/** Netherlands euro display: € 1.000,00 */
export const formatEuro = (amount, options = {}) => {
  const {space = true, decimals = 2} = options;
  const formatted = formatPrice(amount, {decimals});
  return space ? `€ ${formatted}` : `€${formatted}`;
};

/** Parse display/API price strings back to a number (supports nl-NL and plain numbers). */
export const parsePrice = value => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const str = String(value ?? '').trim().replace(/[€\s]/g, '');
  if (!str) {
    return 0;
  }

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  let normalized = str;
  if (hasComma && hasDot) {
    // nl-NL: 1.800,50
    normalized = str.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    // 1800,50
    normalized = str.replace(',', '.');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(Number(amount) || 0);
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
  if (text.length <= maxLength) {return text;}
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
  if (!isoDateString) {return '';}

  const date = new Date(isoDateString);
  const now = new Date();
  const diffMs = now - date; // milliseconds
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) {return 'Just now';}
  if (diffMin < 60) {return `${diffMin} min ago`;}
  if (diffHr < 24) {return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;}

  if (diffDay === 1) {return 'Yesterday';}

  if (diffDay < 7) {return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;}

  return date.toLocaleDateString();
}
export const getDistance = (coords1, coords2) => {
  if (!coords1 || !coords2) {
    return {distance: '0'};
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

export const getInitialMarkedDates = (availableDays, referenceDate = moment()) => {
  const marked = {};
  const start = referenceDate.clone();
  const end = referenceDate.clone().add(6, 'months');
  const normalizedDays = (availableDays || []).map(normalizeDayKey).filter(Boolean);
  const availableDaysSet = new Set(normalizedDays);

  for (let m = start.clone(); m.isBefore(end); m.add(1, 'day')) {
    const dayName = getDayKeyFromMoment(m);
    const dateStr = m.format('YYYY-MM-DD');
    const isPast = m.isBefore(referenceDate, 'day');
    const isAvailable = availableDaysSet.has(dayName);

    marked[dateStr] =
      isPast || !isAvailable
        ? {
            disabled: true,
            disableTouchEvent: true,
            customStyles: {
              container: {backgroundColor: '#f0f0f0'},
              text: {color: '#999'},
            },
          }
        : {
            disabled: false,
            customStyles: {
              container: {backgroundColor: '#fff'},
              text: {color: '#000'},
            },
          };
  }

  return marked;
};

export const calculateAvailableDaysWithHours = ({
  startDate,
  endDate,
  startTime,
  endTime,
  availableDays = [],
  defaultHoursPerDay = 10,
}) => {
  if (!startDate) {
    return {
      totalSelectedDays: 0,
      availableSelectedDays: 0,
      hoursPerDay: 0,
      totalHours: 0,
      availableDates: [],
      unavailableDates: [],
    };
  }

  const start = moment(startDate);
  const end = endDate ? moment(endDate) : moment(startDate);
  const normalizedDays = (availableDays || []).map(normalizeDayKey).filter(Boolean);
  const availableDaysSet = new Set(normalizedDays);

  let totalSelectedDays = 0;
  let availableSelectedDays = 0;
  let availableDates = [];
  let unavailableDates = [];

  let curr = start.clone();

  // ---- HOURS PER DAY ----
  let hoursPerDay = defaultHoursPerDay;

  // Single day → calculate from time
  if (start.isSame(end, 'day') && startTime && endTime) {
    hoursPerDay = moment(endTime).diff(moment(startTime), 'hours', true);
  }

  while (curr.isSameOrBefore(end)) {
    totalSelectedDays++;

    const dayName = getDayKeyFromMoment(curr);
    const dateStr = curr.format('YYYY-MM-DD');

    if (availableDaysSet.has(dayName)) {
      availableSelectedDays++;
      availableDates.push(dateStr);
    } else {
      unavailableDates.push(dateStr);
    }

    curr.add(1, 'day');
  }

  const totalHours = availableSelectedDays * hoursPerDay;

  return {
    totalSelectedDays,
    availableSelectedDays,
    hoursPerDay,
    totalHours,
    availableDates,
    unavailableDates,
  };
};

export const getTimeAgoStatus = (createdAt) => {
  if (!createdAt) return '';

  const now = moment();
  const created = moment(createdAt);

  const minutes = now.diff(created, 'minutes');
  const hours = now.diff(created, 'hours');
  const days = now.diff(created, 'days');
  const weeks = now.diff(created, 'weeks');
  const months = now.diff(created, 'months');
  const years = now.diff(created, 'years');

  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} mins ago`;

  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;

  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;

  if (weeks === 1) return '1 week ago';
  if (weeks < 4) return `${weeks} weeks ago`;

  if (months === 1) return 'Last month';
  if (months < 12) return `${months} months ago`;

  if (years === 1) return 'Last year';
  return `${years} years ago`;
};

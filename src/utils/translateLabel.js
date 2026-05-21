const LABEL_ALIASES = {
  Cancel: 'cancel',
  Submit: 'submit',
  Continue: 'continue',
  Back: 'back',
  OK: 'ok',
  'Add To Wishlist': 'addToWishlistButton',
  'Send Booking Request': 'sendBookingRequest',
  Direction: 'Get Directions',
  Recived: 'Received',
  'Extra Time Fee': 'extraTimeFee',
  'Security Deposit(Refundable)': 'securityDepositRefundable',
  'Total Cost': 'Total Cost',
  'Upfront Paid': 'Upfront Paid',
  'Upfront Amount': 'Upfront Amount',
  'Total Paid Amount': 'Total Paid Amount',
  Remaining: 'Remaining',
};

export const findTranslationKey = (key, i18n) => {
  if (!key || typeof key !== 'string') {
    return null;
  }

  const trimmed = key.trim();
  if (trimmed.length <= 1) {
    return null;
  }

  const candidates = [trimmed, LABEL_ALIASES[trimmed], trimmed.toLowerCase()].filter(
    Boolean,
  );

  for (const candidate of [...new Set(candidates)]) {
    if (i18n.exists(candidate)) {
      return candidate;
    }
  }

  return null;
};

export const translateLabel = (key, t, i18n) => {
  const resolvedKey = findTranslationKey(key, i18n);
  if (resolvedKey) {
    return t(resolvedKey);
  }
  return key;
};

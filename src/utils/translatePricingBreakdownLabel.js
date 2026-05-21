import {findTranslationKey} from './translateLabel';

const PRICING_LABEL_PATTERNS = [
  {
    regex: /^Base Service \((\d+) days?\)$/i,
    key: 'baseServiceWithDays',
    params: ([, days]) => ({days}),
  },
  {
    regex: /^Standard Service \((\d+(?:\.\d+)?) hours?\)$/i,
    key: 'standardServiceHours',
    params: ([, hours]) => ({hours}),
  },
  {
    regex: /^Standard Service \((\d+) days?\)$/i,
    key: 'baseServiceWithDays',
    params: ([, days]) => ({days}),
  },
  {
    regex: /^Multi-day Service \((\d+) days? × (\d+(?:\.\d+)?)h\)$/i,
    key: 'multiDayService',
    params: ([, days, hours]) => ({days, hours}),
  },
  {
    regex: /^Extra Time Fee$/i,
    key: 'extraTimeFee',
  },
  {
    regex: /^Extra Time Cost$/i,
    key: 'Extra Time Cost',
  },
  {
    regex: /^Travel Cost \(([\d.]+)\s*km\)$/i,
    key: 'travelCostWithDistance',
    params: ([, distance]) => ({distance}),
  },
  {
    regex: /^VAT Fee \(([\d.]+)%\)$/i,
    key: 'vatFeeWithPercent',
    params: ([, percent]) => ({percent}),
  },
  {
    regex: /^VAT \(([\d.]+)%\)$/i,
    key: 'vatWithPercent',
    params: ([, percent]) => ({percent}),
  },
  {
    regex: /^Security Deposit\s*\(Refundable\)$/i,
    key: 'securityDepositRefundable',
  },
  {
    regex: /^Platform Service Fee \(([\d.]+)%\)$/i,
    key: 'platformServiceFeeWithPercent',
    params: ([, percent]) => ({percent}),
  },
  {
    regex: /^Evenlyo Protect \(([\d.]+)%\)$/i,
    key: 'evenlyoProtectWithPercent',
    params: ([, percent]) => ({percent}),
  },
  {
    regex: /^Extra Time \(([\d.]+) hours? × €([\d.]+)\)$/i,
    key: 'extraTimeWithRate',
    params: ([, hours, rate]) => ({hours, rate}),
  },
  {
    regex: /^Subtotal$/i,
    key: 'Subtotal',
  },
  {
    regex: /^Evenlyo Protect Fee \(([\d.]+)%\)$/i,
    key: 'evenlyoProtectWithPercent',
    params: ([, percent]) => ({percent}),
  },
];

const normalizeStatusKey = status =>
  String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

export {normalizeStatusKey};

export const translatePricingBreakdownLabel = (label, t, i18n) => {
  if (label == null || String(label).trim() === '') {
    return t('notAvailable');
  }

  const trimmed = String(label).trim();
  const exactKey = findTranslationKey(trimmed, i18n);
  if (exactKey) {
    return t(exactKey);
  }

  for (const pattern of PRICING_LABEL_PATTERNS) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      const params = pattern.params ? pattern.params(match) : undefined;
      if (i18n.exists(pattern.key)) {
        return t(pattern.key, params);
      }
      if (typeof pattern.key === 'string' && pattern.key.includes(' ')) {
        const nestedKey = findTranslationKey(pattern.key, i18n);
        if (nestedKey) {
          return t(nestedKey, params);
        }
      }
    }
  }

  return trimmed;
};

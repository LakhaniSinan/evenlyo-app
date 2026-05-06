/**
 * `id` = backend `permissions[].module` slug (must match API).
 * `label` = display name aligned with web admin + vendor app screen titles.
 */
export const DESIGNATION_MODULE_OPTIONS = [
  {id: 'dashboard', label: 'Dashboard'},
  {id: 'listing_management', label: 'Listing Management'},
  {id: 'booking_analytics', label: 'Booking Analytics'},
  {id: 'tracking', label: 'Tracking'},
  {id: 'stock_management', label: 'Stock Management'},
  {id: 'analytics_reports', label: 'Analytics & Report'},
  {id: 'chat', label: 'Messages'},
  {id: 'notifications', label: 'Notifications'},
];

const norm = s =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/');

/** Label for table chips / UI (from API module slug or legacy label). */
export const getPermissionChipLabel = moduleKey => {
  const n = norm(moduleKey);
  if (!n) {
    return '';
  }
  const byId = DESIGNATION_MODULE_OPTIONS.find(m => norm(m.id) === n);
  if (byId) {
    return byId.label;
  }
  const byLabel = DESIGNATION_MODULE_OPTIONS.find(m => norm(m.label) === n);
  if (byLabel) {
    return byLabel.label;
  }
  return String(moduleKey).replace(/_/g, ' ');
};

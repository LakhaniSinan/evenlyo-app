import {endPoints, requestType} from '../constants/Variable';
import {
  DESIGNATION_MODULE_OPTIONS,
  getPermissionChipLabel,
} from '../constants/vendorDesignationModules';
import Api from './index';

const MODULE_COUNT = DESIGNATION_MODULE_OPTIONS.length;

export const createVendorDesignation = payload => {
  return Api(endPoints.vendorCreateDesignation, payload, requestType.POST);
};

export const fetchVendorDesignations = vendorId => {
  return Api(endPoints.vendorFetchDesignations(vendorId), null, requestType.GET);
};

/**
 * Body sent to POST /vendor/update-designation/:designationId
 */
export const updateVendorDesignation = async (designationId, payload) => {
  const path = endPoints.vendorUpdateDesignation(designationId);
  const res = await Api(path, payload, requestType.PUT);
  if (res?.status === 405) {
    return Api(path, payload, requestType.POST);
  }
  return res;
};

export const deleteVendorDesignation = designationId => {
  return Api(
    endPoints.vendorDeleteDesignation(designationId),
    null,
    requestType.DELETE,
  );
};

const normKey = s =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/');

/** Map API permission entries to checkbox state keyed by DESIGNATION_MODULE_OPTIONS ids. */
export const buildPermissionMapFromApiItem = item => {
  const map = Object.fromEntries(
    DESIGNATION_MODULE_OPTIONS.map(m => [m.id, false]),
  );
  const alias = {};
  for (const m of DESIGNATION_MODULE_OPTIONS) {
    alias[normKey(m.id)] = m.id;
    alias[normKey(m.label)] = m.id;
  }
  const LEGACY_TO_ID = [
    ['Dashboard', 'dashboard'],
    ['Booking Items', 'listing_management'],
    ['Listings', 'listing_management'],
    ['Listing Management', 'listing_management'],
    ['All Listings', 'listing_management'],
    ['Calendar', 'booking_analytics'],
    ['Bookings', 'booking_analytics'],
    ['Booking Analytics', 'booking_analytics'],
    ['All Bookings', 'booking_analytics'],
    ['Tracking', 'tracking'],
    ['Order Tracking', 'tracking'],
    ['Stock', 'stock_management'],
    ['Stock Management', 'stock_management'],
    ['Analytics', 'analytics_reports'],
    ['Analytics Reports', 'analytics_reports'],
    ['Analytics & Report', 'analytics_reports'],
    ['Inbox / Chat', 'chat'],
    ['Chat', 'chat'],
    ['Messages', 'chat'],
    ['Notifications', 'notifications'],
  ];
  for (const [legacy, id] of LEGACY_TO_ID) {
    alias[normKey(legacy)] = id;
  }
  const assign = raw => {
    const n = normKey(raw);
    if (n && alias[n]) {
      map[alias[n]] = true;
    }
  };

  const perms = item?.permissions ?? item?.modulePermissions ?? item?.modules;

  if (Array.isArray(perms)) {
    for (const p of perms) {
      if (typeof p === 'string' || typeof p === 'number') {
        assign(p);
      } else if (p && typeof p === 'object') {
        if (p.canView === false && p.canEdit === false) {
          continue;
        }
        if (p.enabled === false || p.hasAccess === false) {
          continue;
        }
        assign(
          p.module ??
            p.name ??
            p.label ??
            p.moduleName ??
            p.title ??
            p.key ??
            p.id,
        );
      }
    }
    return map;
  }

  if (perms && typeof perms === 'object') {
    for (const [k, v] of Object.entries(perms)) {
      if (v === true || v === 1 || v === '1' || v === 'true') {
        assign(k);
      }
    }
  }

  return map;
};

export const extractDesignationsList = response => {
  const body = response?.data;
  if (Array.isArray(body)) {
    return body;
  }
  const root = body?.data !== undefined ? body.data : body;
  if (Array.isArray(root)) {
    return root;
  }
  if (Array.isArray(root?.designations)) {
    return root.designations;
  }
  if (Array.isArray(root?.items)) {
    return root.items;
  }
  if (Array.isArray(root?.results)) {
    return root.results;
  }
  return [];
};

const permissionToChipLabel = p => {
  if (typeof p === 'string') {
    return getPermissionChipLabel(p);
  }
  if (p && typeof p === 'object') {
    const key = p.module ?? p.name ?? p.label ?? p.title ?? p.id;
    return key ? getPermissionChipLabel(key) : '';
  }
  return '';
};

export const mapApiDesignationToRow = item => {
  const id = String(item?._id ?? item?.id ?? item?.designationId ?? '');
  const name = String(
    item?.designationName ?? item?.name ?? item?.title ?? item?.label ?? '—',
  ).trim();
  const perms = item?.permissions ?? item?.modulePermissions ?? [];
  const total = Array.isArray(perms) ? perms.length : 0;

  const permissionChips = Array.isArray(perms)
    ? [...new Set(perms.map(permissionToChipLabel).filter(Boolean))]
    : [];

  const code = String(
    item?.designationCode ??
      item?.code ??
      item?.badgeCode ??
      item?.shortCode ??
      item?.referenceId ??
      '',
  ).trim();

  let allAccess = '—';
  if (item?.allAccess === true || item?.allAccess === 'Yes') {
    allAccess = 'Yes';
  } else if (typeof item?.allAccess === 'string' && item.allAccess) {
    allAccess = item.allAccess;
  } else if (total >= MODULE_COUNT) {
    allAccess = 'Yes';
  } else if (total > 0) {
    allAccess = 'Partial';
  } else {
    allAccess = 'No';
  }

  const statusRaw = item?.status ?? item?.isActive ?? item?.active;
  let status = '—';
  if (statusRaw === true || statusRaw === 'active' || statusRaw === 'Active') {
    status = 'Active';
  } else if (
    statusRaw === false ||
    statusRaw === 'inactive' ||
    statusRaw === 'Inactive'
  ) {
    status = 'Inactive';
  } else if (item?.statusLabel != null) {
    status = String(item.statusLabel);
  }

  const dateSrc = item?.createdAt ?? item?.updatedAt ?? item?.created_at;
  const dateObj = dateSrc ? new Date(dateSrc) : null;
  const pad = n => String(n).padStart(2, '0');
  const date =
    dateObj && !Number.isNaN(dateObj.getTime())
      ? `${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()}, ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`
      : '—';

  return {
    id: id || `tmp-${name}-${date}`,
    name,
    code,
    date,
    dateSort: dateObj ? dateObj.getTime() : 0,
    allAccess,
    permissionChips,
    status,
    raw: item,
  };
};

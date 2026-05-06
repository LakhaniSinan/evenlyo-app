import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {
  deleteVendorDesignation,
  extractDesignationsList,
  fetchVendorDesignations,
  mapApiDesignationToRow,
} from '../../../services/VendorDesignation';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];
const TABLE_HEADER_BG = '#FDF2F6';
const TABLE_HEADER_TEXT = '#B0107A';
const CHIP_BG = '#DCFCE7';
const CHIP_TEXT = '#166534';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const VendorRoleManagementScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {user} = useSelector(state => state.LoginSlice);
  const vendorId = user?.id ?? user?._id ?? user?.vendorDetails?._id;
  const [mainTab, setMainTab] = useState('designation');
  const [search, setSearch] = useState('');
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [desPage, setDesPage] = useState(1);
  const [desPageSize, setDesPageSize] = useState(10);
  const [pageSizeModal, setPageSizeModal] = useState(false);
  const modalRef = useRef(null);

  const reloadDesignations = useCallback(async () => {
    if (!vendorId) {
      return;
    }
    setListLoading(true);
    try {
      const res = await fetchVendorDesignations(vendorId);
      if (res?.status === 200 || res?.status === 201) {
        const list = extractDesignationsList(res);
        setDesignations(list.map(mapApiDesignationToRow));
      } else {
        const msg = res?.data?.message ?? res?.data?.error;
        if (typeof msg === 'string') {
          Alert.alert('Error', msg);
        }
      }
    } finally {
      setListLoading(false);
    }
  }, [vendorId]);

  useFocusEffect(
    useCallback(() => {
      const submittedRole = route.params?.submittedRole;
      if (submittedRole) {
        setRoles(prev => [...prev, submittedRole]);
        navigation.setParams({submittedRole: undefined});
      }
      reloadDesignations();
    }, [navigation, route.params?.submittedRole, reloadDesignations]),
  );

  const isDesignationTab = mainTab === 'designation';

  const designationFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return designations;
    }
    return designations.filter(r => {
      const name = String(r?.name || '').toLowerCase();
      const code = String(r?.code || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [designations, search]);

  const roleFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return roles;
    }
    return roles.filter(r => {
      const name = String(r?.name || r?.title || '').toLowerCase();
      return name.includes(q);
    });
  }, [roles, search]);

  const filteredRows = isDesignationTab ? designationFiltered : roleFiltered;

  const totalDes = designationFiltered.length;
  const totalDesPages = Math.max(1, Math.ceil(totalDes / desPageSize));

  useEffect(() => {
    setDesPage(1);
  }, [search, designations.length, mainTab]);

  useEffect(() => {
    if (desPage > totalDesPages) {
      setDesPage(totalDesPages);
    }
  }, [desPage, totalDesPages]);

  const paginatedDesignationRows = useMemo(() => {
    const start = (desPage - 1) * desPageSize;
    return designationFiltered.slice(start, start + desPageSize);
  }, [designationFiltered, desPage, desPageSize]);

  const displayRows = isDesignationTab
    ? paginatedDesignationRows
    : filteredRows;

  const emptyMessage = isDesignationTab
    ? 'No designations found.'
    : 'No roles found.';

  const createLabel = isDesignationTab
    ? '+ Create New Designation'
    : '+ Create New Role';

  const sectionTitle = isDesignationTab ? 'All Designations' : 'All Roles';

  const showingFrom = totalDes === 0 ? 0 : (desPage - 1) * desPageSize + 1;
  const showingTo = Math.min(desPage * desPageSize, totalDes);

  const runDeleteDesignation = useCallback(
    async row => {
      if (!row?.id) {
        return;
      }
      setDeletingId(row.id);
      try {
        const res = await deleteVendorDesignation(row.id);
        if (res?.status === 200 || res?.status === 201) {
          await reloadDesignations();
        } else {
          const msg = res?.data?.message ?? res?.data?.error;
          modalRef.current?.show({
            status: 'error',
            message:
              typeof msg === 'string' ? msg : 'Could not delete designation.',
          });
        }
      } catch {
        modalRef.current?.show({
          status: 'error',
          message: 'Network error. Try again.',
        });
      } finally {
        setDeletingId(null);
      }
    },
    [reloadDesignations],
  );

  const confirmDeleteDesignation = row => {
    if (!row?.id) {
      return;
    }
    modalRef.current?.show({
      status: 'alert',
      message: `Are you sure you want to delete "${row.name}"? This cannot be undone.`,
      handlePressOk: () => {
        runDeleteDesignation(row).catch(() => {});
      },
    });
  };

  const openEditDesignation = row => {
    if (!row?.raw) {
      return;
    }
    navigation.navigate('CreateVendorDesignation', {
      mode: 'edit',
      designation: row.raw,
    });
  };

  const renderPermissionChips = chips => {
    const list = Array.isArray(chips) ? chips : [];
    if (!list.length) {
      return (
        <Text style={styles.chipEmpty}>—</Text>
      );
    }
    return (
      <View style={styles.chipWrap}>
        {list.map((label, i) => (
          <View key={`${label}-${i}`} style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderDesignationRow = row => {
    const isActive = String(row.status).toLowerCase() === 'active';
    return (
      <View
        key={row.id}
        style={[styles.desRow, !isActive && styles.desRowInactive]}>
        <Text
          style={[
            styles.desColDateWidth,
            styles.desDateValue,
            !isActive && styles.desTextInactiveMuted,
          ]}>
          {row.date || '—'}
        </Text>
        <View style={styles.desColName}>
          <Text
            style={[
              styles.desNamePrimary,
              !isActive && styles.desNamePrimaryInactive,
            ]}
            numberOfLines={2}>
            {row.name || '—'}
          </Text>
          {row.code ? (
            <Text
              style={[
                styles.desNameCode,
                !isActive && styles.desTextInactiveMuted,
              ]}>
              {row.code}
            </Text>
          ) : null}
        </View>
        <View style={styles.desColAccess}>
          {renderPermissionChips(row.permissionChips)}
        </View>
        <View style={styles.desColStatus}>
          <View
            style={[
              styles.statusBadge,
              !isActive && styles.statusBadgeInactive,
            ]}>
            <Text
              style={[
                styles.statusBadgeText,
                !isActive && styles.statusBadgeTextInactive,
              ]}>
              {row.status || '—'}
            </Text>
          </View>
        </View>
        <View style={[styles.desColActionsHeader, styles.desColActionsRow]}>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => openEditDesignation(row)}
            disabled={!!deletingId}>
            <Icon
              name="create-outline"
              size={19}
              color={isActive ? COLORS.navyBlue : '#C2410C'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={8}
            onPress={() => confirmDeleteDesignation(row)}
            disabled={!!deletingId}>
            <Icon name="trash-outline" size={19} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRoleRow = (row, idx) => (
    <View key={row.id || idx} style={styles.dataRow}>
      <Text style={[styles.td, styles.colDate]}>{row.date || '—'}</Text>
      <Text style={[styles.td, styles.colName]} numberOfLines={2}>
        {row.name || row.title || '—'}
      </Text>
      <Text style={[styles.td, styles.colAccess]}>
        {row.allAccess != null ? String(row.allAccess) : '—'}
      </Text>
      <Text style={[styles.td, styles.colStatus]}>{row.status || '—'}</Text>
      <View style={[styles.td, styles.colActions]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        backgroundColor={COLORS.white}
        headingText="Role Management"
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() =>
          navigation.navigate('Dashboard', {
            screen: 'Home',
            params: {screen: 'Notifications'},
          })
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageSubtitle}>
          Create, update, and manage user roles and their permissions within the
          platform.
        </Text>

        <View style={styles.pillTabs}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.pillTabOuter}
            onPress={() => setMainTab('designation')}>
            {isDesignationTab ? (
              <LinearGradient
                colors={GRADIENT_COLORS}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.pillTabInner}>
                <Text style={styles.pillTabTextActive}>Set Designation</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.pillTabInner, styles.pillTabInactive]}>
                <Text style={styles.pillTabTextInactive}>Set Designation</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.pillTabOuter}
            onPress={() => setMainTab('roles')}>
            {!isDesignationTab ? (
              <LinearGradient
                colors={GRADIENT_COLORS}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.pillTabInner}>
                <Text style={styles.pillTabTextActive}>Manage Roles</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.pillTabInner, styles.pillTabInactive]}>
                <Text style={styles.pillTabTextInactive}>Manage Roles</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.searchWrap}>
            <Icon name="search" size={18} color={COLORS.textLight} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search..."
              placeholderTextColor={COLORS.textLight}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.createBtnWrap}
            onPress={() => {
              if (isDesignationTab) {
                navigation.navigate('CreateVendorDesignation', {});
              } else {
                navigation.navigate('CreateVendorRole', {
                  designationOptions: designations.map(d => ({
                    id: d.id,
                    name: d.name,
                  })),
                });
              }
            }}>
            <LinearGradient
              colors={GRADIENT_COLORS}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.createBtn}>
              <Text style={styles.createBtnText} numberOfLines={1}>
                {createLabel}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{sectionTitle}</Text>

        <View style={styles.tableCard}>
          {isDesignationTab ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                bounces={false}
                contentContainerStyle={styles.desScrollInner}>
                <View style={styles.desTableMin}>
                  <View style={styles.desHeaderRow}>
                    <Text style={[styles.th, styles.desColDateWidth]}>
                      DATE & TIME
                    </Text>
                    <Text style={[styles.th, styles.desColName]}>
                      DESIGNATION NAME
                    </Text>
                    <Text style={[styles.th, styles.desColAccess]}>
                      ALL ACCESS
                    </Text>
                    <Text style={[styles.th, styles.desColStatus]}>STATUS</Text>
                    <Text style={[styles.th, styles.desColActionsHeader]}>
                      ACTIONS
                    </Text>
                  </View>
                  {displayRows.length === 0 ? (
                    <View style={styles.emptyBodyDes}>
                      <Text style={styles.emptyText}>{emptyMessage}</Text>
                    </View>
                  ) : (
                    displayRows.map(renderDesignationRow)
                  )}
                </View>
              </ScrollView>
              {isDesignationTab && totalDes > 0 ? (
                <View style={[styles.tableFooter, styles.tableFooterCenter]}>
                  <Text style={styles.footerHint}>
                    Showing {showingFrom} to {showingTo} of {totalDes}{' '}
                    designations
                  </Text>
                  <View style={styles.footerRight}>
                    <TouchableOpacity
                      style={styles.pageSizeBtn}
                      onPress={() => setPageSizeModal(true)}>
                      <Text style={styles.pageSizeBtnText}>
                        Show {desPageSize}
                      </Text>
                      <Icon
                        name="chevron-down"
                        size={14}
                        color={COLORS.textDark}
                      />
                    </TouchableOpacity>
                    <View style={styles.pager}>
                      <TouchableOpacity
                        style={[
                          styles.pagerNav,
                          desPage <= 1 && styles.pagerNavDisabled,
                        ]}
                        disabled={desPage <= 1}
                        onPress={() => setDesPage(p => Math.max(1, p - 1))}>
                        <Text
                          style={[
                            styles.pagerNavText,
                            desPage <= 1 && styles.pagerNavTextDisabled,
                          ]}>
                          Previous
                        </Text>
                      </TouchableOpacity>
                      <LinearGradient
                        colors={GRADIENT_COLORS}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={styles.pagerPageActive}>
                        <Text style={styles.pagerPageActiveText}>
                          {desPage}
                        </Text>
                      </LinearGradient>
                      <TouchableOpacity
                        style={[
                          styles.pagerNav,
                          desPage >= totalDesPages && styles.pagerNavDisabled,
                        ]}
                        disabled={desPage >= totalDesPages}
                        onPress={() =>
                          setDesPage(p => Math.min(totalDesPages, p + 1))
                        }>
                        <Text
                          style={[
                            styles.pagerNavText,
                            desPage >= totalDesPages &&
                              styles.pagerNavTextDisabled,
                          ]}>
                          Next
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tableMin}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.th, styles.colDate]}>DATE & TIME</Text>
                  <Text style={[styles.th, styles.colName]}>ROLE NAME</Text>
                  <Text style={[styles.th, styles.colAccess]}>PERMISSIONS</Text>
                  <Text style={[styles.th, styles.colStatus]}>STATUS</Text>
                  <View style={[styles.th, styles.colActions, styles.thActions]}>
                    <Text style={styles.thInline}>ACTIONS</Text>
                  </View>
                </View>
                {displayRows.length === 0 ? (
                  <View style={styles.emptyBody}>
                    <Text style={styles.emptyText}>{emptyMessage}</Text>
                  </View>
                ) : (
                  displayRows.map(renderRoleRow)
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={pageSizeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setPageSizeModal(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setPageSizeModal(false)}
          />
          <View style={styles.pageSizeSheet}>
            <Text style={styles.pageSizeTitle}>Rows per page</Text>
            {PAGE_SIZE_OPTIONS.map(n => (
              <TouchableOpacity
                key={n}
                style={styles.pageSizeRow}
                onPress={() => {
                  setDesPageSize(n);
                  setDesPage(1);
                  setPageSizeModal(false);
                }}>
                <Text style={styles.pageSizeRowText}>{n}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pageSizeCancel}
              onPress={() => setPageSizeModal(false)}>
              <Text style={styles.pageSizeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CommonAlert ref={modalRef} />
      <Loader isLoading={listLoading || !!deletingId} />
    </SafeAreaView>
  );
};

export default VendorRoleManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width(4),
    paddingBottom: width(10),
    paddingTop: width(2),
    backgroundColor: COLORS.white,
  },
  pageSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginBottom: width(4),
  },
  pillTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: width(4),
  },
  pillTabOuter: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  pillTabInner: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTabInactive: {
    backgroundColor: '#ECEEF4',
  },
  pillTabTextActive: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  pillTabTextInactive: {
    color: COLORS.textDark,
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginBottom: width(4),
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EFEFF4',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    padding: 0,
    fontSize: 14,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  createBtnWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  createBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: width(2),
  },
  tableCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFF4',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  desScrollInner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
  },
  desTableMin: {
    minWidth: 560,
    alignSelf: 'center',
  },
  desHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TABLE_HEADER_BG,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },
  desRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    backgroundColor: COLORS.white,
  },
  desRowInactive: {
    backgroundColor: '#FFFBFB',
  },
  desNamePrimaryInactive: {
    color: '#B91C1C',
  },
  desTextInactiveMuted: {
    color: '#9F1239',
  },
  desColDateWidth: {
    width: 104,
    paddingRight: 4,
  },
  desDateValue: {
    fontSize: 10,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    textAlign: 'center',
  },
  desColName: {
    width: 118,
    paddingRight: 6,
    alignItems: 'center',
  },
  desColAccess: {
    width: 200,
    paddingRight: 6,
    alignItems: 'center',
  },
  desColStatus: {
    width: 76,
    alignItems: 'center',
  },
  desColActionsHeader: {
    width: 76,
    textAlign: 'center',
  },
  desColActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  th: {
    fontSize: 8,
    letterSpacing: 0.15,
    color: TABLE_HEADER_TEXT,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    textAlign: 'center',
  },
  desNamePrimary: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    textAlign: 'center',
  },
  desNameCode: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    textAlign: 'center',
  },
  chipWrap: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
  },
  chip: {
    backgroundColor: CHIP_BG,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: '100%',
  },
  chipText: {
    fontSize: 9,
    color: CHIP_TEXT,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    textAlign: 'center',
  },
  chipEmpty: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  statusBadge: {
    alignSelf: 'center',
    backgroundColor: CHIP_BG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10,
    color: CHIP_TEXT,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  statusBadgeTextInactive: {
    color: '#B91C1C',
  },
  tableFooter: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    backgroundColor: COLORS.white,
  },
  tableFooterCenter: {
    alignItems: 'center',
  },
  footerHint: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pageSizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
  },
  pageSizeBtnText: {
    fontSize: 11,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pagerNav: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pagerNavDisabled: {
    opacity: 0.45,
  },
  pagerNavText: {
    fontSize: 11,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  pagerNavTextDisabled: {
    color: COLORS.textLight,
  },
  pagerPageActive: {
    minWidth: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  pagerPageActiveText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: width(8),
  },
  pageSizeSheet: {
    width: '100%',
    maxWidth: 320,
    zIndex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 8,
  },
  pageSizeTitle: {
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pageSizeRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },
  pageSizeRowText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  pageSizeCancel: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  pageSizeCancelText: {
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 15,
  },
  tableMin: {
    minWidth: width(100),
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TABLE_HEADER_BG,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  thInline: {
    fontSize: 10,
    letterSpacing: 0.3,
    color: TABLE_HEADER_TEXT,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    marginRight: 4,
  },
  thActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colDate: {width: 100},
  colName: {width: 130, paddingRight: 6},
  colAccess: {width: 88},
  colStatus: {width: 72},
  colActions: {width: 88},
  emptyBodyDes: {
    minHeight: 100,
    width: '100%',
    minWidth: width(88),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    alignSelf: 'center',
  },
  emptyBody: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },
  td: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});

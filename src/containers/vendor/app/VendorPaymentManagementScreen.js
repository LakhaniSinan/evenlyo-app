import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {formatPrice} from '../../../utils';
import {
  disburseVendorPayments,
  getPayoutOrders,
} from '../../../services/VendorPaymentManagement';
import {vendorStripeOnboardingStatus} from '../../../services/VendorStripe';
import moment from 'moment';

const getOrderId = order => {
  return order?.trackingId;
};

const getOrderAmount = order => Number(order?.amount) || 0;

const getPaymentStatus = order => String(order?.status || '').toLowerCase();

const getEscrowDate = order =>
  order?.escrowEndsAt || order?.escrowEndDate || order?.escrowTime || null;

const normalizeOrdersFromResponse = body => {
  const raw = body?.data || body || {};
  if (
    Array.isArray(raw?.readyToPayOrders) ||
    Array.isArray(raw?.pendingOrders) ||
    Array.isArray(raw?.paidOrders)
  ) {
    return {
      readyToPayOrders: Array.isArray(raw?.readyToPayOrders)
        ? raw.readyToPayOrders
        : [],
      pendingOrders: Array.isArray(raw?.pendingOrders) ? raw.pendingOrders : [],
      paidOrders: Array.isArray(raw?.paidOrders) ? raw.paidOrders : [],
      stripeOnboarded: raw?.stripeOnboarded === true,
    };
  }
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.orders)) return raw.orders;
  if (Array.isArray(raw?.results)) return raw.results;
  const merged = [
    ...(Array.isArray(raw?.readyToPay) ? raw.readyToPay : []),
    ...(Array.isArray(raw?.pending) ? raw.pending : []),
    ...(Array.isArray(raw?.completed) ? raw.completed : []),
  ];
  return merged;
};

const VendorPaymentManagementScreen = () => {
  const navigation = useNavigation();
  const {user} = useSelector(state => state.LoginSlice);
  const VENDOR_ID = user?.id;

  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ready');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [readyOrdersApi, setReadyOrdersApi] = useState([]);

  const [pendingOrdersApi, setPendingOrdersApi] = useState([]);
  const [paidOrdersApi, setPaidOrdersApi] = useState([]);
  console.log(
    paidOrdersApi,
    'readyOrdersApireadyOrdersApireadyOrdersApireadyOrdersApi',
  );
  const [stripeConnected, setStripeConnected] = useState(false);
  const alertRef = useRef(null);
  const fetchScreenData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, stripeRes] = await Promise.all([
        getPayoutOrders(VENDOR_ID),
        vendorStripeOnboardingStatus(),
      ]);

      if (ordersRes?.status === 200 || ordersRes?.status === 201) {
        const fetchedOrders = normalizeOrdersFromResponse(ordersRes?.data);
        if (
          fetchedOrders &&
          typeof fetchedOrders === 'object' &&
          Array.isArray(fetchedOrders?.readyToPayOrders)
        ) {
          setReadyOrdersApi(fetchedOrders.readyToPayOrders);
          setPendingOrdersApi(fetchedOrders.pendingOrders || []);
          setPaidOrdersApi(fetchedOrders.paidOrders || []);
          setOrders([
            ...(fetchedOrders.readyToPayOrders || []),
            ...(fetchedOrders.pendingOrders || []),
            ...(fetchedOrders.paidOrders || []),
          ]);
          if (fetchedOrders.stripeOnboarded === true) {
            setStripeConnected(true);
          }
        } else {
          setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
          setReadyOrdersApi([]);
          setPendingOrdersApi([]);
          setPaidOrdersApi([]);
        }
      } else {
        setOrders([]);
        setReadyOrdersApi([]);
        setPendingOrdersApi([]);
        setPaidOrdersApi([]);
      }

      const stripeData = stripeRes?.data?.data ?? stripeRes?.data ?? {};
      const isConnected =
        stripeRes?.data?.onboarded === true ||
        stripeData?.connected === true ||
        stripeData?.onboarded === true ||
        stripeData?.onboardingComplete === true ||
        stripeData?.onboarding_complete === true ||
        stripeData?.charges_enabled === true ||
        stripeData?.chargesEnabled === true ||
        stripeData?.payoutsEnabled === true ||
        stripeData?.payouts_enabled === true ||
        stripeData?.details_submitted === true ||
        stripeData?.detailsSubmitted === true ||
        stripeData?.account?.payouts_enabled === true ||
        stripeData?.account?.charges_enabled === true;
      setStripeConnected(isConnected);
    } catch (error) {
      setOrders([]);
      setStripeConnected(false);
    } finally {
      setLoading(false);
    }
  }, [VENDOR_ID]);

  useFocusEffect(
    useCallback(() => {
      fetchScreenData();
    }, [fetchScreenData]),
  );

  const now = new Date();

  const readyToPayOrders = useMemo(() => {
    if (
      readyOrdersApi.length ||
      pendingOrdersApi.length ||
      paidOrdersApi.length
    ) {
      return readyOrdersApi;
    }
    return orders.filter(order => {
      const paymentStatus = getPaymentStatus(order);
      const escrowDate = getEscrowDate(order);
      const escrowEnded = escrowDate ? new Date(escrowDate) <= now : false;
      return paymentStatus === 'pending' && escrowEnded;
    });
  }, [orders, now, readyOrdersApi, pendingOrdersApi, paidOrdersApi]);

  const pendingOrders = useMemo(() => {
    if (
      readyOrdersApi.length ||
      pendingOrdersApi.length ||
      paidOrdersApi.length
    ) {
      return pendingOrdersApi;
    }
    return orders.filter(order => {
      const paymentStatus = getPaymentStatus(order);
      const escrowDate = getEscrowDate(order);
      const escrowNotEnded = escrowDate ? new Date(escrowDate) > now : false;
      return paymentStatus === 'pending' || escrowNotEnded;
    });
  }, [orders, now, readyOrdersApi, pendingOrdersApi, paidOrdersApi]);

  const completedOrders = useMemo(() => {
    if (
      readyOrdersApi.length ||
      pendingOrdersApi.length ||
      paidOrdersApi.length
    ) {
      return paidOrdersApi;
    }
    return orders.filter(
      order =>
        getPaymentStatus(order) === 'paid' ||
        getPaymentStatus(order) === 'completed',
    );
  }, [orders, readyOrdersApi, pendingOrdersApi, paidOrdersApi]);

  const activeOrders = useMemo(() => {
    if (activeTab === 'ready') return readyToPayOrders;
    if (activeTab === 'pending') return pendingOrders;
    return completedOrders;
  }, [activeTab, readyToPayOrders, pendingOrders, completedOrders]);

  const selectedOrders = readyToPayOrders.filter(order =>
    selectedOrderIds.includes(getOrderId(order)),
  );
  const selectedTotal = selectedOrders.reduce(
    (sum, order) => sum + getOrderAmount(order),
    0,
  );

  const toggleOrderSelection = useCallback(orderId => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId],
    );
  }, []);

  const getPaymentStatusLabel = useCallback(
    status => {
      const s = String(status || 'pending').toLowerCase();
      if (s === 'paid') {
        return t('Paid');
      }
      if (s === 'completed') {
        return t('Completed');
      }
      if (s === 'pending') {
        return t('Pending');
      }
      const raw = String(status || '').trim();
      return raw || t('Pending');
    },
    [t],
  );

  const canPayout =
    stripeConnected && selectedOrderIds.length > 0 && activeTab === 'ready';

  const handlePaySelected = async () => {
    if (!stripeConnected) {
      alertRef.current.show(
        'error',
        t('vendorPaymentStripeRequiredTitle'),
        t('vendorPaymentConnectStripeFirst'),
      );
      return;
      s;
    }
    if (!selectedOrderIds.length) {
      alertRef.current.show(
        'error',
        t('vendorPaymentSelectOrdersTitle'),
        t('vendorPaymentSelectOneOrder'),
      );
      return;
    }

    const payload = {
      trackingIds: selectedOrderIds,
      amount: Number(selectedTotal),
    };

    try {
      setLoading(true);
      const response = await disburseVendorPayments(VENDOR_ID, payload);

      if (response?.status === 200 || response?.status === 201) {
        setSelectedOrderIds([]);
        fetchScreenData();
      } else {
        alertRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerrorerror');
    } finally {
      setLoading(false);
    }
  };
  const renderOrderCard = useCallback(
    order => {
      const orderId = getOrderId(order);
      const amount = getOrderAmount(order);
      const paymentStatus = getPaymentStatus(order);
      const escrowDate = getEscrowDate(order);
      const escrowEnded = escrowDate ? new Date(escrowDate) <= now : false;

      const isSelected = selectedOrderIds.includes(orderId);

      const serviceName =
        order?.serviceName?.en || order?.serviceName?.nl || '-';

      const shouldShowCheckbox =
        order?.status !== 'complain' ||
        !!order?.claimDetails?.refundVendorAmount;

      return (
        <View key={orderId} style={styles.orderCard}>
          {/* Header */}

          <View style={styles.orderTopStrip}>
            <View style={{flex: 1}}>
              <Text style={styles.orderId}>{order?.trackingId}</Text>

              <Text style={styles.serviceName}>{serviceName}</Text>
            </View>

            {shouldShowCheckbox && activeTab === 'ready' && (
              <TouchableOpacity onPress={() => toggleOrderSelection(orderId)}>
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxChecked,
                  ]}>
                  {isSelected && (
                    <Icon name="checkmark" size={14} color={COLORS.white} />
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Customer */}

          <View style={styles.section}>
            <Text style={styles.customerName}>{order?.userName}</Text>

            <Text style={styles.email}>{order?.userEmail}</Text>
          </View>

          {/* Details */}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Booking Type</Text>
            <Text style={styles.value}>
              {order?.orderType === 'custom'
                ? 'Custom Booking'
                : 'Normal Booking'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Vendor</Text>
            <Text style={styles.value}>{order?.vendorName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Booking Date</Text>
            <Text style={styles.value}>
              {order?.bookingDate
                ? moment(order.bookingDate).format('DD MMM YYYY')
                : 'N/A'}
            </Text>
          </View>

          {/* <View style={styles.infoRow}>
            <Text style={styles.label}>Payout Date</Text>
            <Text style={styles.value}>
              {order?.payoutReadyAt
                ? moment(order.payoutReadyAt).format('DD MMM YYYY')
                : 'N/A'}
            </Text>
          </View> */}

          {order?.claimDetails?.status !== 'pending' && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Claim Status</Text>
              <Text style={styles.value}>
                {order?.claimDetails?.status || 'N/A'}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Status</Text>
            <Text style={styles.value}>
              {getPaymentStatusLabel(paymentStatus)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <View />

            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.footerLabel}>Total Amount</Text>

              <Text style={styles.amount}>€{formatPrice(amount)}</Text>
            </View>
          </View>
        </View>
      );
    },
    [
      activeTab,
      now,
      selectedOrderIds,
      toggleOrderSelection,
      getPaymentStatusLabel,
    ],
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText={t('paymentManagement')}
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

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'ready' && styles.tabBtnActive]}
          onPress={() => setActiveTab('ready')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'ready' && styles.tabTextActive,
            ]}>
            {`${t('vendorPaymentReadyToPay')} (${readyToPayOrders.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'pending' && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab('pending')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'pending' && styles.tabTextActive,
            ]}>
            {`${t('Pending')} (${pendingOrders.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'completed' && styles.tabBtnActive,
          ]}
          onPress={() => setActiveTab('completed')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'completed' && styles.tabTextActive,
            ]}>
            {`${t('Completed')} (${completedOrders.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {!stripeConnected ? (
        <Text style={styles.warningText}>
          {t('vendorPaymentStripeNotConnected')}
        </Text>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {activeOrders.length ? (
          <View style={styles.ordersWrap}>
            {activeOrders.map(renderOrderCard)}
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{t('vendorPaymentNoOrders')}</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePaySelected}
        disabled={!canPayout}
        style={[
          styles.floatingButton,
          !canPayout ? styles.floatingButtonDisabled : null,
        ]}>
        <Text style={styles.floatingButtonText}>
          {t('vendorPaymentPayoutCta', {
            amount: formatPrice(selectedTotal),
          })}
        </Text>
      </TouchableOpacity>
      <CommonAlert ref={alertRef} />
      <Loader isLoading={loading} />
    </SafeAreaView>
  );
};

export default VendorPaymentManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: width(4),
    marginTop: width(3),
    backgroundColor: '#ECEEF4',
    borderRadius: 14,
    padding: 4,
  },

  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },

  tabBtnActive: {
    backgroundColor: COLORS.white,
    elevation: 2,
  },

  tabText: {
    fontSize: 12,
    color: '#777',
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },

  tabTextActive: {
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  warningText: {
    marginHorizontal: width(4),
    marginTop: width(3),
    color: '#D32F2F',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },

  scrollContent: {
    paddingBottom: width(28),
  },

  ordersWrap: {
    marginHorizontal: width(4),
    marginTop: width(3),
    gap: width(3),
  },

  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: width(4),
    borderWidth: 1,
    borderColor: '#ECECEC',
    elevation: 2,
  },

  orderTopStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },

  orderId: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  serviceName: {
    marginTop: 6,
    fontSize: 17,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CFCFCF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  section: {
    marginTop: 16,
    marginBottom: 14,
  },

  customerName: {
    fontSize: 15,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  email: {
    marginTop: 4,
    fontSize: 13,
    color: '#8A8A8A',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F2F2F2',
  },

  label: {
    flex: 1,
    fontSize: 13,
    color: '#7B7B7B',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },

  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },

  divider: {
    height: 1,
    backgroundColor: '#ECECEC',
    marginVertical: 18,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLabel: {
    fontSize: 12,
    color: '#888',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },

  footerValue: {
    marginTop: 3,
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  amount: {
    marginTop: 3,
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  floatingButton: {
    position: 'absolute',
    left: width(4),
    right: width(4),
    bottom: width(4),
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },

  floatingButtonDisabled: {
    backgroundColor: '#C8CCD8',
  },

  floatingButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  emptyWrap: {
    marginTop: width(18),
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 14,
    color: '#888',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});

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
import {
  disburseVendorPayments,
  getPayoutOrders,
} from '../../../services/VendorPaymentManagement';
import {vendorStripeOnboardingStatus} from '../../../services/VendorStripe';

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
      alertRef.current.showAlert(
        'error',
        t('vendorPaymentStripeRequiredTitle'),
        t('vendorPaymentConnectStripeFirst'),
      );
      return;
    }
    if (!selectedOrderIds.length) {
      alertRef.current.showAlert(
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
        alertRef.current.showAlert('error', response?.data?.message);
      }
    } catch (error) {
      alertRef.current.showAlert(
        'error',
        t('Something went wrong. Please try again.'),
      );
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

      return (
        <View key={orderId} style={styles.orderCard}>
          <View style={styles.orderTopStrip}>
            <Text style={styles.orderId}>{orderId || t('N/A')}</Text>
            <Text style={styles.orderStatusText}>
              {getPaymentStatusLabel(paymentStatus)}
            </Text>
          </View>
          <View style={styles.orderHeader}>
            <Text style={styles.orderText}>
              {order?.customerName ||
                order?.customer?.name ||
                t('vendorPaymentCustomerFallback')}
            </Text>
            {activeTab === 'ready' ? (
              <TouchableOpacity onPress={() => toggleOrderSelection(orderId)}>
                <View
                  style={[
                    styles.checkbox,
                    isSelected && styles.checkboxChecked,
                  ]}>
                  {isSelected ? (
                    <Icon name="checkmark" size={14} color={COLORS.white} />
                  ) : null}
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.orderAmount}>
            {t('vendorPaymentAmountEur', {amount: amount.toFixed(2)})}
          </Text>
          <Text style={styles.orderMeta}>
            {escrowEnded
              ? t('vendorPaymentEscrowCompleted')
              : t('vendorPaymentEscrowInProgress')}
          </Text>
        </View>
      );
    },
    [
      activeTab,
      getPaymentStatusLabel,
      now,
      selectedOrderIds,
      t,
      toggleOrderSelection,
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
            amount: selectedTotal.toFixed(2),
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
  container: {flex: 1, backgroundColor: '#F8F9FC'},
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: width(3),
    marginHorizontal: width(3.5),
    marginTop: width(2),
    backgroundColor: '#ECEEF4',
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: width(2),
  },
  tabBtnActive: {backgroundColor: COLORS.white},
  tabText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  tabTextActive: {color: COLORS.black},
  warningText: {
    marginHorizontal: width(4),
    marginTop: width(2),
    color: '#C62828',
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 11,
  },
  scrollContent: {
    paddingBottom: width(24),
  },
  ordersWrap: {
    marginTop: width(3),
    marginHorizontal: width(3.5),
    gap: width(2.5),
  },
  orderCard: {
    borderRadius: width(2.5),
    borderWidth: 1.2,
    borderColor: '#EFEFF4',
    padding: width(3.5),
    backgroundColor: COLORS.white,
  },
  orderTopStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  orderId: {
    color: COLORS.black,
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  orderStatusText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    textTransform: 'uppercase',
  },
  orderText: {
    color: COLORS.black,
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  orderAmount: {
    color: COLORS.primary,
    fontSize: 19,
    marginTop: 8,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  orderMeta: {
    color: COLORS.textLight,
    fontSize: 12,
    marginTop: 5,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#BDBFC7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  floatingButton: {
    position: 'absolute',
    left: width(4),
    right: width(4),
    bottom: width(4),
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  floatingButtonDisabled: {
    backgroundColor: '#C6C8D0',
  },
  floatingButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  emptyWrap: {marginTop: width(10), alignItems: 'center'},
  emptyText: {
    color: COLORS.textLight,
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});

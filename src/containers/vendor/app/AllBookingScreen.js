import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import {ICONS} from '../../../assets';
import AllBookingCard from '../../../components/allBookingCard';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import BookingFilterModal from '../../../components/modals/BookingFilterModal';
import DailyCalendar from '../../../components/timeChart';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  getBookingAnalytics,
  vendorOrderHistory,
} from '../../../services/BookingItem';
import {generateOrderHTML} from '../../../utils/htmlComtent';
import {handleUpdateOrderStatus} from '../../../services/ListingsItem';

/* -------------------- CONSTANTS -------------------- */

const TABS = ['Booking Items', 'Sale Items'];
const SALE_STATUS_TABS = ['All', 'Order Placed', 'On the way', 'Delivered'];
const SALE_STATUSES = ['Order Placed', 'On the way', 'Delivered'];

/* -------------------- COMPONENT -------------------- */
const countBookingsByStatus = (bookings = []) => {
  const statusCounts = {
    pending: 0,
    accepted: 0,
    rejected: 0,
    on_the_way: 0,
    received: 0,
    finished: 0,
    picked_up: 0,
    received_back: 0,
    completed: 0,
    claim: 0,
  };

  bookings.forEach(item => {
    const status = item?.status?.trim()?.toLowerCase();
    if (status && statusCounts.hasOwnProperty(status)) {
      statusCounts[status] += 1;
    }
  });

  return statusCounts;
};

const getStatusData = counts => {
  return Object.entries(counts).map(([key, value]) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1).replaceAll('-', ' '),
    value,
  }));
};

function AllBookingScreen() {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [listingCartData, setListingCartData] = useState([]);

  /* Booking */
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [statusData, setStatusData] = useState([]);

  /* Sale Items */
  const [saleOrders, setSaleOrders] = useState([]);
  const [saleStatusFilter, setSaleStatusFilter] = useState('All');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState(null);
  const itemsPerPage = 10;

  /* -------------------- API -------------------- */

  const handleGetCartListing = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const response = await getBookingAnalytics();
      if (response?.status === 200 || response?.status === 201) {
        const bookings = response?.data?.bookings || [];
        const stats = response?.data?.stats || [];

        const filteredBookings = bookings.filter(
          item => item?.status && item?.startDate,
        );
        setStats(stats);
        setListingCartData(filteredBookings);
        const counts = countBookingsByStatus(filteredBookings);
        const formattedStatusData = getStatusData(counts);
        setStatusData(formattedStatusData);
      } else {
        console.log('Fetch failed:', response?.data?.message);
      }
    } catch (error) {
      console.log('Error fetching bookings:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  /* -------------------- MEMOS -------------------- */

  const getDashboardData = t => [
    {
      title: t('Total Bookings'),
      icon: ICONS.groupIcon,
      value: stats?.totalBookings,
      percentage: 12,
    },
    {
      title: t('Completed Bookings'),
      icon: ICONS.checkIcon,
      value: stats?.completedBookings,
      percentage: 10,
    },
    {
      title: t('Request Booking'),
      icon: ICONS.whiteCartIcon,
      value: stats?.requestBookings,
      percentage: 10,
    },
    {
      title: t('In Process'),
      icon: ICONS.earningIcon,
      value: stats?.inProcessBookings,
      percentage: 10,
    },
  ];

  useEffect(() => {
    handleGetCartListing();
  }, [handleGetCartListing]);

  const markedDates = useMemo(() => {
    const marks = {};
    listingCartData.forEach(item => {
      const start = moment(item.startDate).format('YYYY-MM-DD');
      marks[start] = {
        selected: true,
        selectedColor: '#FF295D',
        customStyles: {
          container: {
            backgroundColor: '#FF295D',
            borderRadius: 8,
          },
          text: {
            color: '#fff',
            fontWeight: 'bold',
          },
        },
      };
    });
    return marks;
  }, [listingCartData]);

  const handleDaySelect = day => {
    const dateStr = day.dateString;
    if (markedDates[dateStr]) {
      setSelectedDate(dateStr);
      const booking = listingCartData.find(
        b => moment(b.startDate).format('YYYY-MM-DD') === dateStr,
      );

      console.log(booking, 'bookingbookingbookingbooking');
    } else {
      Alert.alert('Not Allowed', 'You can only select booked start dates.');
    }
  };

  const filteredSaleOrders = useMemo(() => {
    if (saleStatusFilter === 'All') {
      return saleOrders;
    }
    return saleOrders.filter(o => o.status === saleStatusFilter);
  }, [saleOrders, saleStatusFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSaleOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSaleOrders, currentPage]);

  const totalPages = Math.ceil(filteredSaleOrders.length / itemsPerPage);

  /* -------------------- HANDLERS -------------------- */

  useEffect(() => {
    fetchSaleOrders();
  }, [activeTab]);

  const fetchSaleOrders = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const res = await vendorOrderHistory();

      console.log(res, 'resresresresresresresresasdasdasdaaaaa');

      if (res?.status === 200 || res?.status === 201) {
        setSaleOrders(res?.data?.order || []);
      }
    } catch (e) {
      modalRef.current?.show({status: 'error', message: e?.message});
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    activeTab === 'Booking Items'
      ? handleGetCartListing()
      : fetchSaleOrders(true);
  };

  const onSelectAll = () => {
    const currentPageIds = paginatedOrders.map(i => i._id);
    const allSelected = currentPageIds.every(id => selectedRows.includes(id));
    if (allSelected) {
      setSelectedRows(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const toggleRow = id => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const exportCSV = async () => {
    try {
      setExportLoading(true);

      const rows =
        selectedRows.length > 0
          ? filteredSaleOrders.filter(r => selectedRows.includes(r._id))
          : filteredSaleOrders;

      if (rows.length === 0) {
        modalRef.current?.show({
          status: 'error',
          message:
            'No orders found to export. Please select orders or ensure there are orders available.',
        });
        return;
      }

      const csv =
        'Tracking ID,Status,Total Amount,Date,Buyer\n' +
        rows
          .map(
            r =>
              `${r.trackingId},${r.status},${r.totalAmount},${moment(
                r.createdAt,
              ).format('MMM DD, YYYY')},${r.vendorId?.fullName || ''}`,
          )
          .join('\n');

      const fileName = `sale_orders_${moment().format(
        'YYYY-MM-DD_HH-mm-ss',
      )}.csv`;
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(path, csv, 'utf8');

      setExportLoading(false);

      modalRef.current?.show({
        status: 'ok',
        message: `CSV file with ${rows.length} order(s) has been saved to your device storage as "${fileName}". Tap OK to open or share the file.`,
        handlePressOk: () => {
          Share.open({url: `file://${path}`}).catch(() => {
            Linking.openURL(`file://${path}`).catch(() => {
              modalRef.current?.show({
                status: 'ok',
                message: `File saved at: ${path}`,
              });
            });
          });
        },
      });
    } catch (error) {
      setExportLoading(false);
      console.log('Error exporting CSV:', error);
      modalRef.current?.show({
        status: 'error',
        message: 'Failed to export CSV file. Please try again.',
      });
    }
  };

  const downloadPdf = async item => {
    try {
      setPdfLoadingId(item._id);

      const htmlContent = generateOrderHTML(item);
      const fileName = `order_${item.trackingId}_${moment().format(
        'YYYY-MM-DD_HH-mm-ss',
      )}.html`;
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.writeFile(path, htmlContent, 'utf8');

      setPdfLoadingId(null);

      modalRef.current?.show({
        status: 'ok',
        message: `PDF has been saved to your device storage as "${fileName}". Tap OK to open or share the file.`,
        handlePressOk: () => {
          Share.open({url: `file://${path}`}).catch(() => {
            Linking.openURL(`file://${path}`).catch(() => {
              modalRef.current?.show({
                status: 'ok',
                message: `File saved at: ${path}`,
              });
            });
          });
        },
      });
    } catch (error) {
      setPdfLoadingId(null);
      console.log('Error generating PDF:', error);
      modalRef.current?.show({
        status: 'error',
        message: 'Failed to generate PDF. Please try again.',
      });
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    console.log(orderId, newStatus, 'orderId, newStatus');
    setStatusModalVisible(false);
    setSelectedOrderForStatus(null);

    try {
      setRefreshing(true);
      const response = await handleUpdateOrderStatus(orderId, {
        status: newStatus,
      });
      console.log(response, 'responseresponseresponseresponseresponse');

      if (response?.status === 200 || response?.status === 201) {
        setSaleOrders(prev =>
          prev.map(order =>
            order._id === orderId ? {...order, status: newStatus} : order,
          ),
        );
        modalRef.current?.show({
          status: 'ok',
          message:
            response?.data?.message || 'Order status updated successfully',
          handlePressOk: () => fetchSaleOrders(),
        });
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message || 'Failed to update order status',
        });
      }
    } catch (error) {
      console.log('Error updating order status:', error);
      modalRef.current?.show({
        status: 'error',
        message: 'Failed to update order status. Please try again.',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const openStatusModal = order => {
    setSelectedOrderForStatus(order);
    setStatusModalVisible(true);
  };

  /* -------------------- UI -------------------- */

  const TabButton = ({label}) => {
    if (activeTab === label) {
      return (
        <LinearGradient
          colors={['#FF295D', '#E31B95', '#C817AE']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.tabButton}>
          <TouchableOpacity
            style={styles.tabButtonTouchable}
            onPress={() => setActiveTab(label)}>
            <Text style={[styles.tabText, styles.activeText]}>{label}</Text>
          </TouchableOpacity>
        </LinearGradient>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab(label)}>
          <Text style={styles.tabText}>{label}</Text>
        </TouchableOpacity>
      );
    }
  };

  const SaleRow = ({item}) => {
    const checked = selectedRows.includes(item._id);
    const statusColor =
      item.status === 'Delivered'
        ? '#28a745'
        : item.status === 'On the way'
        ? '#ffc107'
        : item.status === 'Order Placed'
        ? '#007bff'
        : '#6c757d';

    return (
      <View style={styles.tableRow}>
        <TouchableOpacity
          onPress={() => toggleRow(item._id)}
          style={styles.checkboxCell}>
          <View
            style={[
              styles.checkboxContainer,
              checked && styles.checkboxChecked,
            ]}>
            {checked && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        <Text style={[styles.td, styles.trackingCell]}>{item.trackingId}</Text>
        <Text style={[styles.td, styles.dateCell]}>
          {moment(item.createdAt).format('MMM DD, YYYY')}
        </Text>
        <Text style={[styles.td, styles.buyerCell]}>
          {item.vendorId?.fullName || 'N/A'}
        </Text>
        <Text style={[styles.td, styles.buyerCell]}>
          {item?.items?.length
            ? item.items
                .map(
                  (val, index) =>
                    `${index + 1}. (${val?.quantity || 0})x ${
                      val?.title?.en || 'N/A'
                    }`,
                )
                .join('\n')
            : 'N/A'}
        </Text>
        <Text style={[styles.td, styles.buyerCell]}>
          {item?.deliveryLocation?.fullAddress || 'N/A'}
        </Text>
        <TouchableOpacity
          onPress={() => openStatusModal(item)}
          style={styles.statusCell}>
          <View
            style={[styles.statusBadge, {backgroundColor: statusColor + '20'}]}>
            <Text style={[styles.statusText, {color: statusColor}]}>
              {item.status}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => downloadPdf(item)}
          style={styles.actionCell}
          disabled={pdfLoadingId === item._id}>
          <LinearGradient
            colors={['#FF295D', '#E31B95', '#C817AE']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={[
              styles.pdfButton,
              pdfLoadingId === item._id && styles.disabledBtn,
            ]}>
            <Text style={styles.pdfText}>
              {pdfLoadingId === item._id ? '...' : 'PDF'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText="All Bookings"
        leftIcon={ICONS.drawerIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.openDrawer()}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />

      {/* <View style={styles.tabContainer}>
        {TABS.map(t => (
          <TabButton key={t} label={t} />
        ))}
      </View> */}

      {activeTab === 'Booking Items' && (
        <ScrollView
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <FlatList
            data={getDashboardData(t)}
            numColumns={2}
            renderItem={({item}) => <AllBookingCard item={item} />}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{padding: width(3)}}
            columnWrapperStyle={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginTop: width(3),
              paddingHorizontal: width(4),
            }}>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                width: width(30),
                borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: COLORS.border,
                paddingVertical: width(3),
                borderRadius: width(2),
              }}>
              <Image
                source={ICONS.filterIcon}
                resizeMode="contain"
                style={{height: 19, width: 19, marginRight: width(3)}}
              />
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  color: COLORS.textLight,
                  fontSize: 14,
                }}>
                Filters
              </Text>
            </TouchableOpacity>
          </View>

          {!selectedDate ? (
            <Calendar
              onDayPress={handleDaySelect}
              markingType="custom"
              markedDates={markedDates}
              theme={{
                todayTextColor: '#FF295D',
                arrowColor: '#FF295D',
              }}
            />
          ) : (
            <DailyCalendar
              listingCartData={listingCartData}
              goBack={() => setSelectedDate('')}
              selectedDate={selectedDate}
              onEventPress={event => {
                console.log(event, 'eventeventeventevent');

                navigation.navigate('BookingsByStatus', event);
              }}
            />
          )}

          <Text
            style={{
              fontSize: 18,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
              color: COLORS.textDark,
              marginHorizontal: width(4),
              marginTop: width(5),
              marginBottom: width(2),
            }}>
            Booking Status Summary
          </Text>

          {statusData.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate('BookingsByStatus', item)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: width(12),
                backgroundColor: COLORS.backgroundLight,
                marginTop: width(2),
                paddingHorizontal: width(3),
                marginHorizontal: width(4),
                borderRadius: width(3),
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    color: COLORS.textDark,
                    fontSize: 14,
                    fontFamily: fontFamly.PlusJakartaSansSemiBold,
                  }}>
                  {item.title}
                </Text>
                <Text
                  style={{
                    marginLeft: width(1),
                    fontSize: 13,
                    color: COLORS.textLight,
                    fontFamily: fontFamly.PlusJakartaSansSemiBold,
                  }}>
                  ({item.value})
                </Text>
              </View>
              <Image
                source={ICONS.arrowRight}
                style={{height: 12, width: 12}}
                resizeMode="contain"
                tintColor={COLORS.semiLightText}
              />
            </TouchableOpacity>
          ))}

          <View style={{height: width(5)}} />
        </ScrollView>
      )}

      {/* SALE ITEMS */}
      {activeTab === 'Sale Items' && (
        <ScrollView
          style={{flex: 1}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.saleFilterTabs}>
            {SALE_STATUS_TABS.map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSaleStatusFilter(tab)}
                style={styles.filterTab}>
                <Text
                  style={[
                    styles.saleFilterText,
                    saleStatusFilter === tab && styles.saleFilterTextActive,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tableControls}>
            <LinearGradient
              colors={['#FF295D', '#E31B95', '#C817AE']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={[styles.exportBtn, exportLoading && styles.disabledBtn]}>
              <TouchableOpacity
                onPress={exportCSV}
                style={styles.exportBtnTouchable}
                disabled={exportLoading}>
                <Text style={styles.exportBtnText}>
                  {exportLoading ? 'Exporting...' : 'Export CSV'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
            <Text style={styles.totalText}>
              Total: {filteredSaleOrders.length} items
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              <View style={styles.tableHeader}>
                <TouchableOpacity
                  onPress={onSelectAll}
                  style={styles.checkboxCell}>
                  <View
                    style={[
                      styles.checkboxContainer,
                      paginatedOrders.length > 0 &&
                        paginatedOrders.every(item =>
                          selectedRows.includes(item._id),
                        ) &&
                        styles.checkboxChecked,
                    ]}>
                    {paginatedOrders.length > 0 &&
                      paginatedOrders.every(item =>
                        selectedRows.includes(item._id),
                      ) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Text style={[styles.th, styles.trackingCell]}>TRACKING</Text>
                <Text style={[styles.th, styles.dateCell]}>DATE</Text>
                <Text style={[styles.th, styles.buyerCell]}>BUYER</Text>
                <Text style={[styles.th, styles.statusCell]}>ITEMS LIST</Text>
                <Text style={[styles.th, styles.statusCell]}>LOCATION</Text>
                <Text style={[styles.th, styles.statusCell]}>STATUS</Text>
                <Text style={[styles.th, styles.actionCell]}>PDF</Text>
              </View>

              {paginatedOrders.map(item => (
                <SaleRow key={item._id} item={item} />
              ))}
            </View>
          </ScrollView>

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <LinearGradient
                colors={['#FF295D', '#E31B95', '#C817AE']}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                style={[
                  styles.pageBtn,
                  currentPage === 1 && styles.disabledBtn,
                ]}>
                <TouchableOpacity
                  onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={styles.pageBtnTouchable}>
                  <Text style={styles.pageBtnText}>Prev</Text>
                </TouchableOpacity>
              </LinearGradient>

              <Text style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </Text>

              <LinearGradient
                colors={['#FF295D', '#E31B95', '#C817AE']}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
                style={[
                  styles.pageBtn,
                  currentPage === totalPages && styles.disabledBtn,
                ]}>
                <TouchableOpacity
                  onPress={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={styles.pageBtnTouchable}>
                  <Text style={styles.pageBtnText}>Next</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </ScrollView>
      )}

      <BookingFilterModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Order Status</Text>
            <Text style={styles.modalSubtitle}>
              Order: {selectedOrderForStatus?.trackingId}
            </Text>

            <View style={styles.statusOptions}>
              {SALE_STATUSES.map(status => (
                <TouchableOpacity
                  key={status}
                  onPress={() =>
                    updateOrderStatus(selectedOrderForStatus._id, status)
                  }
                  style={[
                    styles.statusOption,
                    selectedOrderForStatus?.status === status &&
                      styles.statusOptionSelected,
                  ]}>
                  <Text
                    style={[
                      styles.statusOptionText,
                      selectedOrderForStatus?.status === status &&
                        styles.statusOptionTextSelected,
                    ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setStatusModalVisible(false)}
              style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
}

export default memo(AllBookingScreen);

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  /* ---------------- Tabs ---------------- */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    margin: width(3),
    borderRadius: width(4),
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabButtonTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    // Removed backgroundColor as it's now handled by LinearGradient
  },
  tabText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    fontSize: 14,
  },
  activeText: {
    color: COLORS.white,
  },

  /* ---------------- Dashboard Cards ---------------- */
  cardRow: {
    justifyContent: 'space-between',
  },

  /* ---------------- Filter Button ---------------- */
  filterBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    margin: width(4),
    padding: width(3),
    borderRadius: width(2),
    borderWidth: 1,
    borderColor: '#FF295D',
    backgroundColor: COLORS.backgroundLight,
  },
  filterIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    tintColor: '#FF295D',
  },
  filterText: {
    color: '#FF295D',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },

  /* ---------------- Section Titles ---------------- */
  summaryTitle: {
    color: COLORS.textDark,
    marginHorizontal: width(4),
    marginTop: width(3),
    marginBottom: width(2),
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 16,
  },

  /* ---------------- Status Summary ---------------- */
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: width(4),
    marginTop: width(2),
    padding: width(3),
    borderRadius: width(3),
  },
  statusText: {
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  arrow: {
    width: 12,
    height: 12,
    tintColor: '#FF295D',
  },

  /* ---------------- Sale Filter Tabs ---------------- */
  saleFilterTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: width(3),
    paddingHorizontal: width(3),
  },
  filterTab: {
    paddingVertical: width(2),
    paddingHorizontal: width(4),
    borderRadius: width(2),
  },
  saleFilterText: {
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 14,
  },
  saleFilterTextActive: {
    color: '#FF295D',
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
  },

  /* ---------------- Table Controls ---------------- */
  tableControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width(4),
    marginBottom: width(2),
  },
  exportBtn: {
    paddingVertical: width(2),
    paddingHorizontal: width(4),
    borderRadius: width(2),
  },
  exportBtnTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 14,
  },
  totalText: {
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 14,
  },

  /* ---------------- Table ---------------- */
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 2,
    borderColor: COLORS.border,
    minWidth: width(150),
  },
  th: {
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    textAlign: 'center',
  },
  checkboxCell: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingCell: {
    width: 120,
  },
  dateCell: {
    width: 110,
  },
  buyerCell: {
    width: 140,
  },
  statusCell: {
    width: 130,
    alignItems: 'center',
  },
  actionCell: {
    width: 60,
    alignItems: 'center',
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    minWidth: width(150),
    alignItems: 'center',
  },
  td: {
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 14,
    textAlign: 'center',
  },

  /* ---------------- Status Badge ---------------- */
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 100,
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 12,
    textAlign: 'center',
  },
  dropdownArrow: {
    fontSize: 10,
    color: COLORS.textLight,
    marginLeft: 4,
  },

  /* ---------------- Checkbox ---------------- */
  checkboxContainer: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FF295D',
    borderRadius: 4,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF295D',
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },

  /* ---------------- PDF Button ---------------- */
  pdfButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    textAlign: 'center',
  },

  /* ---------------- Actions ---------------- */
  actionIcon: {
    width: 18,
    height: 18,
    tintColor: '#FF295D',
  },

  /* ---------------- Pagination ---------------- */
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width(4),
    paddingVertical: width(3),
    backgroundColor: COLORS.backgroundLight,
  },
  pageBtn: {
    paddingVertical: width(2),
    paddingHorizontal: width(4),
    borderRadius: width(2),
  },
  pageBtnTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    backgroundColor: COLORS.textLight,
  },
  pageBtnText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 14,
  },
  pageInfo: {
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 14,
  },

  /* ---------------- Status Modal ---------------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  statusOptions: {
    marginBottom: 20,
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  statusOptionSelected: {
    backgroundColor: '#FF295D',
    borderColor: '#FF295D',
  },
  statusOptionText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  statusOptionTextSelected: {
    color: COLORS.white,
  },
  cancelBtn: {
    backgroundColor: COLORS.textLight,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
});

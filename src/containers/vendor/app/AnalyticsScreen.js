import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import RNFS from 'react-native-fs';
import {generatePDF} from 'react-native-html-to-pdf';
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import BookingTable from '../../../components/bookingTable';
import LineChartComponent from '../../../components/charts/LineChart';
import PieChartComponent from '../../../components/charts/PiaCart';
import AnalyticsFilter from '../../../components/modals/AnalyticsFilter';
import AnalyticsCard from '../../../components/reportAndAnalyticsCard';
import {COLORS, fontFamly} from '../../../constants';
import {
  getAnalyticsReport,
  getBookingAnalytic,
} from '../../../services/AnalyticsReport';

const TABS = ['Booking Items', 'Sale Items'];

const AnalyticsReport = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [analyticsReport, setAnalyticsReport] = useState(null);
  console.log(
    analyticsReport,
    'analyticsReportanalyticsReportanalyticsReportanalyticsReport',
  );

  const [rawAnalyticsReport, setRawAnalyticsReport] = useState(null);
  const [activeTab, setActiveTab] = useState('Booking Items');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [dateFilters, setDateFilters] = useState({startDate: '', endDate: ''});

  // Memoized dashboard data to prevent unnecessary re-renders
  const DUMMY_DASHBOARD_DATA = useMemo(
    () => [
      {
        title: 'Today Earning',
        icon: ICONS.earningIcon,
        value: analyticsReport?.stats?.todayEarnings,
        percentage: 10,
      },
      {
        title: 'Last Week Earning',
        icon: ICONS.dollerSignIcon,
        value: analyticsReport?.stats?.lastWeekEarnings,
        percentage: 10,
      },
    ],
    [analyticsReport],
  );

  // Fetch analytics data
  const handleGetAnalyticsReport = useCallback(async () => {
    try {
      setRefreshing(true);
      // const response =
      //   activeTab === 'Booking Items'
      //     ? await getBookingAnalytic()
      //     : await getAnalyticsReport();
      const response = await getBookingAnalytic();

      if (response?.status === 200 || response?.status === 201) {
        setAnalyticsReport(response.data);
        setRawAnalyticsReport(response.data);
      } else {
        Alert.alert(
          'Error',
          response?.data?.message || 'Failed to load report.',
        );
      }
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    handleGetAnalyticsReport();
  }, [handleGetAnalyticsReport]);

  const handleFilterPress = useCallback(() => setModalVisible(true), []);
  const hasSelectedBookings = selectedBookings.length > 0;

  const parseDate = value => {
    if (!value) return null;
    const parsed = moment(value);
    return parsed.isValid() ? parsed.startOf('day') : null;
  };

  const getBookingStartDate = booking =>
    parseDate(
      booking?.details?.startDate ||
        booking?.bookingDateTime?.start ||
        booking?.startDate ||
        booking?.createdAt,
    );

  const getBookingEndDate = booking =>
    parseDate(
      booking?.details?.endDate ||
        booking?.bookingDateTime?.end ||
        booking?.endDate ||
        booking?.details?.startDate ||
        booking?.bookingDateTime?.start ||
        booking?.startDate ||
        booking?.createdAt,
    );

  const handleApplyFilters = useCallback(
    ({startDate, endDate}) => {
      if (!rawAnalyticsReport) return;

      const normalizedStart = parseDate(startDate);
      const normalizedEnd = parseDate(endDate);
      const startBoundary = normalizedStart || null;
      const endBoundary = (normalizedEnd || normalizedStart || null)?.endOf(
        'day',
      );

      const filteredBookingTable = (
        rawAnalyticsReport?.bookingTable || []
      ).filter(booking => {
        const bookingStart = getBookingStartDate(booking);
        const bookingEnd = getBookingEndDate(booking);
        if (!bookingStart && !bookingEnd) return false;

        const startPoint = bookingStart || bookingEnd;
        const endPoint = bookingEnd || bookingStart;

        if (startBoundary && endBoundary) {
          return (
            startPoint?.isSameOrBefore(endBoundary) &&
            endPoint?.isSameOrAfter(startBoundary)
          );
        }

        return true;
      });

      setDateFilters({startDate: startDate || '', endDate: endDate || ''});
      setAnalyticsReport({
        ...rawAnalyticsReport,
        bookingTable: filteredBookingTable,
      });
      setSelectedBookings([]);
    },
    [rawAnalyticsReport],
  );

  const handleResetFilters = useCallback(() => {
    setDateFilters({startDate: '', endDate: ''});
    setSelectedBookings([]);
    setAnalyticsReport(rawAnalyticsReport);
  }, [rawAnalyticsReport]);

  const formatDate = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const safeCsvValue = value => `"${String(value ?? '-').replace(/"/g, '""')}"`;

  const exportSelectedCSV = useCallback(async () => {
    if (!hasSelectedBookings) {
      return;
    }
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `selected-bookings-${timestamp}.csv`;
      const generatedAt = formatDate(new Date());
      const rows = selectedBookings.map(item => {
        const bookingItem = item?.listingDetails?.title?.en || '-';
        const totalCost = `€${item?.pricingBreakdown?.total ?? 0}`;
        const bookingDate = formatDate(item?.createdAt);
        const duration = `${item?.details?.duration?.totalHours ?? 0} hours`;
        const location =
          item?.eventLocation || item?.details?.eventLocation || '-';
        return [
          safeCsvValue(item?.trackingId || '-'),
          safeCsvValue(bookingItem),
          safeCsvValue(item?.userId?._id || item?.client?._id || '-'),
          safeCsvValue(totalCost),
          safeCsvValue(bookingDate),
          safeCsvValue(item?.status || '-'),
          safeCsvValue(duration),
          safeCsvValue(location),
        ].join(',');
      });
      const csvContent = [
        'Selected Bookings Report',
        '',
        `Generated on:,${generatedAt}`,
        `Total Items:,${selectedBookings.length}`,
        '',
        'Tracking ID,Service Name,Customer ID,Total Cost,Booking Date,Status,Duration,Location',
        ...rows,
      ].join('\n');

      if (Platform.OS === 'android') {
        const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.writeFile(destinationPath, csvContent, 'utf8');
        Alert.alert('Success', 'Selected CSV saved to Downloads folder.');
      } else {
        const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.writeFile(destinationPath, csvContent, 'utf8');
        await Share.share({
          url: `file://${destinationPath}`,
          type: 'text/csv',
          title: 'Selected Bookings CSV',
        });
      }
    } catch (error) {
      console.log('CSV export error:', error);
      Alert.alert('Error', 'Failed to export CSV.');
    }
  }, [hasSelectedBookings, selectedBookings]);

  const exportSelectedPDF = useCallback(async () => {
    if (!hasSelectedBookings) {
      return;
    }
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `selected-bookings-${timestamp}`;
      const generatedAt = formatDate(new Date());
      const reportDate = formatDate(new Date());
      const tableRows = selectedBookings
        .map(
          item => `
            <tr>
              <td>${item?.trackingId || '-'}</td>
              <td>${item?.listingDetails?.title?.en || '-'}</td>
              <td>${item?.userId?._id || item?.client?._id || '-'}</td>
              <td>€${item?.pricingBreakdown?.total ?? 0}</td>
              <td>${formatDate(item?.createdAt)}</td>
              <td>${item?.status || '-'}</td>
              <td>${item?.details?.duration?.totalHours ?? 0}h</td>
              <td>${
                item?.eventLocation || item?.details?.eventLocation || '-'
              }</td>
            </tr>
          `,
        )
        .join('');

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 26px; color: #0f2940; }
              .header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px; }
              .brand { display:flex; align-items:center; gap:8px; }
              .logoBox { width:24px; height:34px; border-radius:10px; background: linear-gradient(180deg, #FF2C78 0%, #E31B95 60%, #C817AE 100%); color:#fff; font-weight:700; font-size:26px; line-height:34px; text-align:center; }
              .brandName { font-size:42px; font-weight:700; line-height:1; }
              .reportTitle { color:#E31B95; font-size:36px; font-weight:700; }
              .sectionTitle { margin-top: 16px; font-size: 14px; font-weight: 700; color: #E31B95; border-bottom: 1px solid #EBC8DF; padding-bottom: 4px; margin-bottom: 8px; }
              .summary td { border: 1px solid #EBC8DF; padding: 10px; font-size: 12px; }
              .summaryLabel { font-weight: 700; width: 30%; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #EBC8DF; padding: 8px; text-align: left; font-size: 11px; vertical-align: top; }
              th { background: #E31B95; color: #fff; }
              .footer { margin-top: 24px; display:flex; justify-content:space-between; color:#374151; font-size:10px; font-weight:600; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="brand">
                <div class="logoBox">E</div>
                <div class="brandName">Evenlyo</div>
              </div>
              <div class="reportTitle">Selected Bookings Report</div>
            </div>
            <div class="sectionTitle">Report Summary</div>
            <table class="summary">
              <tr><td class="summaryLabel">Report Date</td><td>${reportDate}</td></tr>
              <tr><td class="summaryLabel">Item Type</td><td>Booking</td></tr>
              <tr><td class="summaryLabel">Total Items</td><td>${selectedBookings.length}</td></tr>
            </table>
            <div class="sectionTitle">Selected Bookings</div>
            <table>
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Service Name</th>
                  <th>Customer ID</th>
                  <th>Total Cost</th>
                  <th>Booking Date</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="footer">
              <span>Generated on: ${generatedAt}</span>
              <span>Page 1</span>
            </div>
          </body>
        </html>
      `;

      const pdf = await generatePDF({
        html: htmlContent,
        fileName,
        directory: 'Documents',
      });

      if (Platform.OS === 'android') {
        const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}.pdf`;
        await RNFS.copyFile(pdf.filePath, destinationPath);
        Alert.alert('Success', 'Selected PDF saved to Downloads folder.');
      } else {
        const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}.pdf`;
        await RNFS.moveFile(pdf.filePath, destinationPath);
        await Share.share({
          url: `file://${destinationPath}`,
          type: 'application/pdf',
          title: 'Selected Bookings PDF',
        });
      }
    } catch (error) {
      console.log('PDF export error:', error);
      Alert.alert('Error', 'Failed to export PDF.');
    }
  }, [hasSelectedBookings, selectedBookings]);

  // Render filter button - memoized for smoothness
  const renderFilterButton = useCallback(
    (icon, text, onPress, disabled = false) => (
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={[styles.filterButton, disabled && styles.filterButtonDisabled]}>
        <Image source={icon} resizeMode="contain" style={styles.filterIcon} />
        <Text
          style={[styles.filterText, disabled && styles.filterTextDisabled]}>
          {text}
        </Text>
      </TouchableOpacity>
    ),
    [],
  );

  // Render tab buttons
  const renderTabs = useMemo(
    () =>
      TABS.map(tab => (
        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
          {activeTab === tab ? (
            <LinearGradient
              colors={['#FF295D', '#E31B95', '#C817AE']}
              start={{x: 0, y: 0}}
              end={{x: 0, y: 1}}
              style={styles.activeTab}>
              <Text style={styles.activeText}>{tab}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTab}>
              <Text style={styles.inactiveText}>{tab}</Text>
            </View>
          )}
        </TouchableOpacity>
      )),
    [activeTab],
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText="Analytics & Report"
        leftIcon={ICONS.drawerIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.openDrawer()}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />

      <FlatList
        data={DUMMY_DASHBOARD_DATA} // Only FlatList for vertical scroll
        keyExtractor={(_, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.dashboardColumns}
        contentContainerStyle={{paddingBottom: 50}} // Bottom spacing
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleGetAnalyticsReport}
          />
        }
        showsVerticalScrollIndicator={false}
        // <View style={styles.tabContainer}>{renderTabs}</View>
        ListHeaderComponent={
          <>
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                width: '100%',
                justifyContent: 'space-between',
                paddingHorizontal: width(3),
                marginTop: width(2),
              }}>
              {DUMMY_DASHBOARD_DATA?.map(item => {
                return <AnalyticsCard item={item} />;
              })}
            </View>

            <View style={styles.totalEarningCard}>
              <View style={styles.totalEarningHeader}>
                <Text style={styles.totalEarningLabel}>Total Earning</Text>
                <View style={styles.totalEarningIconContainer}>
                  <Image
                    source={ICONS.incrimentIcon}
                    resizeMode="contain"
                    style={styles.totalEarningIcon}
                  />
                </View>
              </View>
              <Text style={styles.totalEarningValue}>
                €{analyticsReport?.stats?.totalEarnings || 0}
              </Text>
            </View>

            <View style={styles.chartContainer}>
              <LineChartComponent
                // labelll={
                //   activeTab === 'Booking Items'
                //     ? 'Booking Earnings'
                //     : 'Sale Earnings'
                // }
                labelll={'Orders Overview'}
                data={analyticsReport?.monthlyEarnings || []}
              />
            </View>

            <View style={styles.chartContainer}>
              <PieChartComponent
                labelll={
                  activeTab === 'Booking Items'
                    ? 'Booking Earnings'
                    : 'Sale Earnings'
                }
                data={analyticsReport?.earningsByCategory || []}
                loading={refreshing}
              />
            </View>
            <View style={styles.filterRow}>
              {renderFilterButton(
                ICONS.filterIcon,
                'Filter',
                handleFilterPress,
              )}
              {renderFilterButton(
                ICONS.blackDownloadIcon,
                `Export CSV (${selectedBookings.length})`,
                exportSelectedCSV,
                !hasSelectedBookings,
              )}
              {renderFilterButton(
                ICONS.blackDownloadIcon,
                `Export PDF (${selectedBookings.length})`,
                exportSelectedPDF,
                !hasSelectedBookings,
              )}
            </View>
            <View style={styles.tableContainer}>
              <BookingTable
                data={analyticsReport || []}
                canDownload={false}
                onSelectionChange={setSelectedBookings}
              />
            </View>
            {/* Booking Table */}
            {/* {activeTab === 'Booking Items' ? (

            ) : (
              <View style={styles.tableContainer}>
                <SaleItemTable
                  data={analyticsReport || []}
                  canDownload={handleDownload}
                />
              </View>
            )} */}
          </>
        }
      />

      <AnalyticsFilter
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        filters={dateFilters}
      />
    </SafeAreaView>
  );
};

export default AnalyticsReport;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width(1),
    alignItems: 'center',
    marginHorizontal: width(3),
    backgroundColor: COLORS.backgroundLight,
    padding: width(1),
    borderRadius: width(4),
    marginTop: width(2),
  },
  activeTab: {paddingVertical: 16, width: width(44.5), borderRadius: 12},
  inactiveTab: {paddingVertical: 16, width: width(44.5), borderRadius: 12},
  activeText: {
    color: COLORS.white,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  inactiveText: {
    color: '#333',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  dashboardColumns: {justifyContent: 'space-between', alignItems: 'center'},
  totalEarningCard: {
    padding: width(4),
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: width(3.5),
    borderRadius: width(3),
    elevation: 5,
    marginTop: width(3),
  },
  totalEarningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalEarningLabel: {
    color: COLORS.black,
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  totalEarningIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalEarningIcon: {width: 10, height: 10},
  totalEarningValue: {
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 20,
    marginTop: 5,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: width(3),
  },
  filterButton: {
    width: width(30),
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: width(3),
    borderRadius: width(3),
  },
  filterButtonDisabled: {
    backgroundColor: '#F4F4F4',
  },
  filterIcon: {height: 10, width: 10, marginRight: width(3)},
  filterText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    fontSize: 10,
  },
  filterTextDisabled: {
    color: '#B5B5B5',
  },
  chartContainer: {
    backgroundColor: COLORS.backgroundLight,
    marginTop: width(3),
    marginHorizontal: width(3),
    borderRadius: 12,
    paddingVertical: width(4),
  },
  tableContainer: {padding: width(3)},
});

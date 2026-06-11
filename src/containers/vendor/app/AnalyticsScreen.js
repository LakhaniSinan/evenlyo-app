import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
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
import ShareLib from 'react-native-share';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import BookingTable from '../../../components/bookingTable';
import LineChartComponent from '../../../components/charts/LineChart';
import PieChartComponent from '../../../components/charts/PiaCart';
import AnalyticsFilter from '../../../components/modals/AnalyticsFilter';
import AnalyticsCard from '../../../components/reportAndAnalyticsCard';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getBookingAnalytic} from '../../../services/AnalyticsReport';
import {normalizeStatusKey} from '../../../utils/translatePricingBreakdownLabel';

const TABS = ['Booking Items', 'Sale Items'];

const BOOKING_STATUS_I18N = {
  pending: 'statusPending',
  accepted: 'statusAccepted',
  rejected: 'statusRejected',
  on_the_way: 'statusOnTheWay',
  received: 'statusReceived',
  finished: 'statusFinished',
  picked_up: 'statusPickedUp',
  received_back: 'statusReceivedBack',
  completed: 'statusCompleted',
  cancelled: 'statusCancelled',
  claim: 'statusClaim',
};

const AnalyticsReport = () => {
  const navigation = useNavigation();
  const {t, currentLanguage} = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [analyticsReport, setAnalyticsReport] = useState(null);

  const [rawAnalyticsReport, setRawAnalyticsReport] = useState(null);
  const [activeTab, setActiveTab] = useState('Booking Items');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [dateFilters, setDateFilters] = useState({startDate: '', endDate: ''});

  // Memoized dashboard data to prevent unnecessary re-renders
  const DUMMY_DASHBOARD_DATA = useMemo(
    () => [
      {
        titleKey: 'Today Earning:',
        icon: ICONS.earningIcon,
        value: analyticsReport?.stats?.todayEarnings,
        percentage: 10,
      },
      {
        titleKey: 'Last Week Earning:',
        icon: ICONS.dollerSignIcon,
        value: analyticsReport?.stats?.lastWeekEarnings,
        percentage: 10,
      },
    ],
    [analyticsReport],
  );

  const getStatusLabel = useCallback(
    status => {
      if (!status) {
        return t('N/A');
      }
      const key = BOOKING_STATUS_I18N[normalizeStatusKey(status)];
      return key ? t(key) : String(status);
    },
    [t],
  );

  const getListingTitle = useCallback(
    item => {
      const title = item?.listingDetails?.title;
      if (!title) {
        return t('Untitled');
      }
      if (typeof title === 'string') {
        return title;
      }
      return currentLanguage === 'nl'
        ? title?.nl || title?.en || t('Untitled')
        : title?.en || title?.nl || t('Untitled');
    },
    [currentLanguage, t],
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
          t('Error'),
          response?.data?.message || t('Failed to load report.'),
        );
      }
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [t]);

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

  const dateLocale = currentLanguage === 'nl' ? 'nl-NL' : 'en-US';

  const formatDate = useCallback(
    value => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return t('notAvailable');
      }
      return date.toLocaleDateString(dateLocale, {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
    },
    [dateLocale, t],
  );

  const safeCsvValue = value => `"${String(value ?? '-').replace(/"/g, '""')}"`;

  const normalizeFilePath = path => String(path || '').replace(/^file:\/\//, '');

  const escapeHtml = value =>
    String(value ?? '-')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const shareFileOnIos = async (filePath, {type, title}) => {
    const shareUrl = filePath.startsWith('file://')
      ? filePath
      : `file://${filePath}`;

    try {
      await ShareLib.open({
        url: shareUrl,
        type,
        title,
        failOnCancel: false,
      });
    } catch (shareLibError) {
      try {
        await Share.share({
          url: shareUrl,
          type,
          title,
        });
      } catch (shareError) {
        await Linking.openURL(shareUrl).catch(() => {
          throw shareLibError || shareError;
        });
      }
    }
  };

  const exportSelectedCSV = useCallback(async () => {
    if (!hasSelectedBookings) {
      return;
    }
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `selected-bookings-${timestamp}.csv`;
      const generatedAt = formatDate(new Date());
      const rows = selectedBookings.map(item => {
        const bookingItem = getListingTitle(item);
        const totalCost = `€${item?.pricingBreakdown?.total ?? 0}`;
        const bookingDate = formatDate(item?.createdAt);
        const duration = `${item?.details?.duration?.totalHours ?? 0} ${t('hours')}`;
        const location =
          item?.eventLocation || item?.details?.eventLocation || t('notAvailable');
        return [
          safeCsvValue(item?.trackingId || t('notAvailable')),
          safeCsvValue(bookingItem),
          safeCsvValue(item?.userId?._id || item?.client?._id || t('notAvailable')),
          safeCsvValue(totalCost),
          safeCsvValue(bookingDate),
          safeCsvValue(getStatusLabel(item?.status)),
          safeCsvValue(duration),
          safeCsvValue(location),
        ].join(',');
      });
      const csvContent = [
        t('Selected Bookings Report'),
        '',
        `${t('Generated on:')},${generatedAt}`,
        `${t('Total Items')}:,${selectedBookings.length}`,
        '',
        [
          t('Tracking ID'),
          t('Service Name'),
          t('Customer ID'),
          t('Total Cost'),
          t('Booking Date'),
          t('Status'),
          t('Duration'),
          t('Location'),
        ].join(','),
        ...rows,
      ].join('\n');

      if (Platform.OS === 'android') {
        const destinationPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        await RNFS.writeFile(destinationPath, csvContent, 'utf8');
        Alert.alert(t('Success'), t('Selected CSV saved to Downloads folder.'));
      } else {
        const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        await RNFS.writeFile(destinationPath, csvContent, 'utf8');
        await shareFileOnIos(destinationPath, {
          type: 'text/csv',
          title: t('Selected Bookings CSV'),
        });
      }
    } catch (error) {
      console.log('CSV export error:', error);
      Alert.alert(t('Error'), t('Failed to export CSV.'));
    }
  }, [
    hasSelectedBookings,
    selectedBookings,
    formatDate,
    getListingTitle,
    getStatusLabel,
    t,
  ]);

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
              <td>${escapeHtml(item?.trackingId || t('notAvailable'))}</td>
              <td>${escapeHtml(getListingTitle(item))}</td>
              <td>${escapeHtml(item?.userId?._id || item?.client?._id || t('notAvailable'))}</td>
              <td>${escapeHtml(`€${item?.pricingBreakdown?.total ?? 0}`)}</td>
              <td>${escapeHtml(formatDate(item?.createdAt))}</td>
              <td>${escapeHtml(getStatusLabel(item?.status))}</td>
              <td>${escapeHtml(`${item?.details?.duration?.totalHours ?? 0}h`)}</td>
              <td>${escapeHtml(
                item?.eventLocation ||
                  item?.details?.eventLocation ||
                  t('notAvailable'),
              )}</td>
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
              <div class="reportTitle">${escapeHtml(t('Selected Bookings Report'))}</div>
            </div>
            <div class="sectionTitle">${escapeHtml(t('Report Summary'))}</div>
            <table class="summary">
              <tr><td class="summaryLabel">${escapeHtml(t('Report Date'))}</td><td>${escapeHtml(reportDate)}</td></tr>
              <tr><td class="summaryLabel">${escapeHtml(t('Item Type'))}</td><td>${escapeHtml(t('Booking'))}</td></tr>
              <tr><td class="summaryLabel">${escapeHtml(t('Total Items'))}</td><td>${selectedBookings.length}</td></tr>
            </table>
            <div class="sectionTitle">${escapeHtml(t('Selected Bookings'))}</div>
            <table>
              <thead>
                <tr>
                  <th>${escapeHtml(t('Tracking ID'))}</th>
                  <th>${escapeHtml(t('Service Name'))}</th>
                  <th>${escapeHtml(t('Customer ID'))}</th>
                  <th>${escapeHtml(t('Total Cost'))}</th>
                  <th>${escapeHtml(t('Booking Date'))}</th>
                  <th>${escapeHtml(t('Status'))}</th>
                  <th>${escapeHtml(t('Duration'))}</th>
                  <th>${escapeHtml(t('Location'))}</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="footer">
              <span>${escapeHtml(t('Generated on:'))} ${escapeHtml(generatedAt)}</span>
              <span>${escapeHtml(t('Page 1'))}</span>
            </div>
          </body>
        </html>
      `;

      const pdf = await generatePDF({
        html: htmlContent,
        fileName,
        directory: 'Documents',
      });

      const generatedPath = normalizeFilePath(pdf?.filePath);
      if (!generatedPath || !(await RNFS.exists(generatedPath))) {
        throw new Error(t('PDF file was not created'));
      }

      const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}.pdf`;

      if (generatedPath !== destinationPath) {
        if (await RNFS.exists(destinationPath)) {
          await RNFS.unlink(destinationPath);
        }
        await RNFS.copyFile(generatedPath, destinationPath);
      }

      if (Platform.OS === 'android') {
        const androidPath = `${RNFS.DownloadDirectoryPath}/${fileName}.pdf`;
        if (await RNFS.exists(androidPath)) {
          await RNFS.unlink(androidPath);
        }
        await RNFS.copyFile(destinationPath, androidPath);
        Alert.alert(t('Success'), t('Selected PDF saved to Downloads folder.'));
      } else {
        await shareFileOnIos(destinationPath, {
          type: 'application/pdf',
          title: t('Selected Bookings PDF'),
        });
      }
    } catch (error) {
      console.log('PDF export error:', error);
      Alert.alert(
        t('Error'),
        error?.message || t('Failed to export PDF. Please try again.'),
      );
    }
  }, [
    hasSelectedBookings,
    selectedBookings,
    formatDate,
    getListingTitle,
    getStatusLabel,
    t,
  ]);

  // Render filter button - memoized for smoothness
  const renderFilterButton = useCallback(
    (icon, text, onPress, disabled = false) => (
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={[styles.filterButton, disabled && styles.filterButtonDisabled]}>
        <View style={styles.filterButtonInner}>
          <Image source={icon} resizeMode="contain" style={styles.filterIcon} />
          <Text
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={[styles.filterText, disabled && styles.filterTextDisabled]}>
            {text}
          </Text>
        </View>
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
        headingText={t('Analytics & Report')}
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
                <Text style={styles.totalEarningLabel}>{t('Total Earning:')}</Text>
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
                labelll={t('Orders Overview')}
                data={analyticsReport?.monthlyEarnings || []}
              />
            </View>

            <View style={styles.chartContainer}>
              <PieChartComponent
                labelll={
                  activeTab === 'Booking Items'
                    ? t('Booking Earnings')
                    : t('Sale Earnings')
                }
                data={analyticsReport?.earningsByCategory || []}
                loading={refreshing}
              />
            </View>
            <View style={styles.filterRow}>
              {renderFilterButton(
                ICONS.filterIcon,
                t('Filter'),
                handleFilterPress,
              )}
              {renderFilterButton(
                ICONS.blackDownloadIcon,
                t('Export CSV ({{count}})', {count: selectedBookings.length}),
                exportSelectedCSV,
                !hasSelectedBookings,
              )}
              {renderFilterButton(
                ICONS.blackDownloadIcon,
                t('Export PDF ({{count}})', {count: selectedBookings.length}),
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
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: width(1.25),
    marginHorizontal: width(3),
    marginTop: width(2),
    marginBottom: width(1),
  },
  filterButton: {
    flex: 1,
    minWidth: 0,
    minHeight: width(18),
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: width(2),
    paddingHorizontal: width(1),
    borderRadius: width(3),
    justifyContent: 'center',
  },
  filterButtonInner: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width(1),
  },
  filterButtonDisabled: {
    backgroundColor: '#F4F4F4',
  },
  filterIcon: {
    height: width(3.5),
    width: width(3.5),
  },
  filterText: {
    width: '100%',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 12,
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

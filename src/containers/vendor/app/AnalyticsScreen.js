import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
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
import SaleItemTable from '../../../components/saleItemTable';

const TABS = ['Booking Items', 'Sale Items'];

const AnalyticsReport = () => {
  const navigation = useNavigation();
  const modalRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [analyticsReport, setAnalyticsReport] = useState(null);
  const [activeTab, setActiveTab] = useState('Booking Items');
  const [refreshing, setRefreshing] = useState(false);

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
      const response =
        activeTab === 'Booking Items'
          ? await getBookingAnalytic()
          : await getAnalyticsReport();

      if (response?.status === 200 || response?.status === 201) {
        setAnalyticsReport(response.data);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
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

  const handleFilterPress = useCallback(text => {
    if (text === 'Filter') setModalVisible(true);
  }, []);

  const handleDownload = useCallback(() => setModalVisible(true), []);

  // Render filter button - memoized for smoothness
  const renderFilterButton = useCallback(
    (icon, text) => (
      <TouchableOpacity
        onPress={() => handleFilterPress(text)}
        style={styles.filterButton}>
        <Image source={icon} resizeMode="contain" style={styles.filterIcon} />
        <Text style={styles.filterText}>{text}</Text>
      </TouchableOpacity>
    ),
    [handleFilterPress],
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
        ListHeaderComponent={
          <>
            <View style={styles.tabContainer}>{renderTabs}</View>

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
                ${analyticsReport?.stats?.totalEarnings || 0}
              </Text>
            </View>

            <View style={styles.filterRow}>
              {renderFilterButton(ICONS.filterIcon, 'Filter')}
              {renderFilterButton(ICONS.blackDownloadIcon, 'Export CSV')}
              {renderFilterButton(ICONS.blackDownloadIcon, 'Export PDF')}
            </View>

            <View style={styles.chartContainer}>
              <LineChartComponent
                labelll={
                  activeTab === 'Booking Items'
                    ? 'Booking Earnings'
                    : 'Sale Earnings'
                }
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

            {/* Booking Table */}
            {activeTab === 'Booking Items' ? (
              <View style={styles.tableContainer}>
                <BookingTable
                  data={analyticsReport || []}
                  canDownload={handleDownload}
                />
              </View>
            ) : (
              <View style={styles.tableContainer}>
                <SaleItemTable
                  data={analyticsReport || []}
                  canDownload={handleDownload}
                />
              </View>
            )}
          </>
        }
      />

      <AnalyticsFilter
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
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
  filterIcon: {height: 19, width: 19, marginRight: width(3)},
  filterText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    fontSize: 12,
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

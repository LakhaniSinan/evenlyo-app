import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
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
import {getAnalyticsReport} from '../../../services/AnalyticsReport';

const TABS = ['Booking Items', 'Sale Items'];

const DUMMY_TABLE_DATA = [
  {
    bookingId: 'ITM001',
    bookingItem: 'DJ',
    totalCost: '$1,195',
    earning: '$359',
  },
  {
    bookingId: 'ITM002',
    bookingItem: 'DJ',
    totalCost: '$1,195',
    earning: '$359',
  },
  {
    bookingId: 'ITM003',
    bookingItem: 'DJ',
    totalCost: '$1,195',
    earning: '$359',
  },
  {
    bookingId: 'ITM004',
    bookingItem: 'DJ',
    totalCost: '$1,195',
    earning: '$359',
  },
];

const AnalyticsReport = () => {
  const navigation = useNavigation();
  const modalRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [analyticsReport, setAnalyticsReport] = useState(null);
  console.log(analyticsReport, 'analyticsReportanalyticsReportanalyticsReport');

  const [activeTab, setActiveTab] = useState('Booking Items');
  const [refreshing, setRefreshing] = useState(false);
  const DUMMY_DASHBOARD_DATA = [
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
  ];
  // Fetch analytics data
  const handleGetAnalyticsReport = useCallback(async () => {
    try {
      const response = await getAnalyticsReport();
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
  }, []);

  useEffect(() => {
    handleGetAnalyticsReport();
  }, [handleGetAnalyticsReport]);

  const handleFilterPress = text => {
    if (text === 'Filter') setModalVisible(true);
  };

  const handleDownload = () => {
    setModalVisible(true);
  };

  console.log(analyticsReport, 'analyticsReport?.monthlyEarnings');

  const renderFilterButton = (icon, text) => (
    <TouchableOpacity
      onPress={() => handleFilterPress(text)}
      style={styles.filterButton}>
      <Image source={icon} resizeMode="contain" style={styles.filterIcon} />
      <Text style={styles.filterText}>{text}</Text>
    </TouchableOpacity>
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

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleGetAnalyticsReport}
          />
        }
        showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          {TABS.map(tab => (
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
          ))}
        </View>

        {/* Dashboard Cards */}
        <FlatList
          data={DUMMY_DASHBOARD_DATA}
          numColumns={2}
          renderItem={({item}) => <AnalyticsCard item={item} />}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.dashboardList}
          columnWrapperStyle={styles.dashboardColumns}
        />

        {/* Total Earnings Card */}
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
            ${analyticsReport?.stats?.totalEarnings}
          </Text>
          <Text style={styles.totalEarningSubText}>+8.7% from last month</Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          {renderFilterButton(ICONS.filterIcon, 'Filter')}
          {renderFilterButton(ICONS.blackDownloadIcon, 'Export CSV')}
          {renderFilterButton(ICONS.blackDownloadIcon, 'Export PDF')}
        </View>

        {/* Charts */}
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
        <View style={styles.tableContainer}>
          <BookingTable
            data={analyticsReport?.bookingTable}
            canDownload={handleDownload}
          />
        </View>
      </ScrollView>

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
  scrollContainer: {flex: 1},
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
  activeTab: {
    paddingVertical: 16,
    width: width(44.5),
    borderRadius: 12,
  },
  inactiveTab: {
    paddingVertical: 16,
    width: width(44.5),
    borderRadius: 12,
  },
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
  dashboardList: {padding: width(3)},
  dashboardColumns: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalEarningCard: {
    padding: width(4),
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: width(3.5),
    height: 95,
    borderRadius: width(3),
    elevation: 5,
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
  },
  totalEarningSubText: {
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 8,
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

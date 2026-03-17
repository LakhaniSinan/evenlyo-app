import messaging from '@react-native-firebase/messaging';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import ActivityLogCard from '../../../components/activityLogCard';
import AppHeader from '../../../components/appHeader';
import LineChartComponent from '../../../components/charts/LineChart';
import CommonAlert from '../../../components/commanAlert';
import DashboardCard from '../../../components/dashboardCard';
import RecentBookingCards from '../../../components/recentBookingCards';
import RecentClientsCard from '../../../components/recentClientsCard';
import {COLORS, fontFamly} from '../../../constants';
import {helper} from '../../../helper';
import {getDashboard} from '../../../services/Dashboard';
import useTranslation from '../../../hooks/useTranslation';

const ViewMoreButton = React.memo(({heading, onPress, showViewAll}) => (
  <View style={styles.viewMoreContainer}>
    <Text style={styles.viewMoreHeading}>{heading}</Text>
    {showViewAll && (
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.viewMoreText}>View All</Text>
      </TouchableOpacity>
    )}
  </View>
));

const Dashboard = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Booking');

  useEffect(() => {
    // App launch se pehle ki notification handle
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const {title, body} = remoteMessage.notification || {};
          console.log('Initial Notification:', title, body);
        }
      })
      .catch(console.error);

    // App background se open hone pe notification
    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        if (remoteMessage) {
          const {title, body} = remoteMessage.notification || {};
          console.log('Notification Opened:', title, body);
        }
      },
    );

    // App foreground me notification receive hone pe
    const unsubscribeForeground = messaging().onMessage(remoteMessage => {
      const {title, body} = remoteMessage.notification || {};
      helper.notificationCall(title, body, () => {});
    });

    return () => {
      unsubscribeOpened();
      unsubscribeForeground();
    };
  }, []);

  const dashboardStats = useMemo(
    () => [
      {
        title: 'All Clients',
        icon: ICONS.groupIcon,
        value: dashboardData?.stats?.totalClients ?? 0,
      },
      {
        title: 'Total Items',
        icon: ICONS.whiteCartIcon,
        value: dashboardData?.stats?.totalItemsListed ?? 0,
      },
      {
        title: 'Complete Bookings',
        icon: ICONS.checkIcon,
        value: dashboardData?.stats?.completedBookingsCount ?? 0,
      },
      {
        title: 'Monthly Revenue',
        icon: ICONS.earningIcon,
        value: dashboardData?.stats?.monthlyRevenue ?? 0,
      },
    ],
    [dashboardData],
  );

  const handleGetDashboard = useCallback(async () => {
    try {
      const response = await getDashboard();
      console.log(response, 'responseresponseresponseresponseresponseresponse');

      if (response?.status === 200 || response?.status === 201) {
        setDashboardData(response?.data || null);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message || t('failedToLoadDashboardData'),
        });
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    handleGetDashboard();
  }, [handleGetDashboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleGetDashboard();
  }, [handleGetDashboard]);

  const renderDashboardCard = ({item}) => <DashboardCard item={item} />;

  const renderRecentBookings = ({item, index}) => (
    <RecentBookingCards
      item={item}
      index={index}
      dataLength={dashboardData?.recentBookings?.length || 0}
    />
  );

  const renderActivityLog = ({item, index}) => (
    <ActivityLogCard
      item={item}
      index={index}
      dataLength={dashboardData?.activityLog?.length}
    />
  );

  const renderRecentClients = ({item, index}) => (
    <RecentClientsCard
      item={item}
      index={index}
      dataLength={dashboardData?.recentClients?.length || 0}
    />
  );

  return (
    <>
      <AppHeader
        headingText={t('dashboard')}
        leftIcon={ICONS.drawerIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.openDrawer()}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeText}>
            {t('welcomeUser', {name: 'John Doe'})}
          </Text>
          <Text style={styles.roleText}>{t('vendorDashboardOverview')}</Text>
        </View>

        <FlatList
          data={dashboardStats}
          numColumns={2}
          renderItem={renderDashboardCard}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.dashboardGrid}
          columnWrapperStyle={styles.columnWrapper}
        />

        {/* <View style={styles.tabContainer}>
          {['Booking', 'Sale'].map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                {
                  backgroundColor:
                    activeTab === tab ? COLORS.primary : COLORS.white,
                },
              ]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab ? COLORS.white : COLORS.textLight,
                  },
                ]}>
                {tab} Items
              </Text>
            </TouchableOpacity>
          ))}
        </View> */}

        <View style={styles.chartContainer}>
          <LineChartComponent
            data={
              activeTab === 'Booking' ? dashboardData?.orderOverview || [] : []
            }
          />
        </View>

        {dashboardData?.recentBookings?.length > 0 && (
          <View style={styles.sectionContainer}>
            <ViewMoreButton
              heading={t('recentBookingOffers')}
              showViewAll={dashboardData?.recentBookings?.length > 3}
              onPress={() =>
                navigation.navigate(
                  'AllRecentBookings',
                  dashboardData?.recentBookings,
                )
              }
            />
            <FlatList
              data={dashboardData?.recentBookings?.slice(0, 3) || []}
              renderItem={renderRecentBookings}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}

        {dashboardData?.activityLog?.length > 0 && (
          <View style={styles.sectionContainer}>
            <ViewMoreButton
              showViewAll={dashboardData?.activityLog?.length > 3}
              heading={t('activityLog')}
              onPress={() =>
                navigation.navigate(
                  'AllActivityLog',
                  dashboardData?.activityLog,
                )
              }
            />
            <FlatList
              data={dashboardData?.activityLog?.slice(0, 3)}
              renderItem={renderActivityLog}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}

        {dashboardData?.recentClients?.length > 0 && (
          <View style={styles.sectionContainer}>
            <ViewMoreButton
              showViewAll={dashboardData?.recentClients?.length > 3}
              heading={t('recentlyJoinedClients')}
              onPress={() =>
                navigation.navigate(
                  'AllRecentClients',
                  dashboardData?.recentClients,
                )
              }
            />
            <FlatList
              data={dashboardData?.recentClients?.slice(0, 3) || []}
              renderItem={renderRecentClients}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}

        <CommonAlert ref={modalRef} />
      </ScrollView>
    </>
  );
};

export default Dashboard;

const styles = {
  headerContainer: {
    padding: width(4),
    paddingBottom: 0,
  },
  welcomeText: {
    color: COLORS.black,
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  roleText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  dashboardGrid: {
    padding: width(3),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: width(3),
    marginVertical: width(3),
  },
  tabButton: {
    height: width(10),
    width: width(35),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: width(3),
    borderRadius: 12,
    paddingVertical: width(4),
    marginBottom: width(2),
  },
  sectionContainer: {
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: width(3),
    borderRadius: 12,
    paddingVertical: width(4),
    marginBottom: width(2),
  },
  viewMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width(4),
  },
  viewMoreHeading: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    fontSize: 12,
  },
  viewMoreText: {
    fontSize: 10,
    marginTop: width(1),
    color: COLORS.primary,
    textDecorationColor: 'underline',
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
};

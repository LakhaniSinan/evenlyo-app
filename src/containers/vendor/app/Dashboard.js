import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
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
import {getDashboard} from '../../../services/Dashboard';
import useTranslation from '../../../hooks/useTranslation';
import {useSelector} from 'react-redux';

const ViewMoreButton = React.memo(
  ({heading, onPress, showViewAll, viewAllLabel}) => (
    <View style={styles.viewMoreContainer}>
      <Text style={styles.viewMoreHeading}>{heading}</Text>
      {showViewAll && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.viewMoreText}>{viewAllLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  ),
);

const DashboardEmptyState = React.memo(({icon, title, subtitle}) => (
  <View style={styles.emptyStateContainer}>
    {icon ? (
      <Image source={icon} resizeMode="contain" style={styles.emptyStateIcon} />
    ) : null}
    <Text style={styles.emptyStateTitle}>{title}</Text>
    {subtitle ? (
      <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
    ) : null}
  </View>
));

const Dashboard = () => {
  const navigation = useNavigation();
  const {t, currentLanguage} = useTranslation();
  const {user} = useSelector(state => state.LoginSlice);
  console.log(user, 'useruseruseruseruseruser');

  const tRef = useRef(t);
  tRef.current = t;
  const modalRef = useRef(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Booking');

  const dashboardStats = useMemo(
    () => [
      {
        id: 'totalClients',
        title: t('Total Clients'),
        icon: ICONS.groupIcon,
        value: dashboardData?.stats?.totalClients ?? 0,
      },
      {
        id: 'totalBookings',
        title: t('Total Bookings'),
        icon: ICONS.cartIcon,
        iconTint: COLORS.primary,
        value:
          dashboardData?.stats?.totalBookingsCount ??
          dashboardData?.stats?.totalBookings ??
          0,
      },
      {
        id: 'completedBookings',
        title: t('Completed Bookings'),
        icon: ICONS.checkIcon,
        value:
          dashboardData?.stats?.completedBookingsCount ??
          dashboardData?.stats?.completedBookings ??
          0,
      },
      {
        id: 'revenue',
        title: t('Revenue'),
        icon: ICONS.earningIcon,
        value: `€${dashboardData?.stats?.monthlyRevenue ?? 0}`,
      },
    ],
    [dashboardData, t],
  );

  const handleGetDashboard = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await getDashboard();
      console.log(
        response,
        'responseresponseresponseresponseresponseresponseasdd',
      );

      if (response?.status === 200 || response?.status === 201) {
        setDashboardData(response?.data || null);
      } else {
        modalRef.current?.show({
          status: 'error',
          message:
            response?.data?.message ||
            tRef.current('failedToLoadDashboardData'),
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
    handleGetDashboard();
  }, [handleGetDashboard]);

  const orderChartData = useMemo(
    () => [
      ...(dashboardData?.orderOverviewDaily || []),
      ...(dashboardData?.orderOverview || []),
    ],
    [dashboardData?.orderOverview, dashboardData?.orderOverviewDaily],
  );

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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeText}>
            {t('welcomeUser', {name: user?.firstName})}
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
            data={activeTab === 'Booking' ? orderChartData : []}
          />
        </View>

        {dashboardData !== null && (
          <>
            <View style={styles.sectionContainer}>
              <ViewMoreButton
                heading={t('recentBookingOffers')}
                viewAllLabel={t('viewAll')}
                showViewAll={(dashboardData?.recentBookings?.length ?? 0) > 3}
                onPress={() =>
                  navigation.navigate(
                    'AllRecentBookings',
                    dashboardData?.recentBookings ?? [],
                  )
                }
              />
              {(dashboardData?.recentBookings?.length ?? 0) > 0 ? (
                <FlatList
                  data={dashboardData.recentBookings.slice(0, 3)}
                  renderItem={renderRecentBookings}
                  extraData={currentLanguage}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <DashboardEmptyState
                  icon={ICONS.calenderIcon}
                  title={t('dashboardNoBookingsYet')}
                  subtitle={t('dashboardNoBookingsSubtitle')}
                />
              )}
            </View>

            <View style={styles.sectionContainer}>
              <ViewMoreButton
                showViewAll={(dashboardData?.activityLog?.length ?? 0) > 3}
                heading={t('activityLog')}
                viewAllLabel={t('viewAll')}
                onPress={() =>
                  navigation.navigate(
                    'AllActivityLog',
                    dashboardData?.activityLog ?? [],
                  )
                }
              />
              {(dashboardData?.activityLog?.length ?? 0) > 0 ? (
                <FlatList
                  data={dashboardData.activityLog.slice(0, 3)}
                  renderItem={renderActivityLog}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <DashboardEmptyState title={t('dashboardNoActivity')} />
              )}
            </View>

            <View style={styles.sectionContainer}>
              <ViewMoreButton
                showViewAll={(dashboardData?.recentClients?.length ?? 0) > 3}
                heading={t('recentlyJoinedClients')}
                viewAllLabel={t('viewAll')}
                onPress={() =>
                  navigation.navigate(
                    'AllRecentClients',
                    dashboardData?.recentClients ?? [],
                  )
                }
              />
              {(dashboardData?.recentClients?.length ?? 0) > 0 ? (
                <FlatList
                  data={dashboardData.recentClients.slice(0, 3)}
                  renderItem={renderRecentClients}
                  keyExtractor={(item, index) => index.toString()}
                  scrollEnabled={false}
                />
              ) : (
                <DashboardEmptyState
                  icon={ICONS.groupIcon}
                  title={t('dashboardNoClientsYet')}
                  subtitle={t('dashboardNoClientsSubtitle')}
                />
              )}
            </View>
          </>
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
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width(6),
    paddingVertical: width(8),
  },
  emptyStateIcon: {
    width: width(14),
    height: width(14),
    marginBottom: width(3),
    opacity: 0.45,
    tintColor: COLORS.textLight,
  },
  emptyStateTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 13,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: width(1.5),
  },
  emptyStateSubtitle: {
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
};

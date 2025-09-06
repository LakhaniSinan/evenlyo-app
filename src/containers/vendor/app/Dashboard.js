import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
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
import DashboardCard from '../../../components/dashboardCard';
import RecentBookingCards from '../../../components/recentBookingCards';
import RecentClientsCard from '../../../components/recentClientsCard';
import {COLORS, fontFamly} from '../../../constants';

const dashboardData = [
  {
    title: 'All Clients',
    icon: ICONS.groupIcon,
    value: 1247,
    percentage: 10,
  },
  {
    title: 'Total Items',
    icon: ICONS.whiteCartIcon,
    value: 89,
    percentage: 10,
  },
  {
    title: 'Complete Bookings',
    icon: ICONS.checkIcon,
    value: 456,
    percentage: 10,
  },
  {
    title: 'Monthly Revenue',
    icon: ICONS.earningIcon,
    value: 12450,
    percentage: 10,
  },
];

export const ViewMoreButton = ({onPress, heading}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: width(4),
      }}>
      <Text
        style={{
          fontFamily: fontFamly.PlusJakartaSansBold,
          color: COLORS.textDark,
          fontSize: 12,
        }}>
        {heading}
      </Text>
      <TouchableOpacity onPress={onPress}>
        <Text
          style={{
            fontSize: 10,
            marginTop: width(1),
            color: COLORS.primary,
            textDecorationColor: 'underline',
            fontFamily: fontFamly.PlusJakartaSansSemiBold,
          }}>
          View All
        </Text>
      </TouchableOpacity>
    </View>
  );
};
function Dashboard() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'Dashboard'}
        leftIcon={ICONS.drawerIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => {
          navigation.openDrawer();
        }}
        onRightIconPress={() => {
          navigation.navigate('Notifications');
        }}
      />
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={{flex: 1, padding: width(4), paddingBottom: 0}}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
            }}>
            Welcome, John Doe
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: fontFamly.PlusJakartaSansMedium,
              color: COLORS.textLight,
            }}>
            Role: Vendor • Here's an overview of your business performance
          </Text>
        </View>

        <FlatList
          data={dashboardData}
          numColumns={2}
          renderItem={({item, index}) => {
            return <DashboardCard item={item} />;
          }}
          contentContainerStyle={{
            padding: width(3),
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        />
        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            marginHorizontal: width(3),
            borderRadius: 12,
            paddingVertical: width(4),
          }}>
          <LineChartComponent />
        </View>

        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            marginTop: width(3),
            marginHorizontal: width(3),
            borderRadius: 12,
            paddingVertical: width(4),
            marginBottom: width(2),
          }}>
          <ViewMoreButton onPress={() => {}} heading={'Recent Bookings'} />
          <FlatList
            data={data}
            renderItem={({item, index}) => (
              <RecentBookingCards
                item={item}
                index={index}
                dataLength={data.length}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            marginTop: width(3),
            marginHorizontal: width(3),
            borderRadius: 12,
            paddingVertical: width(4),
            marginBottom: width(2),
          }}>
          <ViewMoreButton onPress={() => {}} heading={'Activity Log'} />
          <FlatList
            data={data}
            renderItem={({item, index}) => (
              <ActivityLogCard
                item={item}
                index={index}
                dataLength={data.length}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            marginTop: width(3),
            marginHorizontal: width(3),
            borderRadius: 12,
            paddingVertical: width(4),
            marginBottom: width(2),
          }}>
          <ViewMoreButton
            onPress={() => {}}
            heading={'Recently Joined Clients'}
          />
          <FlatList
            data={data}
            renderItem={({item, index}) => (
              <RecentClientsCard
                item={item}
                index={index}
                dataLength={data.length}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Dashboard;
const data = [
  {
    id: 1,
    name: 'Sarah Johnson',
    initials: 'SJ',
    status: 'New',
    statusColor: '#FFB6C1',
    service: 'Camera Equipment',
    location: 'Downtown',
    time: '2 hours ago',
  },
  {
    id: 2,
    name: 'Mike Chen',
    initials: 'MC',
    status: 'Confirmed',
    statusColor: '#90EE90',
    service: 'Sound System',
    location: 'Downtown',
    time: '2 hours ago',
  },
  {
    id: 3,
    name: 'Chen',
    initials: 'MC',
    status: 'Confirmed',
    statusColor: '#FFB6C1',
    service: 'Sound System',
    location: 'Downtown',
    time: '2 hours ago',
  },
];

import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import AllBookingCard from '../../../components/allBookingCard';
import AppHeader from '../../../components/appHeader';
import BookingFilterModal from '../../../components/modals/BookingFilterModal';
import DailyCalendar from '../../../components/timeChart';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getBookingAnalytics} from '../../../services/BookingItem';

const countBookingsByStatus = (bookings = []) => {
  const statusCounts = {
    pending: 0,
    accepted: 0,
    rejected: 0,
    claim: 0,
    'on the way': 0,
    received: 0,
    finished: 0,
    'picked up': 0,
    'received back': 0,
    complete: 0,
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
  const navigation = useNavigation();
  const {t} = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [listingCartData, setListingCartData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState([]);
  const [stats, setStats] = useState(null);

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
        selectedColor: COLORS.primary,
        customStyles: {
          container: {
            backgroundColor: COLORS.primary,
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

  const onRefresh = useCallback(() => {
    handleGetCartListing();
  }, [handleGetCartListing]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'All Bookings'}
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
              todayTextColor: COLORS.primary,
              arrowColor: COLORS.primary,
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

      <BookingFilterModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

export default React.memo(AllBookingScreen);

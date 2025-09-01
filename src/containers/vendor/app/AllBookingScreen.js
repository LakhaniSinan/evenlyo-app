import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import React, {useRef, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../../assets';
import AllBookingCard from '../../../components/allBookingCard';
import AppHeader from '../../../components/appHeader';
import CustomPicker from '../../../components/customPicker';
import BookingFilterModal from '../../../components/modals/BookingFilterModal';
import DailyCalendar from '../../../components/timeChart';
import {COLORS, fontFamly} from '../../../constants';

const dashboardData = [
  {
    title: 'Total Bookings',
    icon: ICONS.groupIcon,
    value: 10,
    percentage: 12,
  },
  {
    title: 'Total Items',
    icon: ICONS.whiteCartIcon,
    value: 3,
    percentage: 10,
  },
  {
    title: 'Request Bookings',
    icon: ICONS.checkIcon,
    value: 7,
    percentage: 10,
  },
  {
    title: 'In Process',
    icon: ICONS.earningIcon,
    value: 10,
    percentage: 10,
  },
];

const statusData = [
  {
    title: 'Completed',
    value: 80,
  },
  {
    title: 'New Requests',
    value: 20,
  },
  {
    title: 'In Progress',
    value: 10,
  },
  {
    title: 'Delivered',
    value: 10,
  },
  {
    title: 'Received',
    value: 69,
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

function AllBookingScreen() {
  const navigation = useNavigation();
  const selectSizeRef = useRef();
  const [filterType, setFilterType] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const gradientColors = ['#FF295D', '#E31B95', '#C817AE'];
  console.log(selectedDate, 'selectedDateselectedDate');

  const handleSelectValue = (name, value) => {
    setFilterType(value?.name || value);
  };

  const handleDaySelect = day => {
    const formattedDate = dayjs(day.dateString).format('DD-MM-YYYY');
    setSelectedDate(formattedDate);

    setMarkedDates({
      [day.dateString]: {
        selected: true,
      },
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'All Bookings'}
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
        {/* Dashboard Cards */}
        <View
          style={{
            marginTop: width(4),
            gap: width(4),
            flexWrap: 'wrap',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: width(8),
          }}>
          {dashboardData.map(item => {
            return <AllBookingCard item={item} key={item.title} />;
          })}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: width(3),
            paddingHorizontal: width(4),
          }}>
          <View style={{width: width(40)}}>
            <CustomPicker
              ref={selectSizeRef}
              labelll={'By Week'}
              value={filterType || 'Select'}
              dropdownContainerStyle={{
                backgroundColor: COLORS.backgroundLight,
                paddingVertical: width(3),
                borderRadius: 6,
              }}
              listData={[
                {name: 'Today'},
                {name: 'Weekly'},
                {name: 'Monthly'},
                {name: '6Monthly'},
                {name: 'Yearly'},
              ]}
              name="filterType"
              handleSelectValue={handleSelectValue}
            />
          </View>
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
            minDate={dayjs().format('YYYY-MM-DD')}
            onDayPress={handleDaySelect}
            markingType="custom"
            markedDates={markedDates}
            dayComponent={({date, state}) => {
              const isSelected = markedDates[date.dateString];
              return (
                <TouchableOpacity onPress={() => handleDaySelect(date)}>
                  {isSelected ? (
                    <LinearGradient
                      colors={gradientColors}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 100,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: '#fff', fontWeight: 'bold'}}>
                        {date.day}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text
                      style={{
                        textAlign: 'center',
                        color: state === 'disabled' ? '#ccc' : '#000',
                        padding: 10,
                      }}>
                      {date.day}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
            theme={{
              todayTextColor: 'red',
              arrowColor: 'blue',
            }}
          />
        ) : (
          <DailyCalendar
            goBack={() => setSelectedDate('')}
            selectedDate={selectedDate}
            onEventPress={event => navigation.navigate('BookingHistory', event)}
          />
        )}

        {statusData.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: width(12),
                backgroundColor: COLORS.backgroundLight,
                marginTop: width(4),
                paddingHorizontal: width(3),
                marginHorizontal: width(4),
                borderRadius: width(3),
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: fontFamly.PlusJakartaSansSemiBold,
                  }}>
                  {item?.title}
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
          );
        })}
        <View style={{height: width(5)}} />
      </ScrollView>

      {/* Filter Modal */}
      <BookingFilterModal
        isVisible={modalVisible}
        onClose={() => setModalVisible()}
      />
    </SafeAreaView>
  );
}

export default AllBookingScreen;

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

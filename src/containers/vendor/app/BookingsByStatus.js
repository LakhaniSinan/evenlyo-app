import moment from 'moment';
import React, {useCallback, useEffect, useState} from 'react';
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
import {useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getBookingByStatus} from '../../../services/BookingItem';

const BookingsByStatus = ({navigation, route}) => {
  const {t, currentLanguage} = useTranslation();
  const event = route.params;
  console.log(event, 'titletitletitletitletitletitle');

  const [activeTab, setActiveTab] = useState(0);
  const [listingCartData, setListingCartData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const {user} = useSelector(state => state.LoginSlice);

  const handleGetCartListing = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      const response = await getBookingByStatus({
        status: event?.title?.toLowerCase(),
        vendorId: user?.id,
      });
      console.log(
        response,
        'responseresponseresponseresponseasdasdsadsaderfwetr',
      );

      if (response?.status === 200 || response?.status === 201) {
        let data = response?.data?.data || [];
        setListingCartData(data);
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

  useEffect(() => {
    handleGetCartListing();
  }, [handleGetCartListing]);

  const onRefresh = useCallback(() => {
    handleGetCartListing();
  }, [handleGetCartListing]);

  const BookingCard = ({item}) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardImageWrapper}>
          <Image
            source={{
              uri: item?.listingDetails?.images[0] || '',
            }}
            resizeMode="cover"
            style={styles.cardImage}
          />
        </View>

        <View style={styles.cardDetails}>
          {/* 🏷️ Title */}
          <Text style={styles.title}>
            {currentLanguage == 'en'
              ? item?.listingDetails?.title?.en
              : item?.listingDetails?.title?.nl || 'Untitled'}
          </Text>

          <Text numberOfLines={2} style={styles.bookingId}>
            Location:{' '}
            {item?.listingDetails?.location?.address ||
              item?.details?.eventLocation}
          </Text>

          <Text style={styles.bookingId}>
            Booking ID: {item?.trackingId || 'N/A'}
          </Text>

          <View style={styles.dateTimeWrapper}>
            <Text style={styles.dateTime}>
              Start: {moment(item?.details?.startDate).format('MMMM DD, YYYY')}
            </Text>
            <Text style={styles.dateTime}>
              End: {moment(item?.details?.startDate).format('MMMM DD, YYYY')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('BookingDetails', {...item, tab: activeTab})
            }
            style={styles.button}>
            <Text style={[styles.buttonText, {color: COLORS.black}]}>
              {t('View Details')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // if (loading) {
  //   return (
  //     <View style={styles.loaderContainer}>
  //       <ActivityIndicator size="large" color={COLORS.primary} />
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText={`${
          event?.status?.charAt(0).toUpperCase() +
            event?.status?.slice(1).toLowerCase() ||
          event?.title?.charAt(0).toUpperCase() +
            event?.title?.slice(1).toLowerCase()
        } Booking`}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />

      <FlatList
        data={listingCartData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <BookingCard item={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No items found for "
            {event?.status?.charAt(0).toUpperCase() +
              event?.status?.slice(1).toLowerCase() ||
              event?.title?.charAt(0).toUpperCase() +
                event?.title?.slice(1).toLowerCase()}
            " in {activeTab}.
          </Text>
        }
        contentContainerStyle={{paddingBottom: 20}}
      />
    </SafeAreaView>
  );
};

export default BookingsByStatus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: width(3),
    backgroundColor: COLORS.backgroundLight,
    padding: width(1),
    borderRadius: width(4),
    marginTop: width(2),
  },
  button: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
    borderRadius: 6,
    width: width(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textLight,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 15,
    marginHorizontal: width(3),
    marginTop: width(3),
    paddingHorizontal: width(3),
    backgroundColor: COLORS.backgroundLight,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImageWrapper: {
    height: width(40),
    width: width(30),
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: width(3),
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  cardDetails: {
    width: width(55),
    marginVertical: width(3),
    paddingHorizontal: width(2),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizer: {
    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
    color: COLORS.textLight,
    fontSize: 9,
  },
  statusWrapper: {
    paddingHorizontal: width(4),
    borderRadius: 100,
    paddingVertical: width(1),
  },
  statusText: {
    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
    fontSize: 9,
    color: COLORS.white,
  },
  title: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    fontSize: 12,
    paddingRight: width(8),
  },
  bookingId: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
    fontSize: 10,
    paddingRight: width(8),
  },
  dateTimeWrapper: {
    justifyContent: 'space-between',
  },
  dateTime: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    fontSize: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});

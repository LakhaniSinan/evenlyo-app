import moment from 'moment';
import 'moment/locale/nl';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {normalizeStatusKey} from '../../../utils/translatePricingBreakdownLabel';

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

const getStatusLabel = (status, t) => {
  const key = BOOKING_STATUS_I18N[normalizeStatusKey(status)];
  if (key) {
    return t(key);
  }
  const raw = String(status || '').trim();
  return raw || t('bookings');
};

const resolveLocationLine = (address, eventLocation, lang) => {
  if (address != null && address !== '') {
    if (typeof address === 'string') {
      return address.trim();
    }
    if (typeof address === 'object') {
      return lang === 'nl'
        ? String(address.nl || address.en || '').trim()
        : String(address.en || address.nl || '').trim();
    }
  }
  if (eventLocation != null && eventLocation !== '') {
    if (typeof eventLocation === 'string') {
      return eventLocation.trim();
    }
    if (typeof eventLocation === 'object') {
      return lang === 'nl'
        ? String(eventLocation.nl || eventLocation.en || '').trim()
        : String(eventLocation.en || eventLocation.nl || '').trim();
    }
  }
  return '';
};

const BookingsByStatus = ({navigation, route}) => {
  const {t, currentLanguage} = useTranslation();
  const event = route.params;
  const [activeTab] = useState(0);
  const [listingCartData, setListingCartData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const {user} = useSelector(state => state.LoginSlice);

  const statusParam = useMemo(
    () =>
      event?.status?.toLowerCase() ||
      event?.statusKey?.toLowerCase() ||
      event?.title?.toLowerCase() ||
      '',
    [event?.status, event?.statusKey, event?.title],
  );

  const headerStatusLabel = useMemo(
    () => getStatusLabel(event?.status || event?.statusKey || event?.title, t),
    [event?.status, event?.statusKey, event?.title, t],
  );

  const pageTitle = useMemo(
    () => t('bookingsByStatusPageTitle', {status: headerStatusLabel}),
    [t, headerStatusLabel],
  );

  const emptyMessage = useMemo(
    () => t('bookingsByStatusEmpty', {status: headerStatusLabel}),
    [t, headerStatusLabel],
  );

  const dateLocale = currentLanguage === 'nl' ? 'nl' : 'en';

  const formatListingDate = useCallback(
    value => {
      if (!value) {
        return t('notAvailable');
      }
      const m = moment(value);
      if (!m.isValid()) {
        return t('notAvailable');
      }
      return m.locale(dateLocale).format('LL');
    },
    [dateLocale, t],
  );

  const handleGetCartListing = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      const response = await getBookingByStatus({
        status: statusParam,
        vendorId: user?.id,
      });

      if (response?.status === 200 || response?.status === 201) {
        const data = response?.data?.data || [];
        setListingCartData(Array.isArray(data) ? data : []);
      } else {
        setListingCartData([]);
      }
    } catch (error) {
      setListingCartData([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [statusParam, user?.id]);

  useEffect(() => {
    handleGetCartListing();
  }, [handleGetCartListing]);

  const onRefresh = useCallback(() => {
    handleGetCartListing();
  }, [handleGetCartListing]);

  const renderBookingCard = useCallback(
    ({item}) => {
      const titleObj = item?.listingDetails?.title;
      const listingTitle =
        currentLanguage === 'nl'
          ? titleObj?.nl || titleObj?.en
          : titleObj?.en || titleObj?.nl;

      const locationLine = resolveLocationLine(
        item?.listingDetails?.location?.address,
        item?.details?.eventLocation,
        currentLanguage,
      );

      const startRaw =
        item?.details?.startDate ||
        item?.bookingDateTime?.start ||
        item?.startDate;
      const endRaw =
        item?.details?.endDate ||
        item?.bookingDateTime?.end ||
        item?.endDate ||
        startRaw;

      return (
        <View style={styles.card}>
          <View style={styles.cardImageWrapper}>
            <Image
              source={{
                uri: item?.listingDetails?.images?.[0] || '',
              }}
              resizeMode="cover"
              style={styles.cardImage}
            />
          </View>

          <View style={styles.cardDetails}>
            <Text style={styles.title}>
              {(listingTitle || '').trim() || t('Untitled')}
            </Text>

            <Text numberOfLines={2} style={styles.bookingId}>
              {`${t('bookingsByStatusLocationLabel')}: `}
              {locationLine.trim() || t('notAvailable')}
            </Text>

            <Text style={styles.bookingId}>
              {`${t('bookingsByStatusBookingIdLabel')}: `}
              {item?.trackingId || t('N/A')}
            </Text>

            <View style={styles.dateTimeWrapper}>
              <Text style={styles.dateTime}>
                {`${t('bookingsByStatusStartLabel')}: `}
                {formatListingDate(startRaw)}
              </Text>
              <Text style={styles.dateTime}>
                {`${t('bookingsByStatusEndLabel')}: `}
                {formatListingDate(endRaw)}
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
    },
    [
      activeTab,
      currentLanguage,
      formatListingDate,
      navigation,
      t,
    ],
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText={pageTitle}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />

      <FlatList
        data={listingCartData}
        keyExtractor={(item, index) =>
          item?._id?.toString() || item?.trackingId || String(index)
        }
        renderItem={renderBookingCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          ) : null
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

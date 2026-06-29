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
import {
  getBookingByDate,
  getBookingByStatus,
} from '../../../services/BookingItem';
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

const parseBookingDate = value => {
  if (!value) {
    return null;
  }
  const parsed = moment(value);
  return parsed.isValid() ? parsed.startOf('day') : null;
};

const bookingOverlapsDateRange = (booking, startDate, endDate) => {
  const bookingStart = parseBookingDate(
    booking?.details?.startDate ||
      booking?.bookingDateTime?.start ||
      booking?.startDate,
  );
  const bookingEnd = parseBookingDate(
    booking?.details?.endDate ||
      booking?.bookingDateTime?.end ||
      booking?.endDate ||
      booking?.details?.startDate ||
      booking?.bookingDateTime?.start ||
      booking?.startDate,
  );

  if (!bookingStart && !bookingEnd) {
    return false;
  }

  const startPoint = bookingStart || bookingEnd;
  const endPoint = bookingEnd || bookingStart;
  const startBoundary = parseBookingDate(startDate);
  const endBoundary = (
    parseBookingDate(endDate) || parseBookingDate(startDate)
  )?.endOf('day');

  if (!startBoundary && !endBoundary) {
    return true;
  }

  return (
    startPoint?.isSameOrBefore(endBoundary) &&
    endPoint?.isSameOrAfter(startBoundary)
  );
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
  const [rawListingData, setRawListingData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const {user} = useSelector(state => state.LoginSlice);

  const filterMode = event?.filterMode === 'date' ? 'date' : 'status';
  const dateFilters = event?.dateFilters || {};
  const statusFilter = event?.statusFilter || '';
  const selectedDate = event?.selectedDate || dateFilters?.startDate || '';
  const dateLocale = currentLanguage === 'nl' ? 'nl' : 'en';

  const statusParam = useMemo(() => {
    if (filterMode === 'date') {
      return '';
    }
    return event?.statusKey?.toLowerCase() || '';
  }, [event?.statusKey, filterMode]);

  const headerStatusLabel = useMemo(
    () => getStatusLabel(event?.statusKey || event?.title, t),
    [event?.statusKey, event?.title, t],
  );

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) {
      return '';
    }
    const parsed = moment(selectedDate);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '';
  }, [dateLocale, selectedDate]);

  const pageTitle = useMemo(() => {
    if (filterMode === 'date' && formattedSelectedDate) {
      return t('bookingsByDatePageTitle', {date: formattedSelectedDate});
    }
    return t('bookingsByStatusPageTitle', {status: headerStatusLabel});
  }, [filterMode, formattedSelectedDate, headerStatusLabel, t]);

  const emptyMessage = useMemo(() => {
    if (filterMode === 'date' && formattedSelectedDate) {
      return t('bookingsByDateEmpty', {date: formattedSelectedDate});
    }
    return t('bookingsByStatusEmpty', {status: headerStatusLabel});
  }, [filterMode, formattedSelectedDate, headerStatusLabel, t]);

  const formatListingDate = useCallback(
    value => {
      if (!value) {
        return t('notAvailable');
      }
      const m = moment(value);
      if (!m.isValid()) {
        return t('notAvailable');
      }
      return m.format('DD/MM/YYYY');
    },
    [dateLocale, t],
  );

  const handleGetCartListing = useCallback(async () => {
    try {
      setRefreshing(true);
      setLoading(true);

      let response;
      if (filterMode === 'date') {
        if (!selectedDate) {
          setRawListingData([]);
          return;
        }
        response = await getBookingByDate({
          date: selectedDate,
          vendorId: user?.id,
        });
      } else {
        response = await getBookingByStatus({
          status: statusParam,
          vendorId: user?.id,
        });
      }

      if (response?.status === 200 || response?.status === 201) {
        const data = response?.data?.data || [];
        setRawListingData(Array.isArray(data) ? data : []);
      } else {
        setRawListingData([]);
      }
    } catch (error) {
      setRawListingData([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [filterMode, selectedDate, statusParam, user?.id]);

  useEffect(() => {
    handleGetCartListing();
  }, [handleGetCartListing]);

  const onRefresh = useCallback(() => {
    handleGetCartListing();
  }, [handleGetCartListing]);

  const listingCartData = useMemo(() => {
    let result = rawListingData;

    if (filterMode === 'date' && (dateFilters?.startDate || dateFilters?.endDate)) {
      result = result.filter(item =>
        bookingOverlapsDateRange(
          item,
          dateFilters.startDate,
          dateFilters.endDate,
        ),
      );
    }

    if (filterMode === 'status' && statusFilter) {
      const normalizedStatus = statusFilter.trim().toLowerCase();
      result = result.filter(
        item => item?.status?.trim()?.toLowerCase() === normalizedStatus,
      );
    }

    return result;
  }, [
    dateFilters?.endDate,
    dateFilters?.startDate,
    filterMode,
    rawListingData,
    statusFilter,
  ]);

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

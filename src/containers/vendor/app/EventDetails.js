import moment from 'moment';
import 'moment/locale/nl';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CarouselComponent from '../../../components/carousel';
import CommonAlert from '../../../components/commanAlert';
import EventAndPriceDetails, {
  EventListingReviewsSection,
} from '../../../components/eventDetailAndPrice';
import Loader from '../../../components/loder';
import CategoryEditSuccess from '../../../components/modals/CategoryEditSuccess';
import DeleteRequestModal from '../../../components/modals/DeleteRequestModal';
import OrderBooking from '../../../components/modals/OrderBookingModal';
import RequestConfirmation from '../../../components/modals/RequestConfirmation';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {formatPrice} from '../../../utils';
import {getBookingDetails, toggleStatus} from '../../../services/ListingsItem';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const pickApiMessage = (message, lang) => {
  if (message == null) {
    return '';
  }
  if (typeof message === 'string') {
    return message;
  }
  if (typeof message === 'object') {
    return lang === 'nl' ? message.nl || message.en : message.en || message.nl;
  }
  return String(message);
};

function EventDetailsScreen({navigation, route}) {
  const {t, currentLanguage} = useTranslation();
  const item = route.params;
  const modalRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [deleteRequestVisible, setDeleteRequestVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [listingDetails, setListingDetails] = useState(null);

  const handleGetListingDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getBookingDetails(item?._id);

      if (response.status === 200 || response.status === 201) {
        setListingDetails(response.data.data);
      } else {
        const msg =
          pickApiMessage(response?.data?.message, currentLanguage) ||
          t('Something went wrong');
        modalRef.current?.show({
          status: 'error',
          message: msg,
        });
      }
    } catch (error) {
      console.log('Error fetching listing details:', error);
      modalRef.current?.show({
        status: 'error',
        message: t('Something went wrong'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [item?._id, currentLanguage, t]);

  useEffect(() => {
    handleGetListingDetails();
  }, [handleGetListingDetails]);

  const onStatusChange = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await toggleStatus(item?.id);
      if (response?.status === 200 || response?.status === 201) {
        const msg =
          pickApiMessage(response?.data?.message, currentLanguage) ||
          t('successfullyChanged');
        modalRef.current?.show({
          status: 'ok',
          message: msg,
          handlePressOk: async () => {
            modalRef.current?.hide();
            await handleGetListingDetails();
          },
        });
      } else {
        const msg =
          pickApiMessage(response?.data?.message, currentLanguage) ||
          t('Something went wrong');
        modalRef.current?.show({
          status: 'error',
          message: msg,
        });
      }
    } catch (error) {
      console.log('Error toggling status:', error);
      modalRef.current?.show({
        status: 'error',
        message: t('Something went wrong'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [item?.id, handleGetListingDetails, currentLanguage, t]);

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);

  const handleSendBookingRequest = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setRequestModalVisible(true), 500);
  }, []);

  const handleTrackBooking = useCallback(() => {
    setDeleteRequestVisible(false);
    setTimeout(() => setSuccessModalVisible(true), 500);
    setTimeout(() => setSuccessModalVisible(false), 2000);
  }, []);

  const scheduleData = useMemo(() => {
    if (!listingDetails) {
      return [];
    }
    const locale = currentLanguage === 'nl' ? 'nl' : 'en';
    const slot = listingDetails?.availability?.availableTimeSlots?.[0] || {};
    const unavailableLabel = t('notAvailable');

    const mondayWeek = moment().locale(locale).clone().isoWeekday(1);

    return WEEKDAY_KEYS.map((dayKey, index) => {
      const isAvailable = listingDetails?.availability?.availableDays?.includes(
        dayKey,
      );
      const dayLabel = mondayWeek
        .clone()
        .add(index, 'days')
        .format('ddd');

      return {
        day: dayLabel,
        isAvailable,
        opening: isAvailable ? slot.startTime || unavailableLabel : '',
        closing: isAvailable ? slot.endTime || unavailableLabel : '',
      };
    });
  }, [listingDetails, currentLanguage, t]);

  const descriptionParagraph = useMemo(() => {
    const desc = listingDetails?.description;
    if (!desc) {
      return t('notAvailable');
    }
    if (typeof desc === 'string') {
      return desc.trim() || t('notAvailable');
    }
    const text =
      currentLanguage === 'nl'
        ? desc.nl || desc.en
        : desc.en || desc.nl;
    return (text || '').trim() || t('notAvailable');
  }, [listingDetails?.description, currentLanguage, t]);

  const feeAmount = listingDetails?.pricing?.securityFee;
  const perKmAmount = listingDetails?.pricing?.pricePerKm;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText={t('vendorEventDetailsHeader')}
        leftIcon={ICONS.leftArrowIcon}
        onLeftIconPress={handleBackPress}
      />
      <ScrollView style={styles.scrollView}>
        <CarouselComponent data={listingDetails?.images || []} />
        <View style={styles.detailsContainer}>
          <EventAndPriceDetails
            data={listingDetails}
            showDiscount={false}
            showSwitch
            onStatusChange={onStatusChange}
          />
        </View>

        <View style={styles.feeContainer}>
          <View style={styles.feeRow}>
            <Text style={styles.feeText}>
              {t('vendorEventFeeExtraPrefix', {
                amount:
                  feeAmount != null && feeAmount !== ''
                    ? formatPrice(feeAmount)
                    : t('notAvailable'),
              })}
            </Text>
            <Text style={styles.feeSubText}>
              {t('vendorEventSecurityFeeShortLabel')}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeText}>
              {t('vendorEventKmRowLabel')}
              :
            </Text>
            <Text style={styles.feeSubText}>
              {t('vendorEventPricePerKmLine', {
                amount:
                  perKmAmount != null && perKmAmount !== ''
                    ? formatPrice(perKmAmount)
                    : t('notAvailable'),
              })}
            </Text>
          </View>
        </View>

        <EventListingReviewsSection data={listingDetails} />

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>{`${t('Description')}:`}</Text>
          <Text numberOfLines={4} style={styles.descriptionText}>
            {descriptionParagraph}
          </Text>
        </View>

        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>
            {t('vendorEventOpeningHoursTitle')}
          </Text>
          {scheduleData.map((row, index) => (
            <View
              key={index}
              style={[
                styles.scheduleRow,
                index === scheduleData.length - 1 && {borderBottomWidth: 0},
              ]}>
              <Text style={styles.scheduleDay}>{row.day}</Text>
              <Text
                style={[
                  styles.scheduleTime,
                  {color: row.isAvailable ? COLORS.textLight : '#999'},
                ]}>
                {row.isAvailable
                  ? t('vendorEventTimeSlotRange', {
                      start: row.opening,
                      end: row.closing,
                    })
                  : t('vendorEventScheduleClosed')}
              </Text>
            </View>
          ))}
        </View>

        {/* Modals */}
        <OrderBooking
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          handleSendBookingRequest={handleSendBookingRequest}
        />
        <RequestConfirmation
          visible={requestModalVisible}
          onClose={() => setRequestModalVisible(false)}
          navigation={navigation}
        />
        <DeleteRequestModal
          visible={deleteRequestVisible}
          onClose={() => setDeleteRequestVisible(false)}
          navigation={navigation}
          handleTrackBooking={handleTrackBooking}
        />
        <CategoryEditSuccess
          visible={successModalVisible}
          type="vendorEventSuccessfullyDeletedModal"
        />

        <Loader isLoading={isLoading} />
        <CommonAlert ref={modalRef} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},
  scrollView: {flex: 1},
  detailsContainer: {marginHorizontal: 10, marginTop: width(3)},
  feeContainer: {
    height: width(10),
    marginHorizontal: width(5),
    marginRight: width(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeRow: {flexDirection: 'row', alignItems: 'center'},
  feeText: {color: COLORS.black},
  feeSubText: {color: COLORS.textLight, marginLeft: width(2)},
  descriptionContainer: {paddingVertical: width(3), marginHorizontal: 20},
  descriptionTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.black,
  },
  descriptionText: {
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 10,
    color: COLORS.textLight,
  },
  scheduleContainer: {
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: width(4),
    borderRadius: width(3),
    paddingVertical: width(3),
    marginBottom: width(4),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  scheduleTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 13,
    color: COLORS.black,
    marginBottom: width(2),
    paddingHorizontal: width(3),
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width(3),
    paddingVertical: width(2),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.backgroundLight,
  },
  scheduleDay: {
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 12,
    color: COLORS.black,
    textTransform: 'capitalize',
  },
  scheduleTime: {fontFamily: fontFamly.PlusJakartaSansMedium, fontSize: 12},
});

export default memo(EventDetailsScreen);

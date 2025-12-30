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
import EventAndPriceDetails from '../../../components/eventDetailAndPrice';
import Loader from '../../../components/loder';
import CategoryEditSuccess from '../../../components/modals/CategoryEditSuccess';
import DeleteRequestModal from '../../../components/modals/DeleteRequestModal';
import OrderBooking from '../../../components/modals/OrderBookingModal';
import RequestConfirmation from '../../../components/modals/RequestConfirmation';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getBookingDetails, toggleStatus} from '../../../services/ListingsItem';

const DAYS = [
  {key: 'mon', label: 'Mon'},
  {key: 'tue', label: 'Tue'},
  {key: 'wed', label: 'Wed'},
  {key: 'thu', label: 'Thu'},
  {key: 'fri', label: 'Fri'},
  {key: 'sat', label: 'Sat'},
  {key: 'sun', label: 'Sun'},
];

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
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log('Error fetching listing details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [item?._id]);

  useEffect(() => {
    handleGetListingDetails();
  }, [handleGetListingDetails]);

  const onStatusChange = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await toggleStatus(item?.id);
      if (response?.status === 200 || response?.status === 201) {
        modalRef.current?.show({
          status: 'ok',
          message: response?.data?.message,
          handlePressOk: async () => {
            modalRef.current?.hide();
            await handleGetListingDetails();
          },
        });
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log('Error toggling status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [item?.id, handleGetListingDetails]);

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
    if (!listingDetails) {return [];}
    const slot = listingDetails?.availability?.availableTimeSlots?.[0] || {};
    return DAYS.map(day => {
      const isAvailable = listingDetails?.availability?.availableDays?.includes(
        day.key,
      );
      return {
        day: day.label,
        isAvailable,
        opening: isAvailable ? slot.startTime || '—' : '',
        closing: isAvailable ? slot.endTime || '—' : '',
      };
    });
  }, [listingDetails]);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText="Details"
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
            <Text
              style={
                styles.feeText
              }>{`Extra: $${listingDetails?.pricing?.securityFee}`}</Text>
            <Text style={styles.feeSubText}>Security Fee</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeText}>Kilometer:</Text>
            <Text
              style={
                styles.feeSubText
              }>{`1km $${listingDetails?.pricing?.pricePerKm}`}</Text>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description:</Text>
          <Text numberOfLines={4} style={styles.descriptionText}>
            {currentLanguage === 'en'
              ? listingDetails?.description?.en
              : listingDetails?.description?.nl}
          </Text>
        </View>

        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleTitle}>
            Opening / Closing: Day & Time
          </Text>
          {scheduleData.map((item, index) => (
            <View
              key={index}
              style={[
                styles.scheduleRow,
                index === scheduleData.length - 1 && {borderBottomWidth: 0},
              ]}>
              <Text style={styles.scheduleDay}>{item.day}</Text>
              <Text
                style={[
                  styles.scheduleTime,
                  {color: item.isAvailable ? COLORS.textLight : '#999'},
                ]}>
                {item.isAvailable
                  ? `${item.opening} to ${item.closing}`
                  : 'Closed'}
              </Text>
            </View>
          ))}
        </View>

        {/* Modals */}
        <OrderBooking
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          nestedFilter
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
          type="Successfully Delete!"
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
  },
  scheduleTime: {fontFamily: fontFamly.PlusJakartaSansMedium, fontSize: 12},
});

export default memo(EventDetailsScreen);

import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import {useSelector} from 'react-redux';

import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CarouselComponent from '../../../components/carousel';
import CommonAlert from '../../../components/commanAlert';
import EventAndPriceDetails from '../../../components/eventDetailAndPrice';
import GradientText from '../../../components/gradiantText';
import Loader from '../../../components/loder';
import CancelBookingModal from '../../../components/modals/CancellationModal';
import ComplaintPopup from '../../../components/modals/ComplaintModal';
import ReviewModal from '../../../components/modals/ReviewModal';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  addReview,
  cancelBooking,
  getBookingDetails,
  markAsClaimed,
  markAsComplete,
  markAsRecived,
} from '../../../services/BookingItem';
import {checkIsChatedBefore, createConnection} from '../../../services/Chat';

/* -------------------------------------------------------------------------- */
/*                                HELPERS                                     */
/* -------------------------------------------------------------------------- */

const formatDate = date => (date ? moment(date).format('MM/DD/YYYY') : '--');

const formatTime = time =>
  time ? moment(time, 'HH:mm').format('hh:mm A') : '--';

const normalizeStatus = status =>
  status?.toLowerCase().replace(/\s+/g, '_') || 'default';

/* -------------------------------------------------------------------------- */
/*                             STATUS COLORS                                  */
/* -------------------------------------------------------------------------- */

const STATUS_COLORS = {
  pending: {bg: '#FFF3CD', text: '#856404'},
  accepted: {bg: '#D1E7DD', text: '#0F5132'},
  on_the_way: {bg: '#E7F1FF', text: '#084298'},
  received: {bg: '#E7F1FF', text: '#084298'},
  completed: {bg: '#D1E7DD', text: '#0F5132'},
  finished: {bg: '#D1E7DD', text: '#0F5132'},
  cancelled: {bg: '#F8D7DA', text: '#842029'},
  rejected: {bg: '#F8D7DA', text: '#842029'},
  claim: {bg: '#FFF3CD', text: '#856404'},
  default: {bg: COLORS.border, text: COLORS.black},
};

/* -------------------------------------------------------------------------- */
/*                            SMALL COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

const StatusBadge = React.memo(({text}) => {
  const colors = STATUS_COLORS[normalizeStatus(text)] || STATUS_COLORS.default;
  return (
    <View style={[styles.badge, {backgroundColor: colors.bg}]}>
      <Text style={[styles.badgeText, {color: colors.text}]}>{text}</Text>
    </View>
  );
});

const InfoRow = React.memo(({label, value}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
));

const RenderCards = React.memo(({type, data}) => {
  const isCheckIn = type === 'Check In';
  return (
    <View style={styles.checkCard}>
      <GradientText text={type} customStyles={{textAlign: 'left'}} />
      <Text style={styles.checkDate}>
        {formatDate(isCheckIn ? data?.start : data?.end)}
      </Text>
      <Text style={styles.checkTime}>
        {formatTime(isCheckIn ? data?.startTime : data?.endTime)}
      </Text>
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/*                              MAIN SCREEN                                   */
/* -------------------------------------------------------------------------- */

const BookingDetails = ({route, navigation}) => {
  const {currentLanguage} = useTranslation();
  const modalRef = useRef(null);
  const mapRef = useRef(null);
  const {user} = useSelector(state => state.LoginSlice);
  const bookingId = route?.params?._id;
  const [claimedPopUp, setClaimedPopUp] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);

  const [bookingData, setBookingData] = useState(null);
  console.log(bookingData, 'bookingDatabookingDatabookingDatabookingData');

  const [chatData, setChatData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openCancelModal, setOpenCancelModal] = useState(false);

  const hasLocation = useMemo(
    () =>
      bookingData?.details?.eventLatitude &&
      bookingData?.details?.eventLongitude,
    [bookingData],
  );

  const animateMap = useCallback(() => {
    if (!hasLocation || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: Number(bookingData.details.eventLatitude),
        longitude: Number(bookingData.details.eventLongitude),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      700,
    );
  }, [hasLocation, bookingData]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const res = await getBookingDetails(bookingId);
      console.log(res, 'resresresresresresresres13323132');

      if (res?.status === 200 || res?.status === 201) {
        setBookingData(res?.data?.data?.booking);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: res?.data?.message,
        });
      }
    } catch (e) {
      console.log('Booking details error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  useEffect(() => {
    animateMap();
  }, [animateMap]);

  const formatParticipants = participantsData => {
    const participants = {};
    participantsData?.forEach(({role, refPath, userId}) => {
      if (refPath === 'Vendor') {
        participants[role === 'vendor' ? 'vendor' : 'user'] = {
          userId: userId?._id,
          name: userId?.businessName,
          photo: userId?.businessLogo || null,
          email: userId?.businessEmail,
          role: 'vendor',
        };
      } else {
        participants.user = {
          userId: userId?._id,
          name: `${userId?.firstName || ''} ${userId?.lastName || ''}`.trim(),
          photo:
            userId?.profileImage ||
            userId?.businessLogo ||
            userId?.photo ||
            null,
          email: userId?.email,
          role: 'user',
        };
      }
    });
    return participants;
  };

  const getVendorIdForChat = () => bookingData?.vendorDetails?.vendorModelId;

  const handleCreateChatConnection = async () => {
    try {
      const vendorId = getVendorIdForChat();
      if (!vendorId || !user?.id) {
        navigation.navigate('MessagesScreen');
        return;
      }
      const response = await createConnection({userId: user?.id, vendorId});
      if (response?.status === 200 || response?.status === 201) {
        const conversation = response?.data?.data;
        const finalChatData = {
          ...conversation,
          participants: formatParticipants(conversation?.participants),
        };
        setChatData(finalChatData);
        navigation.navigate('ChatDetail', finalChatData);
      } else {
        navigation.navigate('MessagesScreen');
      }
    } catch {
      navigation.navigate('MessagesScreen');
    }
  };

  const handleOpenChat = async () => {
    if (chatData?.conversationId) {
      navigation.navigate('ChatDetail', chatData);
      return;
    }
    const vendorId = getVendorIdForChat();
    if (!vendorId || !user?.id) {
      navigation.navigate('MessagesScreen');
      return;
    }
    try {
      const response = await checkIsChatedBefore(user?.id, vendorId);
      if (response?.status === 200 || response?.status === 201) {
        const conversation = response?.data?.data;
        if (!conversation) {
          handleCreateChatConnection();
          return;
        }
        const finalChatData = {
          ...conversation,
          participants: formatParticipants(conversation?.participants),
        };
        setChatData(finalChatData);
        navigation.navigate('ChatDetail', finalChatData);
      } else {
        navigation.navigate('MessagesScreen');
      }
    } catch {
      navigation.navigate('MessagesScreen');
    }
  };

  const handleConfirmCancel = async val => {
    try {
      await cancelBooking(bookingId, {
        cancellationReason: {
          reason: val?.note,
          requestedBy: user?.userType,
        },
      });
      setOpenCancelModal(false);
      fetchBookingDetails();
    } catch (e) {
      console.log('Cancel error', e);
    }
  };
  const handleMarkAsRecived = async () => {
    try {
      setIsLoading(true);
      await markAsRecived(bookingId);
      fetchBookingDetails();
    } catch (e) {
      console.log('Cancel error', e);
    } finally {
      setIsLoading(false);
    }
  };
  const handleMarkAsComplete = async () => {
    try {
      setIsLoading(true);
      await markAsComplete(bookingId);
      fetchBookingDetails();
    } catch (e) {
      console.log('Cancel error', e);
    } finally {
      setIsLoading(false);
    }
  };
  const handleClaimed = async note => {
    try {
      let params = {
        claimType: note?.type,
        reason: note?.note,
      };
      setIsLoading(true);
      await markAsClaimed(bookingId, params);
      setClaimedPopUp(false);
      fetchBookingDetails();
    } catch (e) {
      console.log('Cancel error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const onClaimaedPress = () => {
    setClaimedPopUp(true);
  };

  const handleAddReview = async vall => {
    try {
      let params = {
        rating: vall?.rating,
        review: vall?.review,
      };
      setIsLoading(true);
      const responce = await addReview(bookingId, params);

      setReviewModal(false);
      if (responce.status == 200 || responce.status == 201) {
        modalRef.current.show({
          status: 'ok',
          message:
            currentLanguage === 'en'
              ? responce?.data?.message?.en
              : responce?.data?.message?.nl,
          handlePressOk: () => {
            fetchBookingDetails();
          },
        });
      }
    } catch (e) {
      console.log('Cancel error', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          headingText="Booking"
          rightIcon={ICONS.chatIcon}
          onLeftIconPress={() => navigation.goBack()}
          onRightIconPress={handleOpenChat}
        />

        <CarouselComponent data={bookingData?.listingDetails?.images} />

        <EventAndPriceDetails
          data={{...bookingData?.listingDetails, ...bookingData}}
          showDiscount={false}
          showSwitch={false}
        />

        {/* CHECK IN / OUT */}
        <View style={styles.checkRow}>
          <RenderCards type="Check In" data={bookingData?.bookingDateTime} />
          <Image style={styles.arrowIcon} source={ICONS.arrowIcon} />
          <RenderCards type="Check Out" data={bookingData?.bookingDateTime} />
        </View>
        <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.black,
            }}>
            Description:
          </Text>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 10,
              color: COLORS.textLight,
            }}>
            {currentLanguage === 'en'
              ? bookingData?.listingDetails?.description?.en
              : bookingData?.listingDetails?.description?.nl}
          </Text>
        </View>
        {/* ORDER DETAILS */}
        <View style={styles.card}>
          <Text style={styles.heading}>Order Details</Text>

          <Text style={styles.label}>
            Tracking ID: {bookingData?.trackingId}
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Order Status</Text>
            <StatusBadge text={bookingData?.status?.toUpperCase()} />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <StatusBadge text={bookingData?.paymentStatus?.toUpperCase()} />
          </View>

          <InfoRow
            label="Start Date"
            value={`${formatDate(bookingData?.bookingDateTime?.start)} ${
              bookingData?.bookingDateTime?.startTime || ''
            }`}
          />

          <InfoRow
            label="End Date"
            value={`${formatDate(bookingData?.bookingDateTime?.end)} ${
              bookingData?.bookingDateTime?.endTime || ''
            }`}
          />
          <InfoRow
            label="Security"
            value={`€${bookingData?.pricingBreakdown?.securityFee}`}
          />

          <InfoRow label="Total Price" value={`€${bookingData?.totalPrice}`} />
        </View>
        {/* LOCATION
        {hasLocation && (
          <View style={{paddingHorizontal: width(4)}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.black,
              }}>
              Location:
            </Text>
            <View style={styles.mapWrapper}>
              <MapView ref={mapRef} style={StyleSheet.absoluteFillObject}>
                <Marker
                  coordinate={{
                    latitude: Number(bookingData.details.eventLatitude),
                    longitude: Number(bookingData.details.eventLongitude),
                  }}
                />
              </MapView>

              <TouchableOpacity style={styles.locateBtn} onPress={animateMap}>
                <Image source={ICONS.locationIcon} style={styles.locateIcon} />
              </TouchableOpacity>
            </View>
          </View>
        )} */}
      </ScrollView>

      {(bookingData?.status == 'pending' ||
        bookingData?.status == 'accepted') && (
        <View
          style={{
            backgroundColor: COLORS.white,
            paddingVertical: width(3),
            paddingHorizontal: width(4),
          }}>
          <GradientButton
            onPress={() => setOpenCancelModal(true)}
            text={'Cancel'}
            type="outline"
            useGradient={true}
            styleProps={{}}
            outlineButtonStyle={{
              backgroundColor: COLORS.backgroundLight,
              borderColor: COLORS.border,
            }}
          />
        </View>
      )}

      {bookingData?.status == 'on_the_way' && (
        <View
          style={{
            backgroundColor: COLORS.white,
            paddingVertical: width(3),
            paddingHorizontal: width(4),
          }}>
          <GradientButton
            onPress={handleMarkAsRecived}
            text={'Recived'}
            type="outline"
            useGradient={true}
            styleProps={{}}
            outlineButtonStyle={{
              backgroundColor: COLORS.backgroundLight,
              borderColor: COLORS.border,
            }}
          />
        </View>
      )}

      {!bookingData?.isReviewed && bookingData?.status == 'completed' && (
        <View
          style={{
            backgroundColor: COLORS.white,
            paddingVertical: width(3),
            paddingHorizontal: width(4),
          }}>
          <GradientButton
            onPress={() => setReviewModal(true)}
            text={'Add Review'}
            type="outline"
            useGradient={true}
            styleProps={{}}
            outlineButtonStyle={{
              backgroundColor: COLORS.backgroundLight,
              borderColor: COLORS.border,
            }}
          />
        </View>
      )}

      {bookingData?.status === 'received' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: width(4),
            marginVertical: width(2),
          }}>
          <View style={{width: width(45)}}>
            <GradientButton
              onPress={handleMarkAsComplete}
              text={'Complete'}
              type="outline"
              useGradient={true}
              styleProps={{}}
              outlineButtonStyle={{
                backgroundColor: COLORS.backgroundLight,
                borderColor: COLORS.border,
              }}
            />
          </View>
          <View style={{width: width(42)}}>
            <GradientButton
              text={'Complain'}
              type="filled"
              onPress={onClaimaedPress}
            />
          </View>
        </View>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: width(4),
          marginVertical: width(2),
        }}>
        <View style={{width: '100%'}}>
          <GradientButton
            text={'Track Booking'}
            type="filled"
            onPress={() =>
              navigation.navigate('TrackDirections', {
                ...bookingData,
                ...bookingData?.vendorDetails,
              })
            }
          />
        </View>
      </View>
      <CancelBookingModal
        visible={openCancelModal}
        onClose={() => setOpenCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
      <ComplaintPopup
        visible={claimedPopUp}
        onClose={() => setClaimedPopUp(false)}
        onConfirm={handleClaimed}
      />
      <ReviewModal
        visible={reviewModal}
        onClose={() => setReviewModal(false)}
        onConfirm={handleAddReview}
      />
      <CommonAlert ref={modalRef} />
      <Loader isLoading={isLoading} />
    </SafeAreaView>
  );
};

export default BookingDetails;

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},

  card: {
    margin: width(3),
    padding: width(3),
    borderRadius: 15,
    backgroundColor: COLORS.white,
    elevation: 5,
  },

  heading: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    marginBottom: width(2),
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: width(2),
  },

  label: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },

  value: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  badge: {
    paddingVertical: width(1.2),
    paddingHorizontal: width(4),
    borderRadius: 100,
  },

  badgeText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  checkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  checkCard: {
    width: width(40),
    height: 80,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    elevation: 4,
    padding: 10,
  },

  checkDate: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  checkTime: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  arrowIcon: {
    width: 12,
    height: 7,
    marginHorizontal: 10,
  },

  mapWrapper: {
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },

  locateBtn: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  locateIcon: {
    width: 20,
    height: 20,
  },
});

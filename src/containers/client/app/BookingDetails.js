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
import EventAndPriceDetails, {
  EventListingReviewsSection,
} from '../../../components/eventDetailAndPrice';
import GradientText from '../../../components/gradiantText';
import Loader from '../../../components/loder';
import CancelBookingModal from '../../../components/modals/CancellationModal';
import ComplaintPopup from '../../../components/modals/ComplaintModal';
import ReviewModal from '../../../components/modals/ReviewModal';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {formatEuro, formatPrice} from '../../../utils';
import {
  addReview,
  cancelBooking,
  getBookingDetails,
  markAsClaimed,
  markAsComplete,
  markAsRecived,
} from '../../../services/BookingItem';
import {checkIsChatedBefore, createConnection} from '../../../services/Chat';
import {createPaymentIntent, getAmountToPay} from '../../../services/Payment';
import PaymentModal from '../../../components/paymentModal';

/* -------------------------------------------------------------------------- */
/*                                HELPERS                                     */
/* -------------------------------------------------------------------------- */

const formatDate = date => (date ? moment(date).format('DD/MM/YYYY') : '--');

const formatTime = time =>
  time ? moment(time, 'HH:mm').format('hh:mm A') : '--';

const normalizeStatus = status =>
  status?.toLowerCase().replace(/\s+/g, '_') || 'default';

const REVIEWABLE_BOOKING_STATUSES = ['completed', 'finished'];
const CANCEL_WINDOW_MINUTES = 30;

const formatCancelCountdown = remainingMs => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
};

const PAYMENT_STATUS_LABEL_KEYS = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  pending: 'Pending',
  upfront_paid: 'Upfront Paid',
};

const getPaymentStatusLabel = (status, translate) => {
  if (!status) {
    return '';
  }
  const labelKey = PAYMENT_STATUS_LABEL_KEYS[String(status).toLowerCase()];
  if (labelKey) {
    return translate(labelKey);
  }
  return String(status).toUpperCase();
};

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

const StatusBadge = React.memo(({rawStatus, label}) => {
  const colors =
    STATUS_COLORS[normalizeStatus(rawStatus || label)] || STATUS_COLORS.default;
  return (
    <View style={[styles.badge, {backgroundColor: colors.bg}]}>
      <Text style={[styles.badgeText, {color: colors.text}]}>{label}</Text>
    </View>
  );
});

const InfoRow = React.memo(({label, value}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
));

const RenderCards = React.memo(({title, isCheckIn, data}) => {
  return (
    <View style={styles.checkCard}>
      <GradientText text={title} customStyles={{textAlign: 'left'}} />
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
  console.log(route?.params, 'routerouterouterouterouterouterouteroute');

  const {t, currentLanguage} = useTranslation();
  const isDutch = currentLanguage === 'nl';
  const localizedText = {
    booking: isDutch ? 'Boeking' : 'Booking',
    checkIn: isDutch ? 'Inchecken' : 'Check In',
    checkOut: isDutch ? 'Uitchecken' : 'Check Out',
    description: isDutch ? 'Beschrijving' : 'Description',
    orderDetails: isDutch ? 'Bestelgegevens' : 'Order Details',
    trackingId: isDutch ? 'Tracking-ID' : 'Tracking ID',
    orderStatus: isDutch ? 'Bestelstatus' : 'Order Status',
    paymentStatus: isDutch ? 'Betaalstatus' : 'Payment Status',
    startDate: isDutch ? 'Startdatum' : 'Start Date',
    endDate: isDutch ? 'Einddatum' : 'End Date',
    security: isDutch ? 'Borg' : 'Security',
    totalPrice: isDutch ? 'Totale prijs' : 'Total Price',
    cancel: isDutch ? 'Annuleren' : 'Cancel',
    received: isDutch ? 'Ontvangen' : 'Received',
    addReview: isDutch ? 'Beoordeling toevoegen' : 'Add Review',
    complete: isDutch ? 'Voltooien' : 'Complete',
    complain: isDutch ? 'Klacht indienen' : 'Complain',
    trackBooking: isDutch ? 'Boeking volgen' : 'Track Booking',
  };
  const statusLabelMap = {
    pending: isDutch ? 'IN AFWACHTING' : 'PENDING',
    accepted: isDutch ? 'GEACCEPTEERD' : 'ACCEPTED',
    on_the_way: isDutch ? 'ONDERWEG' : 'ON THE WAY',
    received: isDutch ? 'ONTVANGEN' : 'RECEIVED',
    completed: isDutch ? 'VOLTOOID' : 'COMPLETED',
    finished: isDutch ? 'AFGEROND' : 'FINISHED',
    cancelled: isDutch ? 'GEANNULEERD' : 'CANCELLED',
    rejected: isDutch ? 'AFGEWEZEN' : 'REJECTED',
    claim: isDutch ? 'CLAIM' : 'CLAIM',
  };
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
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [amountToPay, setAmountToPay] = useState(0);
  const [cancelRemainingMs, setCancelRemainingMs] = useState(0);

  const isUpfrontPaid = useMemo(() => {
    const paymentStatus = normalizeStatus(bookingData?.paymentStatus);
    return (
      Boolean(bookingData?.isUpfrontPaid) ||
      paymentStatus === 'upfront_paid' ||
      paymentStatus === 'paid'
    );
  }, [bookingData?.isUpfrontPaid, bookingData?.paymentStatus]);

  const isCancellableStatus = useMemo(() => {
    const bookingStatus = normalizeStatus(bookingData?.status);
    return (
      (bookingStatus === 'pending' || bookingStatus === 'accepted') &&
      !isUpfrontPaid
    );
  }, [bookingData?.status, isUpfrontPaid]);

  const canCancelWithinWindow = useMemo(
    () => isCancellableStatus && cancelRemainingMs > 0,
    [cancelRemainingMs, isCancellableStatus],
  );

  useEffect(() => {
    if (!bookingData?.createdAt || !isCancellableStatus) {
      setCancelRemainingMs(0);
      return;
    }

    const updateRemainingTime = () => {
      const deadline = moment(bookingData.createdAt).add(
        CANCEL_WINDOW_MINUTES,
        'minutes',
      );
      setCancelRemainingMs(Math.max(0, deadline.diff(moment())));
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [bookingData?.createdAt, isCancellableStatus]);

  const resolveApiMessage = useCallback(
    message => {
      if (!message) {
        return t('somethingWentWrong');
      }
      if (typeof message === 'string') {
        return message;
      }
      return currentLanguage === 'en'
        ? message?.en || message?.nl || t('somethingWentWrong')
        : message?.nl || message?.en || t('somethingWentWrong');
    },
    [currentLanguage, t],
  );

  const canProceedToCheckout = useMemo(() => {
    const paymentStatus = normalizeStatus(bookingData?.paymentStatus);
    const bookingStatus = normalizeStatus(bookingData?.status);
    const hasPayableStatus =
      paymentStatus === 'pending' ||
      paymentStatus === 'unpaid' ||
      paymentStatus === 'upfront_paid';

    return bookingStatus === 'accepted' && hasPayableStatus;
  }, [bookingData?.paymentStatus, bookingData?.status]);

  const showPaymentSummary = useMemo(() => {
    if (!bookingData) {
      return false;
    }
    const bookingStatus = normalizeStatus(bookingData?.status);
    if (
      bookingStatus === 'pending' ||
      bookingStatus === 'rejected' ||
      bookingStatus === 'cancelled'
    ) {
      return false;
    }
    return (
      canProceedToCheckout ||
      bookingData?.paymentStatus === 'upfront_paid' ||
      normalizeStatus(bookingData?.paymentStatus) === 'paid' ||
      Boolean(bookingData?.pricingBreakdown)
    );
  }, [bookingData, canProceedToCheckout]);

  const showPaymentWarning = useMemo(() => {
    if (!bookingData) {
      return false;
    }
    return normalizeStatus(bookingData?.paymentStatus) !== 'paid';
  }, [bookingData?.paymentStatus]);

  const paymentRows = useMemo(
    () => [
      {
        key: 'totalCost',
        label: t('Total Cost'),
        value: bookingData?.pricingBreakdown?.total,
        color: COLORS.textLight,
      },
      {
        key: 'upfrontPaid',
        label: t('Upfront Paid'),
        value: isUpfrontPaid ? t('Paid') : t('Un Paid'),
        color: COLORS.navyBlue,
      },
      {
        key: 'upfrontAmount',
        label: t('Upfront Amount'),
        value: bookingData?.pricingBreakdown?.upfrontFee,
        color: COLORS.navyBlue,
      },
      {
        key: 'totalPaid',
        label: t('Total Paid Amount'),
        value: bookingData?.AmountPaid,
        color: isUpfrontPaid ? COLORS.green : COLORS.red,
      },
      {
        key: 'remaining',
        label: t('Remaining'),
        value: bookingData?.AmountLeft,
        color: COLORS.red,
      },
    ],
    [bookingData, t, isUpfrontPaid],
  );

  const hasLocation = useMemo(
    () =>
      bookingData?.details?.eventLatitude &&
      bookingData?.details?.eventLongitude,
    [bookingData],
  );

  const canAddReview = useMemo(() => {
    if (!bookingData || bookingData.isReviewed) {
      return false;
    }
    return REVIEWABLE_BOOKING_STATUSES.includes(
      normalizeStatus(bookingData.status),
    );
  }, [bookingData]);

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

  const fetchBookingDetails = useCallback(async () => {
    if (!bookingId) {
      return;
    }
    try {
      setIsLoading(true);
      const res = await getBookingDetails(bookingId);

      if (res?.status === 200 || res?.status === 201) {
        setBookingData(res?.data?.data?.booking);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: resolveApiMessage(res?.data?.message),
        });
      }
    } catch (e) {
      console.log('Booking details error', e);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, resolveApiMessage]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

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

  const handlePayAmount = async () => {
    if (!bookingData?._id) {
      modalRef.current?.show({
        status: 'error',
        message: t('somethingWentWrong'),
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await getAmountToPay(bookingData._id);

      if (response?.status === 200 || response?.status === 201) {
        const payableAmount = Number(response?.data?.amountToPay || 0);
        if (!payableAmount) {
          modalRef.current?.show({
            status: 'error',
            message: resolveApiMessage(response?.data?.message),
          });
          return;
        }

        setAmountToPay(payableAmount);
        const res = await createPaymentIntent({
          amount: payableAmount.toFixed(2),
          bookingId: bookingData._id,
        });
        if (res?.data?.clientSecret) {
          setPayModalVisible(true);
          setClientSecret(res.data.clientSecret);
        } else {
          modalRef.current?.show({
            status: 'error',
            message: resolveApiMessage(res?.data?.message),
          });
        }
      } else {
        modalRef.current?.show({
          status: 'error',
          message: resolveApiMessage(response?.data?.message),
        });
      }
    } catch (err) {
      console.log('PAYMENT INTENT ERROR', err);
      modalRef.current?.show({
        status: 'error',
        message: t('somethingWentWrong'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = useCallback(() => {
    setPayModalVisible(false);
    setClientSecret(null);
    fetchBookingDetails();
  }, [fetchBookingDetails]);

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
        setBookingData(prev => (prev ? {...prev, isReviewed: true} : prev));
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
          headingText={localizedText.booking}
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
          <RenderCards
            title={localizedText.checkIn}
            isCheckIn
            data={bookingData?.bookingDateTime}
          />
          <Image style={styles.arrowIcon} source={ICONS.arrowIcon} />
          <RenderCards
            title={localizedText.checkOut}
            isCheckIn={false}
            data={bookingData?.bookingDateTime}
          />
        </View>
        <EventListingReviewsSection
          data={{
            ...(bookingData?.listingDetails || {}),
            reviews:
              bookingData?.listingDetails?.reviews || bookingData?.reviews,
          }}
        />
        <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.black,
            }}>
            {localizedText.description}:
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
          <Text style={styles.heading}>{localizedText.orderDetails}</Text>

          <Text style={styles.label}>
            {localizedText.trackingId}: {bookingData?.trackingId}
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>{localizedText.orderStatus}</Text>
            <StatusBadge
              rawStatus={bookingData?.status}
              label={
                statusLabelMap[normalizeStatus(bookingData?.status)] ||
                String(bookingData?.status || '').toUpperCase()
              }
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{localizedText.paymentStatus}</Text>
            <StatusBadge
              rawStatus={bookingData?.paymentStatus}
              label={getPaymentStatusLabel(bookingData?.paymentStatus, t)}
            />
          </View>

          <InfoRow
            label={localizedText.startDate}
            value={`${formatDate(bookingData?.bookingDateTime?.start)} ${
              bookingData?.bookingDateTime?.startTime || ''
            }`}
          />

          <InfoRow
            label={localizedText.endDate}
            value={`${formatDate(bookingData?.bookingDateTime?.end)} ${
              bookingData?.bookingDateTime?.endTime || ''
            }`}
          />
          <InfoRow
            label={localizedText.security}
            value={formatEuro(bookingData?.pricingBreakdown?.securityFee, {
              space: false,
            })}
          />

          <InfoRow
            label={localizedText.totalPrice}
            value={formatEuro(bookingData?.totalPrice, {space: false})}
          />

          {showPaymentSummary && (
            <View style={styles.paymentSummarySection}>
              {paymentRows.map(row => {
                if (!row?.value > 0) {
                  return null;
                }
                if (
                  !bookingData?.willPayUpfront &&
                  row?.key === 'upfrontPaid'
                ) {
                  return null;
                }
                if (
                  !bookingData?.willPayUpfront &&
                  row?.key === 'upfrontAmount'
                ) {
                  return null;
                }
                return (
                  <View key={row.key} style={styles.paymentSummaryRow}>
                    <Text
                      style={[styles.paymentSummaryText, {color: row.color}]}>
                      {row.label}
                    </Text>
                    <Text
                      style={[styles.paymentSummaryText, {color: row.color}]}>
                      {!isNaN(row.value)
                        ? formatEuro(row.value, {space: false})
                        : row.value}
                    </Text>
                  </View>
                );
              })}

              {showPaymentWarning &&
                (bookingData?.pricingBreakdown?.requiresFullPayment ? (
                  <View
                    style={[
                      styles.paymentWarningBox,
                      styles.paymentWarningBoxFull,
                    ]}>
                    <Text
                      style={[
                        styles.paymentWarningText,
                        styles.paymentWarningTextFull,
                      ]}>
                      {t('cartFullPaymentRequired', {
                        amount: formatPrice(
                          bookingData?.pricingBreakdown?.total,
                        ),
                      })}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.paymentWarningBox}>
                    <Text style={styles.paymentWarningText}>
                      {t('cartRemainingBalanceWarning', {
                        amount: bookingData?.AmountLeft
                          ? formatEuro(bookingData?.AmountLeft, {space: false})
                          : '',
                      })}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          {canProceedToCheckout && (
            <View style={styles.paymentCheckoutButton}>
              <GradientButton
                text={t('processToCheckout')}
                type="filled"
                onPress={handlePayAmount}
                styleContainer={styles.filledActionButton}
                textStyle={styles.filledActionText}
              />
            </View>
          )}
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

      {bookingData && (
        <View style={styles.footerButtonSection}>
          {isCancellableStatus && (
            <View
              style={[
                styles.cancelWindowMessageBox,
                !canCancelWithinWindow && styles.cancelWindowMessageBoxExpired,
              ]}>
              <Text
                style={[
                  styles.cancelWindowMessageText,
                  !canCancelWithinWindow &&
                    styles.cancelWindowMessageTextExpired,
                ]}>
                {canCancelWithinWindow
                  ? t('bookingCancelWindowWarning')
                  : t('bookingCancelWindowExpired')}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.actionButtonRow,
              isCancellableStatus &&
                !canCancelWithinWindow &&
                styles.actionButtonRowSingle,
            ]}>
            {canCancelWithinWindow && (
              <View style={styles.actionButtonWrapper}>
                <GradientButton
                  onPress={() => setOpenCancelModal(true)}
                  text={`${localizedText.cancel} (${formatCancelCountdown(
                    cancelRemainingMs,
                  )})`}
                  type="outline"
                  useGradient
                  outlineButtonStyle={styles.outlineActionButton}
                  textStyle={styles.outlineActionText}
                />
              </View>
            )}
            <View
              style={[
                styles.actionButtonWrapper,
                isCancellableStatus &&
                  !canCancelWithinWindow &&
                  styles.actionButtonWrapperFull,
              ]}>
              <GradientButton
                text={localizedText.trackBooking}
                type="filled"
                onPress={() =>
                  navigation.navigate('TrackDirections', {
                    ...bookingData,
                    ...bookingData?.vendorDetails,
                  })
                }
                styleContainer={styles.filledActionButton}
                textStyle={styles.filledActionText}
              />
            </View>
          </View>
        </View>
      )}

      {bookingData?.status == 'on_the_way' && (
        <View style={styles.footerButtonSection}>
          <GradientButton
            onPress={handleMarkAsRecived}
            text={localizedText.received}
            type="outline"
            useGradient
            outlineButtonStyle={styles.outlineActionButton}
            textStyle={styles.outlineActionText}
          />
        </View>
      )}

      {canAddReview && (
        <View style={styles.footerButtonSection}>
          <GradientButton
            onPress={() => setReviewModal(true)}
            text={localizedText.addReview}
            type="outline"
            useGradient
            outlineButtonStyle={styles.outlineActionButton}
            textStyle={styles.outlineActionText}
          />
        </View>
      )}

      {bookingData?.status === 'received' && (
        <View style={[styles.footerButtonSection, styles.actionButtonRow]}>
          <View style={styles.actionButtonWrapper}>
            <GradientButton
              onPress={handleMarkAsComplete}
              text={localizedText.complete}
              type="outline"
              useGradient
              outlineButtonStyle={styles.outlineActionButton}
              textStyle={styles.outlineActionText}
            />
          </View>
          <View style={styles.actionButtonWrapper}>
            <GradientButton
              text={localizedText.complain}
              type="filled"
              onPress={onClaimaedPress}
              styleContainer={styles.filledActionButton}
              textStyle={styles.filledActionText}
            />
          </View>
        </View>
      )}

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
      <PaymentModal
        selectedData={bookingData}
        amountToPay={amountToPay}
        modalRef={modalRef}
        isVisible={payModalVisible}
        clientSecret={clientSecret}
        onPaymentSuccess={handlePaymentSuccess}
        onClose={() => {
          setPayModalVisible(false);
          setClientSecret(null);
        }}
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

  paymentSummarySection: {
    marginTop: width(3),
    paddingTop: width(3),
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
  },

  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: width(2),
  },

  paymentSummaryText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.black,
  },

  paymentWarningBox: {
    marginTop: width(2),
    padding: width(2),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },

  paymentWarningBoxFull: {
    backgroundColor: '#FEE2E2',
    borderColor: COLORS.red,
  },

  paymentWarningText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: '#92400E',
  },

  paymentWarningTextFull: {
    color: COLORS.red,
  },

  paymentCheckoutButton: {
    marginTop: width(4),
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

  footerButtonSection: {
    paddingHorizontal: width(4),
    paddingVertical: width(2),
  },
  cancelWindowMessageBox: {
    marginBottom: width(2),
    padding: width(2.5),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  cancelWindowMessageBoxExpired: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  cancelWindowMessageText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 11,
    lineHeight: 16,
    color: '#92400E',
  },
  cancelWindowMessageTextExpired: {
    color: '#991B1B',
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: width(3),
  },
  actionButtonWrapper: {
    flex: 1,
  },
  actionButtonWrapperFull: {
    flex: 1,
    width: '100%',
  },
  actionButtonRowSingle: {
    justifyContent: 'center',
  },
  outlineActionButton: {
    backgroundColor: COLORS.backgroundLight,
    minHeight: width(11),
    paddingVertical: width(2.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineActionText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  filledActionButton: {
    height: width(12),
  },
  filledActionText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';

import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CarouselComponent from '../../../components/carousel';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import PickedupModal from '../../../components/modals/PickedupModal';
import RejectRequestModal from '../../../components/modals/RejectRequest';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  acceptBooking,
  getVendorBookingById,
  rejectBooking,
  updateStatus,
} from '../../../services/BookingItem';

const BOOKING_STATUS_I18N = {
  pending: 'statusPending',
  accepted: 'statusAccepted',
  on_the_way: 'statusOnTheWay',
  finished: 'statusFinished',
  picked_up: 'statusPickedUp',
  received_back: 'statusReceivedBack',
  completed: 'statusCompleted',
  rejected: 'statusRejected',
};

const STATUS_COLORS = {
  pending: {bg: '#FFF4E5', text: '#FF9800'},
  accepted: {bg: '#E3F2FD', text: '#1976D2'},
  on_the_way: {bg: '#E1F5FE', text: '#0288D1'},
  finished: {bg: '#E8F5E9', text: '#2E7D32'},
  picked_up: {bg: '#F3E5F5', text: '#7B1FA2'},
  received_back: {bg: '#E0F2F1', text: '#00695C'},
  completed: {bg: '#E8F5E9', text: '#1B5E20'},
  rejected: {bg: '#FDECEA', text: '#D32F2F'},
};

const PRICING_TYPE_LABEL_KEYS = {
  perhour: 'Per Hour',
  perday: 'Per Day',
  perevent: 'Per Event',
};

const PAYMENT_STATUS_LABEL_KEYS = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  pending: 'Pending',
};

const getPricingTypeLabel = (type, translate) => {
  if (!type) {
    return '';
  }
  const normalized = String(type).toLowerCase().replace(/\s+/g, '');
  const labelKey = PRICING_TYPE_LABEL_KEYS[normalized];
  if (labelKey) {
    return translate(labelKey);
  }
  return String(type);
};

const getPaymentStatusLabel = (status, translate) => {
  if (!status) {
    return '';
  }
  const labelKey = PAYMENT_STATUS_LABEL_KEYS[String(status).toLowerCase()];
  if (labelKey) {
    return translate(labelKey);
  }
  return String(status);
};

function BookingDetails({route}) {
  console.log(route, 'routerouterouterouteroute');

  const navigation = useNavigation();
  const {t, currentLanguage} = useTranslation();
  const {_id} = route.params || {};
  const [openPickedUpModal, setOpenPickedUpModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  console.log(booking, 'bookingbookingbookingbookingbookingbooking');

  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const alertRef = useRef(null);

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const getStatusStyle = status => {
    const key = (status || '').toLowerCase();
    const colors = STATUS_COLORS[key] || {bg: '#ECEFF1', text: '#37474F'};
    const labelKey = BOOKING_STATUS_I18N[key];
    const label = labelKey ? t(labelKey) : status || t('Unknown');

    return {
      ...colors,
      label,
    };
  };

  const fetchBookingDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getVendorBookingById(_id);
      console.log(response, 'responseresponseresponseresponse');

      if (response?.status === 200 || response?.status === 201) {
        setBooking(response?.data?.data?.booking);
      } else {
        showAlert('error', response?.data?.message);
      }
    } catch (error) {
      console.log('Fetch booking error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [_id]);

  const showAlert = (status, message, onOk) => {
    alertRef.current?.show({
      status,
      message,
      handlePressOk: onOk,
    });
  };

  const handleAcceptBooking = async () => {
    try {
      setIsLoading(true);
      const response = await acceptBooking(booking?._id);

      if (response?.status === 200 || response?.status === 201) {
        showAlert(
          'ok',
          currentLanguage === 'en'
            ? response?.data?.message?.en
            : response?.data?.message?.nl,
          () => {
            alertRef.current?.hide();
            fetchBookingDetails();
          },
        );
      } else {
        showAlert(
          'error',
          currentLanguage === 'en'
            ? response?.data?.message?.en
            : response?.data?.message?.nl,
        );
      }
    } catch (error) {
      console.log('Accept booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectBooking = async reason => {
    try {
      setIsLoading(true);
      const response = await rejectBooking(booking?._id, {
        rejectionReason: reason,
      });

      if (response?.status === 200 || response?.status === 201) {
        setRejectModalVisible(false);
        showAlert(
          'ok',
          currentLanguage === 'en'
            ? response?.data?.message?.en
            : response?.data?.message?.nl,
          () => {
            alertRef.current?.hide();
            fetchBookingDetails();
          },
        );
      } else {
        showAlert(
          'error',
          currentLanguage === 'en'
            ? response?.data?.message?.en
            : response?.data?.message?.nl,
        );
      }
    } catch (error) {
      console.log('Reject booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (params = null, type) => {
    try {
      setIsLoading(true);
      const response = await updateStatus(booking?._id, params, type);
      console.log(response, 'responseresponseresponseresponseresponse');

      if (response?.status === 200 || response?.status === 201) {
        setOpenPickedUpModal(false);
        showAlert(
          'ok',
          currentLanguage === 'en'
            ? response?.data?.message?.en
            : response?.data?.message?.nl,
          () => {
            alertRef.current?.hide();
            fetchBookingDetails();
          },
        );
      } else {
        showAlert(
          'error',
          currentLanguage === 'en'
            ? response?.data?.message?.en
            : response?.data?.message?.nl,
        );
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerrorerror');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickedUp = () => {
    if (booking?.pricingBreakdown?.securityFee > 0) {
      setOpenPickedUpModal(true);
    } else {
      handleMarkPickedUp();
    }
  };

  const handleMarkPickedUp = vall => {
    if (!vall?.type) {
      handleUpdateStatus({condition: 'good'}, 'mark-picked-up');
      return;
    }
    if (vall?.type === 'Good') {
      handleUpdateStatus({condition: 'good'}, 'mark-picked-up');
      return;
    }
    if (vall?.type === 'Claim') {
      handleUpdateStatus(
        {
          condition: 'claim',
          claimAmount: Number(vall.claimAmount) || 0,
          reason: String(vall.reason || '').trim(),
        },
        'mark-picked-up',
      );
      return;
    }
    handleUpdateStatus(
      {
        condition: 'fair',
        securityFee: vall?.amount,
      },
      'mark-picked-up',
    );
  };

  const renderDateBlock = (labelKey, date, time) => (
    <View style={styles.infoRow}>
      <Image source={ICONS.clockIcon} style={styles.iconSmall} />
      <View style={styles.infoText}>
        <Text style={styles.infoTitle}>{t(labelKey)}</Text>
        <Text style={styles.infoValue}>{moment(date).format('YYYY-MM-DD')}</Text>
        <Text style={styles.infoSubValue}>{time}</Text>
      </View>
    </View>
  );

  const renderInfoRow = (icon, titleKey, value) => (
    <View style={styles.dividerRow}>
      <Image source={icon} style={styles.iconSmall} />
      <View style={styles.infoText}>
        <Text style={styles.infoValue}>{t(titleKey)}</Text>
        <Text style={styles.infoSubValue}>{value}</Text>
      </View>
    </View>
  );

  const renderUserRow = (user, address) => (
    <View style={styles.dividerRow}>
      <View style={styles.avatarContainer}>
        <Image
          source={
            user?.businessLogo ? {uri: user?.businessLogo} : ICONS.userIcon
          }
          style={styles.avatar}
          resizeMode="contain"
        />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoValue}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.infoSubValue}>{address}</Text>
      </View>
    </View>
  );

  const pricingTypeLabel = getPricingTypeLabel(
    booking?.listingDetails?.pricing?.type,
    t,
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText={t('Booking Details')}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={navigation.goBack}
        onRightIconPress={() => navigation.navigate('Messages')}
      />

      <ScrollView style={{flex: 1}}>
        <View style={styles.sectionPadding}>
          <CarouselComponent data={booking?.listingDetails?.images || []} />

          <View style={styles.rowBetween}>
            <View style={{flex: 1, marginRight: width(3)}}>
              <Text style={styles.title}>
                {currentLanguage == 'en'
                  ? booking?.listingDetails?.title?.en
                  : booking?.listingDetails?.title?.nl}
              </Text>
              <Text style={styles.subTitle}>
                {currentLanguage == 'en'
                  ? booking?.listingDetails?.description?.en
                  : booking?.listingDetails?.description?.nl}
              </Text>
            </View>

            <View>
              <Text style={styles.price}>
                € {booking?.listingDetails?.pricing?.amount}
              </Text>
              <Text style={styles.priceType}>/{pricingTypeLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{t('Order Details')}</Text>
            {booking?.status &&
              (() => {
                const statusUI = getStatusStyle(booking.status);

                return (
                  <View
                    style={{
                      backgroundColor: statusUI.bg,
                      paddingHorizontal: width(3),
                      paddingVertical: width(1.2),
                      borderRadius: width(2),
                    }}>
                    <Text
                      style={{
                        color: statusUI.text,
                        fontSize: 12,
                        fontFamily: fontFamly.PlusJakartaSansBold,
                        textTransform: 'capitalize',
                      }}>
                      {statusUI.label}
                    </Text>
                  </View>
                );
              })()}
          </View>

          {renderDateBlock(
            'Start At',
            booking?.details?.startDate,
            booking?.details?.startTime,
          )}

          {renderDateBlock(
            'End At',
            booking?.details?.endDate,
            booking?.details?.endTime,
          )}

          {renderInfoRow(
            ICONS.ticketIcon,
            'Tracking ID',
            booking?.trackingId,
          )}
          {renderInfoRow(
            ICONS.ticketIcon,
            'Payment Status',
            getPaymentStatusLabel(booking?.paymentStatus, t),
          )}

          <Text style={styles.sectionLabel}>{t('Buyer Details')}</Text>

          {renderUserRow(booking?.userId, booking?.details?.eventLocation)}

          <Text style={styles.sectionLabel}>{t('Seller Details')}</Text>

          {renderUserRow(
            booking?.vendorDetails,
            booking?.details?.eventLocation,
          )}
        </View>
      </ScrollView>

      {booking && (
        <View style={styles.footer}>
          {booking?.status === 'pending' && (
            <View style={styles.actionRow}>
              <View style={styles.actionButton}>
                <GradientButton
                  text="Accept"
                  onPress={handleAcceptBooking}
                  type="outline"
                  textStyle={styles.pendingAcceptOutlineText}
                  styleContainer={styles.pendingPairBtnOuter}
                  outlineButtonStyle={styles.pendingPairOutlineInner}
                />
              </View>
              <View style={styles.actionButton}>
                <GradientButton
                  text="Reject"
                  onPress={() => setRejectModalVisible(true)}
                  styleContainer={styles.pendingPairBtnOuter}
                />
              </View>
            </View>
          )}
          {booking?.paymentStatus == 'paid' &&
            booking?.status == 'accepted' && (
              <GradientButton
                text="Mark As On the way"
                onPress={() => handleUpdateStatus(null, 'mark-on-the-way')}
                type="outline"
                useGradient
              />
            )}
          {booking?.status == 'finished' && (
            <GradientButton
              text="Picked Up"
              onPress={handlePickedUp}
              type="outline"
              useGradient
            />
          )}
          {booking?.status == 'picked_up' && (
            <GradientButton
              text="Received Back"
              onPress={() => handleUpdateStatus(null, 'received-back')}
              type="outline"
              useGradient
            />
          )}
          {booking?.status == 'received_back' && (
            <GradientButton
              text="Complete"
              onPress={() => handleUpdateStatus(null, 'mark-completed')}
              type="outline"
              useGradient
            />
          )}
          {booking?.status !== 'pending' && (
            <GradientButton
              text="Track Now"
              onPress={() =>
                navigation.navigate('TrackingBookingDetails', booking)
              }
              textStyle={styles.footerFilledText}
            />
          )}
        </View>
      )}

      <CommonAlert ref={alertRef} />
      <Loader isLoading={isLoading} />

      <RejectRequestModal
        visible={rejectModalVisible}
        onClose={() => setRejectModalVisible(false)}
        onConfirm={handleRejectBooking}
      />
      <PickedupModal
        booking={booking}
        visible={openPickedUpModal}
        onClose={() => setOpenPickedUpModal(false)}
        onConfirm={handleMarkPickedUp}
      />
    </SafeAreaView>
  );
}

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},
  avatarContainer: {
    width: width(10),
    height: width(10),
    borderRadius: 100,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  sectionPadding: {paddingHorizontal: width(3)},
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 18,
    color: COLORS.black,
  },
  subTitle: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 14,
    color: COLORS.textLight,
  },
  price: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 18,
    color: COLORS.black,
    textAlign: 'right',
  },
  priceType: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  card: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(4),
    margin: width(2),
    padding: width(5),
  },
  cardTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 18,
    color: COLORS.black,
  },
  sectionLabel: {
    fontSize: 12,
    marginTop: width(3),
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: width(3),
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: width(3),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconSmall: {
    height: width(5),
    width: width(5),
    marginTop: 2,
  },
  avatar: {
    height: width(8),
    width: width(8),
    borderRadius: 100,
  },
  infoText: {
    flex: 1,
    minWidth: 0,
    marginLeft: width(3),
  },
  infoTitle: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },
  infoValue: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
    flexShrink: 1,
  },
  infoSubValue: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    flexShrink: 1,
  },
  footer: {
    paddingHorizontal: width(4),
    paddingTop: width(2),
    paddingBottom: width(4),
    gap: width(2),
    backgroundColor: COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: width(2),
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
  pendingPairBtnOuter: {
    height: width(11),
  },
  pendingPairOutlineInner: {
    flex: 1,
    justifyContent: 'center',
  },
  pendingAcceptOutlineText: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  footerFilledText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.white,
  },
});

export default BookingDetails;

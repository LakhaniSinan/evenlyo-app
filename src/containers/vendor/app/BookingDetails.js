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
import StatusBadge from '../../../components/statusComponent';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  acceptBooking,
  getVendorBookingById,
  rejectBooking,
  updateStatus,
} from '../../../services/BookingItem';
const STATUS_CONFIG = {
  pending: {
    bg: '#FFF4E5',
    text: '#FF9800',
    label: 'Pending',
  },
  accepted: {
    bg: '#E3F2FD',
    text: '#1976D2',
    label: 'Accepted',
  },
  on_the_way: {
    bg: '#E1F5FE',
    text: '#0288D1',
    label: 'On the way',
  },
  finished: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    label: 'Finished',
  },
  picked_up: {
    bg: '#F3E5F5',
    text: '#7B1FA2',
    label: 'Picked up',
  },
  received_back: {
    bg: '#E0F2F1',
    text: '#00695C',
    label: 'Received back',
  },
  completed: {
    bg: '#E8F5E9',
    text: '#1B5E20',
    label: 'Completed',
  },
  rejected: {
    bg: '#FDECEA',
    text: '#D32F2F',
    label: 'Rejected',
  },
};

function BookingDetails({route}) {
  console.log(route, 'routerouterouterouteroute');

  const navigation = useNavigation();
  const {currentLanguage} = useTranslation();
  const {_id} = route.params || {};
  const [openPickedUpModal, setOpenPickedUpModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const alertRef = useRef(null);

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const getStatusStyle = status => {
    const key = (status || '').toLowerCase();
    return (
      STATUS_CONFIG[key] || {
        bg: '#ECEFF1',
        text: '#37474F',
        label: status || 'Unknown',
      }
    );
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
      console.log(response, 'responceresponceresponceresponceresponce');
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
      setIsLoading(true);
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
    let params =
      vall?.type == 'Good'
        ? {condition: vall?.type?.toLowerCase()}
        : {
            condition: vall?.type?.toLowerCase(),
            securityFee: vall?.amount,
          };
    handleUpdateStatus(params, 'mark-picked-up');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText="Booking Details"
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
                $ {booking?.listingDetails?.pricing?.amount}
              </Text>
              <Text style={styles.priceType}>
                /{booking?.listingDetails?.pricing?.type}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Order Details</Text>
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

          {renderInfoRow(ICONS.ticketIcon, 'Tracking ID', booking?.trackingId)}
          {renderInfoRow(
            ICONS.ticketIcon,
            'Payment Status',
            booking?.paymentStatus,
          )}

          <Text style={styles.sectionLabel}>Buyer Details</Text>

          {renderUserRow(booking?.userId, booking?.details?.eventLocation)}

          <Text style={styles.sectionLabel}>Seller Details</Text>

          {renderUserRow(
            booking?.vendorDetails,
            booking?.listingId?.location?.userAddress,
          )}
        </View>
      </ScrollView>

      {booking?.status === 'pending' && (
        <View style={styles.actionRow}>
          <View style={styles.actionButton}>
            <GradientButton
              text="Accept"
              onPress={handleAcceptBooking}
              type="outline"
              useGradient
            />
          </View>
          <View style={styles.actionButton}>
            <GradientButton
              text="Reject"
              onPress={() => setRejectModalVisible(true)}
            />
          </View>
        </View>
      )}
      {booking?.paymentStatus == 'paid' && booking?.status == 'accepted' && (
        <View style={{paddingHorizontal: width(4), marginTop: width(3)}}>
          <GradientButton
            text="Mark As On the way"
            onPress={() => handleUpdateStatus(null, 'mark-on-the-way')}
            type="outline"
            useGradient
          />
        </View>
      )}
      {booking?.status == 'finished' && (
        <View style={{paddingHorizontal: width(4), marginTop: width(3)}}>
          <GradientButton
            text="Pickedup"
            onPress={handlePickedUp}
            type="outline"
            useGradient
          />
        </View>
      )}
      {booking?.status == 'picked_up' && (
        <View style={{paddingHorizontal: width(4), marginTop: width(3)}}>
          <GradientButton
            text="Received Back"
            onPress={() => handleUpdateStatus(null, 'received-back')}
            type="outline"
            useGradient
          />
        </View>
      )}
      {booking?.status == 'received_back' && (
        <View style={{paddingHorizontal: width(4), marginTop: width(3)}}>
          <GradientButton
            text="Complete"
            onPress={() => handleUpdateStatus(null, 'mark-completed')}
            type="outline"
            useGradient
          />
        </View>
      )}
      {booking?.status !== 'pending' && (
        <View style={{paddingHorizontal: width(4), marginTop: width(3)}}>
          <GradientButton
            textStyle={{
              fontSize: 13,
              fontFamly: fontFamly.PlusJakartaSansMedium,
              color: COLORS.white,
            }}
            text={'Track Now'}
            onPress={() =>
              navigation.navigate('TrackingBookingDetails', booking)
            }
            styleProps={{
              paddingVertical: width(3),
            }}
          />
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

const renderDateBlock = (label, date, time) => (
  <View style={styles.infoRow}>
    <Image source={ICONS.clockIcon} style={styles.iconSmall} />
    <View style={styles.infoText}>
      <Text style={styles.infoTitle}>{label}</Text>
      <Text style={styles.infoValue}>{moment(date).format('YYYY-MM-DD')}</Text>
      <Text style={styles.infoSubValue}>{time}</Text>
    </View>
  </View>
);

const renderInfoRow = (icon, title, value) => (
  <View style={styles.dividerRow}>
    <Image source={icon} style={styles.iconSmall} />
    <View style={styles.infoText}>
      <Text style={styles.infoValue}>{title}</Text>
      <Text style={styles.infoSubValue}>{value}</Text>
    </View>
  </View>
);

const renderUserRow = (user, address) => {
  console.log(user, address, 'user, addressuser, addressuser, address');

  return (
    <View style={styles.dividerRow}>
      <Image source={IMAGES.profilePhoto} style={styles.avatar} />
      <View style={styles.infoText}>
        <Text style={styles.infoValue}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.infoSubValue}>{address}</Text>
      </View>
    </View>
  );
};

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},
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
    alignItems: 'center',
    paddingVertical: width(3),
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: width(3),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconSmall: {
    height: width(5),
    width: width(5),
  },
  avatar: {
    height: width(10),
    width: width(10),
  },
  infoText: {
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
  },
  infoSubValue: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width(3),
  },
  actionButton: {
    width: width(44),
  },
});

export default BookingDetails;

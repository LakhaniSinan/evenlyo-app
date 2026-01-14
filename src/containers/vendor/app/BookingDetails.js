import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
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
import RejectRequestModal from '../../../components/modals/RejectRequest';
import StatusBadge from '../../../components/statusComponent';
import {COLORS, fontFamly} from '../../../constants';
import {
  acceptBooking,
  getBookingAnalytics,
  rejectBooking,
} from '../../../services/BookingItem';

function BookingDetails({route}) {
  const data = route.params;
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [listingCartData, setListingCartData] = useState(null);
  console.log(listingCartData, 'listingCartDatalistingCartDatalistingCartData');

  const [modalVisible, setModalVisible] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    handleGetCartListing();
  }, []);

  const handleGetCartListing = async () => {
    try {
      setIsLoading(true);
      const response = await getBookingAnalytics();

      setIsLoading(false);

      if (response?.status === 200 || response?.status === 201) {
        const cartData = response?.data?.bookings || [];

        const matchedBooking = cartData.find(
          item => item.trackingId === data.trackingId,
        );

        if (matchedBooking) {
          setListingCartData(matchedBooking);
        } else {
        }
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error, 'errorerrorerrorerrorerror214543654');
    }
  };

  const handleConfirmCancel = async data => {
    try {
      setIsLoading(true);
      const response = await rejectBooking(listingCartData?.id, {
        rejectionReason: data,
      });

      setIsLoading(false);
      if (response.status == 200 || response.status == 201) {
        setTimeout(() => {
          setModalVisible(false);
          modalRef.current.show({
            status: 'ok',
            message: response?.data?.message,
            handlePressOk: () => {
              modalRef.current.hide();
              handleGetCartListing();
            },
          });
        }, 500);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'ERRRRRRRRRASDSADASD');
      setIsLoading(false);
    }
  };

  const handleAcceptBooking = async () => {
    try {
      setIsLoading(true);
      const response = await acceptBooking(listingCartData?.id);
      setIsLoading(false);
      if (response.status == 200 || response.status == 201) {
        setTimeout(() => {
          setModalVisible(false);
          modalRef.current.show({
            status: 'ok',
            message: response?.data?.message,
            handlePressOk: () => {
              modalRef.current.hide();
              handleGetCartListing();
            },
          });
        }, 500);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error, 'errorerrorerrorerrorerror');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'Booking Details'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={() => {
          navigation.goBack();
        }}
        onRightIconPress={() => {
          navigation.navigate('Messages');
        }}
      />
      <ScrollView style={{flex: 1}}>
        <View style={{paddingHorizontal: width(3)}}>
          <CarouselComponent
            data={listingCartData?.listingDetails?.images || []}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  fontSize: 18,
                  color: COLORS.black,
                }}>
                {listingCartData?.listingDetails?.title?.en}
              </Text>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  fontSize: 14,
                  color: COLORS.textLight,
                }}>
                {listingCartData?.listingDetails?.description?.en}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  fontSize: 18,
                  color: COLORS.black,
                  textAlign: 'right',
                }}>
                $ {listingCartData?.listingDetails?.pricing?.amount}
              </Text>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  fontSize: 14,
                  color: COLORS.textLight,
                  textAlign: 'right',
                }}>
                /{listingCartData?.listingDetails?.pricing?.type}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            borderRadius: width(4),
            margin: width(4),
            padding: width(5),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 12,
                color: COLORS.textDark,
              }}>
              Booking{' '}
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  color: COLORS.textLight,
                  fontSize: 10,
                }}>
                #{listingCartData?.trackingId}
              </Text>
            </Text>
            <StatusBadge status={listingCartData?.status} />
          </View>
          <View
            style={{
              paddingVertical: width(3),
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              source={ICONS.clockIcon}
              resizeMode="contain"
              style={{height: width(5), width: width(5)}}
            />
            <View style={{marginLeft: width(3)}}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansMedium,
                  fontSize: 12,
                  color: COLORS.textDark,
                }}>
                {moment(listingCartData?.createdAt).format('YYYY-MM-DD')}
              </Text>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansMedium,
                  fontSize: 10,
                  color: COLORS.textLight,
                }}>
                {moment(listingCartData?.createdAt).format('hh:mm A')}
              </Text>
            </View>
          </View>
          <View
            style={{
              paddingVertical: width(3),
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}>
            <Image
              source={ICONS.ticketIcon}
              resizeMode="contain"
              style={{height: width(5), width: width(5)}}
            />
            <View style={{marginLeft: width(3)}}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansMedium,
                  fontSize: 12,
                  color: COLORS.textDark,
                }}>
                Tracking ID
              </Text>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansMedium,
                  fontSize: 10,
                  color: COLORS.textLight,
                }}>
                {listingCartData?.trackingId}
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 12,
              marginTop: width(3),
              color: COLORS.textDark,
              fontFamily: fontFamly.PlusJakartaSansMedium,
            }}>
            Buyer Details
          </Text>
          <View
            style={{
              paddingVertical: width(3),
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
            }}>
            <Image
              source={IMAGES.profilePhoto}
              resizeMode="contain"
              style={{height: width(10), width: width(10)}}
            />
            <View style={{marginLeft: width(3)}}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansMedium,
                  fontSize: 12,
                  color: COLORS.textDark,
                }}>
                {listingCartData?.customer}
              </Text>
              <Text
                style={{
                  width: width(70),
                  fontFamily: fontFamly.PlusJakartaSansMedium,
                  fontSize: 10,
                  color: COLORS.textLight,
                }}>
                {listingCartData?.location?.address ||
                  listingCartData?.location}
              </Text>
            </View>
          </View>
          {data?.type == 'Booking' && (
            <>
              <Text
                style={{
                  fontSize: 12,
                  marginTop: width(3),
                  color: COLORS.textDark,
                  fontFamily: fontFamly.PlusJakartaSansMedium,
                }}>
                Seller Details
              </Text>
              <View
                style={{
                  paddingVertical: width(3),
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Image
                  source={IMAGES.profilePhoto}
                  resizeMode="contain"
                  style={{height: width(10), width: width(10)}}
                />
                <View style={{marginLeft: width(3)}}>
                  <Text
                    style={{
                      fontFamily: fontFamly.PlusJakartaSansMedium,
                      fontSize: 12,
                      color: COLORS.textDark,
                    }}>
                    Tech Solutions Ltd
                  </Text>
                  <Text
                    style={{
                      fontFamily: fontFamly.PlusJakartaSansMedium,
                      fontSize: 10,
                      color: COLORS.textLight,
                    }}>
                    New York, NY
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {listingCartData?.status == 'pending' && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: width(4),
            paddingRight: width(1),
          }}>
          <View style={{width: width(44), marginRight: width(2)}}>
            <GradientButton
              text={'Accept'}
              onPress={handleAcceptBooking}
              type="outline"
              useGradient={true}
            />
          </View>
          <View style={{width: width(44), marginRight: width(2)}}>
            <GradientButton
              textStyle={{
                fontSize: 13,
                fontFamly: fontFamly.PlusJakartaSansMedium,
                color: COLORS.white,
              }}
              text={'Reject'}
              onPress={() => setModalVisible(true)}
              styleProps={{
                paddingVertical: width(3),
              }}
            />
          </View>
        </View>
      )}
      {listingCartData?.status == 'received' && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: width(4),
            paddingRight: width(1),
          }}>
          <View style={{width: width(44), marginRight: width(2)}}>
            <GradientButton
              text={'Complete'}
              onPress={handleAcceptBooking}
              type="outline"
              useGradient={true}
            />
          </View>
          <View style={{width: width(44), marginRight: width(2)}}>
            <GradientButton
              textStyle={{
                fontSize: 13,
                fontFamly: fontFamly.PlusJakartaSansMedium,
                color: COLORS.white,
              }}
              text={'Complain'}
              onPress={() => setModalVisible(true)}
              styleProps={{
                paddingVertical: width(3),
              }}
            />
          </View>
        </View>
      )}
      {listingCartData?.status !== 'pending' && (
        <View style={{paddingHorizontal: width(4), marginTop: width(3)}}>
          <GradientButton
            textStyle={{
              fontSize: 13,
              fontFamly: fontFamly.PlusJakartaSansMedium,
              color: COLORS.white,
            }}
            text={'Track Now'}
            onPress={() => navigation.navigate('TrackingBookingDetails')}
            styleProps={{
              paddingVertical: width(3),
            }}
          />
        </View>
      )}

      <CommonAlert ref={modalRef} />
      <Loader isLoading={isLoading} />

      <RejectRequestModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmCancel}
      />
    </SafeAreaView>
  );
}

export default BookingDetails;

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
});

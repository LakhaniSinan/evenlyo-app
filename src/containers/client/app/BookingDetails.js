import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';

import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CarouselComponent from '../../../components/carousel';
import CommonAlert from '../../../components/commanAlert';
import EventAndPriceDetails from '../../../components/eventDetailAndPrice';
import GradientText from '../../../components/gradiantText';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {getBookingDetails} from '../../../services/BookingItem';
import {useTranslation} from '../../../hooks';

const RenderCards = ({type, data}) => {
  const isCheckIn = type === 'Check In';

  const dateValue = isCheckIn ? data?.start : data?.end;
  const timeValue = isCheckIn ? data?.startTime : data?.endTime;

  return (
    <View
      style={{
        borderRadius: 10,
        height: 79,
        width: 140,
        backgroundColor: 'white',
        elevation: 10,
        paddingLeft: 10,
      }}>
      <GradientText customStyles={{textAlign: 'left'}} text={type} />

      <Text
        style={{
          color: COLORS.black,
          fontSize: 16,
          fontFamily: fontFamly.PlusJakartaSansBold,
        }}>
        {dateValue ? moment(dateValue).format('DD MMM YYYY') : '--'}
      </Text>

      <Text style={{color: COLORS.textLight, fontSize: 12}}>
        {timeValue ? moment(timeValue, 'HH:mm').format('hh:mm A') : '--'}
      </Text>
    </View>
  );
};

const BookingDetails = ({route, navigation}) => {
  const item = route.params;
  const {currentLanguage} = useTranslation();
  const modalRef = useRef(null);
  const mapRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getBookingDetails(item?._id);

      if (response.status === 200 || response.status === 201) {
        setBookingData(response?.data?.data?.booking || null);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (err) {
      console.log('Booking details error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      bookingData?.details?.eventLatitude &&
      bookingData?.details?.eventLongitude &&
      mapRef.current
    ) {
      mapRef.current.animateToRegion(
        {
          latitude: Number(bookingData.details.eventLatitude),
          longitude: Number(bookingData.details.eventLongitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800,
      );
    }
  }, [bookingData]);

  const hasLocation =
    bookingData?.details?.eventLatitude && bookingData?.details?.eventLongitude;

  const recenterMap = () => {
    if (
      bookingData?.details?.eventLatitude &&
      bookingData?.details?.eventLongitude &&
      mapRef.current
    ) {
      mapRef.current.animateToRegion(
        {
          latitude: Number(bookingData.details.eventLatitude),
          longitude: Number(bookingData.details.eventLongitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600,
      );
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          headingText="Booking"
          rightIcon={ICONS.chatIcon}
          onRightIconPress={() => navigation.navigate('MessagesScreen')}
          onLeftIconPress={() => navigation.goBack()}
        />

        <CarouselComponent data={bookingData?.listingDetails?.images} />

        <View style={{marginHorizontal: 10}}>
          <EventAndPriceDetails
            data={{...bookingData?.listingDetails, ...bookingData}}
            showDiscount={false}
            showSwitch={false}
          />
        </View>

        <View
          style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <RenderCards type="Check In" data={bookingData?.bookingDateTime} />

          <View
            style={{
              backgroundColor: 'white',
              width: 32,
              height: 32,
              elevation: 1,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 100,
              marginHorizontal: 10,
            }}>
            <Image style={{height: 7, width: 12}} source={ICONS.arrowIcon} />
          </View>

          <RenderCards type="Check Out" data={bookingData?.bookingDateTime} />
        </View>

        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            marginHorizontal: 20,
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            style={{width: 55, height: 55, borderRadius: 100}}
            resizeMode="cover"
            source={
              bookingData?.vendorDetails?.businessLogo
                ? {uri: bookingData?.vendorDetails?.businessLogo}
                : IMAGES.profilePhoto
            }
          />

          <View style={{marginLeft: 10}}>
            <Text
              style={{
                color: COLORS.black,
                fontSize: 15,
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
              }}>
              {bookingData?.vendorDetails?.firstName}
            </Text>
            <Text
              style={{
                color: COLORS.black,
                fontSize: 10,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              }}>
              {bookingData?.vendorDetails?.email}
            </Text>
          </View>

          <TouchableOpacity
            style={{flex: 1, alignItems: 'flex-end'}}
            onPress={() => navigation.navigate('MessagesScreen')}>
            <Image style={{width: 32, height: 32}} source={ICONS.chatIcon} />
          </TouchableOpacity>
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
        <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.black,
            }}>
            Location:
          </Text>

          <View
            style={{
              height: 200,
              borderRadius: 10,
              overflow: 'hidden',
              marginTop: 10,
            }}>
            {hasLocation && (
              <View style={{flex: 1}}>
                <MapView
                  ref={mapRef}
                  style={{flex: 1}}
                  zoomEnabled
                  scrollEnabled
                  rotateEnabled
                  pitchEnabled>
                  <Marker
                    coordinate={{
                      latitude: Number(bookingData.details.eventLatitude),
                      longitude: Number(bookingData.details.eventLongitude),
                    }}
                    title="Event Location"
                    description={bookingData.details.eventLocation}
                  />
                </MapView>

                <TouchableOpacity
                  onPress={recenterMap}
                  activeOpacity={0.8}
                  style={{
                    position: 'absolute',
                    bottom: 15,
                    right: 15,
                    backgroundColor: COLORS.white,
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 5,
                  }}>
                  <Image
                    source={ICONS.locationIcon || ICONS.location}
                    style={{width: 20, height: 20}}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: width(3),
            }}>
            <View style={{width: width(45)}}>
              <GradientButton
                onPress={() => navigation.navigate('ChatDetail')}
                text={'Chat with Vendor'}
                type="outline"
                icon={ICONS.chatIconfilled}
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
                text={'Track Booking'}
                type="filled"
                onPress={() =>
                  navigation.navigate('TrackDirections', {
                    ...bookingData?.details,
                    ...bookingData?.vendorDetails,
                  })
                }
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <CommonAlert ref={modalRef} />
      <Loader isLoading={isLoading} />
    </SafeAreaView>
  );
};

export default BookingDetails;

import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import {Rating} from 'react-native-ratings';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import LoginModal from '../../../components/authModal';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import GradientText from '../../../components/gradiantText';
import Loader from '../../../components/loder';
import OrderBooking from '../../../components/modals/OrderBookingModal';
import RequestConfirmation from '../../../components/modals/RequestConfirmation';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {setCartData} from '../../../redux/slice/cart';
import {
  listingAddToCart,
  sendBookingRequest,
} from '../../../services/ListingsItem';
import {getDistance} from '../../../utils';

const getInitialMarkedDates = availableDays => {
  let marked = {};
  const start = moment();
  const end = moment().add(6, 'months');

  for (let m = start.clone(); m.isBefore(end); m.add(1, 'day')) {
    const dayName = m.format('ddd').toLowerCase();
    const dateStr = m.format('YYYY-MM-DD');
    const isPast = m.isBefore(moment(), 'day');
    const isAvailable = availableDays.includes(dayName);

    marked[dateStr] =
      isPast || !isAvailable
        ? {
            disabled: true,
            disableTouchEvent: true,
            customStyles: {
              container: {backgroundColor: '#f0f0f0'},
              text: {color: '#999'},
            },
          }
        : {
            disabled: false,
            customStyles: {
              container: {backgroundColor: '#fff'},
              text: {color: '#000'},
            },
          };
  }
  return marked;
};

const DetailsContent = ({data, selectedTab, navigation}) => {
  const {cartData} = useSelector(state => state.CartSlice);
  const dispatch = useDispatch(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const {currentLanguage} = useTranslation();
  const modalRef = useRef(null);
  const [responeData, setResponeData] = useState(null);
  const [isLoadding, setIsLoadding] = useState(false);
  const mapRef = useRef(null);
  const locationCoordinates = data?.location?.coordinates;
  let latitude = 24.9614333;
  let longitude = 67.106703;

  if (Array.isArray(locationCoordinates)) {
    longitude = Number(locationCoordinates[0]);
    latitude = Number(locationCoordinates[1]);
  } else if (locationCoordinates?.latitude && locationCoordinates?.longitude) {
    latitude = Number(locationCoordinates.latitude);
    longitude = Number(locationCoordinates.longitude);
  }

  const mapRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    if (mapRef.current && latitude && longitude) {
      setTimeout(() => {
        mapRef.current.animateToRegion(mapRegion, 1000);
      }, 1000);
    }
  }, [latitude, longitude]);

  const availableDays = useMemo(() => {
    const days = data?.availability?.availableDays || data?.availableDays || [];
    return days.map(d => String(d).toLowerCase());
  }, [data]);

  const [modalVisible, setModalVisible] = useState(false);
  const [resuestModalVisible, setResuestModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState(() =>
    getInitialMarkedDates(availableDays),
  );

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    setMarkedDates(getInitialMarkedDates(availableDays));
  }, [availableDays]);

  const handleDayPress = day => {
    const date = day.dateString;
    const m = moment(date, 'YYYY-MM-DD');
    const dayName = m.format('ddd').toLowerCase();
    const isPast = m.isBefore(moment(), 'day');
    const isAvailable = availableDays.includes(dayName);

    if (isPast || !isAvailable) {
      return;
    }

    let newStartDate = startDate;
    let newEndDate = endDate;

    if (!startDate || (startDate && endDate)) {
      newStartDate = date;
      newEndDate = null;
      setStartDate(newStartDate);
      setEndDate(null);
    } else if (moment(date).isBefore(moment(startDate))) {
      newStartDate = date;
      newEndDate = null;
      setStartDate(newStartDate);
      setEndDate(null);
    } else {
      newEndDate = date;
      setEndDate(newEndDate);
    }

    let updatedMarked = getInitialMarkedDates(availableDays);

    if (newStartDate && newEndDate) {
      const range = [];
      let curr = moment(newStartDate);
      while (curr.isSameOrBefore(newEndDate)) {
        const currDayName = curr.format('ddd').toLowerCase();
        const currDateStr = curr.format('YYYY-MM-DD');
        if (availableDays.includes(currDayName)) {
          range.push(currDateStr);
        }
        curr.add(1, 'day');
      }

      range.forEach(d => {
        if (updatedMarked[d] && !updatedMarked[d].disabled) {
          updatedMarked[d] = {
            ...updatedMarked[d],
            customStyles: {
              container: {backgroundColor: '#FF295D', borderRadius: 5},
              text: {color: '#fff', fontWeight: 'bold'},
            },
          };
        }
      });
    } else if (newStartDate && !newEndDate) {
      const startDayName = moment(newStartDate).format('ddd').toLowerCase();
      if (availableDays.includes(startDayName)) {
        updatedMarked[newStartDate] = {
          ...updatedMarked[newStartDate],
          customStyles: {
            container: {backgroundColor: '#FF295D', borderRadius: 5},
            text: {color: '#fff', fontWeight: 'bold'},
          },
        };
      }
    }

    setMarkedDates(updatedMarked);
  };

  const selectedRangeText =
    startDate && endDate
      ? `${startDate} → ${endDate}`
      : startDate
      ? `${startDate}`
      : 'No date selected';

  const handleSendBookingRequest = async details => {
    try {
      setIsLoadding(true);
      const response = await sendBookingRequest(details);
      if (response.status == 200 || response.status == 201) {
        setResponeData(response?.data?.data?.bookingRequest);
        setStartDate(null);
        setModalVisible(false);
        setTimeout(() => setResuestModalVisible(true), 500);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
      setIsLoadding(false);
    } catch (error) {
      setIsLoadding(false);
      console.log(error, 'errorerrorerrorerror');
    } finally {
      setIsLoadding(false);
    }
  };

  const handleAddToCart = async () => {
    console.log('asdasd');

    try {
      let updatedCart = JSON.parse(JSON.stringify(cartData || []));
      const vendorId = data?.vendor?._id;

      const vendorIndex = updatedCart.findIndex(v => v.vendorId === vendorId);

      const productObject = {
        _id: data?._id,
        title: data?.title?.en,
        image: data?.image,
        sellingPrice: data?.sellingPrice,
        quantity: 1,
        stockQuantity: data?.stockQuantity,
        vendor: {
          _id: data?.vendor?._id,
          businessName: data?.vendor?.businessName,
          businessLogo: data?.vendor?.businessLogo,
        },
        linkedListing: data?.linkedListing,
        orderStatus: 'Pending',
        type: data?.type,
        createdAt: new Date().toISOString(),
      };
      if (vendorIndex !== -1) {
        const alreadyExists = updatedCart[vendorIndex].products.some(
          p => p._id === data._id,
        );

        if (alreadyExists) {
          modalRef.current.show({
            status: 'error',
            message: 'Item already exists in your cart',
          });
          return;
        } else {
          updatedCart[vendorIndex].products.push(productObject);
        }
      } else {
        updatedCart.push({
          vendorId: vendorId,
          products: [productObject],
          businessLogo: data?.vendor?.businessLogo,
          vendorName: data?.vendor?.businessName,
          businessLocation: data?.vendor?.businessLocation,
        });
      }

      dispatch(setCartData(updatedCart));
      await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));

      modalRef.current.show({
        status: 'ok',
        message: 'Item added to cart successfully!',
      });
    } catch (error) {
      console.log('Add to Cart Error:', error);
      modalRef.current.show({
        status: 'error',
        message: 'Something went wrong while adding to cart',
      });
    }
  };

  const handleAddToWishList = async listingId => {
    const userToken = await AsyncStorage.getItem('token');

    if (userToken == null) {
      setShowLoginModal(true);
    } else {
      try {
        let payload = {
          listingId,
          tempDetails: {
            startDate: startDate,
            endDate: endDate,
          },
        };
        let params = {
          listingId: listingId?.listingId,
          tempDetails: {
            contactPreference: 'email',
            startDate: listingId?.startDate,
            endDate: listingId?.endDate,
            eventLocation: listingId?.eventLocation,
            specialRequests: listingId?.specialRequests,
            distanceKm: listingId?.distanceKm,
            evenyloProtect: listingId?.evenlyoProtect,
            startTime: listingId?.startTime,
            endTime: listingId?.endTime,
          },
        };

        const finalPayload = listingId?.listingId ? params : payload;

        setIsLoadding(true);
        const response = await listingAddToCart(finalPayload);

        setIsLoadding(false);
        if (response.status == 200 || response.status == 201) {
          modalRef.current.show({
            status: 'ok',
            message: response?.data?.message,
            handlePressOk: () => {
              modalRef.current.hide();
              setModalVisible(false);
              setTimeout(() => {
                listingId?.listingId == undefined
                  ? navigation.navigate('Messages')
                  : null;
              }, 500);
            },
          });
        } else {
          modalRef.current.show({
            status: 'error',
            message: response?.data?.message,
          });
        }
      } catch (error) {
        setIsLoadding(false);
        console.log(error, 'ljsbalskbdlasdnlasndlaskdnlsa');
      }
    }
  };

  const locationData = useSelector(state => state.LocationSlice);

  const {coords} = locationData;
  let coLatLng = {
    latitude: data?.location?.coordinates?.latitude,
    longitude: data?.location?.coordinates?.longitude,
  };

  const {distance} = getDistance(coLatLng, coords);
  return (
    <>
      {selectedTab === 'gallery' ? (
        // <CarouselComponent data={data} />
        <View
          style={{
            height: width(80),
            backgroundColor: COLORS.white,
            margin: width(2),
            borderRadius: width(5),
            overflow: 'hidden',
          }}>
          <Image
            source={{uri: data?.image}}
            resizeMode="cover"
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        </View>
      ) : (
        <>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="custom"
            minDate={moment().format('YYYY-MM-DD')}
            maxDate={moment().add(6, 'months').format('YYYY-MM-DD')}
            theme={{
              todayTextColor: 'red',
              arrowColor: 'blue',
            }}
            disableAllTouchEventsForDisabledDays
          />

          <View style={{marginHorizontal: 20, marginTop: 10}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
                fontSize: 12,
                color: COLORS.black,
              }}>
              Selected Date Range:
            </Text>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansMedium,
                fontSize: 10,
                color: COLORS.textLight,
              }}>
              {selectedRangeText}
            </Text>
          </View>
        </>
      )}
      <View style={{marginHorizontal: 10, marginTop: width(3)}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: width(3),
          }}>
          <View style={{width: width(60)}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
                color: COLORS.semiLightText,
                fontSize: 12,
              }}>
              {data?.location?.userAddress ||
                data?.location?.fullAddress ||
                data?.vendor?.businessLocation}
            </Text>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: COLORS.textDark,
                fontSize: 15,
              }}>
              {currentLanguage == 'en' ? data?.title?.en : data?.title?.nl}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={ICONS.locationWithoutBg}
                resizeMode="contain"
                style={{height: 10, width: 10}}
                tintColor={COLORS.semiLightText}
              />
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  marginLeft: width(2),
                  color: COLORS.semiLightText,
                  fontSize: 11,
                }}>
                {distance} Km Away
              </Text>
            </View>
            <View
              style={{
                alignItems: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Rating
                ratingCount={5}
                minValue={data?.rating?.totalReviews}
                readonly={true}
                imageSize={15}
                style={{}}
              />
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiMedium,
                  fontSize: 12,
                  marginLeft: width(2),
                  color: COLORS.semiLightText,
                }}>
                {data?.rating?.average}
              </Text>
            </View>
          </View>
          <View style={{}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: '#000',
                fontSize: 15,
              }}>
              $ {data?.sellingPrice || data?.pricing?.amount}
            </Text>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                color: '#000',
                fontSize: 9,
              }}>
              {data?.pricing?.type && ` /${data?.pricing?.type?.toUpperCase()}`}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          backgroundColor: COLORS.backgroundLight,
          marginHorizontal: 20,
          marginTop: 10,
          padding: 10,
          borderRadius: 10,
          flexDirection: 'row',
        }}>
        {!data?.vendor?.businessLogo ? (
          <View
            style={{
              height: 55,
              width: 55,
              backgroundColor: COLORS.white,
              borderRadius: 100,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{width: 30, height: 30, borderRadius: 100}}
              source={ICONS.userIcon}
              resizeMode="contain"
            />
          </View>
        ) : (
          <Image
            style={{width: 55, height: 55, borderRadius: 100}}
            source={{uri: data?.vendor?.businessLogo}}
            resizeMode="contain"
          />
        )}
        <View style={{marginLeft: 10, justifyContent: 'center'}}>
          <Text
            style={{
              color: COLORS.black,
              fontSize: 15,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
            }}>
            {data?.vendor?.businessName || data?.vendor?.fullName}
          </Text>
          <Text
            style={{
              color: COLORS.textLight,
              fontSize: 10,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            }}>
            {data?.vendor?.businessEmail || data?.vendor?.email}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ChatDetail')}
          style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
          <Image style={{width: 32, height: 32}} source={ICONS.chatIcon} />
        </TouchableOpacity>
      </View>

      <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
        <Text
          style={{
            color: COLORS.black,
            fontFamily: fontFamly.PlusJakartaSansBold,
            fontSize: 12,
          }}>
          Description:
        </Text>
        <Text
          numberOfLines={4}
          style={{
            fontFamily: fontFamly.PlusJakartaSansMedium,
            fontSize: 10,
            color: COLORS.textLight,
          }}>
          {data?.description
            ? currentLanguage == 'en'
              ? data?.description?.en
              : data?.description?.nl
            : 'No Description'}
        </Text>
      </View>

      {data?.type !== 'saleItem' ? (
        <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
          <Text
            style={{
              color: COLORS.black,
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
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
            <MapView
              ref={mapRef}
              style={{flex: 1}}
              initialRegion={mapRegion}
              showsUserLocation={false}
              showsMyLocationButton={false}
              scrollEnabled={true}
              zoomEnabled={true}>
              <Marker
                coordinate={{latitude, longitude}}
                title={data?.vendor?.businessName || 'Event Location'}
                description={data?.location?.fullAddress || 'Location'}
              />
            </MapView>
          </View>
          {selectedTab == 'details' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: width(3),
              }}>
              <TouchableOpacity
                onPress={() => handleAddToWishList(data?._id)}
                style={{
                  width: width(45),
                  backgroundColor: COLORS.backgroundLight,
                  height: width(13),
                  borderRadius: width(5),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <GradientText text={'Add To Wishlist'} />
              </TouchableOpacity>
              <View style={{width: width(42)}}>
                <GradientButton
                  text={'Book Now'}
                  type="filled"
                  onPress={() => {
                    if (startDate == null) {
                      return modalRef.current.show({
                        status: 'error',
                        message: 'Please select any available date first!',
                      });
                    }
                    // if (endDate == null) {
                    //   return modalRef.current.show({
                    //     status: 'error',
                    //     message: 'Please select any available end date first!',
                    //   });
                    // }
                    setModalVisible(true);
                  }}
                />
              </View>
            </View>
          )}
        </View>
      ) : null}
      {selectedTab == 'gallery' && data?.type == 'saleItem' && (
        <View
          style={{
            marginHorizontal: width(3),
          }}>
          <GradientButton
            text={'Add To Cart'}
            type="filled"
            onPress={handleAddToCart}
          />
        </View>
      )}

      <OrderBooking
        data={data}
        isVisible={modalVisible}
        selectedDate={{startDate, endDate}}
        onClose={() => setModalVisible(false)}
        handleAddToWishList={handleAddToWishList}
        handleSendBookingRequest={handleSendBookingRequest}
      />
      <RequestConfirmation
        responeData={responeData}
        visible={resuestModalVisible}
        onClose={() => setResuestModalVisible(false)}
        navigation={navigation}
      />
      <LoginModal
        isVisible={showLoginModal}
        onClose={() => setShowLoginModal(!showLoginModal)}
      />
      <Loader isLoading={isLoadding} />
      <CommonAlert ref={modalRef} />
    </>
  );
};

export default DetailsContent;

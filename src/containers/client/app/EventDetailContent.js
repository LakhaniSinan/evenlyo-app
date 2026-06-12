import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  InteractionManager,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import {Rating} from 'react-native-ratings';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import LoginModal from '../../../components/authModal';
import ForgotModal from '../../../components/authModal/ForgotModal';
import RegistrationModal from '../../../components/authModal/RegistrationModal';
import GradientButton from '../../../components/button';
import CarouselComponent from '../../../components/carousel';
import CommonAlert from '../../../components/commanAlert';
import GradientText from '../../../components/gradiantText';
import Loader from '../../../components/loder';
import OrderBooking from '../../../components/modals/OrderBookingModal';
import RequestConfirmation from '../../../components/modals/RequestConfirmation';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {setCartData} from '../../../redux/slice/cart';
import {createConnection} from '../../../services/Chat';
import {
  listingAddToCart,
  sendBookingRequest,
} from '../../../services/ListingsItem';
import {getDistance, resolveAvailableDays} from '../../../utils';

const AUTH_MODAL_SWITCH_MS = 480;

const DEFAULT_MAP_COORDINATE = {
  latitude: 24.860966,
  longitude: 67.001137,
};
const DAY_KEYS_BY_ISO = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const DAY_KEY_ALIASES = {
  mon: 'mon',
  monday: 'mon',
  maandag: 'mon',
  tue: 'tue',
  tues: 'tue',
  tuesday: 'tue',
  dinsdag: 'tue',
  wed: 'wed',
  wednesday: 'wed',
  woensdag: 'wed',
  thu: 'thu',
  thur: 'thu',
  thurs: 'thu',
  thursday: 'thu',
  donderdag: 'thu',
  fri: 'fri',
  friday: 'fri',
  vrijdag: 'fri',
  sat: 'sat',
  saturday: 'sat',
  zaterdag: 'sat',
  sun: 'sun',
  sunday: 'sun',
  zondag: 'sun',
};

const parseFiniteNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeDayKey = day => {
  const key = String(day || '')
    .trim()
    .toLowerCase();
  return DAY_KEY_ALIASES[key] || null;
};

const getDayKeyFromMoment = dateMoment => {
  const isoDay = dateMoment.isoWeekday();
  return DAY_KEYS_BY_ISO[isoDay - 1] || null;
};

const getResolvedMapCoordinates = listingData => {
  const locationCoordinates = listingData?.location?.coordinates;
  const nestedCoordinates = locationCoordinates?.coordinates;

  const latitudeCandidates = [
    listingData?.eventLatitude,
    listingData?.latitude,
    locationCoordinates?.latitude,
    locationCoordinates?.lat,
    Array.isArray(locationCoordinates) ? locationCoordinates[1] : null,
    Array.isArray(nestedCoordinates) ? nestedCoordinates[1] : null,
  ];

  const longitudeCandidates = [
    listingData?.eventLongitude,
    listingData?.longitude,
    locationCoordinates?.longitude,
    locationCoordinates?.lng,
    locationCoordinates?.lon,
    Array.isArray(locationCoordinates) ? locationCoordinates[0] : null,
    Array.isArray(nestedCoordinates) ? nestedCoordinates[0] : null,
  ];

  const latitude =
    latitudeCandidates.map(parseFiniteNumber).find(v => v !== null) ??
    DEFAULT_MAP_COORDINATE.latitude;
  const longitude =
    longitudeCandidates.map(parseFiniteNumber).find(v => v !== null) ??
    DEFAULT_MAP_COORDINATE.longitude;

  const hasValidLatitude = latitude >= -90 && latitude <= 90;
  const hasValidLongitude = longitude >= -180 && longitude <= 180;

  if (!hasValidLatitude || !hasValidLongitude) {
    return DEFAULT_MAP_COORDINATE;
  }

  return {latitude, longitude};
};

const getInitialMarkedDates = availableDays => {
  let marked = {};
  const start = moment();
  const end = moment().add(6, 'months');
  const availableSet = new Set(availableDays);

  for (let m = start.clone(); m.isBefore(end); m.add(1, 'day')) {
    const dayName = getDayKeyFromMoment(m);
    const dateStr = m.format('YYYY-MM-DD');
    const isPast = m.isBefore(moment(), 'day');
    const isAvailable = availableSet.has(dayName);

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
  const {user} = useSelector(state => state.LoginSlice);
  const dispatch = useDispatch(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const {t, currentLanguage} = useTranslation();
  const isDutch = currentLanguage === 'nl';
  const localizedText = {
    selectedDateRange: isDutch
      ? 'Geselecteerd datumbereik:'
      : 'Selected Date Range:',
    noDateSelected: isDutch ? 'Geen datum geselecteerd' : 'No date selected',
    noDescription: isDutch ? 'Geen beschrijving' : 'No Description',
    addToWishlist: isDutch ? 'Toevoegen aan verlanglijst' : 'Add To Wishlist',
    bookNow: isDutch ? 'Nu boeken' : 'Book Now',
    selectAvailableDateFirst: isDutch
      ? 'Selecteer eerst een beschikbare datum!'
      : 'Please select any available date first!',
    addToCart: isDutch ? 'Toevoegen aan winkelwagen' : 'Add To Cart',
    itemAlreadyInCart: isDutch
      ? 'Item bestaat al in je winkelwagen'
      : 'Item already exists in your cart',
    itemAddedToCart: isDutch
      ? 'Item is succesvol toegevoegd aan je winkelwagen!'
      : 'Item added to cart successfully!',
    addToCartError: isDutch
      ? 'Er is iets misgegaan bij toevoegen aan winkelwagen'
      : 'Something went wrong while adding to cart',
  };
  const modalRef = useRef(null);
  const [responeData, setResponeData] = useState(null);
  const [isLoadding, setIsLoadding] = useState(false);
  const mapCoordinates = useMemo(() => getResolvedMapCoordinates(data), [data]);

  const {latitude, longitude} = mapCoordinates;
  const markerCoordinate = useMemo(
    () => ({
      latitude: parseFiniteNumber(latitude) ?? DEFAULT_MAP_COORDINATE.latitude,
      longitude:
        parseFiniteNumber(longitude) ?? DEFAULT_MAP_COORDINATE.longitude,
    }),
    [latitude, longitude],
  );
  const mapRegion = useMemo(
    () => ({
      latitude: markerCoordinate.latitude,
      longitude: markerCoordinate.longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    }),
    [markerCoordinate],
  );

  const availableDays = useMemo(
    () => resolveAvailableDays(data?.availability, data?.availableDays),
    [data?.availability, data?.availableDays],
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [resuestModalVisible, setResuestModalVisible] = useState(false);
  const [chatData, setChatData] = useState(null);
  const [markedDates, setMarkedDates] = useState(() =>
    getInitialMarkedDates(availableDays),
  );

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    setMarkedDates(getInitialMarkedDates(availableDays));
  }, [availableDays]);

  const closeAllAuthModals = useCallback(() => {
    setShowLoginModal(false);
    setShowForgotModal(false);
    setShowRegisterModal(false);
  }, []);

  const handlePressFun = useCallback(
    type => {
      closeAllAuthModals();

      const needsStaggeredOpen =
        type === 'forgot' ||
        type === 'register' ||
        type === 'reset' ||
        type === 'goBackToLogin' ||
        type === 'registeredOTP';

      const openTargetModal = () => {
        if (type === 'forgot') {
          setShowForgotModal(true);
        } else if (type === 'register') {
          setShowRegisterModal(true);
        } else if (
          type === 'reset' ||
          type === 'goBackToLogin' ||
          type === 'registeredOTP'
        ) {
          setShowLoginModal(true);
        }
      };

      if (needsStaggeredOpen) {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(openTargetModal, AUTH_MODAL_SWITCH_MS);
        });
      } else {
        openTargetModal();
      }
    },
    [closeAllAuthModals],
  );

  const handleDayPress = day => {
    const date = day.dateString;
    const m = moment(date, 'YYYY-MM-DD');
    const dayName = getDayKeyFromMoment(m);
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
        const currDayName = getDayKeyFromMoment(curr);
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
      const startDayName = getDayKeyFromMoment(moment(newStartDate));
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
      : localizedText.noDateSelected;

  const handleSendBookingRequest = async details => {
    try {
      // setIsLoadding(true);
      const response = await sendBookingRequest(details);
      console.log(response, 'responseresponseresponseresponseresponse');

      // return;
      if (response.status == 200 || response.status == 201) {
        setResponeData(response?.data?.data?.bookingRequest);
        setStartDate(null);
        setModalVisible(false);
        setTimeout(() => setResuestModalVisible(true), 500);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message?.en
            ? currentLanguage == 'en'
              ? response?.data?.message?.en
              : response?.data?.message?.nl
            : response?.data?.message,
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
            message: localizedText.itemAlreadyInCart,
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
        message: localizedText.itemAddedToCart,
      });
    } catch (error) {
      console.log('Add to Cart Error:', error);
      modalRef.current.show({
        status: 'error',
        message: localizedText.addToCartError,
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
          listingId: listingId?.listingId || listingId?._id,
          tempDetails: {
            startDate: startDate,
            endDate: endDate,
            startTime: listingId?.startTime,
            endTime: listingId?.endTime,
            distance: listingId?.distance,
            eventLocation: listingId?.eventLocation,
            eventLatitude: listingId?.eventLatitude,
            eventLongitude: listingId?.eventLongitude,
            paymentPolicy: data?.paymentPolicy,
            evenyloProtect: listingId?.evenyloProtect,
            specialRequests: listingId?.specialRequests,
          },
        };
        setIsLoadding(true);
        const response = await listingAddToCart(payload);

        setIsLoadding(false);
        if (response.status == 200 || response.status == 201) {
          modalRef.current.show({
            status: 'ok',
            message: response?.data?.message?.en
              ? currentLanguage == 'en'
                ? response?.data?.message?.en
                : response?.data?.message?.nl
              : response?.data?.message,
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
            message: response?.data?.message?.en
              ? currentLanguage == 'en'
                ? response?.data?.message?.en
                : response?.data?.message?.nl
              : response?.data?.message,
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
  const averageRating = Number(
    data?.reviews?.averageRating ?? data?.rating?.average ?? 0,
  );
  const totalReviews = Number(
    data?.reviews?.totalReviews ?? data?.rating?.totalReviews ?? 0,
  );

  const formatParticipants = participantsData => {
    const participants = {};
    participantsData?.forEach(({role, refPath, userId}) => {
      const normalizedRole = String(role || '').toLowerCase();
      const normalizedRefPath = String(refPath || '').toLowerCase();
      const isVendorParticipant =
        normalizedRole === 'vendor' || normalizedRefPath === 'vendor';

      if (isVendorParticipant) {
        participants.vendor = {
          userId: userId?._id || userId?.id || data?.vendor?._id,
          name: userId?.businessName || userId?.fullName || 'Vendor',
          photo: userId?.businessLogo || userId?.photo || null,
          email: userId?.businessEmail || userId?.email || '',
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

    if (!participants.vendor) {
      participants.vendor = {
        userId: data?.vendor?._id,
        name: data?.vendor?.businessName || data?.vendor?.fullName || 'Vendor',
        photo: data?.vendor?.businessLogo || data?.vendor?.photo || null,
        email: data?.vendor?.businessEmail || data?.vendor?.email || '',
        role: 'vendor',
      };
    }

    if (!participants.user) {
      participants.user = {
        userId: user?.id,
        name: user?.fullName || 'User',
        photo: user?.photo || null,
        email: user?.email || '',
        role: 'user',
      };
    }

    return participants;
  };

  const handleConnect = async () => {
    const userToken = await AsyncStorage.getItem('token');
    if (userToken == null) {
      setShowLoginModal(true);
      return;
    }
    if (chatData) {
      navigation.navigate('ChatDetail', chatData);
    } else {
      handleCreateSocketConnenction();
    }
  };

  const handleCreateSocketConnenction = async () => {
    try {
      setIsLoadding(true);
      let params = {
        userId: user?.id,
        vendorId: data?.vendor?.vendorModelId,
      };
      const responce = await createConnection(params);

      if (responce?.status == 200 || responce.status == 201) {
        let data = responce?.data?.data;
        setChatData({
          ...data,
          participants: formatParticipants(data?.participants),
        });
        navigation.navigate('ChatDetail', {
          ...data,
          participants: formatParticipants(data?.participants),
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: responce?.data?.message?.en
            ? currentLanguage == 'en'
              ? responce?.data?.message?.en
              : responce?.data?.message?.nl
            : responce?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'asdasdasdasdasdasdasdasd');
    } finally {
      setIsLoadding(false);
    }
  };

  return (
    <>
      {selectedTab === 'gallery' ? (
        <CarouselComponent data={data?.images || []} />
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
              {localizedText.selectedDateRange}
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
            {/* <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
            </View> */}
            <View
              style={{
                alignItems: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Rating
                ratingCount={5}
                startingValue={averageRating}
                readonly={true}
                imageSize={15}
                fractions={1}
              />
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiMedium,
                  fontSize: 12,
                  marginLeft: width(2),
                  color: COLORS.semiLightText,
                }}>
                {`${averageRating.toFixed(1)} (${totalReviews})`}
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
              € {data?.sellingPrice || data?.pricing?.amount}
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
            {data?.vendor?.firstName}
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
        {/* <TouchableOpacity
          onPress={handleConnect}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
          <Image style={{ width: 32, height: 32 }} source={ICONS.chatIcon} />
        </TouchableOpacity> */}
      </View>

      <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
        <Text
          style={{
            color: COLORS.black,
            fontFamily: fontFamly.PlusJakartaSansBold,
            fontSize: 12,
          }}>
          {t('Description')}:
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
            : localizedText.noDescription}
        </Text>
      </View>

      {data?.type !== 'saleItem' ? (
        <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
          {/* <Text
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
              style={{flex: 1}}
              initialRegion={mapRegion}
              region={mapRegion}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              showsUserLocation={false}
              showsMyLocationButton={false}
              showsCompass={false}
              showsScale={false}>
              <Marker
                key={`${markerCoordinate.latitude}-${markerCoordinate.longitude}`}
                coordinate={markerCoordinate}
                title="Location"
                pinColor="#FF295D"
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: '#FF295D',
                    borderWidth: 2,
                    borderColor: '#fff',
                  }}
                />
              </Marker>
            </MapView>
          </View> */}
          {selectedTab == 'details' && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: width(3),
              }}>
              <TouchableOpacity
                onPress={() => handleAddToWishList(data)}
                style={{
                  width: width(44),
                  backgroundColor: COLORS.backgroundLight,
                  height: width(11),
                  borderRadius: width(5),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <GradientText text={localizedText.addToWishlist} />
              </TouchableOpacity>
              <View style={{width: width(44)}}>
                <GradientButton
                  text={localizedText.bookNow}
                  type="filled"
                  onPress={async () => {
                    const userToken = await AsyncStorage.getItem('token');
                    if (userToken == null) {
                      setShowLoginModal(true);
                      return;
                    }
                    if (startDate == null) {
                      return modalRef.current.show({
                        status: 'error',
                        message: localizedText.selectAvailableDateFirst,
                      });
                    }

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
            text={localizedText.addToCart}
            type="filled"
            onPress={handleAddToCart}
          />
        </View>
      )}

      <OrderBooking
        data={data}
        isVisible={modalVisible}
        type={'add'}
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
        onClose={() => setShowLoginModal(false)}
        handlePressFun={handlePressFun}
      />
      <ForgotModal
        isVisible={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        handlePressFun={handlePressFun}
      />
      <RegistrationModal
        isVisible={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        handlePressFun={handlePressFun}
      />
      <Loader isLoading={isLoadding} />
      <CommonAlert ref={modalRef} />
    </>
  );
};

export default DetailsContent;

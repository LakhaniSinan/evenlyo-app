import moment from 'moment';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import CarouselComponent from '../../../components/carousel';
import CommonAlert from '../../../components/commanAlert';
import EventAndPriceDetails from '../../../components/eventDetailAndPrice';
import GradientText from '../../../components/gradiantText';
import Loader from '../../../components/loder';
import OrderBooking from '../../../components/modals/OrderBookingModal';
import RequestConfirmation from '../../../components/modals/RequestConfirmation';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {sendBookingRequest} from '../../../services/ListingsItem';

// ✅ Function to mark all available days within next 6 months
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

  // ✅ Setup for available days
  const availableDays = useMemo(() => {
    const days = data?.availability?.availableDays || data?.availableDays || [];
    return days.map(d => String(d).toLowerCase());
  }, [data]);

  // ✅ States
  const [modalVisible, setModalVisible] = useState(false);
  const [resuestModalVisible, setResuestModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState(() =>
    getInitialMarkedDates(availableDays),
  );

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // ✅ Reset marked dates when availableDays change
  useEffect(() => {
    setMarkedDates(getInitialMarkedDates(availableDays));
  }, [availableDays]);

  // ✅ Handle Day Press (Date Range Selection)
  const handleDayPress = day => {
    const date = day.dateString;
    const m = moment(date, 'YYYY-MM-DD');
    const dayName = m.format('ddd').toLowerCase();
    const isPast = m.isBefore(moment(), 'day');
    const isAvailable = availableDays.includes(dayName);

    if (isPast || !isAvailable) return;

    let newStartDate = startDate;
    let newEndDate = endDate;

    // If no start date → select start
    if (!startDate || (startDate && endDate)) {
      newStartDate = date;
      newEndDate = null;
      setStartDate(newStartDate);
      setEndDate(null);
    } else if (moment(date).isBefore(moment(startDate))) {
      // if new date < start date, reset range
      newStartDate = date;
      newEndDate = null;
      setStartDate(newStartDate);
      setEndDate(null);
    } else {
      // Select end date
      newEndDate = date;
      setEndDate(newEndDate);
    }

    // Mark range in calendar
    let updatedMarked = getInitialMarkedDates(availableDays);

    if (newStartDate && newEndDate) {
      const range = [];
      let curr = moment(newStartDate);
      while (curr.isSameOrBefore(newEndDate)) {
        range.push(curr.format('YYYY-MM-DD'));
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
      updatedMarked[newStartDate] = {
        ...updatedMarked[newStartDate],
        customStyles: {
          container: {backgroundColor: '#FF295D', borderRadius: 5},
          text: {color: '#fff', fontWeight: 'bold'},
        },
      };
    }

    setMarkedDates(updatedMarked);
  };

  // ✅ Combine selected range into readable text
  const selectedRangeText =
    startDate && endDate
      ? `${startDate} → ${endDate}`
      : startDate
      ? `${startDate}`
      : 'No date selected';

  const handleSendBookingRequest = async details => {
    try {
      const params = {
        listingId: data?._id,
        vendorId: data?.vendor?._id,
        details: {
          startDate: details?.startDate,
          endDate: details?.endDate,
          startTime: details?.startTime,
          endTime: details?.endTime,
          eventLocation: details?.eventLocation,
          distanceKm: details?.distanceKm,
          specialRequests: details?.specialRequests,
        },
      };

      console.log(params, 'paramsparamsparamsparamss');
      return;
      setIsLoadding(true);
      const response = await sendBookingRequest(params);
      console.log(response?.data, 'responseresponseresponse');
      return;
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
    }
  };

  return (
    <>
      {selectedTab === 'gallery' ? (
        <CarouselComponent data={data} />
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

          {/* ✅ Display selected range */}
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
        <EventAndPriceDetails
          data={data}
          showrating={true}
          showDiscount={false}
          currentLanguage={currentLanguage}
        />
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
        <Image
          style={{width: 55, height: 55, borderRadius: 100}}
          source={{uri: data?.vendor?.businessLogo}}
        />
        <View style={{marginLeft: 10, justifyContent: 'center'}}>
          <Text
            style={{
              color: COLORS.black,
              fontSize: 15,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
            }}>
            {data?.vendor?.businessName}
          </Text>
          <Text
            style={{
              color: COLORS.textLight,
              fontSize: 10,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            }}>
            {data?.vendor?.businessEmail}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ChatDetail')}
          style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
          <Image style={{width: 32, height: 32}} source={ICONS.chatIcon} />
        </TouchableOpacity>
      </View>

      {/* ✅ Description + Map */}
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
          {currentLanguage == 'en'
            ? data?.description?.en
            : data?.description?.nl}
        </Text>
      </View>

      {/* ✅ Map View */}
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
              onPress={() => navigation.navigate('Messages')}
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
                  setModalVisible(true);
                }}
              />
            </View>
          </View>
        )}
      </View>

      {/* ✅ Modals */}
      <OrderBooking
        data={data}
        isVisible={modalVisible}
        selectedDate={{startDate, endDate}}
        onClose={() => setModalVisible(false)}
        handleSendBookingRequest={handleSendBookingRequest}
      />
      <RequestConfirmation
        responeData={responeData}
        visible={resuestModalVisible}
        onClose={() => setResuestModalVisible(false)}
        navigation={navigation}
      />
      <Loader isLoading={isLoadding} />
      <CommonAlert ref={modalRef} />
    </>
  );
};

export default DetailsContent;

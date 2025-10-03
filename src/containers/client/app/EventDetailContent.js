import moment from 'moment';
import React, {useEffect, useMemo, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import CarouselComponent from '../../../components/carousel';
import EventAndPriceDetails from '../../../components/eventDetailAndPrice';
import GradientText from '../../../components/gradiantText';
import OrderBooking from '../../../components/modals/OrderBookingModal';
import RequestConfirmation from '../../../components/modals/RequestConfirmation';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const sanFranciscoLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// ✅ Build initial markedDates: disables past days and non-available weekdays
const getInitialMarkedDates = availableDays => {
  let marked = {};
  const start = moment();
  const end = moment().add(6, 'months');

  for (let m = start.clone(); m.isBefore(end); m.add(1, 'day')) {
    const dayName = m.format('ddd').toLowerCase();
    const dateStr = m.format('YYYY-MM-DD');
    const isPast = m.isBefore(moment(), 'day');
    const isAvailable = availableDays.includes(dayName);

    if (!isPast && isAvailable) {
      // ✅ Future + available → selectable
      marked[dateStr] = {
        disabled: false,
        customStyles: {
          container: {backgroundColor: '#fff'},
          text: {color: '#000'},
        },
      };
    } else {
      // ❌ Past or unavailable → disabled
      marked[dateStr] = {
        disabled: true,
        disableTouchEvent: true,
        customStyles: {
          container: {backgroundColor: '#f0f0f0'},
          text: {color: '#999'},
        },
      };
    }
  }
  return marked;
};

const DetailsContent = ({
  data,
  selectedTab,
  selectedDates,
  setSelectedDates,
  navigation,
}) => {
  const {currentLanguage} = useTranslation();

  // support both data.availability.availableDays and data.availableDays
  const availableDays = useMemo(() => {
    const days = data?.availability?.availableDays || data?.availableDays || [];
    return days.map(d => String(d).toLowerCase());
  }, [data]);

  const [modalVisible, setModalVisible] = useState(false);
  const [resuestModalVisible, setResuestModalVisible] = useState(false);

  // ✅ Selected dates state
  const selectedDatesString = selectedDates.join(', '); // string

  const [markedDates, setMarkedDates] = useState(() =>
    getInitialMarkedDates(availableDays),
  );

  // recompute marks when available days change (e.g., after API load)
  useEffect(() => {
    setMarkedDates(getInitialMarkedDates(availableDays));
  }, [availableDays]);

  // ✅ When user taps a day
  const handleDayPress = day => {
    const date = day.dateString;
    const m = moment(date, 'YYYY-MM-DD');
    const dayName = m.format('ddd').toLowerCase();
    const isPast = m.isBefore(moment(), 'day');
    const isAvailable = availableDays.includes(dayName);

    // strictly allow only future dates that match availableDays
    if (isPast || !isAvailable) return;
    // also respect existing disabled mark
    if (markedDates[date]?.disabled) return;

    let newSelectedDates = [...selectedDates];

    if (newSelectedDates.includes(date)) {
      // unselect if already selected
      newSelectedDates = newSelectedDates.filter(d => d !== date);
    } else {
      newSelectedDates.push(date);
    }

    // update markedDates with gradient for selected dates
    const updatedMarked = {...markedDates};

    // ensure the tapped date has a base entry if not present
    if (!updatedMarked[date]) {
      updatedMarked[date] = {
        disabled: false,
        customStyles: {
          container: {backgroundColor: '#fff'},
          text: {color: '#000'},
        },
      };
    }

    // reset all allowed days style
    Object.keys(updatedMarked).forEach(d => {
      if (!updatedMarked[d].disabled) {
        updatedMarked[d] = {
          ...updatedMarked[d],
          customStyles: {
            container: {backgroundColor: '#fff'},
            text: {color: '#000'},
          },
        };
      }
    });

    // apply gradient color for selected dates
    newSelectedDates.forEach(d => {
      updatedMarked[d] = {
        ...updatedMarked[d],
        customStyles: {
          container: {
            backgroundColor: '#FF295D', // fallback for android
            borderRadius: 5,
          },
          text: {
            color: '#fff',
            fontWeight: 'bold',
          },
        },
      };
    });

    setSelectedDates(newSelectedDates);
    setMarkedDates(updatedMarked);
  };

  const handleSendBookingRequest = () => {
    setModalVisible(false);
    setTimeout(() => {
      setResuestModalVisible(true);
    }, 500);
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

          {/* Show selected dates string */}
          {selectedDates.length > 0 && (
            <View style={{marginHorizontal: 20, marginTop: 10}}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansSemiBold,
                  fontSize: 12,
                  color: COLORS.black,
                }}>
                Selected Dates:
              </Text>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansMedium,
                  fontSize: 10,
                  color: COLORS.textLight,
                }}>
                {selectedDatesString}
              </Text>
            </View>
          )}
        </>
      )}

      <View style={{marginHorizontal: 10, marginTop: width(3)}}>
        <EventAndPriceDetails
          data={data}
          showrating={true}
          showDiscount={false}
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
            {currentLanguage == 'en'
              ? data?.vendor?.businessDescription?.en
              : data?.vendor?.businessDescription?.nl}
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
          {data?.description}
        </Text>
      </View>

      <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
        <Text style={{fontFamily: fontFamly.PlusJakartaSansBold, fontSize: 12}}>
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
            initialRegion={sanFranciscoLocation}
            showsUserLocation={false}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}>
            <Marker
              coordinate={sanFranciscoLocation}
              title="Event Location"
              description="San Francisco, CA"
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
                onPress={() => setModalVisible(true)}
              />
            </View>
          </View>
        )}
      </View>

      <OrderBooking
        selectedDate={selectedDates}
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        handleSendBookingRequest={handleSendBookingRequest}
      />
      <RequestConfirmation
        visible={resuestModalVisible}
        onClose={() => setResuestModalVisible(false)}
        navigation={navigation}
      />
    </>
  );
};

export default DetailsContent;

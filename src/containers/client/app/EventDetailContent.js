import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import GradientButton from '../../../components/button';
import CarouselComponent from '../../../components/carousel';
import EventAndPriceDetails from '../../../components/eventDetailAndPrice';
import GradientText from '../../../components/gradiantText';
import OrderBooking from '../../../components/modals/OrderBookingModal';
import RequestConfirmation from '../../../components/modals/RequestConfirmation';
import {COLORS, fontFamly} from '../../../constants';

const sanFranciscoLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const DetailsContent = ({data, selectedTab, handleDaySelect, navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [resuestModalVisible, setResuestModalVisible] = useState(false);

  const handleSendBookingRequest = () => {
    setModalVisible(false);
    setTimeout(() => {
      setResuestModalVisible(true);
    }, 500);
  };
  return (
    <>
      {selectedTab == 'gallery' ? (
        <CarouselComponent data={data} />
      ) : (
        <Calendar
          onDayPress={handleDaySelect}
          markedDates={[]}
          markingType="custom"
          theme={{
            todayTextColor: 'red',
            arrowColor: 'blue',
          }}
          disableAllTouchEventsForDisabledDays
        />
      )}
      <View style={{marginHorizontal: 10, marginTop: width(3)}}>
        <EventAndPriceDetails showrating={true} showDiscount={false} />
      </View>

      <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
        <Text style={{fontFamily: fontFamly.PlusJakartaSansBold, fontSize: 12}}>
          Description:
        </Text>
        <Text
          numberOfLines={4}
          style={{
            fontFamily: fontFamly.PlusJakartaSansMedium,
            fontSize: 10,
            color: COLORS.textLight,
          }}>
          With over 7 years of event experience, DJ RayBeatz is known for
          high-energy dance floors, seamless transitions, and crowd-pleasing
          remixes. From desi weddings to corporate raves, he brings the perfect
          vibe for every crow With over 7...
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
              style={{
                width: width(45),
                backgroundColor: COLORS.backgroundLight,
                height: width(13),
                borderRadius: width(5),
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <GradientText text={'Add to Cart'} />
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
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        nestedFilter={true}
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

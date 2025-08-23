import React from 'react';
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
import EventAndPriceDetails from '../../../components/eventDetailAndPrice';
import GradientText from '../../../components/gradiantText';
import {COLORS, fontFamly} from '../../../constants';

const data = [1, 2, 3, 4, 5];

const sanFranciscoLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const renderCards = type => {
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
      <GradientText
        customStyles={{
          textAlign: 'left',
        }}
        text={type}
      />
      <Text
        style={{
          fontSize: 16,
          fontFamily: fontFamly.PlusJakartaSansBold,
        }}>
        12 May, 2025
      </Text>
      <Text style={{color: COLORS.textLight, fontSize: 12}}>12: 00 pm</Text>
    </View>
  );
};

const BookingDetails = ({navigation}) => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <ScrollView>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          // headingText={'Booking'}
          rightIcon={ICONS.chatIcon}
          onRightIconPress={() => navigation.navigate('MessagesScreen')}
          onLeftIconPress={() => navigation.goBack()}
        />
        <CarouselComponent data={data} />
        <View style={{marginHorizontal: 10}}>
          <EventAndPriceDetails />
        </View>
        <View
          style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              marginHorizontal: 20,
            }}>
            {renderCards('Check In')}
          </View>
          <View
            style={{
              backgroundColor: 'white',
              width: 32,
              height: 32,
              elevation: 1,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 200,
              // flex: 1,
              // justifyContent: "center"
            }}>
            <Image style={{height: 7, width: 12}} source={ICONS.arrowIcon} />
          </View>
          <View
            style={{
              marginHorizontal: 20,
            }}
            // style={{
            //     flex: 1,
            //     justifyContent: "flex-end",
            //     alignItems: "flex-end",
            //     marginRight: 20
            // }}
          >
            {renderCards('Check Out')}
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
          <Image style={{width: 55, height: 55}} source={IMAGES.profilePhoto} />
          <View style={{marginLeft: 10, justifyContent: 'center'}}>
            <Text
              style={{
                fontSize: 15,
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
              }}>
              Asima Khan
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              }}>
              Coach Organization Name
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('MessagesScreen')}
            style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end'}}>
            <Image style={{width: 32, height: 32}} source={ICONS.chatIcon} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            paddingVertical: width(3),
            marginHorizontal: 20,
          }}>
          <Text
            style={{
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
            With over 7 years of event experience, DJ RayBeatz is known for
            high-energy dance floors, seamless transitions, and crowd-pleasing
            remixes. From desi weddings to corporate raves, he brings the
            perfect vibe for every crow With over 7...
          </Text>
        </View>
        <View
          style={{
            paddingVertical: width(3),
            marginHorizontal: 20,
          }}>
          <Text
            style={{
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
              style={{
                flex: 1,
              }}
              initialRegion={sanFranciscoLocation}
              showsUserLocation={false}
              showsMyLocationButton={false}
              scrollEnabled={true}
              zoomEnabled={true}>
              <Marker
                coordinate={{
                  latitude: sanFranciscoLocation.latitude,
                  longitude: sanFranciscoLocation.longitude,
                }}
                title="Event Location"
                description="San Francisco, CA"
              />
            </MapView>
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
                onPress={() => navigation.navigate('TrackDirections')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingDetails;

import React, {useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {COLORS, fontFamly} from '../../../constants';

const TrackDirections = ({navigation}) => {
  const [vendorData] = useState({
    name: 'DJ Ray Vibes',
    service: '+Photo Booth',
    location: 'Los Angeles, CA',
    image: ICONS.userIcon || require('../../../assets/icons/userIcon.png'),
  });

  const [region] = useState({
    latitude: -6.9175,
    longitude: 107.6191,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  return (
    <View style={styles.container}>
      <View
        style={{
          position: 'absolute',
          zIndex: 99,
          width: width(100),
          top: -5,
        }}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          headingText={'Track Detail'}
          rightIcon={ICONS.notificationIcon}
          onRightIconPress={() => navigation.navigate('Notification')}
          onLeftIconPress={() => navigation.goBack()}
        />
      </View>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsTraffic={false}
          showsBuildings={false}
          showsIndoors={false}
          showsIndoorLevelPicker={false}
          showsPointsOfInterest={false}
          showsMapToolbar={false}
          mapType="standard">
          <Marker
            coordinate={{
              latitude: -6.9175,
              longitude: 107.6191,
            }}
            title="DJ Ray Vibes"
            description="Event Location"
            pinColor="#FF69B4"
          />
        </MapView>
      </View>
      <View style={styles.bottomCard}>
        <View style={styles.cardContent}>
          <Image
            source={IMAGES.backgroundImage}
            style={styles.vendorImage}
            resizeMode="cover"
          />
          <View style={styles.vendorInfo}>
            <Text style={styles.serviceType}>{vendorData.service}</Text>
            <Text style={styles.vendorName}>{vendorData.name}</Text>
            <View style={styles.locationContainer}>
              <Icon name="location" size={14} color={COLORS.textLight} />
              <Text style={styles.locationText}>{vendorData.location}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: width(5),
    padding: width(3),
    margin: width(5),
    zIndex: 1000,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 15,
  },
  vendorInfo: {
    flex: 1,
  },
  serviceType: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: '#4CAF50',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  heartButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TrackDirections;

import React, {useEffect, useRef} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const parseFiniteNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
const DEFAULT_MAP_COORDINATE = {
  latitude: 24.8607,
  longitude: 67.0011,
};

const TrackDirections = ({navigation, route}) => {
  const {currentLanguage} = useTranslation();
  const isDutch = currentLanguage === 'nl';
  const localizedText = {
    trackDetail: isDutch ? 'Volgdetails' : 'Track Detail',
    eventLocation: isDutch ? 'Evenementlocatie' : 'Event Location',
    event: isDutch ? 'Evenement' : 'Event',
  };
  const data = route.params;
  const mapRef = useRef(null);
  const rawLatitude =
    data?.eventLatitude ??
    data?.details?.location?.coordinates?.latitude ??
    data?.listingDetails?.location?.coordinates?.latitude ??
    data?.location?.coordinates?.latitude;
  const rawLongitude =
    data?.eventLongitude ??
    data?.details?.location?.coordinates?.longitude ??
    data?.listingDetails?.location?.coordinates?.longitude ??
    data?.location?.coordinates?.longitude;
  const latitude = parseFiniteNumber(rawLatitude) ?? DEFAULT_MAP_COORDINATE.latitude;
  const longitude =
    parseFiniteNumber(rawLongitude) ?? DEFAULT_MAP_COORDINATE.longitude;
  const hasValidCoordinates = true;

  const region = {
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    if (hasValidCoordinates && mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current.animateToRegion(region, 800);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [hasValidCoordinates, region]);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 800);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          headingText={localizedText.trackDetail}
          rightIcon={ICONS.notificationIcon}
          onRightIconPress={() => navigation.navigate('Notifications')}
          onLeftIconPress={() => navigation.goBack()}
        />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={hasValidCoordinates ? region : undefined}
          showsUserLocation
          showsMyLocationButton={false}
          mapType="standard">
          {hasValidCoordinates && (
            <Marker
              coordinate={{latitude, longitude}}
              title={localizedText.eventLocation}
              description={data?.eventLocation}
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.recenterButton}
          onPress={handleRecenter}>
          <Icon name="locate" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.cardContent}>
          <Image
            source={{uri: data?.businessLogo}}
            style={styles.vendorImage}
            resizeMode="cover"
          />
          <View style={styles.vendorInfo}>
            <Text style={styles.serviceType}>{localizedText.event}</Text>
            <Text style={styles.vendorName}>{data?.firstName}</Text>
            <View style={styles.locationContainer}>
              <Icon
                name="location-outline"
                size={14}
                color={COLORS.textLight}
              />
              <Text style={styles.locationText} numberOfLines={2}>
                {data?.eventLocation}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TrackDirections;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerWrapper: {
    position: 'absolute',
    zIndex: 100,
    width: width(100),
    top: -5,
  },

  mapContainer: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  recenterButton: {
    position: 'absolute',
    right: 15,
    bottom: 160,
    backgroundColor: COLORS.primary,
    width: 45,
    height: 45,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
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
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vendorImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
  },

  vendorInfo: {
    flex: 1,
  },

  serviceType: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.primary,
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
  },

  locationText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    marginLeft: 4,
  },
});

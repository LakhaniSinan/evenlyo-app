import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import {ICONS} from '../../../assets';
import CommonAlert from '../../../components/commanAlert';
import ListingCard from '../../../components/listingCard';
import Loader from '../../../components/loder';
import FilterModal from '../../../components/modals/FilterModal';
import TextField from '../../../components/textInput';
import {COLORS} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getAllListingData} from '../../../services/ListingsItem';

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const EventListingScreen = ({navigation}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const mapRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allListings, setAllListings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    handleGetAllBooking();
  }, []);

  const handleGetAllBooking = async () => {
    try {
      setIsLoading(true);
      const response = await getAllListingData();
      setIsLoading(false);
      let data = response.data?.data || [];

      if (response.status === 200 || response.status === 201) {
        setAllListings(data);

        // extract valid coords from both array or object
        const validCoords = data
          .map(item => {
            const coords = item?.location?.coordinates;
            if (Array.isArray(coords) && coords.length === 2) {
              // format: [longitude, latitude]
              return {latitude: coords[1], longitude: coords[0]};
            } else if (coords?.latitude && coords?.longitude) {
              return {latitude: coords.latitude, longitude: coords.longitude};
            }
            return null;
          })
          .filter(c => c);

        // center map if valid coordinates exist
        if (validCoords.length > 0 && mapRef.current) {
          const avgLat =
            validCoords.reduce((sum, c) => sum + c.latitude, 0) /
            validCoords.length;
          const avgLng =
            validCoords.reduce((sum, c) => sum + c.longitude, 0) /
            validCoords.length;

          mapRef.current.animateToRegion(
            {
              latitude: avgLat,
              longitude: avgLng,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            },
            1000,
          );
        }
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error, 'Error fetching listings');
    }
  };

  const renderCartItem = ({item}) => {
    return <ListingCard item={item} navigation={navigation} />;
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <ScrollView>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.backgroundLight,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
          }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: width(2),
              paddingHorizontal: width(2),
            }}>
            <TouchableOpacity
              style={{marginLeft: width(2)}}
              onPress={() => navigation.goBack()}>
              <Image
                resizeMode="contain"
                style={{width: 40, height: 40}}
                source={ICONS.leftArrowIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{borderRadius: 20}}
              onPress={() => navigation.navigate('Notification')}>
              <Image
                resizeMode="contain"
                style={{width: 40, height: 40}}
                source={ICONS.notificationIcon}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              width: '100%',
              paddingLeft: width(4),
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: width(3),
              justifyContent: 'space-between',
            }}>
            <TextField
              placeholder={t('searchEvent')}
              placeholderTextColor="#aaa"
              bgColor={COLORS.white}
              startIcon={ICONS.search}
              inputContainer={{
                paddingVertical: 0,
                paddingHorizontal: 10,
                height: 45,
                width: '80%',
                marginTop: 0,
              }}
              styleProps={{
                fontSize: 14,
                color: '#000',
              }}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginRight: 10,
              }}>
              <Image
                resizeMode="contain"
                style={{width: 40, height: 40}}
                source={ICONS.filters}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            height: 250,
            borderRadius: width(5),
            overflow: 'hidden',
            marginTop: width(2),
            marginHorizontal: width(3),
          }}>
          <MapView
            ref={mapRef}
            style={{flex: 1}}
            initialRegion={DEFAULT_REGION}
            showsUserLocation={false}
            showsMyLocationButton={false}
            zoomEnabled={true}
            scrollEnabled={true}>
            {allListings?.map((item, index) => {
              let latitude, longitude;
              const coords = item?.location?.coordinates;

              if (Array.isArray(coords) && coords.length === 2) {
                longitude = coords[0];
                latitude = coords[1];
              } else {
                latitude = coords?.latitude;
                longitude = coords?.longitude;
              }

              if (latitude && longitude) {
                return (
                  <Marker
                    key={index}
                    coordinate={{latitude, longitude}}
                    title={item?.vendor?.businessName || 'Vendor'}
                    description={
                      item?.location?.fullAddress || 'No address available'
                    }>
                    <Image
                      source={ICONS.locationIcon}
                      style={{width: 40, height: 40, resizeMode: 'contain'}}
                      tintColor={'red'}
                    />
                  </Marker>
                );
              }
              return null;
            })}
          </MapView>
        </View>

        <FlatList
          data={allListings}
          keyExtractor={item => item.id?.toString()}
          renderItem={renderCartItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </ScrollView>

      <FilterModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        nestedFilter={true}
      />
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
};

export default EventListingScreen;

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: width(5),
  },
});

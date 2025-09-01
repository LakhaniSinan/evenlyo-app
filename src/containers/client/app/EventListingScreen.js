import React, {useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import MapView, {Marker} from 'react-native-maps';
import {ICONS} from '../../../assets';
import GradientText from '../../../components/gradiantText';
import ListingCard from '../../../components/listingCard';
import FilterModal from '../../../components/modals/FilterModal';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const data = [1, 2, 3, 4, 5];

// San Francisco dummy coordinates
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

const renderCartItem = ({item, navigation}) => {
  return <ListingCard item={item} navigation={navigation} />;
};

const EventListingScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

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
            height: 200,
            borderRadius: width(5),
            overflow: 'hidden',
            marginTop: width(2),
            marginHorizontal: width(3),
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
        <FlatList
          data={requested}
          keyExtractor={item => item.id}
          renderItem={({item}) => renderCartItem({item, navigation})}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </ScrollView>
      <FilterModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        nestedFilter={true}
      />
    </SafeAreaView>
  );
};

export default EventListingScreen;
const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: width(5),
  },
});

export const requested = [
  {
    id: 'dj_01',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    price: 300,
    priceUnit: 'Per Event',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isBookmarked: true,
    isSelected: false,
  },
  {
    id: 'dj_02',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    price: 300,
    priceUnit: 'Per Event',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isBookmarked: true,
    isSelected: true,
  },
  {
    id: 'dj_03',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    price: 300,
    priceUnit: 'Per Event',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isBookmarked: false,
    isSelected: false,
  },
  {
    id: 'dj_04',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    price: 300,
    priceUnit: 'Per Event',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isBookmarked: false,
    isSelected: false,
  },
  {
    id: 'dj_05',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    price: 300,
    priceUnit: 'Per Event',
    image:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    isBookmarked: true,
    isSelected: false,
  },
];

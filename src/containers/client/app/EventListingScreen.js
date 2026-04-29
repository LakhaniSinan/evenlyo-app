import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import CommonAlert from '../../../components/commanAlert';
import ListingCard from '../../../components/listingCard';
import Loader from '../../../components/loder';
import FilterModal from '../../../components/modals/FilterModal';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getListingData} from '../../../services/ListingsItem';

const EventListingScreen = ({navigation}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ✅ new state
  const [allListings, setAllListings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    handleGetAllBooking();
  }, []);

  const handleGetAllBooking = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setIsLoading(true);

      const response = await getListingData();

      let data = response.data?.data || [];

      if (response.status === 200 || response.status === 201) {
        setAllListings(data);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'Error fetching listings');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Pull to Refresh handler
  const onRefresh = () => {
    handleGetAllBooking(true);
  };

  const renderCartItem = ({item}) => {
    return <ListingCard item={item} navigation={navigation} />;
  };

  // ✅ Header component (ScrollView hata kar yahan shift kiya)

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: COLORS.backgroundLight,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 20,
          paddingVertical: width(2),
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              style={{width: 40, height: 40}}
              source={ICONS.leftArrowIcon}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.black,
            }}>
            All Booking Items
          </Text>

          <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
            <Image
              style={{width: 40, height: 40}}
              source={ICONS.notificationIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={allListings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        // ✅ Pull to Refresh
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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

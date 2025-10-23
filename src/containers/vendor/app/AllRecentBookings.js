import {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import RecentBookingCards from '../../../components/recentBookingCards';
import {COLORS} from '../../../constants';
import {getBookingAnalytics} from '../../../services/BookingItem';

const AllRecentBookings = ({route, navigation}) => {
  const data = route.params;
  const [listingCartData, setListingCartData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const modalRef = useRef(null);

  // ✅ Fetch Data
  const handleGetCartListing = useCallback(async () => {
    try {
      const response = await getBookingAnalytics();
      if (response?.status === 200 || response?.status === 201) {
        const cartData = response?.data?.bookings || [];
        setListingCartData(cartData);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message || 'Something went wrong!',
        });
      }
    } catch (error) {
      console.log('Error fetching bookings:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    handleGetCartListing();
  }, [handleGetCartListing]);

  // ✅ Pull-to-Refresh Handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleGetCartListing();
  }, [handleGetCartListing]);

  // ✅ Render Item
  const renderItem = ({item, index}) => (
    <RecentBookingCards item={item} index={index} dataLength={data?.length} />
  );

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'All Recent Bookings'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />

      <FlatList
        data={listingCartData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={{paddingBottom: 20}}
      />

      <CommonAlert ref={modalRef} />
    </View>
  );
};

export default AllRecentBookings;

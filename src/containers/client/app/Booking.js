import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import BookingList from '../../../components/bookingCard';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {
  getAllBookingHistory,
  getAllSaleItems,
} from '../../../services/ListingsItem';

const MAIN_TABS = ['Booking Items', 'Sale Items'];

const BOOKING_TABS = [
  'All Order',
  'pending',
  'accepted',
  'completed',
  'paid',
  'finished',
  'rejected',
];

const SALE_TABS = ['Order Placed', 'On the way', 'Delivered'];

const BooKings = () => {
  const navigation = useNavigation();
  const modalRef = useRef(null);

  const [mainTab, setMainTab] = useState('Booking Items');
  const [bookingStatusTab, setBookingStatusTab] = useState('All Order');
  const [saleStatusTab, setSaleStatusTab] = useState('Order Placed');

  const [bookingHistory, setBookingHistory] = useState([]);
  const [saleItems, setSaleItems] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  const handleGetBookingHistory = useCallback(async () => {
    try {
      const response = await getAllBookingHistory('', 1, 10);
      if (response?.status === 200 || response?.status === 201) {
        setBookingHistory(response?.data?.data?.bookings || []);
      }
    } catch (error) {
      console.log('BOOKING ERROR', error);
    }
  }, []);

  const handleGetSaleItemsOrders = useCallback(async () => {
    try {
      const response = await getAllSaleItems();
      if (response?.status === 200 || response?.status === 201) {
        setSaleItems(response?.data?.order || []);
      }
    } catch (error) {
      console.log('SALE ITEMS ERROR', error);
    }
  }, []);


  useEffect(() => {
    setIsLoading(true);
    if (mainTab === 'Booking Items') {
      handleGetBookingHistory().finally(() => setIsLoading(false));
    } else {
      handleGetSaleItemsOrders().finally(() => setIsLoading(false));
    }
  }, [mainTab, handleGetBookingHistory, handleGetSaleItemsOrders]);


  const onRefresh = async () => {
    setRefreshing(true);
    if (mainTab === 'Booking Items') {
      await handleGetBookingHistory();
    } else {
      await handleGetSaleItemsOrders();
    }
    setRefreshing(false);
  };


  const filteredSaleItems = saleItems.filter(item => {
    if (saleStatusTab === 'Delivered') return item.status === 'Delivered';
    if (saleStatusTab === 'Order Placed') return item.status === 'Order Placed';
    if (saleStatusTab === 'On the way') return item.status === 'On the way';
    return true;
  });


  const renderTab = useCallback((item, activeTab, onPress) => {
    const isActive = activeTab === item;

    return (
      <TouchableOpacity onPress={() => onPress(item)}>
        {isActive ? (
          <LinearGradient
            colors={['#FF295D', '#E31B95', '#C817AE']}
            style={styles.activeTab}>
            <Text style={styles.activeText}>{item}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveTab}>
            <Text style={styles.inactiveText}>{item}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }, []);


  const renderSaleItem = ({item}) => (
    <View style={styles.saleCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.trackingId}>Tracking: {item.trackingId}</Text>

        <Text
          style={[
            styles.status,
            item.status === 'Delivered' ? styles.delivered : styles.pending,
          ]}>
          {item.status}
        </Text>
      </View>

      {item.items?.map((product, index) => (
        <View key={index} style={styles.productRow}>
          <Image source={{uri: product.image}} style={styles.image} />
          <View style={{flex: 1}}>
            <Text style={styles.title}>{product.title?.en}</Text>
            <Text style={styles.subText}>Qty: {product.quantity}</Text>
            <Text style={styles.subText}>Price: Rs {product.price}</Text>
          </View>
        </View>
      ))}

      <View style={styles.addressBox}>
        <Text style={styles.addressText}>
          Pickup: {item.itemLocation?.fullAddress}
        </Text>
        <View style={{height: width(2)}} />
        <Text style={styles.addressText}>
          Drop: {item.deliveryLocation?.fullAddress}
        </Text>
      </View>

      <Text style={styles.amount}>Total: Rs {item.totalAmount}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText="History"
        rightIcon={ICONS.chatIcon}
        onRightIconPress={() => navigation.navigate('MessagesScreen')}
      />

      <View style={styles.mainTabWrapper}>
        {MAIN_TABS.map(tab => (
          <View key={tab}>{renderTab(tab, mainTab, setMainTab)}</View>
        ))}
      </View>

      {mainTab === 'Booking Items' && (
        <>
          <FlatList
            data={BOOKING_TABS}
            horizontal
            keyExtractor={item => item}
            extraData={bookingStatusTab}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
            renderItem={({item}) =>
              renderTab(item, bookingStatusTab, setBookingStatusTab)
            }
          />

          <BookingList
            bookings={bookingHistory}
            activeTab={bookingStatusTab}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </>
      )}

      {mainTab === 'Sale Items' && (
        <>
          <FlatList
            data={SALE_TABS}
            horizontal
            keyExtractor={item => item}
            extraData={saleStatusTab}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
            renderItem={({item}) =>
              renderTab(item, saleStatusTab, setSaleStatusTab)
            }
          />

          <FlatList
            data={filteredSaleItems}
            keyExtractor={item => item._id}
            renderItem={renderSaleItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No sale items found</Text>
              </View>
            }
            contentContainerStyle={{paddingBottom: 30}}
          />
        </>
      )}

      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
};

export default BooKings;

const styles = StyleSheet.create({
  mainTabWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 15,
  },
  tabContainer: {
    paddingHorizontal: width(3),
    marginVertical: 10,
  },
  activeTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 10,
  },
  inactiveTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    marginRight: 10,
  },
  activeText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  inactiveText: {
    color: '#333',
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  saleCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 12,
    padding: 14,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackingId: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    color: '#fff',
    fontSize: 12,
  },
  delivered: {backgroundColor: 'green'},
  pending: {backgroundColor: 'orange'},
  productRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  title: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  subText: {
    fontSize: 12,
    color: '#555',
  },
  addressBox: {
    marginTop: 8,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  amount: {
    marginTop: 8,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  emptyBox: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});

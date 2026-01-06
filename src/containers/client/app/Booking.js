import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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

import {useSelector} from 'react-redux';
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

/* -------------------- CONSTANTS -------------------- */

const MAIN_TABS = ['Booking Items', 'Sale Items'];

const BOOKING_TABS = [
  'all order',
  'pending',
  'accepted',
  'completed',
  'paid',
  'finished',
  'rejected',
];

const SALE_TABS = ['Order Placed', 'On the way', 'Delivered'];

/* -------------------- TAB ITEM -------------------- */
const capitalizeFirstLetter = text => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const TabItem = React.memo(({label, active, onPress}) => {
  const displayLabel = capitalizeFirstLetter(label);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      {active ? (
        <LinearGradient
          colors={['#FF295D', '#E31B95', '#C817AE']}
          style={styles.activeTab}>
          <Text
            style={styles.activeText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {displayLabel}
          </Text>
        </LinearGradient>
      ) : (
        <View style={styles.inactiveTab}>
          <Text
            style={styles.inactiveText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {displayLabel}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const BooKings = () => {
  const navigation = useNavigation();
  const modalRef = useRef(null);
  const {user} = useSelector(state => state.LoginSlice);

  const [mainTab, setMainTab] = useState('Booking Items');
  const [bookingStatusTab, setBookingStatusTab] = useState('all order');
  const [saleStatusTab, setSaleStatusTab] = useState('Order Placed');

  const [bookingHistory, setBookingHistory] = useState([]);
  const [saleItems, setSaleItems] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookingHistory = useCallback(async () => {
    try {
      const res = await getAllBookingHistory('', 1, 10);
      if (res?.status === 200 || res?.status === 201) {
        setBookingHistory(res?.data?.data?.bookings || []);
      }
    } catch (e) {
      console.log('BOOKING ERROR', e);
    }
  }, []);

  const fetchSaleOrders = useCallback(async () => {
    try {
      const res = await getAllSaleItems();
      if (res?.status === 200 || res?.status === 201) {
        setSaleItems(res?.data?.order || []);
      }
    } catch (e) {
      console.log('SALE ERROR', e);
    }
  }, []);

  useEffect(() => {
    if (user?._id) {
      setIsLoading(true);
      const apiCall =
        mainTab === 'Booking Items' ? fetchBookingHistory : fetchSaleOrders;

      apiCall().finally(() => setIsLoading(false));
    }
  }, [mainTab, fetchBookingHistory, fetchSaleOrders]);

  /* -------------------- REFRESH -------------------- */

  const onRefresh = async () => {
    setRefreshing(true);
    if (mainTab === 'Booking Items') {
      await fetchBookingHistory();
    } else {
      await fetchSaleOrders();
    }
    setRefreshing(false);
  };

  /* -------------------- FILTER -------------------- */

  const filteredSaleItems = useMemo(() => {
    return saleItems.filter(item => {
      if (saleStatusTab === 'Delivered') return item.status === 'Delivered';
      if (saleStatusTab === 'Order Placed')
        return item.status === 'Order Placed';
      if (saleStatusTab === 'On the way') return item.status === 'On the way';
      return true;
    });
  }, [saleItems, saleStatusTab]);

  /* -------------------- RENDERERS -------------------- */

  const renderMainTab = tab => (
    <TabItem
      key={tab}
      label={tab}
      active={mainTab === tab}
      onPress={() => setMainTab(tab)}
    />
  );

  const renderBookingTab = ({item}) => (
    <TabItem
      label={item}
      active={bookingStatusTab === item}
      onPress={() => setBookingStatusTab(item)}
    />
  );

  const renderSaleTab = ({item}) => (
    <TabItem
      label={item}
      active={saleStatusTab === item}
      onPress={() => setSaleStatusTab(item)}
    />
  );

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

      {item.items?.map((p, i) => (
        <View key={i} style={styles.productRow}>
          <Image source={{uri: p.image}} style={styles.image} />
          <View style={{flex: 1}}>
            <Text style={styles.title}>{p.title?.en}</Text>
            <Text style={styles.subText}>Qty: {p.quantity}</Text>
            <Text style={styles.subText}>Price: Rs {p.price}</Text>
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

  /* -------------------- UI -------------------- */

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText="History"
        rightIcon={ICONS.chatIcon}
        onRightIconPress={() => navigation.navigate('MessagesScreen')}
      />
      <FlatList
        ListHeaderComponent={
          <>
            <View style={styles.mainTabWrapper}>
              {MAIN_TABS.map(renderMainTab)}
            </View>
            <FlatList
              data={mainTab === 'Booking Items' ? BOOKING_TABS : SALE_TABS}
              horizontal
              renderItem={
                mainTab === 'Booking Items' ? renderBookingTab : renderSaleTab
              }
              keyExtractor={item => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabContainer}
              removeClippedSubviews={false}
            />
            {mainTab === 'Booking Items' && (
              <View style={styles.listWrapper}>
                <BookingList
                  bookings={bookingHistory}
                  activeTab={bookingStatusTab}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                />
              </View>
            )}
          </>
        }
        data={mainTab === 'Sale Items' ? filteredSaleItems : []}
        renderItem={mainTab === 'Sale Items' ? renderSaleItem : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          mainTab === 'Sale Items' ? (
            <View style={styles.emptyCenterBox}>
              <Text style={styles.emptyText}>No sale items found</Text>
            </View>
          ) : null
        }
        contentContainerStyle={{flexGrow: 1, paddingBottom: 30}}
      />

      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
};

export default BooKings;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},

  mainTabWrapper: {
    marginTop: width(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabContainer: {
    paddingHorizontal: width(3),
    marginVertical: 10,
  },

  activeTab: {
    height: width(10),
    marginBottom: width(2),
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: width(30),
  },

  inactiveTab: {
    height: width(10),
    marginBottom: width(2),
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: width(30),
  },

  activeText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    textAlign: 'center',
  },

  inactiveText: {
    color: '#333',
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    textAlign: 'center',
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
    // justifyContent: 'space-between',
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

  productRow: {flexDirection: 'row', marginTop: 10},

  image: {width: 60, height: 60, borderRadius: 8, marginRight: 10},

  title: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },

  subText: {fontSize: 12, color: '#555'},

  addressBox: {marginTop: 8},

  addressText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  amount: {
    marginTop: 8,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  emptyBox: {marginTop: 60, alignItems: 'center'},

  emptyCenterBox: {flex: 1, alignItems: 'center', justifyContent: 'center'},

  listWrapper: {flex: 1, padding: width(2)},

  emptyText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});

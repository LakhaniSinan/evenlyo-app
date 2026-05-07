import {useFocusEffect, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {generatePDF} from 'react-native-html-to-pdf';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import RNFS from 'react-native-fs';
import AppHeader from '../../../components/appHeader';
import BookingList from '../../../components/bookingCard';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  getAllBookingHistory,
  getAllSaleItems,
} from '../../../services/ListingsItem';
import {getInvoiceHtml} from '../../../utils/htmlComtent';

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

const SALE_TABS = ['All', 'Order Placed', 'On the way', 'Delivered'];

/* -------------------- TAB ITEM -------------------- */
const capitalizeFirstLetter = text => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const TabItem = React.memo(({label, active, onPress}) => {
  const displayLabel = capitalizeFirstLetter(label);
  const tabLabel = (
    <Text
      style={active ? styles.activeText : styles.inactiveText}
      numberOfLines={1}
      ellipsizeMode="tail">
      {displayLabel}
    </Text>
  );

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      {active ? (
        <View style={styles.activeTab}>
          <LinearGradient
            colors={['#FF295D', '#E31B95', '#C817AE']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.activeTabGradient}
          />
          {tabLabel}
        </View>
      ) : (
        <View style={styles.inactiveTab}>
          {tabLabel}
        </View>
      )}
    </TouchableOpacity>
  );
});

const renderTabs = () => {
  const tabs = [
    {id: 'bookingItem', label: t('Booking Items')},
    {id: 'saleItem', label: t('Sale Items')},
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map(({id, label}) => {
        const isActive = activeTab === id;
        const colors = isActive
          ? ['#FF295D', '#E31B95', '#C817AE']
          : ['#F6F6F6', '#F6F6F6', '#F6F6F6'];

        return (
          <LinearGradient
            key={id}
            colors={colors}
            style={[styles.tabGradient, isActive && styles.activeGradient]}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.tab}
              onPress={() => setActiveTab(id)}>
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {label}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        );
      })}
    </View>
  );
};

const BooKings = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const {user} = useSelector(state => state.LoginSlice);
  const [searchTrackingId, setSearchTrackingId] = useState('');

  const [mainTab, setMainTab] = useState('Booking Items');

  const [bookingStatusTab, setBookingStatusTab] = useState('all order');
  const [saleStatusTab, setSaleStatusTab] = useState('All');

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

  useFocusEffect(
    useCallback(() => {
      console.log('FOCUS EFFECT RUN');
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;

      let isActive = true;
      setIsLoading(true);

      const loadData =
        mainTab === 'Booking Items' ? fetchBookingHistory : fetchSaleOrders;

      loadData()
        .catch(() => {})
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [user?._id, mainTab]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    if (mainTab === 'Booking Items') {
      await fetchBookingHistory();
    } else {
      await fetchSaleOrders();
    }
    setRefreshing(false);
  };

  const filteredSaleItems = useMemo(() => {
    return saleItems.filter(item => {
      const statusMatch =
        saleStatusTab === 'All' || item.status === saleStatusTab;

      const searchMatch =
        !searchTrackingId ||
        item.trackingId?.toLowerCase().includes(searchTrackingId.toLowerCase());

      return statusMatch && searchMatch;
    });
  }, [saleItems, saleStatusTab, searchTrackingId]);

  const STATUS_COLORS = {
    'Order Placed': '#FF9800',
    'On the way': '#2196F3',
    Delivered: '#4CAF50',
  };

  const handleDownloadInvoice = async item => {
    try {
      const htmlContent = getInvoiceHtml(item);
      const timeStamp = moment().format('YYYYMMDD_HHmmss');
      const fileName = `order_${item.trackingId}_${moment().format(
        'YYYY-MM-DD_HH-mm-ss',
      )}`;

      const pdf = await generatePDF({
        html: htmlContent,
        fileName: fileName,
        directory: 'Documents',
      });
      if (Platform.OS === 'android') {
        const folderPath = RNFS.DownloadDirectoryPath;
        const fileName = `Report_${timeStamp}.pdf`;
        const destinationPath = `${folderPath}/${fileName}`;

        if (!(await RNFS.exists(folderPath))) {
          await RNFS.mkdir(folderPath);
        }

        await RNFS.copyFile(pdf.filePath, destinationPath);
        modalRef.current?.show({
          status: 'ok',
          message: 'PDF saved to Downloads folder.',
        });
        console.log('Saved to Android Downloads:', destinationPath);
      } else {
        const destinationPath = `${RNFS.DocumentDirectoryPath}/Report_${timeStamp}.pdf`;
        await RNFS.moveFile(pdf.filePath, destinationPath);

        await Share.share({
          url: `file://${destinationPath}`,
          type: 'application/pdf',
          title: 'Share your Report PDF',
        });
      }
    } catch (error) {
      console.log('Error generating PDF:', error);
      modalRef.current?.show({
        status: 'error',
        message: 'Failed to generate PDF. Please try again.',
      });
    }
  };
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

  const renderSaleItem = ({item}) => {
    return (
      <View style={styles.saleCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.trackingLabel}>Tracking ID</Text>
            <Text style={styles.trackingId}>{item.trackingId}</Text>
          </View>

          <View
            style={[
              styles.statusChip,
              {backgroundColor: STATUS_COLORS[item.status] || '#999'},
            ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {item.items?.map((p, i) => (
          <View key={i} style={styles.productRow}>
            <Image source={{uri: p.image}} style={styles.image} />

            <View style={{flex: 1}}>
              <Text style={styles.title}>{p.title?.en}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Qty: {p.quantity}</Text>
                <Text style={styles.metaText}>$ {p.price}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>Pickup</Text>
          <Text style={styles.addressText}>
            {item.itemLocation?.fullAddress}
          </Text>

          <View style={styles.addressDivider} />

          <Text style={styles.addressTitle}>Drop</Text>
          <Text style={styles.addressText}>
            {item.deliveryLocation?.fullAddress}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.amount}>$ {item.totalAmount}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <GradientButton
            text="Download Invoice"
            onPress={() => handleDownloadInvoice(item)}
            type="filled"
            gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          />
        </View>
      </View>
    );
  };

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
            {/* <View style={styles.mainTabWrapper}>
              {MAIN_TABS.map(renderMainTab)}
            </View> */}
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

            {mainTab === 'Sale Items' && (
              <View style={styles.searchBox}>
                <Image source={ICONS.search} style={styles.searchIcon} />
                <TextInput
                  placeholder="Search by Tracking ID"
                  placeholderTextColor="#999"
                  value={searchTrackingId}
                  onChangeText={setSearchTrackingId}
                  style={styles.searchInput}
                  autoCapitalize="none"
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
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  listWrapper: {
    flex: 1,
    padding: width(2),
  },

  emptyCenterBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },

  mainTabWrapper: {
    marginTop: width(3),
    flexDirection: 'row',
    justifyContent: 'center',
  },

  tabContainer: {
    paddingHorizontal: width(3),
    marginVertical: 10,
  },

  activeTab: {
    height: width(10),
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: width(30),
  },
  activeTabGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },

  buttonContainer: {
    marginTop: width(8),
  },

  inactiveTab: {
    height: width(10),
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
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  trackingLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },

  trackingId: {
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  productRow: {
    flexDirection: 'row',
    marginTop: 12,
  },

  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f2f2f2',
  },

  title: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  metaText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },

  /* ---------- ADDRESS ---------- */
  addressCard: {
    marginTop: 14,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
  },

  addressTitle: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },

  addressText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },

  addressDivider: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 8,
  },

  totalRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },

  amount: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 54,
  },

  searchIcon: {
    width: 18,
    height: 18,
    tintColor: '#999',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});

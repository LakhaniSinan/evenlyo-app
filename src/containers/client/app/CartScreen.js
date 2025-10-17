import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CartCard from '../../../components/cartCard';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import CancellationConfirm from '../../../components/modals/CancellationConfirm';
import CancelBookingModal from '../../../components/modals/CancellationModal';
import InfoModal from '../../../components/modals/InfoModal';
import ShippingFromModal from '../../../components/modals/ShippingFormModal';
import SaleItemCard from '../../../components/saleItemCard';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  getAccepetedBookings,
  getCartListings,
  listingRemoveFromCart,
} from '../../../services/ListingsItem';

function CartScreen({navigation}) {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const [cancelConfirmation, setCancelConfirmation] = useState(false);
  const [shippingForm, setshippingForm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('bookingItem');
  const [isLoadding, setIsLoadding] = useState(false);
  const [listingCartData, setListingCartData] = useState([]);
  const [accepetedBookings, setAccepetedBookings] = useState([]);

  useFocusEffect(
    useCallback(() => {
      handleGetCartListing();
    }, []),
  );

  const handleGetCartListing = async () => {
    try {
      setIsLoadding(true);

      const [responseCart, responseAccepted] = await Promise.all([
        getCartListings(),
        getAccepetedBookings(),
      ]);

      setIsLoadding(false);

      if (
        (responseCart?.status === 200 || responseCart?.status === 201) &&
        (responseAccepted?.status === 200 || responseAccepted?.status === 201)
      ) {
        const cartData = responseCart?.data?.data || [];
        const acceptedData = responseAccepted?.data?.data?.bookings || [];
        setAccepetedBookings(acceptedData);
        setListingCartData(cartData);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: responseCart?.data?.message,
        });
      }
    } catch (error) {
      setIsLoadding(false);
      console.log(error, 'errorerrorerrorerrorerror214543654');
    }
  };

  const handleRemoveFromCart = async id => {
    modalRef.current.show({
      status: 'alert',
      message: 'Are you sure you want to remove this item from the wishlist?',
      handlePressOk: async () => {
        modalRef.current.hide();
        try {
          setIsLoadding(true);
          const response = await listingRemoveFromCart(id);
          setIsLoadding(false);
          if (response?.status == 200 || response.status == 201) {
            modalRef.current.show({
              status: 'ok',
              message: response?.data?.message,
              handlePressOk: () => {
                modalRef.current.hide();
                handleGetCartListing();
              },
            });
          } else {
            modalRef.current.show({
              status: 'error',
              message: response?.data?.message,
            });
          }
        } catch (error) {
          setIsLoadding(false);
          console.log('Remove from cart error:', error);
        }
      },
    });
  };

  const handleConfirmCancel = () => {
    setModalVisible(false);
    setCancelConfirmation(true);
    setTimeout(() => setCancelConfirmation(false), 2000);
  };

  const handleBookNow = item => {
    setshippingForm(true);
  };

  const renderCartItem = ({item}) => (
    <CartCard
      item={item}
      onBookNow={handleBookNow}
      onRemoveItemFromCart={handleRemoveFromCart}
    />
  );
  const renderAcceptedItem = ({item}) => (
    <CartCard
      item={item}
      onBookNow={handleBookNow}
      onRemoveItemFromCart={handleRemoveFromCart}
    />
  );

  const renderSaleItemCart = ({item}) => (
    <SaleItemCard
      item={item}
      onBookNow={handleBookNow}
      onCancelBooking={handleRemoveFromCart}
    />
  );

  const renderSection = (title, data, onSeeAllPress) => {
    if (!data?.length) return null;
    return (
      <View style={{marginBottom: width(4)}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={styles.sectionTitle}>{t(title)}</Text>
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text
              style={[
                styles.sectionTitle,
                {fontSize: 10, color: COLORS.primary},
              ]}>
              See All
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={(item, index) => {
            return activeTab == 'saleItem'
              ? renderSaleItemCart(item)
              : title == 'Accepted Order'
              ? renderCartItem(item)
              : renderAcceptedItem(item);
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    );
  };

  const onContinueToShipping = async () => {
    setModalVisible(false);
    setshippingForm(false);
    setTimeout(() => setShowInfoModal(true), 500);
  };

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
            : ['#FFFFFF', '#FFFFFF', '#FFFFFF'];

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
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}>
                  {label}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={t('Add To Wishlist')}
        rightIcon={ICONS.chatIcon}
        onRightIconPress={() => navigation.navigate('MessagesScreen')}
      />

      <ScrollView style={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
        {renderTabs()}

        {activeTab === 'bookingItem' ? (
          <>
            {renderSection(
              'Request Add To Cart',
              listingCartData?.slice(0, 2),
              () => navigation.navigate('SeeAllRequestCart'),
            )}
            {renderSection('Accepted Order', accepetedBookings, () =>
              navigation.navigate('SeeAllRequestCart'),
            )}
            {/* <View style={styles.progressNotesCard}>
              <View style={styles.itemsList}>
                {[
                  {label: 'Subtotal', value: '$600'},
                  {label: 'Security Fee', value: '$25'},
                  {label: 'Kilometre Fee', value: '$5'},
                  {label: 'Service Charges', value: '$60'},
                  {label: 'Evenlyo Protect', value: '$25'},
                ].map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.label}</Text>
                    <Text style={styles.itemPrice}>{item.value}</Text>
                  </View>
                ))}
                <View
                  style={[styles.itemRow, {borderBottomColor: COLORS.white}]}>
                  <Text style={styles.totalText}>Total</Text>
                  <Text style={styles.totalAmount}>$690</Text>
                </View>
              </View>
            </View> */}

            <View style={{margin: width(3)}}>
              <GradientButton
                text={t('Process to Checkout')}
                onPress={() => {}}
                type="filled"
                gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              />
            </View>
          </>
        ) : (
          <>{renderSection('Sale Items', saleItem)}</>
        )}
      </ScrollView>

      <CancelBookingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmCancel}
      />
      <CancellationConfirm visible={cancelConfirmation} />
      <ShippingFromModal
        isVisible={shippingForm}
        onClose={() => setshippingForm(false)}
        nestedFilter={true}
        onContinueToShipping={onContinueToShipping}
      />
      <InfoModal
        isVisible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        nestedFilter={true}
        onContinueToShipping={() => {
          setshippingForm(false);
          setModalVisible(false);
          setShowInfoModal(false);
        }}
      />
      <Loader isLoading={isLoadding} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
}

export default CartScreen;

// ================== STYLES ==================
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: width(5),
    padding: width(1),
    margin: width(3),
    backgroundColor: COLORS.white,
    gap: width(1),
  },
  tabGradient: {
    flex: 1,
    borderRadius: width(3),
  },
  activeGradient: {
    elevation: 3,
  },
  tab: {
    paddingHorizontal: width(3),
    paddingVertical: width(3.5),
    borderRadius: width(3),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: width(12),
  },
  tabText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  listContainer: {
    paddingBottom: width(2),
  },
  sectionTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    fontSize: 14,
    paddingHorizontal: width(5),
    marginBottom: width(2),
  },
  progressNotesCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    padding: width(4),
    margin: width(4),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemsList: {
    gap: width(3),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: width(1),
  },
  itemName: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
  },
  totalText: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  totalAmount: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
});

const saleItem = [
  {
    id: 'dj_01',
    name: 'DJ Ray Vibes',
    status: 'In stock',
    verified: true,
    artistName: 'Jaydeep',
    price: 300,
    priceUnit: 'Per Event',
    image: IMAGES.vase,
    variant: 'requested',
    isBookmarked: true,
    isSelected: false,
  },
];

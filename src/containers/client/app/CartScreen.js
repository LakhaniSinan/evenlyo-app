import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CartCard from '../../../components/cartCard';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import CancellationConfirm from '../../../components/modals/CancellationConfirm';
import CancelBookingModal from '../../../components/modals/CancellationModal';
import InfoModal from '../../../components/modals/InfoModal';
import OrderBooking from '../../../components/modals/OrderBookingModal';
import RequestConfirmation from '../../../components/modals/RequestConfirmation';
import ShippingFromModal from '../../../components/modals/ShippingFormModal';
import PaymentModal from '../../../components/paymentModal';
import SaleItemCard from '../../../components/saleItemCard';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  getAccepetedBookings,
  getCartListings,
  listingRemoveFromCart,
  sendBookingRequest,
} from '../../../services/ListingsItem';
import {createPaymentIntent, getAmountToPay} from '../../../services/Payment';

function CartScreen({navigation}) {
  const dispatch = useDispatch();
  const {t, currentLanguage} = useTranslation();
  const modalRef = useRef(null);
  const {user} = useSelector(state => state.LoginSlice);
  const isAuthenticated = Boolean(user?.id || user?._id);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [orderBookingForm, setOrderBookingForm] = useState(false);
  const [cancelConfirmation, setCancelConfirmation] = useState(false);
  const [shippingForm, setshippingForm] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('bookingItem');
  const [isLoadding, setIsLoadding] = useState(false);
  const [listingCartData, setListingCartData] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [responeData, setResponeData] = useState(null);
  const [accepetedBookings, setAccepetedBookings] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [resuestModalVisible, setResuestModalVisible] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const [amountToPay, setAmountToPay] = useState(0);

  const [clientSecret, setClientSecret] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleGetCartListing = useCallback(async () => {
    if (!isAuthenticated) {
      setListingCartData([]);
      setAccepetedBookings([]);
      setIsLoadding(false);
      return;
    }

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
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      if (!isAuthenticated) {
        setListingCartData([]);
        setAccepetedBookings([]);
        setIsLoadding(false);
        return;
      }
      void handleGetCartListing();
    }, [
      isAuthenticated,
      modalVisible,
      payModalVisible,
      orderBookingForm,
      handleGetCartListing,
    ]),
  );

  const onRefresh = async () => {
    if (!isAuthenticated) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    await handleGetCartListing();
    setRefreshing(false);
  };

  const handlePayAmount = async () => {
    if (!isAuthenticated) {
      return;
    }
    if (!selectedData) {
      modalRef.current?.show({
        status: 'error',
        message: t('pleaseSelectBookingFirst'),
      });
      return;
    }
    try {
      setIsLoadding(true);
      const response = await getAmountToPay(selectedData?._id);

      if (response?.status === 200 || response?.status === 201) {
        const payableAmount = Number(response?.data?.amountToPay || 0);
        if (!payableAmount) {
          modalRef.current?.show({
            status: 'error',
            message: response?.data?.message?.en
              ? currentLanguage === 'en'
                ? response?.data?.message?.en
                : response?.data?.message?.nl
              : response?.data?.message,
          });
          return;
        }

        setAmountToPay(payableAmount);
        const res = await createPaymentIntent({
          amount: payableAmount.toFixed(2),
          bookingId: selectedData?._id,
        });

        if (res?.data?.clientSecret) {
          setPayModalVisible(true);
          const clientSecretValue = res.data.clientSecret;
          setClientSecret(clientSecretValue);
        } else {
          modalRef.current?.show({
            status: 'error',
            message: res?.data?.message?.en
              ? currentLanguage === 'en'
                ? res?.data?.message?.en
                : res?.data?.message?.nl
              : res?.data?.message,
          });
        }
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message?.en
            ? currentLanguage === 'en'
              ? response?.data?.message?.en
              : response?.data?.message?.nl
            : response?.data?.message,
        });
      }
    } catch (err) {
      console.log('PAYMENT INTENT ERROR', err);
    } finally {
      setIsLoadding(false);
    }
  };

  const handleRemoveFromCart = async item => {
    if (!isAuthenticated) {
      return;
    }
    console.log(item, 'itemitemitemitemitemitem');

    modalRef.current.show({
      status: 'alert',
      message: t('confirmRemoveFromWishlist'),
      handlePressOk: async () => {
        modalRef.current.hide();
        try {
          setIsLoadding(true);
          const response = await listingRemoveFromCart(item?.listingId?._id);
          setIsLoadding(false);
          if (response?.status == 200 || response.status == 201) {
            modalRef.current.show({
              status: 'ok',
              message: response?.data?.message?.en
                ? currentLanguage === 'en'
                  ? response?.data?.message?.en
                  : response?.data?.message?.nl
                : response?.data?.message,
              handlePressOk: () => {
                modalRef.current.hide();
                handleGetCartListing();
              },
            });
          } else {
            modalRef.current.show({
              status: 'error',
              message: response?.data?.message?.en
                ? currentLanguage === 'en'
                  ? response?.data?.message?.en
                  : response?.data?.message?.nl
                : response?.data?.message,
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
    setOrderBookingForm(true);
    setBookingData(item);
  };

  const handleSelectToPay = item => {
    const itemId = item?._id;
    if (!itemId) {
      return;
    }
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
      setSelectedData(null);
      return;
    }
    setSelectedItemId(itemId);
    setSelectedData(item);
  };

  const handlePaymentSuccess = useCallback(() => {
    setSelectedItemId(null);
    setSelectedData(null);
    void handleGetCartListing();
  }, [handleGetCartListing]);

  const renderCartItem = ({item}) => (
    <CartCard
      item={item}
      onEditData={handleBookNow}
      onRemoveItemFromCart={handleRemoveFromCart}
      onSelectToPay={handleSelectToPay}
      isSelected={selectedItemId === item._id}
    />
  );

  const renderAcceptedItem = ({item}) => (
    <CartCard
      type={'accepted'}
      item={item}
      onEditData={handleBookNow}
      onRemoveItemFromCart={handleRemoveFromCart}
      onSelectToPay={handleSelectToPay}
      isSelected={selectedItemId === item._id}
    />
  );

  const renderSaleItemCart = ({item}) => (
    <SaleItemCard setIsLoading={setIsLoadding} modalRef={modalRef} />
  );

  const renderSection = (sectionKey, title, data, onSeeAllPress) => {
    if (!data?.length) {
      return null;
    }

    const sectionTitle = t(title);

    return (
      <View style={{marginBottom: width(4)}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        </View>
        <FlatList
          data={data}
          keyExtractor={item => String(item._id || item.id)}
          renderItem={item => {
            if (activeTab === 'saleItem') {
              return renderSaleItemCart(item);
            }
            if (sectionKey === 'listingCart') {
              return renderCartItem(item);
            }
            return renderAcceptedItem(item);
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
    setOrderBookingForm(false);
    setTimeout(() => setShowInfoModal(true), 500);
  };

  const handleSendBookingRequest = async details => {
    if (!isAuthenticated) {
      return;
    }
    try {
      setIsLoadding(true);
      const response = await sendBookingRequest(details);

      if (response.status == 200 || response.status == 201) {
        setResponeData(response?.data?.data?.bookingRequest);
        setOrderBookingForm(false);
        setTimeout(() => setResuestModalVisible(true), 500);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
      setIsLoadding(false);
    } catch (error) {
      setIsLoadding(false);
      console.log(error, 'errorerrorerrorerror');
    } finally {
      setIsLoadding(false);
    }
  };

  const isEmpty =
    activeTab === 'bookingItem'
      ? listingCartData.length === 0 && accepetedBookings.length === 0
      : saleItem.length === 0;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={t('addToWishlistButton')}
        rightIcon={ICONS.chatIcon}
        onRightIconPress={() => navigation.navigate('MessagesScreen')}
      />

      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          isAuthenticated ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }>
        {/* {renderTabs()} */}

        {isEmpty ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: fontFamly.PlusJakartaSansMedium,
                color: COLORS.textLight,
              }}>
              {activeTab === 'bookingItem'
                ? t('noBookingItemsInCart')
                : t('noSaleItemsInCart')}
            </Text>
          </View>
        ) : activeTab === 'bookingItem' ? (
          <>
            {renderSection(
              'listingCart',
              'Request Add To Cart',
              listingCartData,
              () => navigation.navigate('SeeAllRequestCart'),
            )}
            {renderSection(
              'acceptedOrder',
              'Accepted Order',
              accepetedBookings,
              () => navigation.navigate('SeeAllRequestCart'),
            )}
          </>
        ) : (
          renderSection('saleItem', 'Sale Items', saleItem)
        )}
      </ScrollView>
      {accepetedBookings?.length > 0 && activeTab === 'bookingItem' && (
        <View style={{margin: width(3)}}>
          <GradientButton
            text={t('processToCheckout')}
            onPress={handlePayAmount}
            type="filled"
            gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          />
        </View>
      )}
      <OrderBooking
        type={'edit'}
        isVisible={orderBookingForm}
        selectedDate={bookingData?.tempDetails}
        handleSendBookingRequest={handleSendBookingRequest}
        onClose={() => setOrderBookingForm(!orderBookingForm)}
        data={{...bookingData?.listingId, ...bookingData?.tempDetails}}
      />
      <RequestConfirmation
        responeData={responeData}
        visible={resuestModalVisible}
        onClose={() => setResuestModalVisible(false)}
        navigation={navigation}
      />
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
      <PaymentModal
        selectedData={selectedData}
        amountToPay={amountToPay}
        modalRef={modalRef}
        isVisible={payModalVisible}
        setCardDetails={setCardDetails}
        clientSecret={clientSecret}
        onPaymentSuccess={handlePaymentSuccess}
        onClose={() => {
          setPayModalVisible(false);
          setClientSecret(null);
        }}
      />
      <Loader isLoading={isLoadding} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
}

export default CartScreen;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: width(5),
    padding: width(1),
    margin: width(3),
    backgroundColor: COLORS.backgroundLight,
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
    color: COLORS.backgroundLight,
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

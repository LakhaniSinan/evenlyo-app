import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../../assets';
import LoginModal from '../../../components/authModal';
import ForgotModal from '../../../components/authModal/ForgotModal';
import RegistrationModal from '../../../components/authModal/RegistrationModal';
import Categories from '../../../components/categories';
import CommonAlert from '../../../components/commanAlert';
import EventCard from '../../../components/eventCard';
import HeadingComponent from '../../../components/headingComponent';
import HomeCard from '../../../components/homeCard';
import Loader from '../../../components/loder';
import FilterModal from '../../../components/modals/FilterModal';
import PopularCard from '../../../components/popularCard';
import SubCategories from '../../../components/subCategories';
import {COLORS, fontFamly} from '../../../constants';
import {helper} from '../../../helper';
import useCategories from '../../../hooks/getCategories';
import useTranslation from '../../../hooks/useTranslation';
import {setCartData} from '../../../redux/slice/cart';
import {
  getHomeData,
  getVendorsBySubCategory,
  listingAddToCart,
} from '../../../services/ListingsItem';

const Home = ({navigation, route}) => {
  const modalRef = useRef();
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const locationData = useSelector(state => state.LocationSlice);
  const {address, city, state: regionState} = locationData;
  const [query, setQuery] = useState('');
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0);
  const [homedata, setHomeData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [subCategoriesSelected, setSubCategoriesSelected] = useState(null);
  console.log(
    homedata,
    'subCategoriesSelectedsubCategoriesSelectedsubCategoriesSelected',
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFrogotModal, setShowFrogotModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const {categories, subCategories, fetchCategories, fetchSubCategories} =
    useCategories();

  useEffect(() => {
    // App launch se pehle ki notification handle
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const {title, body} = remoteMessage.notification || {};
          console.log('Initial Notification:', title, body);
        }
      })
      .catch(console.error);

    // App background se open hone pe notification
    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      remoteMessage => {
        if (remoteMessage) {
          const {title, body} = remoteMessage.notification || {};
          console.log('Notification Opened:', title, body);
        }
      },
    );

    // App foreground me notification receive hone pe
    const unsubscribeForeground = messaging().onMessage(remoteMessage => {
      const {title, body} = remoteMessage.notification || {};
      helper.notificationCall(title, body, () => {});
    });

    return () => {
      unsubscribeOpened();
      unsubscribeForeground();
    };
  }, []);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selected?._id) {
      fetchSubCategories(selected._id);
    }
  }, [selected]);

  const loadInitialData = async () => {
    const res = await fetchCategories();
    if (res.success && res.data?.length > 0) {
      setSelected(res.data[0]);
      const subRes = await fetchSubCategories(res.data[0]._id);
      if (subRes.success && subRes.data?.length > 0) {
        setSubCategoriesSelected(subRes.data[0]);
      }
    } else {
      modalRef.current?.show({status: 'error', message: res.message});
    }
  };

  useEffect(() => {
    if (selected?._id && subCategoriesSelected?._id) {
      fetchHomeData();
    }
  }, [selected, subCategoriesSelected]);

  const fetchHomeData = async () => {
    try {
      const params = {
        subCategoryId: subCategoriesSelected?._id,
      };
      const res = await getHomeData(params);
      const response = await getVendorsBySubCategory(selected?._id);

      if (res.status === 200 || res.status === 201) {
        setHomeData({
          bookingItems: res?.data?.data || [],
          releventVendors: response?.data?.data || [],
        });
        setPlatformFeePercentage(
          res?.data?.data?.saleItems?.platformFeePercentage || 0,
        );
      } else {
        modalRef.current?.show({
          status: 'error',
          message: res?.data?.message,
        });
      }
    } catch (err) {
      console.log(err, 'askdnalskdhasjkdhjakshdks');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const onBookingCardPress = item => {
    navigation.navigate('EventDetails', item);
  };
  const {cartData} = useSelector(state => state.CartSlice);

  const handleAddToCart = async item => {
    console.log(item, 'lasndasdbaksjdbaksjdbaksj');

    try {
      let updatedCart = JSON.parse(JSON.stringify(cartData || []));
      const vendorId = item?.vendor?._id;

      const vendorIndex = updatedCart.findIndex(v => v.vendorId === vendorId);

      const productObject = {
        _id: item?._id,
        title: item?.title,
        image: item?.image,
        sellingPrice: item?.sellingPrice,
        quantity: 1,
        stockQuantity: item?.stockQuantity,
        extraDeliveryCharges: item?.extraDeliveryCharges || 0,
        platformFeePercentage: platformFeePercentage || 10,
        vendor: {
          ...item?.vendor,
          _id: item?.vendor?._id,
          businessName: item?.vendor?.fullName,
          businessLogo: item?.vendor?.businessLogo,
          location: item?.location,
        },
        linkedListing: item?.linkedListing,
        orderStatus: 'Pending',
        type: 'saleItem',
        createdAt: new Date().toISOString(),
      };

      if (vendorIndex !== -1) {
        const alreadyExists = updatedCart[vendorIndex].products.some(
          p => p._id === item._id,
        );

        if (alreadyExists) {
          modalRef.current.show({
            status: 'error',
            message: 'Item already exists in your cart',
          });
          return;
        } else {
          updatedCart[vendorIndex].products.push(productObject);
        }
      } else {
        updatedCart.push({
          vendorId: vendorId,
          products: [productObject],
          vendorName: item?.vendor?.fullName,
          businessLocation: item?.location?.fullAddress,
        });
      }

      dispatch(setCartData(updatedCart));
      await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));

      modalRef.current.show({
        status: 'ok',
        message: 'Item added to cart successfully!',
      });
    } catch (error) {
      console.log('Add to Cart Error:', error);
      modalRef.current.show({
        status: 'error',
        message: 'Something went wrong while adding to cart',
      });
    }
  };

  const handleAddToWishList = async listingId => {
    const userToken = await AsyncStorage.getItem('token');
    let token = JSON.parse(userToken);

    if (token == null) {
      setShowLoginModal(true);
    } else {
      try {
        setIsLoading(true);
        const response = await listingAddToCart({listingId});
        setIsLoading(false);
        fetchHomeData();
        if (response.status == 200 || response.status == 201) {
          modalRef.current.show({
            status: 'ok',
            message: response?.data?.message,
          });
        } else {
          modalRef.current.show({
            status: 'error',
            message: response?.data?.message,
          });
        }
      } catch (error) {
        setIsLoading(false);
        console.log(error, 'errorerrorerrorerrorerrorerror2-3423432');
      }
    }
  };

  const handlePressFun = type => {
    setShowFrogotModal(false);
    setShowLoginModal(false);
    setShowRegisterModal(false);

    if (type == 'forgot') {
      setTimeout(() => {
        setShowFrogotModal(true);
      }, 500);
    } else if (type == 'reset') {
      setShowFrogotModal(false);
      setTimeout(() => {
        setShowLoginModal(true);
      }, 500);
    } else if (type == 'register') {
      setShowLoginModal(false);
      setTimeout(() => {
        setShowRegisterModal(true);
      }, 500);
    } else if (type == 'goBackToLogin') {
      setShowRegisterModal(false);
      setTimeout(() => {
        setShowLoginModal(true);
      }, 500);
    }
  };

  const renderItem = ({item}) => {
    switch (item.type) {
      case 'header':
        return (
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
                paddingVertical: width(2),
                paddingHorizontal: width(2),
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  marginLeft: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Image
                  source={ICONS.locationIcon}
                  style={{width: 40, height: 40}}
                />
                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: 12,
                    marginLeft: width(3),
                    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
                  }}>
                  {city || regionState
                    ? `${city || ''}${
                        regionState ? `${city ? ', ' : ''}${regionState}` : ''
                      }`
                    : address || ''}
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  style={{marginRight: 10}}
                  onPress={() => navigation.navigate('Notifications')}>
                  <Image
                    source={ICONS.notificationIcon}
                    style={{width: 40, height: 40}}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Image
                    source={ICONS.filters}
                    style={{width: 40, height: 40}}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{height: 10}} />
            {/* <View
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
                value={query}
                onChangeText={setQuery}
                inputContainer={{
                  paddingVertical: 0,
                  paddingHorizontal: 10,
                  height: 45,
                  width: '80%',
                }}
                styleProps={{
                  fontSize: 14,
                  color: '#000',
                }}
              />
            </View> */}
          </View>
        );

      case 'banner':
        return (
          <View
            style={{
              height: width(55),
              borderRadius: 20,
              backgroundColor: 'red',
              margin: width(3),
            }}>
            <Image
              resizeMode="cover"
              source={IMAGES.backgroundImage}
              style={{width: '100%', height: '100%', borderRadius: 20}}
            />
          </View>
        );

      case 'categories':
        return (
          <>
            <HeadingComponent
              heading={t('Explore')}
              gradientText={t('Categories')}
              rightArrow={false}
              onPress={() => navigation.navigate('EventListingScreen')}
            />
            <Categories
              data={categories}
              selected={selected}
              setSelected={setSelected}
            />
          </>
        );

      case 'subcategories':
        return (
          <SubCategories
            data={subCategories}
            subSelected={subCategoriesSelected}
            setsubSelected={setSubCategoriesSelected}
          />
        );

      case 'bookingItem':
        return (
          <HeadingComponent
            heading={t('Booking')}
            gradientText={t('Items')}
            rightArrow
            onPress={() => navigation.navigate('EventListingScreen')}
          />
        );

      case 'homecard':
        return (
          <HomeCard
            data={homedata?.bookingItems || []}
            onBookingCardPress={onBookingCardPress}
            handleAddToWishList={handleAddToWishList}
          />
        );

      case 'saleItem':
        return (
          <>
            <HeadingComponent
              heading={t('Sale')}
              gradientText={t('Items')}
              rightArrow
              onPress={() => navigation.navigate('SalesItems')}
            />
            <PopularCard
              type={'saleItem'}
              data={homedata?.saleItems || []}
              handleAddToCart={handleAddToCart}
            />
          </>
        );

      case 'otherSaleItem':
        return (
          <>
            <HeadingComponent
              heading={t('Other Sale')}
              gradientText={t('Items')}
              rightArrow
              onPress={() => navigation.navigate('SalesItems')}
            />
            <PopularCard
              type={'saleItem'}
              data={homedata?.otherSaleItemms || []}
              handleAddToCart={handleAddToCart}
            />
          </>
        );

      case 'relevant':
        return (
          <HeadingComponent
            heading={t('relevant')}
            gradientText={t('vendors')}
            rightArrow
          />
        );

      case 'eventCard':
        return (
          <FlatList
            data={homedata?.releventVendors || []}
            horizontal={true}
            renderItem={({item}) => {
              return (
                <EventCard
                  item={item}
                  navigation={navigation}
                  platformFeePercentage={platformFeePercentage}
                />
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={() => (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: width(100),
                  height: width(10),
                }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.textLight,
              }}>
              {t('noRelevantVendors')}
            </Text>
              </View>
            )}
          />
        );

      default:
        return null;
    }
  };

  const onApplyPress = async item => {
    try {
      setModalVisible(false);
      if (item?.subCategory) {
        setSubCategoriesSelected({_id: item.subCategory});
      }
      const params = {
        ...(item?.subCategory && {subCategoryId: item?.subCategory}),
        ...(item?.lat && {latitude: item?.lat}),
        ...(item?.lng && {longitude: item?.lng}),
        ...(item?.startDate && {date: item?.startDate}),
        ...(item?.radius && {radius: Number(item?.radius)}),
      };
      setRefreshing(true);
      const response = await getHomeData(params);
      if (response.status === 200 || response.status === 201) {
        setHomeData(response?.data?.data || []);
        setPlatformFeePercentage(
          response?.data?.data?.saleItems?.platformFeePercentage || 0,
        );
        setModalVisible(false);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      setModalVisible(false);
      console.log(error, 'errorerrorerrorerrorerrorerrorsdadsd22dd');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <FlatList
        data={[
          {type: 'header'},
          {type: 'categories'},
          {type: 'subcategories'},
          // {type: 'popular'},
          // {type: 'popularCard'},
          {type: 'bookingItem'},
          {type: 'homecard'},
          // {type: 'saleItem'},
          // {type: 'otherSaleItem'},
          {type: 'relevant'},
          {type: 'eventCard'},
        ]}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />
      <FilterModal
        onApplyPress={onApplyPress}
        modalRef={modalRef}
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
      <CommonAlert ref={modalRef} />
      <Loader isLoading={isLoading} />
      <LoginModal
        isVisible={showLoginModal}
        onClose={() => setShowLoginModal(!showLoginModal)}
        handlePressFun={handlePressFun}
      />
      <ForgotModal
        isVisible={showFrogotModal}
        onClose={() => setShowFrogotModal(!showFrogotModal)}
        handlePressFun={handlePressFun}
      />
      <RegistrationModal
        isVisible={showRegisterModal}
        onClose={() => setShowRegisterModal(!showRegisterModal)}
        handlePressFun={handlePressFun}
      />
    </>
  );
};

export default Home;

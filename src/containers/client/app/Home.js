import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {useDispatch, useSelector} from 'react-redux';
import {getHomeData, listingAddToCart} from '../../../services/ListingsItem';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {ICONS} from '../../../assets';
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
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import useCategories from '../../../hooks/getCategories';
import useTranslation from '../../../hooks/useTranslation';
import {setCartData} from '../../../redux/slice/cart';

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
  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFrogotModal, setShowFrogotModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [otherSaleItems, setOtherSaleItems] = useState([]);

  const {categories, subCategories, fetchCategories, fetchSubCategories} =
    useCategories();

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
        categoryId: selected?._id,
        subCategoryId: subCategoriesSelected?._id,
      };
      const res = await getHomeData(params);
      console.log(res, 'resresresresresresresres213123');

      if (res.status === 200 || res.status === 201) {
        setHomeData(res?.data?.data || []);
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
              <TouchableOpacity
                onPress={() => navigation.navigate('Notifications')}>
                <Image
                  source={ICONS.notificationIcon}
                  style={{width: 40, height: 40}}
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
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{marginRight: 10}}>
                <Image source={ICONS.filters} style={{width: 40, height: 40}} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'categories':
        return (
          <Categories
            data={categories}
            selected={selected}
            setSelected={setSelected}
          />
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
            data={homedata?.BookingItems || []}
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
                  No Relevant Vendors Found!
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
    const params = {
      categoryId: selected?._id,
      subCategoryId: subCategoriesSelected?._id,
      ...(query && {searchQuery: query}),
      ...(item?.location && {location: item?.location}),
      ...(item?.lat && {lat: item?.lat}),
      ...(item?.lng && {lng: item?.lng}),
      ...(item?.startDate && {startDate: item?.startDate}),
      ...(item?.endDate && {endDate: item?.endDate}),
      ...(item?.startTime && {startTime: item?.startTime}),
      ...(item?.endTime && {endTime: item?.endTime}),
    };

    const response = await getHomeData(params);
    console.log(response, 'responseresponseresponseresponse');
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
          {type: 'saleItem'},
          {type: 'otherSaleItem'},
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
        // nestedFilter
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

// const asdasd = {
//   BookingItems: [
//     {
//       title: [Object],
//       subtitle: [Object],
//       description: [Object],
//       location: [Object],
//       availability: [Object],
//       serviceDetails: [Object],
//       rating: [Object],
//       bookings: [Object],
//       _id: new ObjectId('6926f83f5c1d49ce48b400c6'),
//       quantity: 71,
//       vendor: new ObjectId('6911b7d4e8478c7b209eb558'),
//       category: new ObjectId('68943d2ca1a765a1f78a635b'),
//       subCategory: new ObjectId('692457736f7216eb2150f682'),
//       pricing: [Object],
//       images: [Array],
//       status: 'active',
//       isActive: true,
//       sortOrder: 0,
//       popular: false,
//       reviews: [],
//       createdAt: '2025-11-26T12:53:19.496Z',
//       updatedAt: '2026-01-07T07:01:18.011Z',
//       __v: 0,
//       id: '6926f83f5c1d49ce48b400c6',
//     },
//   ],
//   saleItems: [
//     {
//       title: [Object],
//       _id: new ObjectId('69315aa22bb91499bd9f2b19'),
//       mainCategory: new ObjectId('68943d2ca1a765a1f78a635b'),
//       subCategory: new ObjectId('692457736f7216eb2150f682'),
//       vendor: new ObjectId('6911b7d4e8478c7b209eb558'),
//       linkedListing: new ObjectId('69299f032c87e6e4e02fafdc'),
//       purchasePrice: 200,
//       sellingPrice: 500,
//       stockQuantity: 68,
//       image:
//         'https://res.cloudinary.com/dv0imczul/image/upload/v1764841983/c5jqxkvy7ku5jlhpkit4.png',
//       extraDeliveryCharges: 200,
//       location: [Object],
//       createdAt: '2025-12-04T09:55:46.754Z',
//       updatedAt: '2026-01-12T09:09:27.059Z',
//       __v: 0,
//     },
//   ],
//   otherSaleItemms: [
//     {
//       title: [Object],
//       _id: new ObjectId('693fdf5cbde592e3b133075d'),
//       mainCategory: null,
//       subCategory: null,
//       vendor: new ObjectId('6911b7d4e8478c7b209eb558'),
//       linkedListing: null,
//       purchasePrice: 100,
//       sellingPrice: 800,
//       stockQuantity: 54,
//       image:
//         'https://res.cloudinary.com/dv0imczul/image/upload/v1765793607/yjnxvcf7yqhqwq0xkbbt.png',
//       extraDeliveryCharges: 200,
//       location: [Object],
//       createdAt: '2025-12-15T10:13:48.023Z',
//       updatedAt: '2025-12-19T14:18:12.097Z',
//       __v: 0,
//     },
//   ],
//   releventVendors: [
//     {
//       tagline: [Object],
//       description: [Object],
//       whyChooseUs: [Object],
//       businessDescription: [Object],
//       rating: [Object],
//       _id: new ObjectId('6942922e4c37a32c3c005ade'),
//       userId: new ObjectId('6942922e4c37a32c3c005adc'),
//       businessName: 'Syeda Gillani',
//       businessEmail: 'syedagilani4520@gmail.com',
//       businessPhone: '3185967030',
//       businessLocation: 'wahcannt',
//       businessLogo:
//         'https://res.cloudinary.com/dv0imczul/image/upload/v1765969953/v5ah0xlijrdfpl29rtfq.png',
//       businessImage:
//         'https://res.cloudinary.com/dv0imczul/image/upload/v1765969963/fowummbr1mhyxsys5vsn.jpg',
//       mainCategories: [Array],
//       subCategories: [Array],
//       totalBookings: 0,
//       completedBookings: 0,
//       isApproved: false,
//       contactMeEnabled: true,
//       accountType: 'personal',
//       reviews: [],
//       createdAt: '2025-12-17T11:21:18.959Z',
//       updatedAt: '2026-01-02T06:55:22.467Z',
//       __v: 0,
//     },
//   ],
// };

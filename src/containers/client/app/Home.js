import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {useSelector} from 'react-redux';
import {
  getBookingItems,
  getPopulorItems,
  getVendorsBySubCategory,
} from '../../../services/ListingsItem';

import {ICONS, IMAGES} from '../../../assets';
import Categories from '../../../components/categories';
import CommonAlert from '../../../components/commanAlert';
import EventCard from '../../../components/eventCard';
import HeadingComponent from '../../../components/headingComponent';
import HomeCard from '../../../components/homeCard';
import FilterModal from '../../../components/modals/FilterModal';
import PopularCard from '../../../components/popularCard';
import SubCategories from '../../../components/subCategories';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import useCategories from '../../../hooks/getCategories';
import useTranslation from '../../../hooks/useTranslation';

const Home = ({navigation}) => {
  const {
    categories,
    subCategories,
    fetchCategories,
    fetchSubCategories,
    setCategories,
  } = useCategories();

  const {
    address,
    city,
    state: regionState,
  } = useSelector(state => state.LocationSlice);

  const [bookingItems, setBookingItems] = useState([]);
  const [vendorsBySubCat, setVendorsBySubCat] = useState([]);
  console.log(vendorsBySubCat, 'vendorsBySubCatvendorsBySubCatvendorsBySubCat');

  const [popularData, setPopularData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [subCategoriesSelected, setSubCategoriesSelected] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const modalRef = useRef();
  const {t} = useTranslation();

  // ✅ Initial Load
  useEffect(() => {
    loadInitialData();
  }, []);

  // ✅ Sub-category change: fetch both
  useEffect(() => {
    if (subCategoriesSelected && selected) {
      fetchBookingAndVendors();
    }
  }, [subCategoriesSelected]);

  // ✅ Sub-category fetch on main category change
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
      fetchPopular();
    } else {
      modalRef.current?.show({status: 'error', message: res.message});
    }
  };

  const fetchPopular = async () => {
    try {
      const res = await getPopulorItems(6);
      if (res.status === 200 || res.status === 201) {
        setPopularData(res?.data?.data || []);
      } else {
        modalRef.current?.show({status: 'error', message: res.message});
      }
    } catch (err) {
      console.log('Popular fetch error:', err);
    }
  };

  const fetchBookingAndVendors = async () => {
    try {
      const [bookingRes, vendorRes] = await Promise.all([
        getBookingItems(selected?._id, subCategoriesSelected?._id),
        getVendorsBySubCategory(subCategoriesSelected?._id),
      ]);
      console.log(vendorRes, 'bookingResbookingResbookingResbookingRes');

      if (bookingRes.status === 200 || bookingRes.status === 201) {
        setBookingItems(bookingRes?.data?.data || []);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: bookingRes?.data?.message,
        });
      }

      if (vendorRes.status === 200 || vendorRes.status === 201) {
        setVendorsBySubCat(vendorRes?.data?.data);
      } else {
        modalRef.current?.show({status: 'error', message: vendorRes.message});
      }
    } catch (err) {
      console.log('Booking/Vendor fetch error:', err);
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

      case 'popular':
        return (
          <HeadingComponent
            heading={t('popular')}
            gradientText={t('nearYou')}
            rightArrow
          />
        );

      case 'popularCard':
        return (
          <PopularCard
            data={popularData}
            onCardPress={() => {}}
            type={'home'}
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
            data={bookingItems || []}
            onBookingCardPress={onBookingCardPress}
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
            <PopularCard data={[{image: IMAGES.vase}, {image: IMAGES.vase}]} />
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
            data={vendorsBySubCat || []}
            horizontal={true}
            renderItem={({item}) => {
              return <EventCard item={item} navigation={navigation} />;
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

  return (
    <>
      <FlatList
        data={[
          {type: 'header'},
          {type: 'categories'},
          {type: 'subcategories'},
          {type: 'popular'},
          {type: 'popularCard'},
          {type: 'bookingItem'},
          {type: 'homecard'},
          {type: 'saleItem'},
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
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
      <CommonAlert ref={modalRef} />
    </>
  );
};

export default Home;

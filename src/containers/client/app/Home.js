import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
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

const Home = ({navigation}) => {
  const {
    categories,
    subCategories,
    loading,
    fetchCategories,
    fetchSubCategories,
    setCategories,
  } = useCategories();

  const [selected, setSelected] = useState(null);
  const [subCategoriesSelected, setSubCategoriesSelected] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const modalRef = useRef();
  const {t} = useTranslation();

  const data1 = [
    {image: IMAGES.backgroundImage2},
    {image: IMAGES.backgroundImage2},
  ];
  const data = [{image: IMAGES.vase}, {image: IMAGES.vase}];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = useCallback(async () => {
    const res = await fetchCategories();
    if (res.success && res.data?.length > 0) {
      setSelected(res.data[0]);
      const subCatRes = await fetchSubCategories(res.data[0]._id);
      if (subCatRes.success && subCatRes.data?.length > 0) {
        setSubCategoriesSelected(0);
      }
    } else {
      modalRef.current?.show({status: 'error', message: res.message});
    }
  }, [fetchCategories, fetchSubCategories]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  useEffect(() => {
    if (selected?._id) fetchSubCategories(selected._id);
  }, [selected, fetchSubCategories]);

  const onCardPress = useCallback(item => {
    console.log('Card pressed:', item);
  }, []);

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
            {/* 🔹 Location + Notification */}
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
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                  source={ICONS.locationIcon}
                />
                <Text
                  style={{
                    fontSize: 12,
                    marginLeft: width(3),
                    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
                  }}>
                  San Francisco, CA
                </Text>
              </View>
              <TouchableOpacity
                style={{borderRadius: 20}}
                onPress={() => navigation.navigate('Notifications')}>
                <Image
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                  source={ICONS.notificationIcon}
                />
              </TouchableOpacity>
            </View>

            {/* 🔹 Search + Filters */}
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
                  marginTop: 0,
                }}
                styleProps={{
                  fontSize: 14,
                  color: '#000',
                }}
              />
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginRight: 10,
                }}>
                <Image
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                  source={ICONS.filters}
                />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'categories':
        return (
          <View style={{marginTop: width(3)}}>
            <Categories
              data={categories}
              selected={selected}
              setSelected={setSelected}
            />
          </View>
        );

      case 'subcategories':
        return (
          <View style={{marginTop: width(3)}}>
            <SubCategories
              data={subCategories}
              subSelected={subCategoriesSelected}
              setsubSelected={setSubCategoriesSelected}
            />
          </View>
        );

      case 'popular':
        return (
          <HeadingComponent
            heading={t('popular')}
            gradientText={t('nearYou')}
            rightArrow
            onPress={() => {}}
          />
        );

      case 'popularCard':
        return <PopularCard data={data1} onCardPress={onCardPress} />;

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
        return <HomeCard />;

      case 'saleItem':
        return (
          <>
            <HeadingComponent
              heading={t('Sale')}
              gradientText={t('Items')}
              rightArrow
              onPress={() => navigation.navigate('SalesItems')}
            />
            <PopularCard data={data} />
          </>
        );

      case 'relevant':
        return (
          <HeadingComponent
            heading={t('relevant')}
            gradientText={t('vendors')}
            rightArrow
            onPress={() => {}}
          />
        );

      case 'eventCard':
        return (
          <>
            <EventCard navigation={navigation} />
            <View style={{height: width(10)}} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <FlatList
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
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
      />

      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
      <CommonAlert ref={modalRef} />
      <Loader isLoading={loading} />
    </>
  );
};

export default Home;

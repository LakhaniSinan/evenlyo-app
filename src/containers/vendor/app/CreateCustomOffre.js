// CreateCustomOffer.js
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  BackHandler,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import BookingFilterPopUp from '../../../components/modals/BookingFilterPopup';
import NewRequestModal from '../../../components/modals/RequestModal';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {removeItem} from '../../../redux/slice/offers';
import {
  fetchSubCategoriesByCategoryIds,
  getVendorCategories,
} from '../../../services/Categories';
import {filterListings} from '../../../services/ListingsItem';
import {formatEuro} from '../../../utils';

const CreateCustomOffer = ({route}) => {
  const data = route?.params || {};
  console.log(data, 'vdatadatadatadatadatadatadata');

  const {t, currentLanguage} = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedListing, setSelectedListing] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [vendorsCategory, setVendorsCategory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useSelector(state => state.LoginSlice);
  const [filteredListings, setFilteredListings] = useState([]);
  const [settingsData, setSettingsData] = useState([]);

  const offerItems = useSelector(state => state.OffersSlice.items);
  console.log(offerItems, 'offerItemsofferItemsofferItems');

  const [showAddNew, setShowAddNew] = useState(false);
  const [isBrowsingMoreItems, setIsBrowsingMoreItems] = useState(false);

  const showSelectedView = offerItems?.length > 0 && !isBrowsingMoreItems;
  const showAvailableView = !offerItems?.length || isBrowsingMoreItems;

  useEffect(() => {
    handleGetVendorCategories();
  }, [modalVisible]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleGoBack();
          return true;
        },
      );
      return () => subscription.remove();
    }, [handleGoBack]),
  );

  const handleGetVendorCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getVendorCategories(user?.id);
      if (response.status == 200 || response?.status === 201) {
        let ides =
          response?.data?.data[0]?.mainCategories?.map(item => item?._id) || [];
        console.log(ides, 'idesidesidesidesidesides');

        handleGetVendorSubCategories(ides);
      }
    } catch (error) {
      console.log('Error fetching vendor categorie', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGetVendorSubCategories = async ides => {
    try {
      setIsLoading(true);
      const res = await fetchSubCategoriesByCategoryIds({
        categoryIds: ides,
      });
      if (res.status == 200 || res?.status === 201) {
        setVendorsCategory(res?.data?.data || []);
      } else {
        console.log('Error fetching vendor subcategorie', res?.data?.message);
      }
    } catch (error) {
      console.log('Error fetching vendor categorie', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetFilteredListings = async (categoryId, subCategoryId) => {
    try {
      setIsLoading(true);
      const response = await filterListings(categoryId, subCategoryId);
      console.log(response, 'responseresponseresponseresponse');

      if (response.status === 200 || response.status === 201) {
        setFilteredListings(response?.data?.data || []);
        setSettingsData(response?.data?.settings || []);
      } else {
        console.log(
          'Error fetching filtered listings:',
          response?.data?.message,
        );
      }
    } catch (error) {
      console.log('Error fetching filtered listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = type => {
    setShowAddNew(false);
    navigation.navigate('BookingItems', type);
  };

  const handleOpenForm = item => {
    setSelectedListing(item);
    setEditingItem(null);
    setShowAddNew(true);
  };

  const handleAddMoreItems = () => {
    if (!filteredListings?.length) {
      setIsBrowsingMoreItems(true);
      setModalVisible(true);
      return;
    }
    setIsBrowsingMoreItems(true);
  };

  const handleCloseRequestModal = () => {
    setShowAddNew(false);
    setEditingItem(null);
    setIsBrowsingMoreItems(false);
  };

  const handleEditOfferItem = item => {
    setSelectedListing(item);
    setEditingItem(item);
    setShowAddNew(true);
  };

  const handleDeleteOfferItem = item => {
    dispatch(removeItem(item?.uniqueId || item?.id || item?._id));
  };

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenForm(item)}>
        <View style={styles.imageWrapper}>
          <Image
            source={
              item?.images ? {uri: item.images[0]} : IMAGES.backgroundImage2
            }
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '80%',
          }}>
          <View style={styles.textWrapper}>
            <Text style={styles.typeText}>• {t('Listing')}</Text>
            <Text style={styles.titleText} numberOfLines={2}>
              {currentLanguage == 'en' ? item?.title?.en : item?.title?.nl}
            </Text>
          </View>
          <View style={styles.priceWrapper}>
            <Text style={styles.priceText}>
              {formatEuro(item?.pricing?.amount, {space: false})}
            </Text>
            <Text style={styles.dayText}>
              /{item?.pricing?.type.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const selectedOfferItem = ({item}) => {
    const title = currentLanguage == 'en' ? item?.title?.en : item?.title?.nl;
    const displayPrice =
      item?.discountedPrice ??
      item?.pricingBreakdown?.subtotal ??
      item?.pricing?.amount ??
      0;
    const itemPayableTotal =
      Number(displayPrice || 0) + Number(item?.securityFee || 0);
    const unit = item?.unit || item?.pricing?.type;

    return (
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image
            source={
              item?.images ? {uri: item.images[0]} : IMAGES.backgroundImage2
            }
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.selectedTextWrapper}>
          <Text style={styles.titleText} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.typeText}>{t('Rental')}</Text>
        </View>
        <View style={styles.selectedRightWrap}>
          <View style={styles.selectedPriceWrapper}>
            <Text style={styles.priceText}>
              {formatEuro(itemPayableTotal || 0, {space: false})}
            </Text>
            {!!unit && (
              <Text style={styles.dayText}>/{String(unit).toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.offerActionWrap}>
            <TouchableOpacity
              onPress={() => handleEditOfferItem(item)}
              style={styles.offerActionBtn}>
              <Image
                source={ICONS.editGridientIcon}
                style={styles.offerActionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteOfferItem(item)}
              style={styles.offerActionBtn}>
              <Image
                source={ICONS.deleteIcon}
                style={styles.offerActionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <AppHeader
        headingText={t('Create Custom offer')}
        leftIcon={ICONS.leftArrowIcon}
        onLeftIconPress={handleGoBack}
      />

      {!offerItems?.length ? (
        <View style={styles.addBtnWrapper}>
          <GradientButton
            text={t('Add New Item')}
            onPress={() => setModalVisible(true)}
            textStyle={styles.addBtnText}
            styleProps={styles.addBtn}
          />
        </View>
      ) : null}

      {showSelectedView ? (
        <FlatList
          ListHeaderComponent={
            <Text style={styles.sectionHeader}>
              {t('selectedItemsCount', {count: offerItems?.length})}
            </Text>
          }
          data={offerItems}
          renderItem={selectedOfferItem}
          keyExtractor={item => String(item?.uniqueId || item?.id || item?._id)}
          ListFooterComponent={
            <View style={{width: width(46), marginLeft: width(3)}}>
              <GradientButton
                text={t('Add More Items')}
                type="filled"
                onPress={handleAddMoreItems}
                textStyle={styles.applyText}
                styleProps={{width: width(46)}}
              />
            </View>
          }
        />
      ) : null}

      {showAvailableView ? (
        <>
          {offerItems?.length > 0 ? (
            <TouchableOpacity
              style={styles.backToSelectedWrap}
              onPress={() => setIsBrowsingMoreItems(false)}>
              <Text style={styles.backToSelectedText}>
                {t('backToSelectedItems', {count: offerItems.length})}
              </Text>
            </TouchableOpacity>
          ) : null}
          <FlatList
            ListHeaderComponent={
              <Text style={styles.sectionHeader}>{t('Available Items')}</Text>
            }
            data={filteredListings}
            renderItem={renderItem}
            keyExtractor={item => String(item?._id || item?.id)}
          />
        </>
      ) : null}

      {offerItems?.length > 0 && !isBrowsingMoreItems ? (
        <View
          style={{alignSelf: 'center', marginVertical: width(4), width: '90%'}}>
          <GradientButton
            text={t('Preview Offer')}
            onPress={() =>
              navigation.navigate('OfferPreview', {
                chatParams: data?.chatParams || data,
              })
            }
            type="filled"
            textStyle={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              color: COLORS.white,
            }}
          />
        </View>
      ) : null}

      <NewRequestModal
        type={'vendor'}
        isVisible={showAddNew}
        onClose={handleCloseRequestModal}
        navigation={navigation}
        selectedListing={selectedListing}
        editingItem={editingItem}
        settingsData={settingsData}
      />
      {/* <AddNewItemModal
        isVisible={showAddNew}
        selectedOption={selectedOption}
        onClose={() => setShowAddNew(false)}
        handleSelect={handleSelect}
      /> */}
      <BookingFilterPopUp
        isLoading={isLoading}
        vendorsCategory={vendorsCategory}
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        handleGetFilteredListings={handleGetFilteredListings}
      />
    </SafeAreaView>
  );
};

export default CreateCustomOffer;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: width(3),
    paddingBottom: width(20),
    backgroundColor: 'red',
  },
  addBtnWrapper: {
    paddingHorizontal: width(4),
    marginTop: width(3),
  },
  addBtn: {
    paddingVertical: width(3),
  },
  addBtnText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.white,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginTop: width(4),
    marginLeft: width(4),
  },
  buttonRow: {
    flexDirection: 'row',
    width: width(100),
    justifyContent: 'space-around',
    marginBottom: width(4),
  },
  applyText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    // alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginVertical: width(2),
    marginHorizontal: width(3),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    padding: width(2),
  },
  imageWrapper: {
    height: width(18),
    width: width(18),
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  textWrapper: {
    marginLeft: width(3),
  },
  selectedTextWrapper: {
    marginLeft: width(3),
    flex: 1,
    paddingRight: width(2),
  },
  typeText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  titleText: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginTop: 3,
  },
  priceWrapper: {
    alignItems: 'flex-end',
  },
  selectedRightWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  selectedPriceWrapper: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  dayText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
  },
  offerActionWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  offerActionBtn: {
    padding: 2,
    marginLeft: width(1.2),
  },
  offerActionIcon: {
    width: width(5),
    height: width(5),
  },
  backToSelectedWrap: {
    marginHorizontal: width(4),
    marginTop: width(3),
    marginBottom: width(1),
  },
  backToSelectedText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

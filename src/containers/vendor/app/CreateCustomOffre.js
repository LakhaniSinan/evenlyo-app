// CreateCustomOffer.js
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import GradientText from '../../../components/gradiantText';
import AddNewItemModal from '../../../components/modals/AddNewItem';
import BookingFilterPopUp from '../../../components/modals/BookingFilterPopup';
import NewRequestModal from '../../../components/modals/RequestModal';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  fetchSubCategoriesByCategoryIds,
  getVendorCategories,
} from '../../../services/Categories';
import {filterListings} from '../../../services/ListingsItem';

const CreateCustomOffer = ({route}) => {
  const data = route.params;
  console.log(data, 'vdatadatadatadatadatadatadata');

  const {t, currentLanguage} = useTranslation();
  const navigation = useNavigation();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [vendorsCategory, setVendorsCategory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useSelector(state => state.LoginSlice);
  const [filteredListings, setFilteredListings] = useState([]);
  const [settingsData, setSettingsData] = useState([]);

  console.log(settingsData, 'settingsDatasettingsDatasettingsData');

  const [showAddNew, setShowAddNew] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    handleGetVendorCategories();
  }, [modalVisible]);

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
    setShowAddNew(true);
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
        <View style={styles.textWrapper}>
          <Text style={styles.typeText}>• Listing</Text>
          <Text style={styles.titleText} numberOfLines={2}>
            {currentLanguage == 'en' ? item?.title?.en : item?.title?.nl}
          </Text>
        </View>
        <View style={styles.priceWrapper}>
          <Text style={styles.priceText}>€{item?.pricing?.amount}</Text>
          <Text style={styles.dayText}>
            /{item?.pricing?.type.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <AppHeader
        headingText={t('Create Custom offer')}
        leftIcon={ICONS.leftArrowIcon}
        onLeftIconPress={() => navigation.goBack()}
      />

      <View style={styles.addBtnWrapper}>
        <GradientButton
          text={t('Add New Item')}
          onPress={() => setModalVisible(true)}
          textStyle={styles.addBtnText}
          styleProps={styles.addBtn}
        />
      </View>

      <FlatList
        ListHeaderComponent={
          <Text style={styles.sectionHeader}>Available Items</Text>
        }
        data={filteredListings}
        renderItem={renderItem}
      />

      <View style={styles.buttonRow}>
        <View style={{width: width(46)}}>
          <TouchableOpacity
            onPress={() => setShowRequestModal(true)}
            style={styles.cancelButton}
            activeOpacity={0.7}>
            <GradientText text={'Offer Preview'} />
          </TouchableOpacity>
        </View>

        <View style={{width: width(46)}}>
          <GradientButton
            text={t('Send Offer')}
            onPress={() =>
              navigation.navigate('ChatDetails', {offreShow: true})
            }
            type="filled"
            textStyle={styles.applyText}
          />
        </View>
      </View>
      <NewRequestModal
        type={'vendor'}
        isVisible={showAddNew}
        onClose={() => setShowAddNew(false)}
        navigation={navigation}
        selectedListing={selectedListing}
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
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    marginVertical: width(2),
    marginHorizontal: width(3),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    width: width(55),
  },
  typeText: {
    fontSize: 9,
    color: COLORS.green,
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
});

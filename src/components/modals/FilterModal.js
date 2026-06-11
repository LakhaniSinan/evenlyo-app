import {useNavigation} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {searchSubCategories} from '../../services/ListingsItem';
import GradientButton from '../button';
import CustomPicker from '../customPicker';
import DateSelector from '../dateSelector';
import GradientText from '../gradiantText';
import GooglePlacesInput from '../locationField';

const INITIAL_FILTERS = {
  mainCategory: '',
  subCategory: '',
};

const INITIAL_DATES = {
  startDate: null,
  endDate: null,
};

const RADIUS_OPTIONS = [
  {name: '5'},
  {name: '10'},
  {name: '25'},
  {name: '50'},
  {name: '100'},
];

const FilterModal = ({
  isVisible,
  onClose,
  nestedFilter = false,
  modalRef,
  onApplyPress = () => {},
}) => {
  const {t, currentLanguage} = useTranslation();
  const navigation = useNavigation();

  const mainCategoryRef = useRef(null);
  const subCategoryRef = useRef(null);
  const radiusRef = useRef(null);

  const debounceRef = useRef(null);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [radius, setRadius] = useState(null);

  const [subCatQuery, setSubCatQuery] = useState('');
  const [subCatList, setSubCatList] = useState([]);
  const [subCatLoading, setSubCatLoading] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [dates, setDates] = useState(INITIAL_DATES);

  const [address, setAddress] = useState({
    fullAddress: '',
    lat: 0,
    lng: 0,
  });
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const fetchSubCategories = useCallback(async text => {
    try {
      setSubCatLoading(true);
      const res = await searchSubCategories(text);
      setSubCatList(res?.data?.data || []);
    } catch (err) {
      console.log('SubCategory API Error:', err);
    } finally {
      setSubCatLoading(false);
    }
  }, []);

  const handleSubCatSearch = useCallback(
    text => {
      setSubCatQuery(text);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        if (text.trim().length > 0) fetchSubCategories(text);
        else setSubCatList([]);
      }, 500);
    },
    [fetchSubCategories],
  );

  const handleSelect = useCallback((key, value) => {
    setFilters(prev => ({...prev, [key]: value?.name || value}));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setDates(INITIAL_DATES);
    setAddress({fullAddress: '', lat: 0, lng: 0});
    setRadius(null);
    setSubCatQuery('');
    setSubCatList([]);
    setSelectedSubCategory(null);
    setFormKey(prev => prev + 1);
  }, []);

  const handleApply = useCallback(() => {
    const payload = {
      startDate: dates.startDate,
      endDate: dates.endDate,
      location: address.fullAddress,
      radius,
      lat: address.lat,
      lng: address.lng,
      subCategory: selectedSubCategory?._id,
    };

    onApplyPress(payload);
    handleReset();
  }, [dates, address, radius, selectedSubCategory, onApplyPress, handleReset]);

  const onLocationSelect = useCallback(item => {
    setAddress({
      fullAddress: item.userAddress,
      lat: item?.latLng?.latitude,
      lng: item?.latLng?.longitude,
    });
  }, []);

  const FooterButtons = memo(() => (
    <View style={styles.buttonRow}>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={nestedFilter ? handleReset : onClose}>
          {nestedFilter ? (
            <GradientText text={t('Reset Filter')} />
          ) : (
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonWrapper}>
        <GradientButton
          text={t('Apply Filters')}
          onPress={handleApply}
          type="filled"
          textStyle={styles.applyText}
        />
      </View>
    </View>
  ));

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Filter')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {nestedFilter && (
            <>
              <CustomPicker
                ref={mainCategoryRef}
                label={t('Main Category')}
                labelll={t('Main Category')}
                value={filters.mainCategory}
                listData={[
                  {name: 'Entertainment & Attractions'},
                  {name: 'Food & Drinks'},
                  {name: 'Decoration & Styling'},
                  {name: 'Locations & Party Tents'},
                  {name: 'Staff & Services'},
                ]}
                name="mainCategory"
                handleOpenModal={() =>
                  mainCategoryRef?.current?.show({title: 'Main Category'})
                }
                handleSelectValue={handleSelect}
              />
            </>
          )}

          {/* SubCategory Search */}
          <View style={styles.searchWrapper}>
            <Text style={styles.label}>{t('searchSubCategory')}</Text>

            <View style={styles.searchBox}>
              <TextInput
                value={subCatQuery}
                placeholder={t('typeToSearch')} 
                placeholderTextColor={COLORS.textLight}
                onChangeText={handleSubCatSearch}
                style={styles.input}
              />
            </View>

            {subCatList.length > 0 && (
              <View style={styles.dropdown}>
                {subCatList.map((item, index) => (
                  <View key={item._id}>
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedSubCategory(item);
                        setSubCatQuery(
                          currentLanguage === 'en'
                            ? item.name?.en
                            : item.name?.nl,
                        );
                        setSubCatList([]);
                      }}>
                      <Text style={styles.dropdownText}>
                        {currentLanguage === 'en'
                          ? item.name?.en
                          : item.name?.nl}
                      </Text>
                    </TouchableOpacity>

                    {/* {index !== subCatList.length - 1 && (
                      <View style={styles.separator} />
                    )} */}
                  </View>
                ))}
              </View>
            )}
          </View>

          <GooglePlacesInput
            key={`location-${formKey}`}
            selectedLocation={address.fullAddress}
            setSelectedLocation={onLocationSelect}
            placeholder={t('searchYourLocation')}
            bgcolor={COLORS.backgroundLight}
            showRightIcon={ICONS.locationIcon}
            lable={t('searchLocation')}
            onEndIconPress={() => {
              setAddress({fullAddress: '', lat: 0, lng: 0});
            }}
          />

          <View style={{flexDirection: 'row', gap: 12}}>
            <View style={{flex: 1}}>
              <DateSelector
                date={dates.startDate}
                placeholder={t('Start Date')}
                onDateChange={date =>
                  setDates(prev => ({...prev, startDate: date}))
                }
              />
            </View>
          </View>

          <CustomPicker
            ref={radiusRef}
            label={t('searchRadius')}
            labelll={t('searchRadius')}
            value={radius ? `${radius}` : ''}
            listData={RADIUS_OPTIONS}
            name="radius"
            handleOpenModal={() =>
              radiusRef?.current?.show({title: t('selectRadius')})
            }
            handleSelectValue={(key, value) => setRadius(value)}
          />
        </ScrollView>

        {!keyboardVisible && <FooterButtons />}
      </View>
    </Modal>
  );
};

export default memo(FilterModal);

const styles = StyleSheet.create({
  modal: {margin: 0, justifyContent: 'flex-end'},

  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: width(8),
    borderTopRightRadius: width(8),
    paddingHorizontal: 16,
    paddingTop: 14,
    height: '80%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
  },

  title: {
    fontSize: 18,
    fontFamily: fontFamly.bold,
    color: COLORS.black,
  },

  label: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    marginBottom: 8,
  },

  searchWrapper: {marginTop: 16},

  searchBox: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
  },

  input: {
    fontSize: 14,
    fontFamily: fontFamly.regular,
    color: COLORS.black,
  },

  dropdown: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    marginTop: 6,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  dropdownItem: {padding: 12},

  dropdownText: {
    fontSize: 14,
    fontFamily: fontFamly.regular,
    color: COLORS.black,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },

  buttonWrapper: {flex: 1, paddingHorizontal: 6},

  cancelButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 14,
    fontFamily: fontFamly.medium,
    color: COLORS.primary,
  },

  applyText: {
    fontSize: 14,
    fontFamily: fontFamly.medium,
    color: COLORS.white,
  },
});

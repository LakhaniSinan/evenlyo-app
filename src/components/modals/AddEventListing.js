import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Image,
  Keyboard,
  Modal as NativeTermsModal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {width} from 'react-native-dimension';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {helper} from '../../helper';
import {useTranslation} from '../../hooks';
import {
  fetchSubCategoriesByCategoryIds,
  getVendorCategories,
} from '../../services/Categories';
import {createVendorLosting, updateVendorListing} from '../../services/Vendor';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import CustomPicker from '../customPicker';
import DualLanguageCustomPicker from '../dualLanguagePicker';
import GooglePlacesInput from '../locationField';
import Loader from '../loder';
import TextField from '../textInput';

const PRICING_TYPE_VALUES = ['Per Hour', 'Per Day', 'Per Event'];
const DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABEL_KEYS = {
  sun: 'daySun',
  mon: 'dayMon',
  tue: 'dayTue',
  wed: 'dayWed',
  thu: 'dayThu',
  fri: 'dayFri',
  sat: 'daySat',
};

const TERMS_MODAL_SECTIONS = [
  {
    title: 'Welcome to Evenlyo',
    body: 'By accessing and using our platform, you agree to the following terms and conditions.\n\nThese terms are designed to protect both clients and vendors, ensuring a safe, fair, and transparent experience for everyone.',
  },
  {
    number: '1',
    title: 'General Terms',
    body: 'Evenlyo acts as a platform to connect clients and vendors for event services.\nUsers must provide accurate information when creating accounts and listings.\nAll users must comply with local laws and regulations when using our platform.\nEvenlyo reserves the right to suspend or terminate accounts that violate these terms.',
  },
  {
    number: '2',
    title: 'Platform Usage Rules',
    body: 'Clients may book services directly through Evenlyo.\nVendors are responsible for maintaining accurate service descriptions, pricing, and availability up-to-date.\nBoth clients and vendors must communicate respectfully and in good faith.',
  },
  {
    number: '3',
    title: 'Payments & Fees',
    body: 'Payments are processed securely through our integrated system.\nFees for vendors (if applicable) will be disclosed clearly before sign-up.\nRefund policies are determined by individual vendors and platform rules.',
  },
  {
    number: '4',
    title: 'Liability & Cancellations',
    body: 'Evenlyo is not a party to contracts between clients and vendors.\nUsers are responsible for their own interactions and agreements.\nVendors are responsible for service delivery.\nCancellation policies vary by vendor and should be reviewed before booking.\nEvenlyo may mediate disputes but is not liable for service performance or service.',
  },
];

const EventListingModal = ({isVisible, onClose, toEditData}) => {
  console.log(toEditData, 'toEditDatatoEditDatatoEditDatatoEditDatatoEditData');

  const {t, currentLanguage} = useTranslation();
  const [formData, setFormData] = useState({
    title: {en: '', nl: ''},
    subTitle: {en: '', nl: ''},
    mainCategory: null,
    subCategory: null,
    description: {en: '', nl: ''},
    pricingType: '',
    cost: '',
    extraTimeCost: '',
    perKm: '',
    securityFeeAmount: '',
    autoAcceptOrder: false,
    selectedCoords: null,
    termsAccepted: false,
    productImage: [],
  });

  const [selectedLang, setSelectedLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const {user} = useSelector(state => state.LoginSlice);
  const [isCheck, setIsCheck] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [vendorsCategories, setVendorsCategory] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const modalRef = useRef(null);

  const pricingTypeOptions = useMemo(
    () =>
      PRICING_TYPE_VALUES.map(name => ({
        name,
        label: t(name),
      })),
    [t],
  );

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

  useEffect(() => {
    handleGetVendorCategories();
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && toEditData && vendorsCategories?.length > 0) {
      // ✅ find selected main category
      const selectedCat = vendorsCategories.find(
        cat => cat?._id === toEditData?.category?._id,
      );

      // ✅ load subcategories first, then preselect subcategory
      (async () => {
        if (selectedCat?._id) {
          const res = await fetchSubCategoriesByCategoryIds({
            categoryIds: [selectedCat._id],
          });
          const subs = res?.data?.data?.[0]?.subcategories || [];
          setAllSubCategories(subs);

          const selectedSubCat = subs.find(
            sub => sub?._id === toEditData?.subCategory?._id,
          );

          // ✅ match pricing type from list
          const priceType = pricingTypeOptions.find(price => {
            const name = price.name.toLowerCase().replace(/\s+/g, '');
            const type = toEditData?.pricing?.type
              ?.toLowerCase()
              .replace(/\s+/g, '');
            return name === type;
          });

          // ✅ Set initial formData with pre-filled values
          setFormData({
            title: toEditData?.title || {en: '', nl: ''},
            subTitle: toEditData?.subtitle || {en: '', nl: ''},
            description: toEditData?.description || {en: '', nl: ''},
            mainCategory: selectedCat || null,
            subCategory: selectedSubCat || null,
            pricingType: priceType?.name || '',
            cost: toEditData?.pricing?.amount?.toString() || '',
            extraTimeCost: toEditData?.pricing?.extratimeCost?.toString() || '',
            perKm: toEditData?.pricing?.pricePerKm?.toString() || '',
            securityFeeAmount:
              toEditData?.pricing?.securityFee?.toString() || '',
            selectedCoords: toEditData?.location || null,
            productImage: toEditData?.images || [],
            termsAccepted: true,
            autoAcceptOrder: toEditData?.autoAcceptOrder || false,
          });

          // ✅ preselect security fee toggle and available days
          setIsCheck(toEditData?.pricing?.securityFee > 0);
          setAvailableDays(toEditData?.availability?.availableDays || []);

          // ✅ preselect time slots if available
          if (
            toEditData?.availability?.availableTimeSlots &&
            toEditData?.availability?.availableTimeSlots.length > 0
          ) {
            const slot = toEditData.availability.availableTimeSlots[0];
            if (slot.startTime) {
              setStartTime(moment(slot.startTime, 'HH:mm').toDate());
            }
            if (slot.endTime) {
              setEndTime(moment(slot.endTime, 'HH:mm').toDate());
            }
          }
        }
      })();
    }
  }, [isVisible, toEditData, vendorsCategories, pricingTypeOptions]);

  // useEffect(() => {
  //   let selectedSubCats = allSubCategories?.find(
  //     item => item?.name?.en || item?.name?.nl === toEditData?.subCategory,
  //   );

  //   setFormData({
  //     ...formData,
  //     subCategory: selectedSubCats || '',
  //   });
  // }, [allSubCategories]);

  const handleGetVendorCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getVendorCategories(user?.id);
      if (response.status == 200 || response?.status) {
        let data = response.data.data[0];
        setVendorsCategory(data?.mainCategories);
      }
    } catch (error) {
      console.log('Error fetching vendor categorie', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formData?.mainCategory?._id) {
      handleGetAllSubCategories([formData?.mainCategory?._id]);
    } else {
      setAllSubCategories([]);
    }
  }, [formData?.mainCategory?._id]);

  const handleGetAllSubCategories = useCallback(async categoryIds => {
    try {
      setIsLoading(true);
      const response = await fetchSubCategoriesByCategoryIds({categoryIds});
      if (response?.status === 200 || response?.status === 201) {
        const fetchedSubCategories =
          response?.data?.data?.[0]?.subcategories || [];
        setAllSubCategories(fetchedSubCategories);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message || 'Failed to fetch subcategories.',
        });
      }
    } catch (error) {
      console.log('❌ Error fetching subcategories:', error);
      modalRef.current?.show({
        status: 'error',
        message: 'Error loading subcategories. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectValue = (key, value) => {
    console.log(key, value, 'key, valuekey, valuekey, value');

    if (key === 'mainCategory') {
      setFormData(prev => ({
        ...prev,
        mainCategory: value,
        subCategory: null,
      }));
      if (value?._id) {
        handleGetAllSubCategories([value._id]);
      }
    } else {
      setFormData(prev => ({...prev, [key]: value}));
    }
  };

  const handleTextChange = (field, value) => {
    const dualLangFields = ['title', 'subTitle', 'description'];

    if (dualLangFields.includes(field)) {
      setFormData(prev => ({
        ...prev,
        [field]: {...prev[field], [selectedLang]: value},
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    const {
      title,
      subTitle,
      description,
      mainCategory,
      subCategory,
      pricingType,
      cost,
      extraTimeCost,
      perKm,
      securityFeeAmount,
      selectedCoords,
      termsAccepted,
      productImage,
    } = formData;

    // ✅ Common Validation Helper
    const showError = message =>
      modalRef.current.show({status: 'error', message});

    const isNonEmpty = v => String(v ?? '').trim().length > 0;
    const isValidAmount = (v, {allowZero = false} = {}) => {
      const n = Number(String(v ?? '').trim());
      if (Number.isNaN(n) || !Number.isFinite(n)) {
        return false;
      }
      return allowZero ? n >= 0 : n > 0;
    };

    // ✅ Validations (all fields required except security fee)
    if (!isNonEmpty(title.en)) {
      return showError(t('Title (English) is required'));
    }
    if (!isNonEmpty(title.nl)) {
      return showError(t('Title (Dutch) is required'));
    }
    if (!isNonEmpty(subTitle.en)) {
      return showError(t('Sub Title (English) is required'));
    }
    if (!isNonEmpty(subTitle.nl)) {
      return showError(t('Sub Title (Dutch) is required'));
    }
    if (!mainCategory) {
      return showError(t('Main Category is required'));
    }
    if (!subCategory) {
      return showError(t('Sub Category is required'));
    }
    if (!isNonEmpty(description.en)) {
      return showError(t('Description (English) is required'));
    }
    if (!isNonEmpty(description.nl)) {
      return showError(t('Description (Dutch) is required'));
    }
    if (!pricingType) {
      return showError(t('Pricing Type is required'));
    }
    if (!isNonEmpty(cost) || !isValidAmount(cost)) {
      return showError(
        t('Cost is required and must be a valid amount greater than 0'),
      );
    }
    if (
      !isNonEmpty(extraTimeCost) ||
      !isValidAmount(extraTimeCost, {allowZero: true})
    ) {
      return showError(
        t('Extra Time Cost is required and must be a valid number'),
      );
    }
    if (!isNonEmpty(perKm) || !isValidAmount(perKm, {allowZero: true})) {
      return showError(t('Per km is required and must be a valid number'));
    }
    if (!productImage?.length) {
      return showError(t('At least one listing image is required'));
    }
    if (availableDays.length === 0) {
      return showError(t('Select at least one available day'));
    }
    if (!startTime) {
      return showError(t('Start Time is required'));
    }
    if (!endTime) {
      return showError(t('End Time is required'));
    }
    if (!selectedCoords) {
      return showError(t('Please select a valid location'));
    }
    if (!termsAccepted) {
      return showError(t('You must agree to Terms & Conditions'));
    }

    // ✅ Build Final Payload
    const payload = {
      title,
      subtitle: subTitle,
      description,
      category: mainCategory?._id || '',
      subCategory: subCategory?._id || '',
      pricing: {
        type: pricingType,
        amount: Number(cost),
        extratimeCost: Number(extraTimeCost) || '',
        pricePerKm: Number(perKm) || '',
        securityFee: isCheck ? Number(securityFeeAmount) : 0,
      },
      images: formData.productImage || [],
      location: {
        userAddress: selectedCoords?.userAddress || '',
        coordinates: {
          latitude: selectedCoords?.latLng?.latitude,
          longitude: selectedCoords?.latLng?.longitude,
        },
      },
      availability: {
        isAvailable: true,
        availableDays: availableDays,
        availableTimeSlots: [
          {
            startTime: startTime ? moment(startTime).format('HH:mm') : '',
            endTime: endTime ? moment(endTime).format('HH:mm') : '',
          },
        ],
      },
      vendorId: user?.id,
      status: 'active',
      isActive: true,
    };

    try {
      setIsLoading(true);
      const response = toEditData
        ? await updateVendorListing(toEditData?._id, payload)
        : await createVendorLosting(payload);
      console.log(response, 'responseresponseresponseresponse');
      const isSuccess = response?.status === 200 || response?.status === 201;
      modalRef.current.show({
        status: isSuccess ? 'ok' : 'error',
        message: response?.data?.message?.en
          ? currentLanguage === 'en'
            ? response?.data?.message?.en
            : response?.data?.message?.nl
          : response?.data?.message,
        handlePressOk: () => {
          modalRef.current.hide();
          onClose();
          resetForm();
        },
      });
    } catch (error) {
      console.log('❌ handleSubmit error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateImage = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 3, // user can only pick up to 3 at once
      },
      async response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert(
            t('Error'),
            typeof response.errorMessage === 'string'
              ? response.errorMessage
              : currentLanguage === 'en'
              ? response.errorMessage?.en
              : response.errorMessage?.nl,
          );
          return;
        }

        const assets = response?.assets || [];
        if (assets.length === 0) {
          return;
        }

        // ✅ Check how many images already exist
        const existingCount = formData?.productImage?.length || 0;
        const newCount = assets.length;

        if (existingCount + newCount > 3) {
          Alert.alert(
            t('Limit Reached'),
            t('You can upload a maximum of 3 images.'),
          );
          return;
        }

        try {
          setIsLoading(true);
          const uploadedUrls = [];

          for (const asset of assets) {
            const file = {
              uri: asset.uri,
              type: asset.type,
              name: asset.fileName || `upload.${asset.type?.split('/')[1]}`,
            };

            const result = await helper.uploadMediaToCloudinary(file);
            const uploadedUrl = result?.secure_url || result?.secureUrl;
            if (uploadedUrl) {
              uploadedUrls.push(uploadedUrl);
            }
          }

          // ✅ Merge with existing images
          setFormData(prev => ({
            ...prev,
            productImage: [...(prev.productImage || []), ...uploadedUrls],
          }));

          console.log('✅ Uploaded images:', uploadedUrls);
        } catch (err) {
          console.error('❌ Upload error:', err);
          Alert.alert(
            t('Error'),
            t('Failed to upload images. Please try again.'),
          );
        } finally {
          setIsLoading(false);
        }
      },
    );
  }, [formData, t]);

  // ✅ render uploaded media
  // ✅ render uploaded media safely
  const renderMedia = (mediaList = [], setter) => {
    if (!Array.isArray(mediaList)) {
      return null;
    } // ensure it's an array

    return mediaList.map((item, index) => (
      <View key={index} style={styles.mediaPreviewContainer}>
        <Image
          source={{uri: item}}
          style={styles.mediaPreview}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            setter(prev => {
              const updated = prev.filter((_, i) => i !== index);
              return [...updated];
            });
          }}>
          <Image
            source={ICONS.redcross}
            style={styles.removeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    ));
  };

  const renderUploadBox = (label, onPress) => (
    <TouchableOpacity style={styles.uploadBox} onPress={onPress}>
      <Image source={ICONS.uploadIcon} style={styles.uploadIcon} />
      <Text style={styles.uploadText}>{label}</Text>
    </TouchableOpacity>
  );

  const resetForm = () => {
    setFormData({
      title: {en: '', nl: ''},
      subTitle: {en: '', nl: ''},
      description: {en: '', nl: ''},
      mainCategory: '',
      subCategory: '',
      pricingType: '',
      cost: '',
      extraTimeCost: '',
      perKm: '',
      securityFeeAmount: '',
      productImage: [],
      autoAcceptOrder: false,
      termsAccepted: false,
      selectedCoords: null,
    });

    setAvailableDays([]);
    setStartTime('');
    setEndTime('');
    setIsCheck(false);
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        onBackdropPress={() => {
          resetForm();
          onClose();
        }}
        style={styles.modal}
        backdropOpacity={0.5}
        avoidKeyboard
        propagateSwipe>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('Add New Listing')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* ScrollView */}
          <ScrollView style={{flex: 1}}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('Basic Information')}</Text>

              <View style={styles.languageRow}>
                <Text style={styles.langLabel}>{t('Select Language:')}</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setSelectedLang('en')}>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedLang === 'en' && styles.radioSelected,
                      ]}
                    />
                    <Text style={styles.radioText}>{t('US English')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setSelectedLang('nl')}>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedLang === 'nl' && styles.radioSelected,
                      ]}
                    />
                    <Text style={styles.radioText}>{t('NL Dutch')}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dynamic Fields */}
              <TextField
                bgColor={COLORS.white}
                label={
                  selectedLang === 'en'
                    ? t('Title (English)')
                    : t('Title (Dutch)')
                }
                placeholder={t('Enter title')}
                value={formData.title[selectedLang]}
                onChangeText={v => handleTextChange('title', v)}
              />
              <View style={{height: 10}} />
              <TextField
                bgColor={COLORS.white}
                label={
                  selectedLang === 'en'
                    ? t('Sub Title (English)')
                    : t('Sub Title (Dutch)')
                }
                placeholder={t('Enter subtitle')}
                value={formData.subTitle[selectedLang]}
                onChangeText={v => handleTextChange('subTitle', v)}
              />

              <DualLanguageCustomPicker
                label={t('Main Category')}
                labelll={t('Select Main Category')}
                dropdownContainerStyle={{backgroundColor: COLORS.white}}
                value={formData?.mainCategory}
                listData={vendorsCategories}
                name="mainCategory"
                handleSelectValue={handleSelectValue}
              />
              <DualLanguageCustomPicker
                label={t('Sub Category')}
                labelll={t('Select Sub Category')}
                dropdownContainerStyle={{backgroundColor: COLORS.white}}
                value={formData?.subCategory}
                listData={allSubCategories}
                name="subCategory"
                handleSelectValue={handleSelectValue}
              />

              <GooglePlacesInput
                selectedLocation={formData?.selectedCoords || ''}
                setSelectedLocation={v =>
                  handleSelectValue('selectedCoords', v)
                }
                placeholder={t('Enter Location')}
                bgcolor={COLORS.white}
                showRightIcon={ICONS.locationIcon}
                lable={t('Add Location *')}
              />

              <TextField
                bgColor={COLORS.white}
                label={
                  selectedLang === 'en'
                    ? t('Description (English)')
                    : t('Description (Dutch)')
                }
                placeholder={t(
                  'Focused on creating vibes through immersive sound...',
                )}
                multiline
                numberOfLines={3}
                value={formData.description[selectedLang]}
                onChangeText={v => handleTextChange('description', v)}
              />
            </View>
            {/* Pricing Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('Pricing Section')}</Text>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{width: width(40)}}>
                  <CustomPicker
                    label={t('Pricing Type')}
                    labelll={t('Pricing Type')}
                    dropdownContainerStyle={{backgroundColor: COLORS.white}}
                    value={formData.pricingType}
                    listData={pricingTypeOptions}
                    name="pricingType"
                    handleSelectValue={handleSelectValue}
                  />
                </View>
                <View style={{width: width(40), marginTop: width(3)}}>
                  <TextField
                    label={t('Cost')}
                    placeholder={t('Enter Cost')}
                    bgColor={COLORS.white}
                    value={formData.cost}
                    onChangeText={v => handleTextChange('cost', v)}
                  />
                </View>
              </View>

              <TextField
                label={t('Extra Time Cost')}
                placeholder={t('Extra Time Cost')}
                bgColor={COLORS.white}
                value={formData.extraTimeCost}
                onChangeText={v => handleTextChange('extraTimeCost', v)}
              />

              <TextField
                label={t('Per km (1)')}
                placeholder={'€1'}
                bgColor={COLORS.white}
                value={formData.perKm}
                onChangeText={v => handleTextChange('perKm', v)}
              />

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => setIsCheck(!isCheck)}>
                <View
                  style={[
                    styles.checkbox,
                    isCheck && {backgroundColor: COLORS.primary},
                  ]}>
                  {isCheck && (
                    <Icon name="checkmark" size={16} color={COLORS.white} />
                  )}
                </View>
                <Text style={styles.optionLabel}>
                  {t('Security Fee (Non-living things only)')}
                </Text>
              </TouchableOpacity>

              {isCheck && (
                <TextField
                  label={t('Security Fee Amount')}
                  placeholder={t('Enter Security Fee Amount')}
                  bgColor={COLORS.white}
                  value={formData.securityFeeAmount}
                  onChangeText={v => handleTextChange('securityFeeAmount', v)}
                />
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('Gallery View')}</Text>

              <Text style={styles.sectionTitle}>{t('Images (Maximum 3)')}</Text>
              {renderUploadBox(t('Click to upload work Images'), () =>
                handleUpdateImage(),
              )}
              <View style={styles.previewRow}>
                {renderMedia(formData?.productImage || [], images =>
                  setFormData(prev => ({...prev, productImage: images})),
                )}
              </View>
            </View>
            <View
              style={{
                backgroundColor: COLORS.backgroundLight,
                borderRadius: width(4),
                padding: width(4),
                marginBottom: width(3),
              }}>
              <Text style={styles.sectionTitle}>{t('Booking Date/Time ')}</Text>
              <Text style={styles.sectionTitle}>{t('Available Days')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginVertical: width(3),
                }}>
                {DAYS_OF_WEEK.map(item => {
                  const isSelected = availableDays.includes(item);

                  return (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setAvailableDays(prev =>
                          prev.includes(item)
                            ? prev.filter(d => d !== item)
                            : [...prev, item],
                        );
                      }}
                      style={{margin: width(1)}}>
                      {isSelected ? (
                        <LinearGradient
                          colors={['#FF295D', '#FF517B']}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={{
                            height: width(8),
                            width: width(15),
                            borderRadius: 100,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{color: COLORS.white, fontWeight: 'bold'}}>
                            {t(DAY_LABEL_KEYS[item])}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View
                          style={{
                            height: width(8),
                            width: width(15),
                            borderRadius: 100,
                            backgroundColor: COLORS.white,
                            borderWidth: 1,
                            borderColor: COLORS.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text style={{color: COLORS.black}}>
                            {item.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.sectionTitle}>{t('Available Days')}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: width(4),
                }}>
                {/* Start Date */}
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setIsStartPickerOpen(true)}>
                  <Text style={styles.dateLabel}>{t('startTime')}</Text>
                  <Text style={styles.dateValue}>
                    {startTime
                      ? moment(startTime).format('hh:mm A')
                      : t('Select Time')}
                  </Text>
                </TouchableOpacity>

                {/* End Date */}
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setIsEndPickerOpen(true)}>
                  <Text style={styles.dateLabel}>{t('endTime')}</Text>
                  <Text style={styles.dateValue}>
                    {endTime
                      ? moment(endTime).format('hh:mm A')
                      : t('Select Time')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Terms & Conditions */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: width(3),
              }}>
              <TouchableOpacity
                onPress={() =>
                  setFormData(prev => ({
                    ...prev,
                    termsAccepted: !prev.termsAccepted,
                  }))
                }
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <View
                  style={[
                    styles.checkbox,
                    formData.termsAccepted && styles.checkboxChecked,
                  ]}>
                  {formData.termsAccepted && (
                    <Icon name="checkmark" size={16} color="white" />
                  )}
                </View>
              </TouchableOpacity>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  marginLeft: 4,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    setFormData(prev => ({
                      ...prev,
                      termsAccepted: !prev.termsAccepted,
                    }))
                  }
                  activeOpacity={0.7}>
                  <Text
                    style={{
                      color: COLORS.black,
                      fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                    }}>
                    {t('I agree to the')}{' '}
                  </Text>
                </TouchableOpacity>
                <Text
                  onPress={() => setTermsModalVisible(true)}
                  style={styles.termsLink}>
                  {t('termsAndConditions')}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Buttons */}
          {!isKeyboardVisible && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                style={[styles.cancelButton, styles.buttonRowItem]}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <View style={styles.buttonRowItem}>
                <GradientButton
                  icon={ICONS.uploadIcon}
                  iconTintColor={COLORS.white}
                  text={toEditData ? t('Update Listing') : t('Add Listing')}
                  onPress={handleSubmit}
                  type="filled"
                  textStyle={styles.applyText}
                />
              </View>
            </View>
          )}
        </View>
        <Loader isLoading={isLoading} />
        <CommonAlert ref={modalRef} />
        <DatePicker
          modal
          open={isStartPickerOpen}
          date={startTime || new Date()}
          mode="time"
          onConfirm={date => {
            setIsStartPickerOpen(false);
            setStartTime(date);
          }}
          onCancel={() => setIsStartPickerOpen(false)}
        />

        <DatePicker
          modal
          open={isEndPickerOpen}
          date={endTime || new Date()}
          mode="time"
          minimumDate={startTime || new Date()}
          onConfirm={date => {
            setIsEndPickerOpen(false);
            setEndTime(date);
          }}
          onCancel={() => setIsEndPickerOpen(false)}
        />
      </Modal>

      <NativeTermsModal
        visible={termsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTermsModalVisible(false)}>
        <View style={styles.termsModalOverlay}>
          <View style={styles.termsModalCard}>
            <View style={styles.termsModalHeader}>
              <Text style={styles.termsModalTitle}>{t('termsAndConditions')}</Text>
              <TouchableOpacity
                onPress={() => setTermsModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                accessibilityLabel="Close terms">
                <Icon name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.termsModalScroll}
              showsVerticalScrollIndicator={false}
              bounces={false}>
              {TERMS_MODAL_SECTIONS.map((section, index) => (
                <View key={index} style={styles.termsModalBlock}>
                  {section.number ? (
                    <Text style={styles.termsModalSectionNumber}>
                      {section.number}. {section.title}
                    </Text>
                  ) : (
                    <Text style={styles.termsModalSectionTitle}>
                      {section.title}
                    </Text>
                  )}
                  <Text style={styles.termsModalBody}>{section.body}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </NativeTermsModal>
    </>
  );
};

const styles = StyleSheet.create({
  languageRow: {
    marginBottom: width(3),
  },
  langLabel: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    fontSize: 12,
    marginBottom: width(2),
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: width(6),
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 6,
  },
  radioSelected: {
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
    fontSize: 12,
  },
  checkboxChecked: {
    backgroundColor: '#FF295D',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF295D',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    width: 25,
    height: 25,
    marginBottom: 6,
    tintColor: COLORS.gray,
  },
  uploadText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: width(2),
    paddingVertical: width(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 20,
    padding: 4,
    zIndex: 1,
  },
  mediaPreview: {
    width: width(25),
    height: width(25),
    borderRadius: width(1),
    backgroundColor: COLORS.lightGray,
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginRight: width(2),
    marginTop: width(2),
  },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginBottom: width(4),
  },
  row: {
    marginBottom: width(2),
  },
  optionWrapper: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(4),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 5,
  },
  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 11,
    color: COLORS.black,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    backgroundColor: '#8b8b8b66',
  },
  container: {
    height: '80%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(4),
    padding: width(4),
    marginBottom: width(3),
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    // marginVertical: width(3),
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 6,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.white,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ff295f3a',
  },
  selectedText: {
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 12,
  },
  removeBtn: {
    marginLeft: 6,
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    width: 15,
    height: 15,
    color: COLORS.white,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    paddingVertical: width(2),
  },
  buttonRowItem: {
    flex: 1,
    minWidth: 0,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 15,
    height: width(11),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#666',
  },
  applyText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: 'white',
  },
  termsLink: {
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
    textDecorationLine: 'underline',
  },
  termsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: width(5),
    paddingVertical: width(8),
  },
  termsModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: width(3),
    maxHeight: '88%',
    paddingBottom: width(3),
    overflow: 'hidden',
  },
  termsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width(4),
    paddingVertical: width(3),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  termsModalTitle: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    flex: 1,
    paddingRight: 8,
  },
  termsModalScroll: {
    paddingHorizontal: width(4),
    paddingTop: width(3),
  },
  termsModalBlock: {
    marginBottom: width(4),
  },
  termsModalSectionTitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  termsModalSectionNumber: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: 6,
  },
  termsModalBody: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.black,
    lineHeight: 18,
  },
  dateBox: {
    width: width(40),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: width(2),
    padding: width(3),
  },
  dateLabel: {
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  dateValue: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 13,
    color: COLORS.textDark,
  },
});

export default EventListingModal;

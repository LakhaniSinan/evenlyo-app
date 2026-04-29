import moment from 'moment';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Image,
  Keyboard,
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
import GradientText from '../gradiantText';
import GooglePlacesInput from '../locationField';
import Loader from '../loder';
import TextField from '../textInput';

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
  const modalRef = useRef(null);
  const pricingType = [
    {name: 'Per Hour'},
    {name: 'Per Day'},
    {name: 'Per Event'},
    {name: 'Fixed Price'},
  ];
  const daysData = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

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
          const priceType = pricingType.find(price => {
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
  }, [isVisible, toEditData, vendorsCategories]);

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
    } = formData;

    // ✅ Common Validation Helper
    const showError = message =>
      modalRef.current.show({status: 'error', message});

    // ✅ Validations
    if (!title.en.trim() && !title.nl.trim()) {
      return showError('Title is required');
    }
    if (!subTitle.en.trim() && !subTitle.nl.trim()) {
      return showError('SubTitle is required');
    }
    if (!mainCategory) {
      return showError('Main Category is required');
    }
    if (!subCategory) {
      return showError('Sub Category is required');
    }
    if (!description.en.trim() && !description.nl.trim()) {
      return showError('Description is required');
    }
    if (!pricingType) {
      return showError('Pricing Type is required');
    }
    if (!cost.trim()) {
      return showError('Cost is required');
    }
    if (availableDays.length === 0) {
      return showError('Select at least one available day');
    }
    if (!startTime) {
      return showError('Start Time is required');
    }
    if (!endTime) {
      return showError('End Time is required');
    }
    if (!selectedCoords) {
      return showError('Please select a valid location');
    }
    if (!termsAccepted) {
      return showError('You must agree to Terms & Conditions');
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

      console.log(response, 'responseresponseresponseresponseresponse');

      const isSuccess = response?.status === 200 || response?.status === 201;

      modalRef.current.show({
        status: isSuccess ? 'ok' : 'error',
        message: response?.data?.message,
        handlePressOk: () => {
          modalRef.current.hide();
          onClose();
          resetForm();
        },
      });
    } catch (error) {
      console.log('❌ handleSubmit error:', error);
      showError(
        currentLanguage == 'en'
          ? 'Something went wrong, please try again later'
          : 'Iets is misgegaan, probeer het opnieuw later.',
      );
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
            'Error',
            currentLanguage == 'en'
              ? response.errorMessage.en
              : response.errorMessage.nl,
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
            'Limit Reached',
            currentLanguage == 'en'
              ? 'You can upload a maximum of 3 images.'
              : 'Je kunt maximaal 3 afbeeldingen uploaden.',
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
            'Error',
            currentLanguage == 'en'
              ? 'Failed to upload images. Please try again.'
              : 'Fout bij het uploaden van afbeeldingen. Probeer het opnieuw.',
          );
        } finally {
          setIsLoading(false);
        }
      },
    );
  }, [formData]);

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
          <Text style={styles.title}>
            {currentLanguage == 'en'
              ? 'Add New Listing'
              : 'Nieuwe vermelding toevoegen'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* ScrollView */}
        <ScrollView style={{flex: 1}}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {currentLanguage == 'en'
                ? 'Basic Information'
                : 'Basis informatie'}
            </Text>

            <View style={styles.languageRow}>
              <Text style={styles.langLabel}>
                {currentLanguage == 'en'
                  ? 'Select Language:'
                  : 'Selecteer taal:'}
              </Text>
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
                  <Text style={styles.radioText}>
                    {currentLanguage == 'en' ? 'US English' : 'US Engels'}
                  </Text>
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
                  <Text style={styles.radioText}>
                    {currentLanguage == 'en' ? 'NL Dutch' : 'NL Nederlands'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dynamic Fields */}
            <TextField
              bgColor={COLORS.white}
              label={`Title (${currentLanguage == 'en' ? 'English' : 'Dutch'})`}
              placeholder={
                currentLanguage == 'en' ? 'Enter title' : 'Voer titel in'
              }
              value={formData.title[selectedLang]}
              onChangeText={v => handleTextChange('title', v)}
            />
            <View style={{height: 10}} />
            <TextField
              bgColor={COLORS.white}
              label={`Sub Title (${
                selectedLang === 'en' ? 'English' : 'Dutch'
              })`}
              placeholder={t('Enter subtitle')}
              value={formData.subTitle[selectedLang]}
              onChangeText={v => handleTextChange('subTitle', v)}
            />

            <DualLanguageCustomPicker
              label="Main Category"
              labelll="Select Main Category"
              dropdownContainerStyle={{backgroundColor: COLORS.white}}
              value={formData?.mainCategory}
              listData={vendorsCategories}
              name="mainCategory"
              handleSelectValue={handleSelectValue}
            />
            <DualLanguageCustomPicker
              label="Sub Category"
              labelll="Select Sub Category"
              dropdownContainerStyle={{backgroundColor: COLORS.white}}
              value={formData?.subCategory}
              listData={allSubCategories}
              name="subCategory"
              handleSelectValue={handleSelectValue}
            />

            <GooglePlacesInput
              selectedLocation={formData?.selectedCoords || ''}
              setSelectedLocation={v => handleSelectValue('selectedCoords', v)}
              placeholder="Enter Location"
              bgcolor={COLORS.white}
              showRightIcon={ICONS.locationIcon}
              lable="Add Location *"
            />

            <TextField
              bgColor={COLORS.white}
              label={`Description (${
                selectedLang === 'en' ? 'English' : 'Dutch'
              })`}
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
                  label="Pricing Type"
                  labelll="Pricing Type"
                  dropdownContainerStyle={{backgroundColor: COLORS.white}}
                  value={formData.pricingType}
                  listData={pricingType}
                  name="pricingType"
                  handleSelectValue={handleSelectValue}
                />
              </View>
              <View style={{width: width(40), marginTop: width(3)}}>
                <TextField
                  label={'Cost'}
                  placeholder={'Enter Cost'}
                  bgColor={COLORS.white}
                  value={formData.cost}
                  onChangeText={v => handleTextChange('cost', v)}
                />
              </View>
            </View>

            <TextField
              label={'Extra Time Cost'}
              placeholder={'Extra Time Cost'}
              bgColor={COLORS.white}
              value={formData.extraTimeCost}
              onChangeText={v => handleTextChange('extraTimeCost', v)}
            />

            <TextField
              label={'Per km (1)'}
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
                Security Fee (Non-living things only)
              </Text>
            </TouchableOpacity>

            {isCheck && (
              <TextField
                label={'Security Fee Amount'}
                placeholder={'Enter Security Fee Amount'}
                bgColor={COLORS.white}
                value={formData.securityFeeAmount}
                onChangeText={v => handleTextChange('securityFeeAmount', v)}
              />
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Gallery View')}</Text>

            <Text style={styles.sectionTitle}>{t('Images (Maximum 3)')}</Text>
            {renderUploadBox('Click to upload work Images', () =>
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
              {daysData.map(item => {
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
                        <Text style={{color: COLORS.white, fontWeight: 'bold'}}>
                          {item.toUpperCase()}
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
                <Text style={styles.dateLabel}>Start Time</Text>
                <Text style={styles.dateValue}>
                  {startTime
                    ? moment(startTime).format('hh:mm A')
                    : 'Select Time'}
                </Text>
              </TouchableOpacity>

              {/* End Date */}
              <TouchableOpacity
                style={styles.dateBox}
                onPress={() => setIsEndPickerOpen(true)}>
                <Text style={styles.dateLabel}>End Time</Text>
                <Text style={styles.dateValue}>
                  {endTime ? moment(endTime).format('hh:mm A') : 'Select Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Terms & Conditions */}
          <TouchableOpacity
            onPress={() =>
              setFormData(prev => ({
                ...prev,
                termsAccepted: !prev.termsAccepted,
              }))
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: width(3),
            }}>
            <View
              style={[
                styles.checkbox,
                formData.termsAccepted && styles.checkboxChecked,
              ]}>
              {formData.termsAccepted && (
                <Icon name="checkmark" size={16} color="white" />
              )}
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  color: COLORS.black,
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                }}>
                I agree to{' '}
              </Text>
              <TouchableOpacity>
                <GradientText
                  text={'Terms & Conditions'}
                  customStyles={styles.termsLink}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Buttons */}
        {!isKeyboardVisible && (
          <View style={styles.buttonRow}>
            <View style={{width: width(40)}}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
            <View style={{width: width(40)}}>
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
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    borderRadius: 20,
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {launchImageLibrary} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import {Rating} from 'react-native-ratings';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import CustomPicker from '../../../components/customPicker';
import Loader from '../../../components/loder';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {helper} from '../../../helper';
import {useTranslation} from '../../../hooks';
import {setUserData} from '../../../redux/slice/auth';
import {
  fetchSubCategoriesByCategoryIds,
  getCategories,
} from '../../../services/Categories';
import {updateVendorDetails} from '../../../services/Vendor';

function ProfileManagement({navigation, route}) {
  const {t, currentLanguage} = useTranslation();
  const data = route.params;
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.LoginSlice);

  const teamSizeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    address: '',
    tagline: {en: '', nl: ''},
    description: {en: '', nl: ''},
    businessImage: '',
    businessLogo: '',
    city: '',
    postalCode: '',
    cnicPassport: '',
    companyName: '',
    businessType: '',
    companyEmail: '',
    companyAddress: '',
    companyWebsite: '',
    selecctSizeRef: '',
    teamSize: '',
    category: '',
    subCategory: '',
    kvkNumber: '',
  });
  const [allCategories, setAllCategories] = useState([]);
  const [categorySubMap, setCategorySubMap] = useState({});
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedSubCategoryIds, setSelectedSubCategoryIds] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [hasHydratedSelections, setHasHydratedSelections] = useState(false);

  const workTypeOptions = useMemo(
    () => [
      {name: 'Single', label: t('Work type Single')},
      {name: 'Team', label: t('Work type Team')},
    ],
    [t],
  );

  const normalizeLocalizedValue = useCallback(value => {
    if (typeof value === 'string') {
      return {en: value, nl: ''};
    }
    return {
      en: value?.en || '',
      nl: value?.nl || '',
    };
  }, []);

  const handleLocalizedInputChange = useCallback((field, language, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value,
      },
    }));
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    const commonFields = {
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
      email: data?.email || '',
      contact: data?.contactNumber || data?.businessPhone || '',
      address: data?.address || '',
      tagline: normalizeLocalizedValue(data?.tagline),
      description: normalizeLocalizedValue(data?.description),
      businessImage: data?.businessImage || '',
      businessLogo: data?.businessLogo || '',
      city: data?.city || '',
      postalCode: data?.postalCode || '',
      cnicPassport: data?.passportNumber || '',
      category: data?.mainCategories || [],
      subCategory: data?.subCategories || [],
    };

    if (data?.accountType === 'business') {
      setFormData(prev => ({
        ...prev,
        ...commonFields,
        companyName: data?.businessName || '',
        businessType: data?.teamType || '',
        companyEmail: data?.businessEmail || '',
        companyAddress: data?.businessLocation || '',
        companyWebsite: data?.businessWebsite || '',
        selecctSizeRef: data?.teamType === 'Single' ? 'Single' : 'Team',
        teamSize: data?.teamSize || '',
        kvkNumber: data?.kvkNumber || '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        ...commonFields,
      }));
    }
  }, [data, normalizeLocalizedValue]);

  useEffect(() => {
    setSelectedCategoryIds(
      (data?.mainCategories || [])
        .map(item => String(item?._id || item?.id || ''))
        .filter(Boolean),
    );
    const uniqueSubIds = [
      ...new Set(
        (data?.subCategories || [])
          .map(item => String(item?._id || item?.id || ''))
          .filter(Boolean),
      ),
    ];
    setSelectedSubCategoryIds(uniqueSubIds);
    setHasHydratedSelections(true);
  }, [data?.mainCategories, data?.subCategories]);

  useEffect(() => {
    // Fallback: show existing selected subcategories from profile response
    // even before dependent subcategory API resolves.
    if (!data?.subCategories?.length) {
      return;
    }

    setCategorySubMap(prev => {
      const next = {...prev};
      data.subCategories.forEach(sub => {
        const mainId = String(sub?.mainCategory || '');
        if (!mainId) {
          return;
        }
        if (!next[mainId]) {
          next[mainId] = [];
        }
        const exists = next[mainId].some(
          item => String(item?._id || item?.id) === String(sub?._id || sub?.id),
        );
        if (!exists) {
          next[mainId].push(sub);
        }
      });
      return next;
    });
  }, [data?.subCategories]);

  const fetchAllMainCategories = useCallback(async () => {
    try {
      setIsCategoryLoading(true);
      const response = await getCategories();
      if (response?.status === 200 || response?.status === 201) {
        setAllCategories(response?.data?.data || []);
      } else {
        setAllCategories([]);
      }
    } catch (error) {
      setAllCategories([]);
      console.log('fetchAllMainCategories error', error);
    } finally {
      setIsCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllMainCategories();
  }, [fetchAllMainCategories]);

  useEffect(() => {
    const loadSubCategoriesBySelectedMain = async () => {
      if (!selectedCategoryIds.length) {
        setCategorySubMap({});
        if (hasHydratedSelections) {
          setSelectedSubCategoryIds([]);
        }
        return;
      }

      try {
        setIsCategoryLoading(true);
        const response = await fetchSubCategoriesByCategoryIds({
          categoryIds: selectedCategoryIds,
        });

        if (response?.status === 200 || response?.status === 201) {
          const mapped = {};
          (response?.data?.data || []).forEach(item => {
            mapped[String(item?._id || item?.id || '')] =
              item?.subcategories || [];
          });
          setCategorySubMap(prev => ({...prev, ...mapped}));

          const allowedSubIds = new Set(
            Object.values(mapped)
              .flat()
              .map(sub => String(sub?._id || sub?.id || ''))
              .filter(Boolean),
          );
          if (allowedSubIds.size > 0) {
            setSelectedSubCategoryIds(prev => {
              const fallbackFromProfile = (data?.subCategories || [])
                .map(item => String(item?._id || item?.id || ''))
                .filter(Boolean);
              const source = prev.length ? prev : fallbackFromProfile;
              return source.filter(id => allowedSubIds.has(String(id)));
            });
          }
        } else {
          setCategorySubMap(prev => prev);
        }
      } catch (error) {
        setCategorySubMap(prev => prev);
        console.log('loadSubCategoriesBySelectedMain error', error);
      } finally {
        setIsCategoryLoading(false);
      }
    };

    loadSubCategoriesBySelectedMain();
  }, [selectedCategoryIds, hasHydratedSelections, data?.subCategories]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);

  const handleSelectValue = useCallback((name, value) => {
    setFormData(prev => ({...prev, [name]: value?.name || value}));
  }, []);

  const getLocalizedName = useCallback(
    node => {
      if (!node?.name) {
        return t('Unnamed');
      }
      return currentLanguage === 'en'
        ? node?.name?.en || node?.name?.nl
        : node?.name?.nl || node?.name?.en;
    },
    [currentLanguage, t],
  );

  const handleToggleCategory = useCallback(categoryId => {
    const normalizedCategoryId = String(categoryId);
    setSelectedCategoryIds(prev => {
      const exists = prev.includes(normalizedCategoryId);
      return exists
        ? prev.filter(id => id !== normalizedCategoryId)
        : [...prev, normalizedCategoryId];
    });
  }, []);

  const handleToggleSubCategory = useCallback(subId => {
    const normalizedSubId = String(subId);
    setSelectedSubCategoryIds(prev => {
      const exists = prev.includes(normalizedSubId);
      return exists
        ? prev.filter(id => id !== normalizedSubId)
        : [...prev, normalizedSubId];
    });
  }, []);

  const renderBusinessFields = () => (
    <>
      <TextField
        label={t('Company Name')}
        placeholder={t('Company Name')}
        value={formData.companyName}
        onChangeText={val => handleInputChange('companyName', val)}
        bgColor={COLORS.backgroundLight}
      />

      {/* <TextField
        label={t('Business type')}
        placeholder={t('Business type')}
        value={formData.businessType}
        onChangeText={val => handleInputChange('businessType', val)}
        bgColor={COLORS.backgroundLight}
      /> */}

      <Spacing />

      <TextField
        label={t('Company Email Address')}
        placeholder={t('Company Email Address')}
        value={formData.companyEmail}
        onChangeText={val => handleInputChange('companyEmail', val)}
        bgColor={COLORS.backgroundLight}
        keyboardType="email-address"
      />

      <Spacing />

      <TextField
        label={t('Contact Number')}
        placeholder={t('Contact Number')}
        value={formData.contact}
        onChangeText={val => handleInputChange('contact', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />

      <TextField
        label={t('Company Address')}
        placeholder={t('Company Address')}
        value={formData.companyAddress}
        onChangeText={val => handleInputChange('companyAddress', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />

      <TextField
        label={t('Company Website')}
        placeholder={t('URL')}
        value={formData.companyWebsite}
        onChangeText={val => handleInputChange('companyWebsite', val)}
        bgColor={COLORS.backgroundLight}
        keyboardType="url"
      />
      <Spacing />

      <TextField
        label={t('KVK Number')}
        placeholder={t('KVK number')}
        value={formData.kvkNumber}
        onChangeText={val => handleInputChange('kvkNumber', val)}
        bgColor={COLORS.backgroundLight}
        keyboardType="numeric"
      />

      <Spacing />

      <CustomPicker
        ref={teamSizeRef}
        labelll={t('Your Work Type')}
        label={t('Your Work Type')}
        value={formData.selecctSizeRef}
        dropdownContainerStyle={{backgroundColor: COLORS.backgroundLight}}
        listData={workTypeOptions}
        name="selecctSizeRef"
        handleSelectValue={handleSelectValue}
      />

      <Spacing height={15} />

      <TextField
        label={t('Team Size')}
        placeholder={t('Number of team')}
        value={formData.teamSize}
        onChangeText={val =>
          handleInputChange('teamSize', val.replace(/[^0-9]/g, ''))
        }
        bgColor={COLORS.backgroundLight}
        keyboardType="numeric"
      />

      <Spacing />

      <TextField
        label={t('Tagline (English)')}
        placeholder={t('Add Why Choose Us (English)')}
        value={formData?.tagline?.en}
        onChangeText={val => handleLocalizedInputChange('tagline', 'en', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />

      <TextField
        label={t('Tagline (Dutch)')}
        placeholder={t('Add Why Choose Us (Dutch)')}
        value={formData?.tagline?.nl}
        onChangeText={val => handleLocalizedInputChange('tagline', 'nl', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />

      <TextField
        label={t('Description (English)')}
        placeholder={t(
          'Focused on creating vibes through immersive sound... (English)',
        )}
        value={formData?.description?.en}
        onChangeText={val =>
          handleLocalizedInputChange('description', 'en', val)
        }
        bgColor={COLORS.backgroundLight}
        multiline
        numberOfLines={3}
      />

      <Spacing />

      <TextField
        label={t('Description (Dutch)')}
        placeholder={t(
          'Focused on creating vibes through immersive sound... (Dutch)',
        )}
        value={formData?.description?.nl}
        onChangeText={val =>
          handleLocalizedInputChange('description', 'nl', val)
        }
        bgColor={COLORS.backgroundLight}
        multiline
        numberOfLines={3}
      />
    </>
  );

  const renderPersonalFields = () => (
    <>
      <TextField
        label={t('First Name')}
        placeholder={t('Enter First Name')}
        value={formData.firstName}
        onChangeText={val => handleInputChange('firstName', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />

      <TextField
        label={t('Last Name')}
        placeholder={t('Enter Last Name')}
        value={formData.lastName}
        onChangeText={val => handleInputChange('lastName', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />

      <TextField
        label={t('Email Address')}
        placeholder={t('Enter Email')}
        value={formData.email}
        onChangeText={val => handleInputChange('email', val)}
        bgColor={COLORS.backgroundLight}
        keyboardType="email-address"
      />

      <Spacing />

      <TextField
        label={t('Phone Number')}
        placeholder={t('00000******')}
        value={formData.contact}
        onChangeText={val => handleInputChange('contact', val)}
        bgColor={COLORS.backgroundLight}
      />
      <Spacing />

      <TextField
        label={t('City')}
        placeholder={t('Enter City')}
        value={formData.city}
        onChangeText={val => handleInputChange('city', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />

      <TextField
        label={t('Postal Code')}
        placeholder={t('Enter Postal Code')}
        value={formData.postalCode}
        onChangeText={val => handleInputChange('postalCode', val)}
        bgColor={COLORS.backgroundLight}
        keyboardType="numeric"
      />

      <Spacing />

      <TextField
        label={t('Address')}
        placeholder={t('Enter Address')}
        value={formData.address}
        onChangeText={val => handleInputChange('address', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />

      <TextField
        label={t('CNIC / Passport Details')}
        placeholder={t('Enter CNIC / Passport Details')}
        value={formData.cnicPassport}
        onChangeText={val => handleInputChange('cnicPassport', val)}
        bgColor={COLORS.backgroundLight}
        keyboardType="numeric"
      />

      <Spacing />

      <TextField
        label={t('Tagline (English)')}
        placeholder={t('Add Why Choose Us (English)')}
        value={formData?.tagline?.en}
        onChangeText={val => handleLocalizedInputChange('tagline', 'en', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />
      <TextField
        label={t('Tagline (Dutch)')}
        placeholder={t('Add Why Choose Us (Dutch)')}
        value={formData?.tagline?.nl}
        onChangeText={val => handleLocalizedInputChange('tagline', 'nl', val)}
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />
      <TextField
        label={t('Description (English)')}
        placeholder={t(
          'Focused on creating vibes through immersive sound... (English)',
        )}
        value={formData?.description?.en}
        onChangeText={val =>
          handleLocalizedInputChange('description', 'en', val)
        }
        bgColor={COLORS.backgroundLight}
        multiline
        numberOfLines={3}
      />

      <Spacing />

      <TextField
        label={t('Description (Dutch)')}
        placeholder={t(
          'Focused on creating vibes through immersive sound... (Dutch)',
        )}
        value={formData?.description?.nl}
        onChangeText={val =>
          handleLocalizedInputChange('description', 'nl', val)
        }
        bgColor={COLORS.backgroundLight}
        multiline
        numberOfLines={3}
      />
    </>
  );

  const CategorySelectionEditor = memo(() => (
    <View style={styles.selectionContainer}>
      <Text style={styles.selectionTitle}>
        {t('Categories & Subcategories')}
      </Text>
      <Text style={styles.selectionSubtitle}>
        {t(
          'Select categories and subcategories that best describe your services.',
        )}
      </Text>

      {allCategories.map(category => {
        const categoryId = category?._id;
        const isCategorySelected = selectedCategoryIds.includes(categoryId);
        const subcategories = categorySubMap[categoryId] || [];
        const selectedCount = subcategories.filter(sub =>
          selectedSubCategoryIds.includes(String(sub?._id || sub?.id || '')),
        ).length;

        return (
          <View key={categoryId} style={styles.selectionCard}>
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionBadge}>{t('MAIN CATEGORY')}</Text>
              {isCategorySelected && (
                <Text style={styles.selectionCountText}>
                  {`${selectedCount} ${t('subcategories selected')}`}
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => handleToggleCategory(categoryId)}
              style={[
                styles.mainCategoryChip,
                isCategorySelected
                  ? styles.selectedMainCategoryChip
                  : styles.unselectedMainCategoryChip,
              ]}>
              <Text
                style={[
                  styles.mainCategoryText,
                  isCategorySelected && styles.selectedChipText,
                ]}>
                {getLocalizedName(category)}
              </Text>
            </TouchableOpacity>

            {isCategorySelected && subcategories.length > 0 && (
              <>
                <View style={styles.subCategoryHeadingWrapper}>
                  <Text style={styles.subCategoryBadge}>
                    {t('SUBCATEGORIES')}
                  </Text>
                </View>
                <View style={styles.subCategoryChipWrapper}>
                  {subcategories.map(sub => {
                    const normalizedSubId = String(sub?._id || sub?.id || '');
                    const isSubSelected =
                      normalizedSubId &&
                      selectedSubCategoryIds.includes(normalizedSubId);
                    return (
                      <TouchableOpacity
                        key={normalizedSubId}
                        onPress={() => handleToggleSubCategory(normalizedSubId)}
                        style={[
                          styles.subCategoryChip,
                          isSubSelected
                            ? styles.selectedSubCategoryChip
                            : styles.unselectedSubCategoryChip,
                        ]}>
                        <Text
                          style={[
                            styles.subCategoryText,
                            isSubSelected && styles.selectedChipText,
                          ]}>
                          {getLocalizedName(sub)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        );
      })}
    </View>
  ));

  const handleUpdate = useCallback(
    async (overrideData = {}, isPartial = false) => {
      const dataToUse = {...formData, ...overrideData};
      const categoryIdsForPayload = selectedCategoryIds;
      const subCategoryIdsForPayload = selectedSubCategoryIds;

      if (!isPartial) {
        if (!categoryIdsForPayload.length) {
          modalRef.current?.show({
            status: 'error',
            message: t('Please select at least one main category.'),
          });
          return;
        }

        const hasInvalidSelection = categoryIdsForPayload.some(categoryId => {
          const mappedSubCategories = categorySubMap[categoryId] || [];
          if (!mappedSubCategories.length) {
            return false;
          }
          return !mappedSubCategories.some(sub =>
            subCategoryIdsForPayload.includes(
              String(sub?._id || sub?.id || ''),
            ),
          );
        });

        if (hasInvalidSelection) {
          modalRef.current?.show({
            status: 'error',
            message: t(
              'Please select at least one subcategory for every selected main category.',
            ),
          });
          return;
        }
      }

      try {
        setIsLoading(true);

        let payload = {};

        if (data?.accountType === 'business') {
          payload = {
            accountType: 'business',
            businessName: dataToUse.companyName,
            businessEmail: dataToUse.companyEmail,
            businessPhone: dataToUse.contact,
            businessWebsite: dataToUse.companyWebsite,
            businessLocation: dataToUse.companyAddress,
            businessLogo: dataToUse.businessLogo,
            businessImage: dataToUse.businessImage,
            description: dataToUse.description,
            teamSize: dataToUse.teamSize,
            kvkNumber: dataToUse.kvkNumber,
            mainCategories: categoryIdsForPayload,
            subCategories: subCategoryIdsForPayload,
            tagline: dataToUse.tagline,
          };
        } else {
          payload = {
            accountType: 'personal',
            firstName: dataToUse.firstName,
            lastName: dataToUse.lastName,
            email: dataToUse.email,
            contactNumber: dataToUse.contact,
            address: dataToUse.address,
            passportNumber: dataToUse.cnicPassport,
            postalCode: dataToUse.postalCode,
            city: dataToUse.city,
            businessLogo: dataToUse.businessLogo,
            businessImage: dataToUse.businessImage,
            mainCategories: categoryIdsForPayload,
            subCategories: subCategoryIdsForPayload,
            tagline: dataToUse.tagline,
            description: dataToUse.description,
          };
        }

        const response = await updateVendorDetails(payload);

        if (response?.status === 200 || response?.status === 201) {
          const updatedUser = {
            ...(user || {}),
            email: dataToUse.companyEmail || dataToUse.email || user?.email,
            mainCategories: categoryIdsForPayload,
            subCategories: subCategoryIdsForPayload,
            businessName: dataToUse.companyName || user?.businessName,
            vendorDetails: {
              ...(user?.vendorDetails || {}),
              businessLogo:
                dataToUse.businessLogo ||
                user?.vendorDetails?.businessLogo ||
                null,
            },
          };
          dispatch(setUserData(updatedUser));
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));

          modalRef.current?.show({
            status: 'ok',
            message: response?.data?.message?.en
              ? currentLanguage === 'en'
                ? response.data.message.en
                : response.data.message.nl
              : response?.data?.message || t('Profile updated successfully.'),
          });
        } else {
          modalRef.current?.show({
            status: 'error',
            message:
              response?.data?.message ||
              t('Failed to update profile. Please try again.'),
          });
        }
      } catch (error) {
        console.error('handleUpdate error:', error);
        modalRef.current?.show({
          status: 'error',
          message: t('Failed to update vendor.'),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData,
      data,
      selectedCategoryIds,
      selectedSubCategoryIds,
      categorySubMap,
      user,
      dispatch,
      t,
      currentLanguage,
    ],
  );

  const handleImageUpload = useCallback(
    async field => {
      launchImageLibrary({mediaType: 'photo', selectionLimit: 1}, async res => {
        if (res.didCancel || res.errorCode) {
          if (res.errorMessage) {
            Alert.alert(t('Error'), res.errorMessage);
          }
          return;
        }

        const asset = res.assets?.[0];
        if (!asset) {
          return;
        }

        const file = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `upload.${asset.type?.split('/')[1]}`,
        };

        try {
          setIsLoading(true);
          const uploaded = await helper.uploadMediaToCloudinary(file);
          const uploadedUrl = uploaded?.secure_url || uploaded?.secureUrl;
          if (!uploadedUrl) {
            throw new Error('Upload failed');
          }

          // update local state
          handleInputChange(field, uploadedUrl);

          // auto update vendor image
          await handleUpdate({[field]: uploadedUrl}, true);
        } catch (err) {
          console.error('Upload error:', err);
          Alert.alert(
            t('Error'),
            t('Failed to upload image. Please try again.'),
          );
        } finally {
          setIsLoading(false);
        }
      });
    },
    [handleInputChange, handleUpdate, t],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={t('Profile Management')}
        rightIcon={user?.userType !== 'vendor' ? ICONS.chatIcon : null}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => navigation.navigate('Messages')}
        containerStyle={{marginVertical: 10}}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground
          resizeMode="cover"
          source={{uri: formData.businessImage || data.businessImage}}
          style={styles.coverImage}>
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity
            style={styles.cameraButtonTop}
            onPress={() => handleImageUpload('businessImage')}>
            <GradientCircleIcon />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={
                  formData.businessLogo
                    ? {uri: formData.businessLogo}
                    : IMAGES.coverImage1
                }
                style={styles.logoImage}
              />
              <TouchableOpacity
                style={styles.cameraButtonBottom}
                onPress={() => handleImageUpload('businessLogo')}>
                <GradientCircleIcon />
              </TouchableOpacity>
            </View>

            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>
                {formData.companyName ||
                  `${formData.firstName || ''} ${
                    formData.lastName || ''
                  }`.trim()}
              </Text>

              <View style={styles.ratingContainer}>
                <Rating count={5} defaultRating={4} imageSize={12} readonly />
                <Text style={styles.ratingText}>4.5 (127 {t('reviews')})</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        <KeyboardAvoidingView>
          <View style={styles.form}>
            {data?.accountType == 'business'
              ? renderBusinessFields()
              : renderPersonalFields()}
          </View>
        </KeyboardAvoidingView>
        <Spacing />
        <CategorySelectionEditor />
        <Spacing />

        <View style={styles.footer}>
          <GradientButton
            text={t('Save & Changes')}
            onPress={() => handleUpdate()}
            styleContainer={styles.saveButtonContainer}
            styleProps={styles.saveButtonInner}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Spacing = ({height = 10}) => <View style={{height}} />;

const GradientCircleIcon = () => (
  <LinearGradient colors={['#FF7E5F', '#FD3A84']} style={styles.gradientCircle}>
    <SimpleLineIcons name="camera" size={20} color={COLORS.black} />
  </LinearGradient>
);

export default ProfileManagement;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},
  coverImage: {
    height: width(50),
    marginHorizontal: 10,
    borderRadius: 15,
  },
  cameraButtonTop: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  cameraButtonBottom: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    zIndex: 9999,
  },
  gradientCircle: {
    height: width(10),
    width: width(10),
    borderRadius: width(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -80,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    height: width(25),
    flex: 1,
  },
  logoWrapper: {
    borderWidth: 2,
    borderColor: COLORS.white,
    height: width(25),
    width: width(25),
    borderRadius: width(12.5),
    marginBottom: width(10),
    overflow: 'visible', // ✅ Allow button to be clickable outside the border
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoImage: {
    height: '100%',
    width: '100%',
    borderRadius: 100,
  },
  businessInfo: {
    marginLeft: width(4),
  },
  businessName: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  businessMeta: {
    color: COLORS.textLight,
    fontSize: 13,
    marginVertical: 2,
  },
  ratingContainer: {flexDirection: 'row', alignItems: 'center'},
  ratingText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    fontSize: 12,
    marginLeft: 5,
  },
  form: {marginTop: width(20), marginHorizontal: width(5)},
  footer: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  saveButtonContainer: {
    height: width(11),
  },
  saveButtonInner: {
    flex: 1,
    paddingVertical: 0,
  },
  selectionContainer: {
    marginHorizontal: width(3),
  },
  selectionTitle: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  selectionSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 6,
    marginBottom: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  selectionCard: {
    backgroundColor: '#F6F7F9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectionBadge: {
    fontSize: 10,
    color: '#5D6C7E',
    backgroundColor: '#E7EBEF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    fontFamily: fontFamly.PlusJakartaSansBold,
    overflow: 'hidden',
  },
  selectionCountText: {
    fontSize: 10,
    color: COLORS.primary,
    marginLeft: 8,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  mainCategoryChip: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  selectedMainCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  unselectedMainCategoryChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#D9DDE3',
  },
  mainCategoryText: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  subCategoryHeadingWrapper: {
    marginTop: 12,
    marginBottom: 6,
  },
  subCategoryBadge: {
    fontSize: 10,
    color: '#3F76D2',
    backgroundColor: '#E7F0FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    fontFamily: fontFamly.PlusJakartaSansBold,
    overflow: 'hidden',
  },
  subCategoryChipWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subCategoryChip: {
    minHeight: 32,
    borderRadius: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSubCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  unselectedSubCategoryChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#D9DDE3',
  },
  subCategoryText: {
    fontSize: 11,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  selectedChipText: {
    color: COLORS.white,
  },
  categoryContainer: {
    paddingHorizontal: width(4),
  },
  categoryHeading: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: width(2),
  },
  categoryWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    height: width(10),
    borderRadius: 100,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width(4),
    margin: width(1),
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.black,
  },
});

import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
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

import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CustomPicker from '../../../components/customPicker';
import Loader from '../../../components/loder';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {helper} from '../../../helper';
import {useTranslation} from '../../../hooks';
import {updateVendorDetails} from '../../../services/Vendor';

function ProfileManagement({navigation, route}) {
  const {t, currentLanguage} = useTranslation();
  const data = route.params;
  console.log(data, 'datadatadatadatadatadatadata');

  const workTypeRef = useRef(null);
  const teamSizeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

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
    teamWorkRef: '',
    category: '',
    subCategory: '',
    kvkNumber: '',
  });

  useEffect(() => {
    if (!data) {return;}

    const commonFields = {
      firstName: data?.firstName || '',
      lastName: data?.lastName || '',
      email: data?.email || '',
      contact: data?.contactNumber || data?.businessPhone || '',
      address: data?.address || '',
      tagline: {
        en: data?.tagline?.en || '',
        nl: data?.tagline?.nl || '',
      },
      description: {
        en: data?.description?.en || '',
        nl: data?.description?.nl || '',
      },
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
        teamWorkRef: data?.teamSize || '',
        kvkNumber: data?.kvkNumber || '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        ...commonFields,
      }));
    }
  }, [data]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);

  const handleSelectValue = useCallback((name, value) => {
    setFormData(prev => ({...prev, [name]: value?.name || value}));
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
        labelll="Your Work Type"
        label="Your Work Type"
        value={formData.selecctSizeRef}
        dropdownContainerStyle={{backgroundColor: COLORS.backgroundLight}}
        listData={[{name: 'Single'}, {name: 'Team'}]}
        name="selecctSizeRef"
        handleSelectValue={handleSelectValue}
      />

      <Spacing height={15} />

      <CustomPicker
        ref={workTypeRef}
        labelll="Selection"
        label="Selection"
        value={formData.teamWorkRef}
        dropdownContainerStyle={{backgroundColor: COLORS.backgroundLight}}
        listData={[
          {name: "It's Just Me"},
          {name: '1-5'},
          {name: '11-20'},
          {name: '21-50'},
          {name: '51-100'},
          {name: '101-200'},
          {name: '201-500'},
          {name: '501-1000'},
          {name: '1001-2000'},
        ]}
        name="teamWorkRef"
        handleSelectValue={handleSelectValue}
      />

      <Spacing />

      {/* Tagline */}
      <TextField
        label={t('Tagline')}
        placeholder={t('Add Why Choose Us')}
        value={
          currentLanguage === 'en'
            ? formData?.tagline?.en
            : formData?.tagline?.nl
        }
        onChangeText={val =>
          setFormData(prev => ({
            ...prev,
            tagline: {
              ...prev.tagline,
              [currentLanguage]: val,
            },
          }))
        }
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />

      {/* Description */}
      <TextField
        label={t('Description')}
        placeholder={t('Focused on creating vibes through immersive sound...')}
        value={
          currentLanguage === 'en'
            ? formData?.description?.en
            : formData?.description?.nl
        }
        onChangeText={val =>
          setFormData(prev => ({
            ...prev,
            description: {
              ...prev.description,
              [currentLanguage]: val,
            },
          }))
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
        label={t('Tagline')}
        placeholder={t('Add Why Choose Us')}
        value={
          currentLanguage === 'en'
            ? formData?.tagline?.en
            : formData?.tagline?.nl
        }
        onChangeText={val =>
          setFormData(prev => ({
            ...prev,
            tagline: {
              ...prev.tagline,
              [currentLanguage]: val,
            },
          }))
        }
        bgColor={COLORS.backgroundLight}
      />

      <Spacing />
      <TextField
        label={t('Description')}
        placeholder={t('Focused on creating vibes through immersive sound...')}
        value={
          currentLanguage === 'en'
            ? formData?.description?.en
            : formData?.description?.nl
        }
        onChangeText={val =>
          setFormData(prev => ({
            ...prev,
            description: {
              ...prev.description,
              [currentLanguage]: val,
            },
          }))
        }
        bgColor={COLORS.backgroundLight}
        multiline
        numberOfLines={3}
      />
    </>
  );

  const MainCategoryList = memo(({data, currentLanguage}) => {
    if (!data?.mainCategories?.length) {return null;}

    return (
      <>
        <Spacing />
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryHeading}>Main category</Text>
          <View style={styles.categoryWrapper}>
            {data.mainCategories.map((item, index) => (
              <View key={item?._id || index} style={styles.categoryChip}>
                <Text style={styles.categoryText}>
                  {currentLanguage === 'en'
                    ? item?.name?.en || 'Unnamed'
                    : item?.name?.nl || 'Unnamed'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </>
    );
  });

  const SubCategoryList = memo(({data, currentLanguage}) => {
    if (!data?.subCategories?.length) {return null;}

    return (
      <>
        <Spacing />
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryHeading}>Sub category</Text>
          <View style={styles.categoryWrapper}>
            {data.subCategories.map((item, index) => (
              <View key={item?._id || index} style={styles.categoryChip}>
                <Text style={styles.categoryText}>
                  {currentLanguage === 'en'
                    ? item?.name?.en || 'Unnamed'
                    : item?.name?.nl || 'Unnamed'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </>
    );
  });

  // =================== IMAGE UPLOAD & AUTO UPDATE ===================
  const handleImageUpload = useCallback(
    async field => {
      launchImageLibrary({mediaType: 'photo', selectionLimit: 1}, async res => {
        if (res.didCancel || res.errorCode) {
          if (res.errorMessage) {Alert.alert('Error', res.errorMessage);}
          return;
        }

        const asset = res.assets?.[0];
        if (!asset) {return;}

        const file = {
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `upload.${asset.type?.split('/')[1]}`,
        };

        try {
          setIsLoading(true);
          const uploaded = await helper.uploadMediaToCloudinary(file);
          const uploadedUrl = uploaded?.secure_url || uploaded?.secureUrl;
          if (!uploadedUrl) {throw new Error('Upload failed');}

          // update local state
          handleInputChange(field, uploadedUrl);

          // auto update vendor image
          await handleUpdate({
            [field]: uploadedUrl, // only update the changed field
          });
        } catch (err) {
          console.error('Upload error:', err);
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
          setIsLoading(false);
        }
      });
    },
    [handleInputChange],
  );

  // =================== HANDLE UPDATE ===================
  const handleUpdate = useCallback(
    async (overrideData = {}) => {
      try {
        setIsLoading(true);

        const mergedData = {...formData, ...overrideData};
        let payload = {};

        if (data?.accountType === 'business') {
          payload = {
            accountType: 'business',
            businessName: mergedData.companyName,
            businessEmail: mergedData.companyEmail,
            businessPhone: mergedData.contact,
            businessWebsite: mergedData.companyWebsite,
            businessLocation: mergedData.companyAddress,
            businessLogo: mergedData.businessLogo,
            businessImage: mergedData.businessImage,
            description: mergedData.description,
            teamSize: mergedData.teamWorkRef,
            kvkNumber: mergedData.kvkNumber,
            mainCategories: mergedData.category || data?.mainCategories,
            subCategories: mergedData.subCategory || data?.subCategories,
            tagline: mergedData.tagline,
          };
        } else {
          payload = {
            accountType: 'personal',
            firstName: mergedData.firstName,
            lastName: mergedData.lastName,
            email: mergedData.email,
            contactNumber: mergedData.contact,
            address: mergedData.address,
            passportNumber: mergedData.cnicPassport,
            postalCode: mergedData.postalCode,
            city: mergedData.city,
            businessLogo: mergedData.businessLogo,
            businessImage: mergedData.businessImage,
            mainCategories: mergedData.category || data?.mainCategories,
            subCategories: mergedData.subCategory || data?.subCategories,
            tagline: mergedData.tagline,
            description: mergedData.description,
          };
        }

        console.log('Updating vendor with payload:', payload);
        const response = await updateVendorDetails(payload);
        console.log(response, 'responseresponseresponseresponseresponseasdasdasdasdasd');

        if (response?.success) {
          Alert.alert('Success', 'Profile updated successfully.');
        } else {
          Alert.alert('Error', response?.message || 'Something went wrong.');
        }
      } catch (error) {
        console.error('handleUpdate error:', error);
        Alert.alert('Error', 'Failed to update vendor.');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, data],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Loader isLoading={isLoading} />
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={t('Profile Management')}
        rightIcon={ICONS.chatIcon}
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

            {/* <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{formData.name}</Text>
              <Text style={styles.businessMeta}>
                10k {t('followers')} • 200-500 {t('employees')}
              </Text>
              <View style={styles.ratingContainer}>
                <Rating count={5} defaultRating={4} imageSize={12} readonly />
                <Text style={styles.ratingText}>4.5 (127 {t('reviews')})</Text>
              </View>
            </View> */}
          </View>
        </ImageBackground>

        <KeyboardAvoidingView>
          <View style={styles.form}>
            {data?.accountType == 'business'
              ? renderBusinessFields()
              : renderPersonalFields()}
          </View>
        </KeyboardAvoidingView>
        <MainCategoryList data={data} currentLanguage={currentLanguage} />
        <SubCategoryList data={data} currentLanguage={currentLanguage} />
        <Spacing />

        <View style={styles.footer}>
          <GradientButton text={'Save & Change'} />
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
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    flex: 1,
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
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(10),
    gap: 10,
    justifyContent: 'flex-end',
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

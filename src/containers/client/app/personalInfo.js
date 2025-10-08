import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {launchImageLibrary} from 'react-native-image-picker';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import TextField from '../../../components/textInput';
import {COLORS, SIZES} from '../../../constants';
import {helper} from '../../../helper';
import useProfile from '../../../hooks/getProfileData';
import {updateProfilePicture} from '../../../services/Media';
import {updateProfile} from '../../../services/Settings';

const PersonalInfo = ({navigation}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const {profileData, fetchProfile} = useProfile();

  useEffect(() => {
    handleGetProfile();
  }, []);

  const handleGetProfile = async () => {
    setIsLoading(true);
    await fetchProfile();
    setIsLoading(false);
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData?.firstName || 'N/A',
        lastName: profileData?.lastName || 'N/A',
        email: profileData?.email || 'N/A',
        contactNumber: profileData?.contactNumber || '',
        address: profileData?.address?.fullAddress || 'N/A',
      });
    }
  }, [profileData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const validateFields = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Enter a valid email';
    if (!formData.contactNumber.trim()) return 'Contact number is required';
    if (!formData.address.trim()) return 'Address is required';
    return null;
  };

  const handleSave = async () => {
    const errorMsg = validateFields();
    if (errorMsg) {
      modalRef.current?.show({status: 'error', message: errorMsg});
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        address: {
          city: '',
          postalCode: '',
          fullAddress: formData.address,
        },
      };
      console.log(payload, 'payloadpayloadpayload');

      const response = await updateProfile(payload);
      console.log(response, 'responseresponseresponseresponse');

      if (response?.status === 200 || response?.status === 201) {
        modalRef.current?.show({
          status: 'ok',
          message: response?.data?.message,
        });
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerror233253465');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateImage = () => {
    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      const asset = response.assets?.[0];
      if (!asset) return;

      const file = {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || `upload.${asset.type.split('/')[1]}`,
      };

      try {
        setIsLoading(true);

        const result = await helper.uploadMediaToCloudinary(file);

        if (result?.secure_url) {
          const res = await updateProfilePicture({
            profilePicture: result.secure_url,
          });
          setIsLoading(false);
          return;
          if (res?.status === 200 || res?.status === 201) {
            modalRef.current?.show({
              status: 'ok',
              message:
                res?.data?.message || 'Profile picture updated successfully',
            });
          } else {
            modalRef.current?.show({
              status: 'error',
              message: res?.data?.message || 'Failed to upload profile picture',
            });
          }
        } else {
          console.log('Image upload failed');
        }
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setIsLoading(false);
      }
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          onLeftIconPress={() => navigation.goBack()}
          headingText={t('Personal Info')}
        />

        <ImageBackground
          source={IMAGES.avatarIcon}
          style={{
            marginTop: width(4),
            height: 100,
            width: 100,
            alignSelf: 'center',
            borderRadius: 100,
            position: 'relative',
          }}>
          <TouchableOpacity
            onPress={handleUpdateImage}
            style={{
              height: width(7),
              width: width(7),
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.primary,
              position: 'absolute',
              bottom: 5,
              right: 5,
            }}>
            <Image
              resizeMode="contain"
              source={ICONS.cameraIcon}
              style={{height: '50%', width: '50%'}}
            />
          </TouchableOpacity>
        </ImageBackground>

        {/* Form Fields */}
        <View style={styles.form}>
          <TextField
            label={t('firstName')}
            placeholder={t('firstNamePlaceholder')}
            value={formData.firstName}
            onChangeText={val => handleInputChange('firstName', val)}
          />

          <View style={{height: 10}} />
          <TextField
            label={t('lastName')}
            placeholder={t('lastNamePlaceholder')}
            value={formData.lastName}
            onChangeText={val => handleInputChange('lastName', val)}
          />

          <View style={{height: 10}} />
          <TextField
            label={t('emailAddress')}
            placeholder={t('emailPlaceholder')}
            value={formData.email}
            onChangeText={val => handleInputChange('email', val)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{height: 10}} />

          <TextField
            label={t('contactNumber')}
            placeholder={t('+123 456 7890')}
            value={formData.contactNumber}
            onChangeText={val => handleInputChange('contactNumber', val)}
            keyboardType="numaric"
            autoCapitalize="none"
          />

          <View style={{height: 10}} />
          <TextField
            label={t('Address')}
            placeholder={t('Enter your address')}
            value={formData.address}
            onChangeText={val => handleInputChange('address', val)}
          />
        </View>

        {/* Save Button */}
        <View style={styles.btnContainer}>
          <GradientButton
            text={t('Save Change')}
            onPress={handleSave}
            disabled={isLoading}
          />
        </View>
      </ScrollView>

      {/* Global Components */}
      <CommonAlert ref={modalRef} />
      <Loader isLoading={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: SIZES.lg,
    marginTop: 20,
    marginHorizontal: 10,
  },
  btnContainer: {
    marginHorizontal: 10,
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
});

export default PersonalInfo;

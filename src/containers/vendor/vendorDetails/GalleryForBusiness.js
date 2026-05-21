import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {launchImageLibrary} from 'react-native-image-picker';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {helper} from '../../../helper';
import {useTranslation} from '../../../hooks';

const MultipleMediaUpload = ({media, onPressBack, handleNextStep}) => {
  const [businessLogo, setBusinessLogo] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation();
  const modalRef = useRef(null);

  useEffect(() => {
    if (media) {
      setBannerImage(media?.banner);
      setBusinessLogo(media?.workImages);
    }
  }, [media]);

  const showError = message => {
    modalRef.current?.show({status: 'error', message});
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: t('storagePermissionTitle'),
          message: t('storagePermissionMessage'),
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleUpload = async setter => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      return;
    }

    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.didCancel || response.errorCode) {
        if (response.errorMessage) {
          showError(response.errorMessage);
        }
        return;
      }
      const asset = response?.assets[0];
      if (!asset) {
        return;
      }
      const file = {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || `upload.${asset.type.split('/')[1]}`,
      };
      try {
        setIsLoading(true);
        const uploadRes = await helper.uploadMediaToCloudinary(file);
        if (uploadRes?.secure_url) {
          setter(uploadRes?.secure_url);
        } else {
          showError(t('imageUploadFailed'));
        }
      } catch (err) {
        console.log('Upload error:', err);
        showError(t('Something went wrong'));
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleRemove = setter => setter('');

  const renderUploadBox = (label, onPress) => (
    <TouchableOpacity style={styles.uploadBox} onPress={onPress}>
      <Image source={ICONS.uploadIcon} style={styles.uploadIcon} />
      <Text style={styles.uploadText}>{label}</Text>
    </TouchableOpacity>
  );

  const handleContinue = () => {
    handleNextStep({
      businessLogo,
      bannerImage,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {t('vendorUploadMediaTitle')}{' '}
        <Text style={styles.optionalText}>{t('vendorUploadMediaOptional')}</Text>
      </Text>

      <Text style={styles.sectionTitle}>{t('vendorLogoSection')}</Text>
      {businessLogo ? (
        <View style={styles.logoPreviewContainer}>
          <Image
            source={{uri: businessLogo}}
            resizeMode="cover"
            style={styles.logoPreview}
          />
          <TouchableOpacity
            style={styles.removeButtonLogo}
            onPress={() => handleRemove(setBusinessLogo)}>
            <Image
              source={ICONS.redcross}
              resizeMode="cover"
              style={styles.removeIcon}
            />
          </TouchableOpacity>
        </View>
      ) : (
        renderUploadBox(t('vendorClickUploadLogo'), () =>
          handleUpload(setBusinessLogo),
        )
      )}
      <Text style={styles.sectionTitle}>{t('vendorBannerSection')}</Text>
      {bannerImage ? (
        <View style={styles.logoPreviewContainer}>
          <Image
            source={{uri: bannerImage}}
            resizeMode="cover"
            style={styles.logoPreview}
          />
          <TouchableOpacity
            style={styles.removeButtonLogo}
            onPress={() => handleRemove(setBannerImage)}>
            <Image
              source={ICONS.redcross}
              resizeMode="cover"
              style={styles.removeIcon}
            />
          </TouchableOpacity>
        </View>
      ) : (
        renderUploadBox(t('vendorClickUploadBanner'), () =>
          handleUpload(setBannerImage),
        )
      )}

      <View style={styles.buttonContainer}>
        <GradientButton
          text={t('back')}
          useGradient
          onPress={onPressBack}
          type="outline"
          gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          icon={ICONS.backIcon}
          styleProps={{flex: 1}}
          outlineButtonStyle={{flex: 1, paddingVertical: 0}}
          styleContainer={styles.backButton}
        />
        <GradientButton
          text={t('continue')}
          onPress={handleContinue}
          type="filled"
          gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          styleProps={{flex: 1}}
          loading={isLoading}
          styleContainer={styles.continueButton}
        />
      </View>
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: width(10),
    paddingHorizontal: width(4),
  },
  title: {
    fontSize: 20,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginVertical: width(4),
    textAlign: 'center',
  },
  optionalText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    marginBottom: width(2),
    marginTop: width(3),
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: width(2),
    paddingVertical: width(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: width(4),
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
  logoPreviewContainer: {
    alignSelf: 'center',
    marginBottom: width(4),
    position: 'relative',
  },
  logoPreview: {
    width: width(60),
    height: width(30),
    borderRadius: width(3),
    backgroundColor: COLORS.lightGray,
  },
  removeButtonLogo: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 2,
  },
  removeIcon: {
    width: 15,
    height: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(8),
    gap: 10,
    justifyContent: 'flex-end',
  },
  backButton: {
    flex: 1,
    width: undefined,
    height: width(11),
  },
  continueButton: {
    flex: 1,
    width: undefined,
    height: width(11),
  },
});

export default MultipleMediaUpload;

import React, {useEffect, useState} from 'react';
import {
  Alert,
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
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {helper} from '../../../helper';
import {useTranslation} from '../../../hooks';

const MultipleMediaUpload = ({media, onPressBack, handleNextStep}) => {
  const [businessLogo, setBusinessLogo] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {t} = useTranslation();

  useEffect(() => {
    if (media) {
      setBannerImage(media?.banner);
      setBusinessLogo(media?.workImages);
    }
  }, [media]);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'App needs access to your storage to select media',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleUpload = async setter => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.didCancel || response.errorCode) {
        if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
        }
        return;
      }
      const asset = response?.assets[0];
      if (!asset) return;
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
          Alert.alert('Error', 'Image upload failed. Please try again.');
        }
      } catch (err) {
        console.log('Upload error:', err);
        Alert.alert('Error', 'Something went wrong during upload.');
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
    if (!businessLogo) {
      Alert.alert('Error', 'Please upload your business logo.');
      return;
    }
    if (!bannerImage) {
      Alert.alert('Error', 'Please upload your banner image.');
      return;
    }

    handleNextStep({
      businessLogo,
      bannerImage,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        Upload Your Media{' '}
        <Text
          style={[
            styles.title,
            {
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              fontSize: 12,
              marginLeft: width(2),
            },
          ]}>
          (Oplional)
        </Text>
      </Text>

      <Text style={styles.sectionTitle}>Logo</Text>
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
        renderUploadBox('Click to upload business logo', () =>
          handleUpload(setBusinessLogo),
        )
      )}
      <Text style={styles.sectionTitle}>Banner Image</Text>
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
        renderUploadBox('Click to upload banner image', () =>
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
        />
        <GradientButton
          text={t('continue')}
          onPress={handleContinue}
          type="filled"
          gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          styleProps={{flex: 1}}
          loading={isLoading}
        />
      </View>
      <Loader isLoading={isLoading} />
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
    backgroundColor: COLORS.black,
    borderRadius: 20,
    backgroundColor: COLORS.white,
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
});

export default MultipleMediaUpload;

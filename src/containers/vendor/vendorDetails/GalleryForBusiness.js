import React, {useState} from 'react';
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
import Video from 'react-native-video';
import {ICONS} from '../../../assets'; // make sure path is correct
import GradientButton from '../../../components/button';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const MediaUploader = ({onPressBack, handleNextStep}) => {
  const [banner, setBanner] = useState([]);
  const [workImages, setWorkImages] = useState([]);
  const [workVideos, setWorkVideos] = useState([]);
  const {t} = useTranslation();
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

  const handlePick = async (type, setter, mediaType) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    launchImageLibrary(
      {
        mediaType: mediaType, // 'photo' | 'video' | 'mixed'
        selectionLimit: 0,
      },
      response => {
        if (response?.assets?.length) {
          const newMedia = response.assets.map(asset => ({
            ...asset,
            localUri: asset.uri, // use directly
          }));
          setter(prev => [...prev, ...newMedia]);
        }
      },
    );
  };

  const renderMedia = (mediaList, setter) =>
    mediaList.map((item, index) => (
      <View key={index} style={styles.mediaPreviewContainer}>
        {item.type?.startsWith('video') ? (
          <Video
            source={{uri: item.localUri}}
            style={styles.mediaPreview}
            paused={true}
            resizeMode="cover"
            controls={true}
            onError={e => console.log('Video error:', e)}
          />
        ) : (
          <Image source={{uri: item.localUri}} style={styles.mediaPreview} />
        )}

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            const updated = mediaList.filter((_, i) => i !== index);
            setter(updated);
          }}>
          <Image source={ICONS.crossIcon} style={styles.removeIcon} />
        </TouchableOpacity>
      </View>
    ));

  const renderUploadBox = (label, onPress) => (
    <TouchableOpacity style={styles.uploadBox} onPress={onPress}>
      <Image source={ICONS.uploadIcon} style={styles.uploadIcon} />
      <Text style={styles.uploadText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Gallery</Text>

      <View style={styles.row}>
        {renderUploadBox('Click to upload banner', () =>
          handlePick('banner', setBanner, 'photo'),
        )}
      </View>
      <View style={styles.previewRow}>{renderMedia(banner, setBanner)}</View>

      <View style={styles.row}>
        {renderUploadBox('Click to upload work images', () =>
          handlePick('workImages', setWorkImages, 'photo'),
        )}
      </View>
      <View style={styles.previewRow}>
        {renderMedia(workImages, setWorkImages)}
      </View>

      <View style={styles.row}>
        {renderUploadBox('Click to upload work Video', () =>
          handlePick('workVideos', setWorkVideos, 'video'),
        )}
      </View>
      <View style={styles.previewRow}>
        {renderMedia(workVideos, setWorkVideos)}
      </View>
      <View style={styles.buttonContainer}>
        <GradientButton
          text={t('back')}
          useGradient={true}
          onPress={() => onPressBack()}
          type="outline"
          styleProps={{
            paddingVertical: 14,
          }}
          gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          icon={ICONS.backIcon}
        />

        <GradientButton
          text={t('continue')}
          onPress={() => handleNextStep()}
          type="filled"
          gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          styleProps={{flex: 1}}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 20,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: width(4),
    textAlign: 'center',
  },
  row: {
    marginBottom: width(2),
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
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: width(4),
  },
  mediaPreviewContainer: {
    position: 'relative',
    marginRight: width(2),
    marginTop: width(2),
  },
  mediaPreview: {
    width: width(30),
    height: width(30),
    borderRadius: width(1),
    backgroundColor: COLORS.lightGray,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 4,
    zIndex: 1,
  },
  removeIcon: {
    width: 15,
    height: 15,
    tintColor: COLORS.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(10),
    gap: 10,
    justifyContent: 'flex-end',
  },
});

export default MediaUploader;

// EventListing.js
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import CustomPicker from '../customPicker';
import DateAndTimings from '../dateAndTimeComponent';
import GradientText from '../gradiantText';
import TextField from '../textInput';

const SelectedItems = ({data, onRemove}) => (
  <View style={styles.selectedContainer}>
    {data.map((item, index) => (
      <View key={index} style={styles.selectedItem}>
        <Text style={styles.selectedText}>{item}</Text>
        <TouchableOpacity
          onPress={() => onRemove(item)}
          style={styles.removeBtn}>
          <Text style={styles.removeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
);

const EventListingModal = ({isVisible, onClose, nestedFilter}) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const mainCategory = useRef(null);
  const subCategory = useRef(null);

  const [toggleTermsAcceptance, setToggleTermsAcceptance] = useState(false);
  const [workImages, setWorkImages] = useState([]);
  const [workVideos, setWorkVideos] = useState([]);
  const [isCheck, setIsCheck] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [formData, setFormData] = useState({category: '', subCategory: ''});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const handleSelectValue = (name, value) => {
    const selectedValue = value?.name || value;

    if (name === 'category' && !selectedCategories.includes(selectedValue)) {
      setSelectedCategories(prev => [...prev, selectedValue]);
    }
    if (
      name === 'subCategory' &&
      !selectedSubCategories.includes(selectedValue)
    ) {
      setSelectedSubCategories(prev => [...prev, selectedValue]);
    }

    setFormData(prev => ({...prev, [name]: selectedValue}));
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
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
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

        {/* Scrollable Content */}
        <ScrollView style={{flex: 1}}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Basic Information')}</Text>

            <TextField
              bgColor={COLORS.white}
              label={t('Title')}
              placeholder={t('Enter title')}
            />
            <View style={{height: 10}} />
            <TextField
              bgColor={COLORS.white}
              label={t('Sub Title')}
              placeholder={t('Enter subtitle')}
            />

            <CustomPicker
              ref={mainCategory}
              label="MainCategory"
              labelll="Select Main Categories"
              dropdownContainerStyle={{backgroundColor: COLORS.white}}
              handleOpenModal={() => mainCategory.current?.show()}
              value={formData.category}
              listData={[
                {name: 'Entertainment & Attractions'},
                {name: 'Food & Drinks'},
                {name: 'Decoration & Styling'},
                {name: 'Locations & Party Tents'},
                {name: 'Staff & Services'},
              ]}
              name="category"
              handleSelectValue={handleSelectValue}
            />
            <SelectedItems
              data={selectedCategories}
              onRemove={item =>
                setSelectedCategories(prev => prev.filter(i => i !== item))
              }
            />

            <CustomPicker
              ref={subCategory}
              label="Sub Category"
              labelll="Select Sub Category"
              handleOpenModal={() => subCategory.current?.show()}
              dropdownContainerStyle={{backgroundColor: COLORS.white}}
              value={formData.subCategory}
              listData={[
                {name: 'DJ'},
                {name: 'Live Band'},
                {name: 'Photo Booth'},
              ]}
              name="subCategory"
              handleSelectValue={handleSelectValue}
            />
            <SelectedItems
              data={selectedSubCategories}
              onRemove={item =>
                setSelectedSubCategories(prev => prev.filter(i => i !== item))
              }
            />

            <View style={{height: 10}} />
            <TextField
              bgColor={COLORS.white}
              label={t('description')}
              placeholder={t(
                'Focused on creating vibes through immersive sound...',
              )}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Pricing Section')}</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View style={{width: width(40)}}>
                <CustomPicker
                  label="Pricing Type"
                  labelll="Per Hour"
                  dropdownContainerStyle={{backgroundColor: COLORS.white}}
                  handleOpenModal={() => mainCategory.current?.show()}
                  value={formData.category}
                  listData={[
                    {name: 'Hourly'},
                    {name: 'Fixed'},
                    {name: 'Custom'},
                  ]}
                  name="category"
                  handleSelectValue={handleSelectValue}
                />
              </View>
              <View style={{width: width(40), marginTop: width(3)}}>
                <TextField
                  label={'Cost'}
                  placeholder={'Enter Cost'}
                  inputContainer={{paddingVertical: width(1.5)}}
                  bgColor={COLORS.white}
                />
              </View>
            </View>
            <View style={{height: width(4)}} />
            <TextField
              label={'Extra Time Cost'}
              placeholder={'Extra Time Cost'}
              inputContainer={{paddingVertical: width(1.5)}}
              bgColor={COLORS.white}
            />
            <View style={{height: width(4)}} />
            <TextField
              label={'Per km (1)'}
              placeholder={'€1'}
              inputContainer={{paddingVertical: width(1.5)}}
              bgColor={COLORS.white}
            />
            <View style={styles.optionWrapper}>
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
            </View>
            {isCheck && (
              <TextField
                label={'Security Fee Amount '}
                placeholder={'Enter Security Fee Amount '}
                inputContainer={{paddingVertical: width(1.5)}}
                bgColor={COLORS.white}
              />
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('Gallery View')}</Text>
            <Text style={styles.sectionTitle}>{t('Video (Maximum 1)')}</Text>
            <View style={styles.row}>
              {renderUploadBox('Click to upload work Video', () =>
                handlePick('workVideos', setWorkVideos, 'video'),
              )}
            </View>
            <View style={styles.previewRow}>
              {renderMedia(workVideos, setWorkVideos)}
            </View>

            <Text style={styles.sectionTitle}>{t('Images (Maximum 3)')}</Text>
            <View style={styles.row}>
              {renderUploadBox('Click to upload work images', () =>
                handlePick('workImages', setWorkImages, 'photo'),
              )}
            </View>
            <View style={styles.previewRow}>
              {renderMedia(workImages, setWorkImages)}
            </View>
          </View>
          <View style={styles.section}>
            <DateAndTimings dataArray={[]} />
          </View>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              backgroundColor: COLORS.backgroundLight,
              borderRadius: width(4),
              padding: width(4),
              marginBottom: width(3),
            }}>
            <TouchableOpacity
              onPress={() => setToggleTermsAcceptance(!toggleTermsAcceptance)}
              style={{flexDirection: 'row', alignItems: 'center'}}>
              <View
                style={[
                  styles.checkbox,
                  toggleTermsAcceptance && styles.checkboxChecked,
                ]}>
                {toggleTermsAcceptance && (
                  <Icon name="checkmark" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
            <View style={{marginLeft: width(2)}}>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textDark,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Auto Accepted Order{' '}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.textLight,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Enable this option if you want booking requests for this item to
                be automatically accepted without manual approval.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setToggleTermsAcceptance(!toggleTermsAcceptance)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: width(3),
            }}>
            <View
              style={[
                styles.checkbox,
                toggleTermsAcceptance && styles.checkboxChecked,
              ]}>
              {toggleTermsAcceptance && (
                <Icon name="checkmark" size={16} color="white" />
              )}
            </View>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Text style={styles.termsText}>I agree to </Text>
              <TouchableOpacity>
                <GradientText
                  text={'Terms & Conditions'}
                  customStyles={styles.termsLink}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {!isKeyboardVisible && (
          <View style={styles.buttonRow}>
            {!nestedFilter && (
              <View style={{width: width(40)}}>
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{width: width(40)}}>
              <GradientButton
                icon={ICONS.uploadIcon}
                iconTintColor={COLORS.white}
                text={t('Update Listing')}
                onPress={() => {
                  onClose();
                  setTimeout(() => {
                    navigation.navigate('EventListingScreen');
                  }, 500);
                }}
                type="filled"
                textStyle={styles.applyText}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 4,
    zIndex: 1,
  },
  mediaPreview: {
    width: width(30),
    height: width(30),
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
    marginBottom: width(4),
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
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    marginVertical: width(3),
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
    tintColor: COLORS.white,
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
});

export default EventListingModal;

// EventListing.js
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
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
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import CustomPicker from '../customPicker';
import TextField from '../textInput';

const EventListingModal = ({isVisible, onClose, nestedFilter}) => {
  const {t} = useTranslation();
  const [priceRange, setPriceRange] = useState({min: 0, max: 500});
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const lastValuesRef = useRef({min: 0, max: 500});
  const navigation = useNavigation();
  const mainCategory = useRef(null);
  const subCategory = useRef(null);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [inputVal, setInputVal] = useState({
    mainCategory: '',
    subCategory: '',
    holderType: '',
    priceRange: '',
    location: '',
    dateRange: '',
    timeRange: '',
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const [imageUri, setImageUri] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
    category: '',
    subCategory: '',
    address: '',
    tagline: '',
    description: '',
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.8,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorMessage) {
        console.log('Camera Error: ', response.errorMessage);
      } else {
        const fileUri = response.assets[0].uri;
        uploadImage(fileUri);
      }
    });
  };

  const uploadImage = async fileUri => {
    try {
      const uploadResponse = await RNFetchBlob.fetch(
        'POST',
        'https://your-api-url.com/upload', // Replace with your API
        {
          'Content-Type': 'multipart/form-data',
        },
        [
          {
            name: 'file',
            filename: 'photo.jpg',
            type: 'image/jpeg',
            data: RNFetchBlob.wrap(fileUri.replace('file://', '')),
          },
        ],
      );

      const responseJson = uploadResponse.json();
      console.log('Upload success: ', responseJson);
      setImageUri(fileUri);
    } catch (error) {
      console.log('Upload error: ', error);
    }
  };

  const handleOpenMainCategory = params => {
    if (mainCategory?.current) {
      mainCategory.current.show(params);
    }
  };

  const handleOpenSubCategory = params => {
    if (subCategory?.current) {
      subCategory.current.show(params);
    }
  };

  const handleSelectValue = (name, value) => {
    const selectedValue = value?.name || value;
    if (name === 'category') {
      if (!selectedCategories.includes(selectedValue)) {
        setSelectedCategories(prev => [...prev, selectedValue]);
      }
    } else if (name === 'subCategory') {
      if (!selectedSubCategories.includes(selectedValue)) {
        setSelectedSubCategories(prev => [...prev, selectedValue]);
      }
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: selectedValue,
    }));
  };

  const removeItem = (type, item) => {
    if (type === 'main') {
      setSelectedCategories(prev => prev.filter(i => i !== item));
    } else {
      setSelectedSubCategories(prev => prev.filter(i => i !== item));
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard={true}
      propagateSwipe={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Add New Listing')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <ScrollView style={{flex: 1}}>
          <View
            style={{
              backgroundColor: COLORS.backgroundLight,
              borderRadius: width(4),
              padding: width(4),
              marginBottom: width(3),
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                marginBottom: width(3),
              }}>
              Basic Information
            </Text>
            <TextField
              bgColor={COLORS.white}
              label={t('Title')}
              placeholder={t('Enter  title')}
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
              handleOpenModal={handleOpenMainCategory}
              value={formData?.category || ''}
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

            <View style={styles.selectedContainer}>
              {selectedCategories.map((item, index) => (
                <View key={index} style={styles.selectedItem}>
                  <Text
                    style={{
                      color: COLORS.black,
                      fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                      fontSize: 12,
                    }}>
                    {item}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem('main', item)}
                    style={{
                      height: 25,
                      width: 25,
                      backgroundColor: 'white',
                      borderRadius: 4,
                      marginLeft: width(3),
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#ff295f3a',
                    }}>
                    <Text style={{color: 'red'}}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <CustomPicker
              ref={subCategory}
              label="Sub Category"
              labelll="Select Sub Category"
              handleOpenModal={handleOpenSubCategory}
              dropdownContainerStyle={{backgroundColor: COLORS.white}}
              value={formData?.subCategory || ''}
              listData={[
                {name: 'DJ'},
                {name: 'Live Band'},
                {name: 'Photo Booth'},
              ]}
              name="subCategory"
              handleSelectValue={handleSelectValue}
            />

            <View style={styles.selectedContainer}>
              {selectedSubCategories.map((item, index) => (
                <View key={index} style={styles.selectedItem}>
                  <Text
                    style={{
                      color: COLORS.black,
                      fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                      fontSize: 12,
                    }}>
                    {item}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem('sub', item)}
                    style={{
                      height: 25,
                      width: 25,
                      backgroundColor: 'white',
                      borderRadius: 4,
                      marginLeft: width(3),
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: '#ff295f3a',
                    }}>
                    <Text style={{color: 'red'}}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={{height: 10}} />
            <TextField
              bgColor={COLORS.white}
              label={t('description')}
              placeholder={t(
                'Focused on creating vibes through immersive sound...',
              )}
              multiline={true}
              numberOfLines={3}
            />
          </View>

          <View
            style={{
              backgroundColor: COLORS.backgroundLight,
              borderRadius: width(4),
              padding: width(4),
              marginBottom: width(3),
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                marginBottom: width(3),
              }}>
              Pricing Section
            </Text>

            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <CustomPicker
                ref={mainCategory}
                label="Pricing Type"
                labelll="Per Hour"
                dropdownContainerStyle={{backgroundColor: COLORS.white}}
                handleOpenModal={handleOpenMainCategory}
                value={formData?.category || ''}
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
            </View>
          </View>
        </ScrollView>
        {!isKeyboardVisible && (
          <View style={styles.buttonRow}>
            {!nestedFilter && (
              <View style={{width: width(40)}}>
                <TouchableOpacity
                  onPress={() => onClose()}
                  style={styles.cancelButton}
                  activeOpacity={0.7}>
                  <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{width: width(40)}}>
              <GradientButton
                text={t('applyFilters')}
                onPress={() => {
                  onClose();
                  setTimeout(() => {
                    navigation.navigate('EventListingScreen');
                  }, 500);
                }}
                type="filled"
                textStyle={{
                  fontSize: 12,
                  fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                  color: 'white',
                }}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#666',
  },
});

export default EventListingModal;

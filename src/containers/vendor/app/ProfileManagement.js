import React, {useRef, useState} from 'react';
import {
  Image,
  ImageBackground,
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
import {Rating} from 'react-native-ratings';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import RNFetchBlob from 'rn-fetch-blob';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CustomPicker from '../../../components/customPicker';
import ContactNumberInput from '../../../components/phoneInput';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';
import GradientButton from '../../../components/button';

function ProfileManagement({navigation}) {
  const {t} = useTranslation();
  const mainCategory = useRef(null);
  const subCategory = useRef(null);
  const [imageUri, setImageUri] = useState(null);

  // ✅ Form data
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

  // ✅ Arrays for selected categories and subcategories
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

  // ✅ Updated handleSelectValue function
  const handleSelectValue = (name, value) => {
    const selectedValue = value?.name || value;
    if (name === 'category') {
      // Add to main categories if not exists
      if (!selectedCategories.includes(selectedValue)) {
        setSelectedCategories(prev => [...prev, selectedValue]);
      }
    } else if (name === 'subCategory') {
      // Add to subcategories if not exists
      if (!selectedSubCategories.includes(selectedValue)) {
        setSelectedSubCategories(prev => [...prev, selectedValue]);
      }
    }

    // Update form data
    setFormData(prevState => ({
      ...prevState,
      [name]: selectedValue,
    }));
  };

  // ✅ Remove category or subcategory
  const removeItem = (type, item) => {
    if (type === 'main') {
      setSelectedCategories(prev => prev.filter(i => i !== item));
    } else {
      setSelectedSubCategories(prev => prev.filter(i => i !== item));
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={t('booking')}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={() => navigation.goBack()}
        setModalVisible={() => {}}
        onRightIconPress={() => navigation.navigate('MessagesScreen')}
        containerStyle={{
          marginVertical: 10,
        }}
      />
      <ScrollView style={{flex: 1, backgroundColor: COLORS.white}}>
        {/* Profile Image Section */}
        <ImageBackground
          resizeMode="contain"
          source={IMAGES.bannerImage}
          style={{
            marginHorizontal: 10,
            justifyContent: 'flex-end',
            paddingHorizontal: width(5),
            marginTop: -width(10),
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              height: width(45),
              marginTop: width(20),
            }}>
            <View
              style={{
                borderWidth: width(1),
                borderColor: COLORS.white,
                height: width(25),
                borderRadius: 100,
                width: width(25),
                marginBottom: width(5),
              }}>
              <Image
                source={imageUri ? {uri: imageUri} : IMAGES.coverImage1}
                resizeMode="cover"
                style={{height: width(25), width: width(25), borderRadius: 100}}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  zIndex: 999,
                  bottom: -10,
                  right: -10,
                }}
                onPress={openCamera}>
                <LinearGradient
                  colors={['#FF7E5F', '#FD3A84']}
                  style={{
                    height: width(10),
                    width: width(10),
                    borderRadius: 100,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <SimpleLineIcons
                    name={'camera'}
                    size={20}
                    color={COLORS.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={{marginLeft: width(5)}}>
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 15,
                  fontFamily: fontFamly.PlusJakartaSansSemiBold,
                }}>
                Ahsan Khan
              </Text>
              <Text style={{color: COLORS.textLight, fontSize: 14}}>
                10k {t('followers')} 200-500 {t('employees')}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Rating
                  count={5}
                  defaultRating={4}
                  imageSize={12}
                  selectedColor={'#FCAD38'}
                  isDisabled={true}
                  readonly={true}
                  style={{marginRight: 5, marginTop: 5}}
                  ratingContainerStyle={{marginRight: 5}}
                />
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                    color: COLORS.textLight,
                    fontSize: 12,
                    marginLeft: 5,
                  }}>
                  4.5 (127 {t('reviews')})
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Form Section */}
        <View style={styles.form}>
          <TextField
            label={t('firstName')}
            placeholder={t('firstNamePlaceholder')}
          />
          <View style={{height: 10}} />
          <TextField
            label={t('lastName')}
            placeholder={t('lastNamePlaceholder')}
          />
          <ContactNumberInput
            labelText={t('contactNumber')}
            labelColor={'#000'}
            phoneNumber={formData.contact}
            containerStyle={{
              backgroundColor: COLORS.backgroundLight,
            }}
          />
          <View style={{height: 10}} />
          <TextField
            label={t('emailAddress')}
            placeholder={t('emailPlaceholder')}
          />
          <View style={{height: 10}} />
          <TextField
            label={t('Address')}
            placeholder={t('ABCD Street, New York')}
          />
          <View style={{height: 10}} />
          <TextField
            label={t('Tagline')}
            placeholder={t('Coach In Organization Name')}
          />
          <View style={{height: 10}} />
          <TextField
            label={t('description')}
            placeholder={t(
              'Focused on creating vibes through immersive sound...',
            )}
            multiline={true}
            numberOfLines={3}
          />

          {/* Categories Section */}
          <Text style={styles.heading}>Explore Categories</Text>
          <CustomPicker
            ref={mainCategory}
            label="Category"
            labelll="Select Categories"
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

          {/* ✅ Show Selected Main Categories */}
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
            value={formData?.subCategory || ''}
            listData={[
              {name: 'DJ'},
              {name: 'Live Band'},
              {name: 'Photo Booth'},
            ]}
            name="subCategory"
            handleSelectValue={handleSelectValue}
          />

          {/* ✅ Show Selected Sub Categories */}
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
          <View
            style={{
              marginHorizontal: 10,
              flex: 1,
              justifyContent: 'flex-end',
              marginBottom: 10,
            }}>
            <GradientButton text={'Save & Change'} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileManagement;

const styles = StyleSheet.create({
  form: {
    marginBottom: SIZES.lg,
    marginTop: 20,
    marginHorizontal: 10,
  },
  heading: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    color: COLORS.textDark,
    marginTop: width(4),
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    margin: 5,
  },
});

import React, {useState} from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
import FilterModal from '../../../components/modals/FilterModal';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
const data = [
  {
    image: IMAGES.profilePhoto,
    heading: 'Get Disc 20%',
    subHeading: 'Thanks for the quick response',
  },
  {
    image: IMAGES.profilePhoto,
    heading: 'Get Disc 20%',
    subHeading: 'Thanks for the quick response',
  },
  {
    image: IMAGES.profilePhoto,
    heading: 'Get Disc 20%',
    subHeading: 'Thanks for the quick response',
  },
  {
    image: IMAGES.profilePhoto,
    heading: 'Get Disc 20%',
    subHeading: 'Thanks for the quick response',
  },
  {
    image: IMAGES.profilePhoto,
    heading: 'Get Disc 20%',
    subHeading: 'Thanks for the quick response',
  },
  {
    image: IMAGES.profilePhoto,
    heading: 'Get Disc 20%',
    subHeading: 'Thanks for the quick response',
  },
];
const Notification = ({navigation}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const {t} = useTranslation();

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('NotificationDetails')}
        style={{
          flexDirection: 'row',
          marginTop: 20,
          marginHorizontal: 14,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              height: width(13),
              width: width(13),
              borderRadius: 100,
              position: 'relative',
            }}>
            <Image
              style={{height: '100%', width: '100%'}}
              source={item.image}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                borderRadius: 100,
                padding: width(1),
                borderWidth: 2,
                borderColor: COLORS.white,
                backgroundColor: COLORS.primary,
              }}
            />
          </View>

          <View style={{marginLeft: 15, flexDirection: 'column'}}>
            <Text
              style={{
                fontSize: 15,
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
              }}>
              {item.heading}
            </Text>
            <Text
              style={{
                color: '#6D6D6D',
                fontSize: 12,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              }}>
              {item.subHeading}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              color: COLORS.textLight,
              fontSize: 14,
              marginHorizontal: width(1),
            }}>
            3 hrs ago
          </Text>
          <Image
            source={ICONS.bellIcon}
            style={{height: width(3), width: width(3), marginTop: width(1)}}
            tintColor={COLORS.black}
          />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <>
      <FlatList
        ListHeaderComponent={
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: COLORS.backgroundLight,
              borderBottomRightRadius: 20,
              borderBottomLeftRadius: 20,
            }}>
            <View
              style={{
                paddingVertical: width(2),
                paddingHorizontal: width(2),
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity style={{}} onPress={() => navigation.goBack()}>
                <Image
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                  source={ICONS.leftArrowIcon}
                />
              </TouchableOpacity>
              <Text style={{fontFamily: fontFamly.PlusJakartaSansBold}}>
                {t('Notifications')}
              </Text>
              <View style={{width: 40}} />
            </View>
            <View
              style={{
                flex: 1,
                width: '100%',
                paddingLeft: width(4),
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: width(3),
                justifyContent: 'space-between',
              }}>
              <TextField
                placeholder={t('searchEvent')}
                placeholderTextColor="#aaa"
                bgColor={COLORS.white}
                startIcon={ICONS.search}
                inputContainer={{
                  paddingVertical: 0,
                  paddingHorizontal: 10,
                  height: 45,
                  width: '95%',
                  marginTop: 0,
                }}
                styleProps={{
                  fontSize: 14,
                  color: '#000',
                }}
              />
            </View>
          </View>
        }
        data={data}
        renderItem={renderItem}
        contentContainerStyle={{paddingBottom: 10}}
      />
      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default Notification;

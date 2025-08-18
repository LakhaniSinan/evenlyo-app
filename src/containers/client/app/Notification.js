import React from 'react';
import {FlatList, Image, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {fontFamly} from '../../../constants';

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

const Notification = () => {
  const navigation = useNavigation();
  const renderItem = ({item}) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          marginTop: 20,
          marginHorizontal: 10,
          alignItems: 'center',
        }}>
        <Image style={{height: 48, width: 48}} source={item.image} />
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
    );
  };
  return (
    <View style={{backgroundColor: 'white'}}>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={'Notifications'}
        onLeftIconPress={() => navigation.goBack()}
      />
      <FlatList data={data} renderItem={renderItem} />
    </View>
  );
};

export default Notification;

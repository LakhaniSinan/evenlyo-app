// import {useNavigation} from '@react-navigation/native';
// import React from 'react';
// import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
// import {width} from 'react-native-dimension';
// import {ICONS, IMAGES} from '../../../assets';
// import AppHeader from '../../../components/appHeader';
// import {COLORS, fontFamly} from '../../../constants';
// import TextField from '../../../components/textInput';
// import {useTranslation} from '../../../hooks';

// const data = [
//   {
//     image: IMAGES.profilePhoto,
//     heading: 'Get Disc 20%',
//     subHeading: 'Thanks for the quick response',
//   },
//   {
//     image: IMAGES.profilePhoto,
//     heading: 'Get Disc 20%',
//     subHeading: 'Thanks for the quick response',
//   },
//   {
//     image: IMAGES.profilePhoto,
//     heading: 'Get Disc 20%',
//     subHeading: 'Thanks for the quick response',
//   },
//   {
//     image: IMAGES.profilePhoto,
//     heading: 'Get Disc 20%',
//     subHeading: 'Thanks for the quick response',
//   },
//   {
//     image: IMAGES.profilePhoto,
//     heading: 'Get Disc 20%',
//     subHeading: 'Thanks for the quick response',
//   },
//   {
//     image: IMAGES.profilePhoto,
//     heading: 'Get Disc 20%',
//     subHeading: 'Thanks for the quick response',
//   },
// ];

// const Notification = () => {
//   const navigation = useNavigation();
//   const {t} = useTranslation();

//   return (
//     <View
//       style={{flex: 1, backgroundColor: COLORS.white, marginTop: width(10)}}>
//       <View
//         style={{
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           backgroundColor: COLORS.backgroundLight,
//           borderBottomRightRadius: 20,
//           borderBottomLeftRadius: 20,
//         }}>
//         <View
//           style={{
//             paddingVertical: width(2),
//             paddingHorizontal: width(2),
//             width: '100%',
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//           }}>
//           <View
//             style={{
//               marginLeft: 10,
//               flexDirection: 'row',
//               alignItems: 'center',
//             }}>
//             <View>
//               <Image
//                 resizeMode="contain"
//                 style={{width: 40, height: 40}}
//                 source={ICONS.locationIcon}
//               />
//             </View>
//             <Text
//               style={{
//                 fontSize: 12,
//                 marginLeft: width(3),
//                 fontFamily: fontFamly.PlusJakartaSansSemiMedium,
//               }}>
//               San Francisco, CA
//             </Text>
//           </View>
//           <TouchableOpacity
//             style={{borderRadius: 20}}
//             onPress={() => navigation.navigate('Notification')}>
//             <Image
//               resizeMode="contain"
//               style={{width: 40, height: 40}}
//               source={ICONS.notificationIcon}
//             />
//           </TouchableOpacity>
//         </View>
//         <View
//           style={{
//             flex: 1,
//             width: '100%',
//             paddingLeft: width(4),
//             flexDirection: 'row',
//             alignItems: 'center',
//             marginVertical: width(3),
//             justifyContent: 'space-between',
//           }}>
//           <TextField
//             placeholder={t('searchEvent')}
//             placeholderTextColor="#aaa"
//             bgColor={COLORS.white}
//             startIcon={ICONS.search}
//             inputContainer={{
//               paddingVertical: 0,
//               paddingHorizontal: 10,
//               height: 45,
//               width: '80%',
//               marginTop: 0,
//             }}
//             styleProps={{
//               fontSize: 14,
//               color: '#000',
//             }}
//           />
//           <TouchableOpacity
//             onPress={() => setModalVisible(true)}
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'flex-end',
//               marginRight: 10,
//             }}>
//             <Image
//               resizeMode="contain"
//               style={{width: 40, height: 40}}
//               source={ICONS.filters}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//       <AppHeader
//         leftIcon={ICONS.leftArrowIcon}
//         headingText={'Notifications'}
//         onLeftIconPress={() => navigation.goBack()}
//       />
//       <FlatList
//         data={data}
//         renderItem={renderItem}
//         contentContainerStyle={{paddingBottom: 10}}
//       />
//     </View>
//   );
// };

// export default Notification;
import React, {useState} from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {SafeAreaView} from 'react-native-safe-area-context';
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
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{flex: 1, backgroundColor: COLORS.white}}>
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
                {t('notifications')}
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
    </SafeAreaView>
  );
};

export default Notification;

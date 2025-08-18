import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {fontFamily} from '../../assets';
import {appColors} from '../../constants';
import {calculateTime} from '../../utills/globalFunctions';

const ChatsCard = ({item, index, navigation}) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChatBox', item)}
      key={index}
      style={{
        marginTop: width(2),
        marginHorizontal: width(2),
        padding: width(2),
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: appColors.spnishGray,
      }}>
      <View
        style={{
          height: width(15),
          width: width(15),
          borderRadius: 100,
        }}>
        <Image
          source={item?.profileImage}
          resizeMode="contain"
          style={{height: '100%', width: '100%'}}
        />
      </View>
      <View style={{width: width(59), marginLeft: width(2)}}>
        <Text
          style={{
            fontFamily: fontFamily.poppinsBold,
            color: appColors.black,
          }}>
          {item?.name}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: fontFamily.poppinsRegular,
            fontSize: 12,
            color: appColors.black,
          }}>
          {item?.message}
        </Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'space-evenly',
        }}>
        <Text
          style={{
            fontFamily: fontFamily.poppinsRegular,
            color: appColors.black,
            fontSize: 10,
          }}>
          {calculateTime(item?.date)}
        </Text>
        {item?.toViewCount && (
          <View
            style={{
              height: width(5),
              width: width(5),
              backgroundColor: '#E8434D',
              borderRadius: width(3),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontFamily: fontFamily.poppinsRegular,
                color: appColors.white,
                fontSize: 12,
              }}>
              {item?.toViewCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ChatsCard;

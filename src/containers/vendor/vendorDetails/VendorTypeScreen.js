import {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../../constants';

const VendorTypeScreen = ({navigation}) => {
  const [selectedType, setSelectedType] = useState(null);
  return (
    <View
      style={{
        height: width(45),
        backgroundColor: 'red',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
      <Text
        style={{
          fontSize: 20,
          fontFamily: fontFamly.PlusJakartaSansBold,
          color: COLORS.textDark,
        }}>
        Create Your Vendor Account
      </Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text
          style={{
            fontSize: 20,
            fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            color: COLORS.textDark,
          }}>
          Welcome to
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.textDark,
          }}>
          Evenloyo
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            color: COLORS.textDark,
          }}>
          Management, Please
        </Text>
      </View>
      <TouchableOpacity
        style={{
          height: width(30),

          width: width(40),
          backgroundColor: COLORS.backgroundLight,
          borderRadius: width(4),
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}></TouchableOpacity>
      <TouchableOpacity
        style={{
          height: width(30),

          width: width(40),
          backgroundColor: COLORS.backgroundLight,
          borderRadius: width(4),
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}></TouchableOpacity>
    </View>
  );
};

export default VendorTypeScreen;

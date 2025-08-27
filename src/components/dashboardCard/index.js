import {Image, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';

const DashboardCard = ({item}) => {
  return (
    <View
      style={{
        width: 162,
        height: 83,
        backgroundColor: COLORS.backgroundLight,
        borderRadius: width(3),
        padding: width(2),
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
          borderRadius: width(2),
        }}>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansSemiBold,
            fontSize: 12,
            color: COLORS.textDark,
          }}>
          All Clients
        </Text>
        <View
          style={{
            width: 20.32,
            height: 20.32,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: COLORS.border,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.white,
          }}>
          <Image
            source={ICONS.groupIcon}
            resizeMode="contain"
            style={{width: 10, height: 10, tintColor: COLORS.green}}
          />
        </View>
      </View>
      <Text style={{fontFamily: fontFamly.PlusJakartaSansBold, fontSize: 16}}>
        1,247
      </Text>
      <Text
        style={{
          fontFamily: fontFamly.PlusJakartaSansSemiBold,
          fontSize: 10,
          color: COLORS.textDark,
        }}>
        +12% from last month
      </Text>
    </View>
  );
};

export default DashboardCard;

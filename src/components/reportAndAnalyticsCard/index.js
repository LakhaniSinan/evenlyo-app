import {Image, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, fontFamly} from '../../constants';

const AnalyticsCard = ({item}) => {
  const isGradient = item?.title === 'Last Week Earning';
  const gradientColors = ['#FF295D', '#E31B95', '#C817AE'];

  return (
    <View
      style={{
        width: 162,
        height: 83,
        borderRadius: width(3),
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
      {isGradient ? (
        <LinearGradient
          colors={gradientColors}
          style={{
            flex: 1,
            padding: width(2),
            borderRadius: width(3),
          }}>
          <CardContent item={item} isDark />
        </LinearGradient>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.backgroundLight,
            padding: width(2),
            borderRadius: width(3),
          }}>
          <CardContent item={item} />
        </View>
      )}
    </View>
  );
};

const CardContent = ({item, isDark = false}) => {
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansSemiBold,
            fontSize: 10,
            color: isDark ? COLORS.white : COLORS.textDark,
          }}>
          {item?.title}
        </Text>
        <View
          style={{
            width: 22.32,
            height: 22.32,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: COLORS.border,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:
              item?.title === 'Last Week Earning'
                ? 'transparent'
                : COLORS.white,
          }}>
          <Image
            source={item.icon}
            resizeMode="contain"
            style={{width: 10, height: 10}}
          />
        </View>
      </View>
      <Text
        style={{
          fontFamily: fontFamly.PlusJakartaSansBold,
          fontSize: 16,
          color: isDark ? COLORS.white : COLORS.textDark,
        }}>
        {item?.value}
      </Text>
      <Text
        style={{
          fontFamily: fontFamly.PlusJakartaSansSemiBold,
          fontSize: 10,
          color: isDark ? COLORS.white : COLORS.textDark,
        }}>
        {`+${item?.percentage}% from last month`}
      </Text>
    </>
  );
};

export default AnalyticsCard;

import {Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const AllBookingCard = ({item}) => {
  const {t} = useTranslation();
  const isGradient = item?.title === t('Total Items');
  const gradientColors = ['#FF295D', '#E31B95', '#C817AE'];

  return (
    <View
      style={{
        width: 162,
        height: 83,
        borderRadius: width(3),
        overflow: 'hidden', // important for rounded corners
        backgroundColor: '#fff', // needed for shadow
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
  const {t} = useTranslation();
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
            width: 10,
            height: 10,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor:
              item?.title === t('Total Bookings')
                ? COLORS.navyBlue
                : item?.title == t('Request Bookings')
                ? COLORS.green
                : item?.title == t('In Process')
                ? COLORS.yellow
                : COLORS.white,
          }}
        />
      </View>
      <Text
        style={{
          fontFamily: fontFamly.PlusJakartaSansBold,
          fontSize: 16,
          color:
            item?.title === t('Total Bookings')
              ? COLORS.navyBlue
              : item?.title == t('Request Bookings')
              ? COLORS.green
              : item?.title == t('In Process')
              ? COLORS.yellow
              : COLORS.white,
        }}>
        {item?.value}
      </Text>
      <Text
        style={{
          fontFamily: fontFamly.PlusJakartaSansSemiBold,
          fontSize: 10,
          color: isDark ? COLORS.white : COLORS.textDark,
        }}>
        {t(`+${item?.percentage}% from last month`, {value: item?.percentage})}
      </Text>
    </>
  );
};

export default AllBookingCard;

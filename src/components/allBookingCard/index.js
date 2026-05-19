import {StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {
  BRAND_BUTTON_GRADIENT_COLORS,
  BRAND_BUTTON_GRADIENT_LOCATIONS,
  COLORS,
  fontFamly,
} from '../../constants';
import {useTranslation} from '../../hooks';

const AllBookingCard = ({item}) => {
  const isGradient = item?.id === 'completed';

  return (
    <View style={styles.cardOuter}>
      {isGradient ? (
        <View style={styles.gradientCard}>
          <LinearGradient
            colors={BRAND_BUTTON_GRADIENT_COLORS}
            locations={BRAND_BUTTON_GRADIENT_LOCATIONS}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.gradientFill}
          />
          <CardContent item={item} isDark />
        </View>
      ) : (
        <View style={styles.plainCard}>
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
                : item?.title == t('Request Booking')
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
              : item?.title == t('Request Booking')
              ? COLORS.green
              : item?.title == t('In Process')
              ? COLORS.yellow
              : COLORS.white,
        }}>
        {item?.value}
      </Text>
    </>
  );
};

export default AllBookingCard;

const styles = StyleSheet.create({
  cardOuter: {
    width: width(45),
    height: 60,
    borderRadius: width(3),
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    marginTop: width(3),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradientCard: {
    flex: 1,
    padding: width(2),
    borderRadius: width(3),
    overflow: 'hidden',
  },
  gradientFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: width(3),
  },
  plainCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    padding: width(2),
    borderRadius: width(3),
  },
});

import {Image, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {
  BRAND_BUTTON_GRADIENT_COLORS,
  BRAND_BUTTON_GRADIENT_LOCATIONS,
  COLORS,
  fontFamly,
} from '../../constants';
import {useTranslation} from '../../hooks';

const AnalyticsCard = ({item}) => {
  const {t} = useTranslation();
  const isGradient = item?.isGradient === true;

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
          <CardContent item={item} isDark label={t(item?.titleKey || item?.title)} />
        </View>
      ) : (
        <View style={styles.plainCard}>
          <CardContent item={item} label={t(item?.titleKey || item?.title)} />
        </View>
      )}
    </View>
  );
};

const CardContent = ({item, isDark = false, label}) => {
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
            flex: 1,
            marginRight: 4,
          }}
          numberOfLines={2}>
          {label}
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
            backgroundColor: isDark ? 'transparent' : COLORS.white,
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
        €{item?.value}
      </Text>
    </>
  );
};

export default AnalyticsCard;

const styles = StyleSheet.create({
  cardOuter: {
    width: width(45),
    height: 65,
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

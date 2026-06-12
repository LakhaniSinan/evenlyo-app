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
  const label = t(item?.titleKey || item?.title);

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
          <CardContent item={item} isDark label={label} />
        </View>
      ) : (
        <View style={styles.plainCard}>
          <CardContent item={item} label={label} />
        </View>
      )}
    </View>
  );
};

const CardContent = ({item, isDark = false, label}) => {
  const iconTint =
    item?.iconTint || (isDark ? COLORS.white : undefined);

  return (
    <>
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.titleText,
            {color: isDark ? COLORS.white : COLORS.textDark},
          ]}
          numberOfLines={2}>
          {label}
        </Text>
        <View
          style={[
            styles.iconContainer,
            {
              borderColor: COLORS.border,
              backgroundColor: isDark ? 'transparent' : COLORS.white,
            },
          ]}>
          <Image
            source={item.icon}
            resizeMode="contain"
            style={styles.iconImage}
            tintColor={iconTint}
          />
        </View>
      </View>
      <Text
        style={[
          styles.valueText,
          {color: isDark ? COLORS.white : COLORS.textDark},
        ]}>
        €{item?.value ?? 0}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
  titleText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 10,
    flex: 1,
    marginRight: 4,
  },
  iconContainer: {
    width: 22.32,
    height: 22.32,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 10,
    height: 10,
  },
  valueText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 16,
  },
});

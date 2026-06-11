import {StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const getCardAccentColor = cardId => {
  switch (cardId) {
    case 'total':
      return COLORS.navyBlue;
    case 'completed':
      return COLORS.primary;
    case 'request':
      return COLORS.green;
    case 'inProcess':
      return COLORS.yellow;
    default:
      return COLORS.textDark;
  }
};

const AllBookingCard = ({item}) => {
  return (
    <View style={styles.cardOuter}>
      <View style={styles.plainCard}>
        <CardContent item={item} />
      </View>
    </View>
  );
};

const CardContent = ({item}) => {
  const accentColor = getCardAccentColor(item?.id);

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
            color: COLORS.textDark,
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
            backgroundColor: accentColor,
          }}
        />
      </View>
      <Text
        style={{
          fontFamily: fontFamly.PlusJakartaSansBold,
          fontSize: 16,
          color: accentColor,
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
  plainCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    padding: width(2),
    borderRadius: width(3),
  },
});

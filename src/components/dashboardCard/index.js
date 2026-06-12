import {Image, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const DashboardCard = ({item}) => {
  return (
    <View style={styles.cardOuter}>
      <View style={styles.plainCard}>
        <View style={styles.headerRow}>
          <Text style={styles.titleText}>{item?.title}</Text>
          <View style={styles.iconContainer}>
            <Image
              source={item.icon}
              resizeMode="contain"
              style={styles.iconImage}
              tintColor={item?.iconTint}
            />
          </View>
        </View>
        <Text style={styles.valueText}>{item?.value}</Text>
      </View>
    </View>
  );
};

export default DashboardCard;

const styles = StyleSheet.create({
  cardOuter: {
    width: width(45),
    height: 60,
    marginTop: width(3),
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
    color: COLORS.textDark,
  },
  iconContainer: {
    width: 22.32,
    height: 22.32,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  iconImage: {
    width: 10,
    height: 10,
  },
  valueText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 16,
    color: COLORS.textDark,
  },
});

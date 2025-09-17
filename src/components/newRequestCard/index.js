import {Image, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const InfoRow = ({label, value}) => (
  <View style={styles.infoBlock}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const NewRequestCard = ({item}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Image source={item?.iamge} style={styles.image} resizeMode="contain" />
        <View style={styles.titleBlock}>
          <Text style={styles.djText}>.DJ</Text>
          <Text style={styles.title}>{item?.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${item?.pricePerDay}</Text>
            <Text style={styles.perDay}>/Day</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {(item?.subtotal || item?.tax) && (
        <View style={styles.rowBetween}>
          <InfoRow label="Subtotal:" value={item?.subtotal} />
          <InfoRow label="Tax (0%):" value={item?.tax} />
        </View>
      )}

      <View style={styles.rowBetween}>
        <InfoRow label="Security Fee:" value={item?.securityFee} />
        <InfoRow label="Discount:" value={item?.discount} />
      </View>

      <View style={styles.rowBetween}>
        <InfoRow label="Kilometre:" value={item?.kilometre} />
        <InfoRow label="Total:" value={item?.total} />
      </View>
    </View>
  );
};

export default NewRequestCard;

const styles = StyleSheet.create({
  card: {
    height: width(60),
    backgroundColor: COLORS.white,
    padding: width(3),
    borderRadius: 15,
    marginBottom: width(3),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: width(20),
    width: width(20),
    borderRadius: 10,
    overflow: 'hidden',
  },
  titleBlock: {
    marginLeft: width(3),
  },
  djText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 9,
    color: COLORS.green,
  },
  title: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 13,
    color: COLORS.black,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.black,
  },
  perDay: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 9,
    color: COLORS.textLight,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginTop: width(2),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBlock: {
    marginTop: width(2),
  },
  label: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 9,
    color: COLORS.textLight,
  },
  value: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.textDark,
  },
});

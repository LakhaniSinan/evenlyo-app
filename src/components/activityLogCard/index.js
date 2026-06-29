import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { width } from 'react-native-dimension';
import { COLORS, fontFamly } from '../../constants';
import { useTranslation } from '../../hooks';

const getActivityTypeLabel = (type, translate) => {
  if (!type) {
    return '';
  }
  const key = `activityType_${type}`;
  const translated = translate(key);
  return translated === key ? type.replace(/_/g, ' ') : translated;
};

const ActivityLogCard = ({item, index, dataLength}) => {
  const {t, currentLanguage} = useTranslation();
  const isLastItem = index === dataLength - 1;
  const typeLabel = getActivityTypeLabel(item?.type, t);

  const formattedTime = moment(item?.createdAt).format(
    'DD/MM/YYYY | hh:mm A',
  );

  return (
    <View
      style={[
        styles.card,
        isLastItem && {borderBottomWidth: 0, borderBottomColor: 'transparent'},
      ]}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item?.type?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.heading}>
            {currentLanguage == 'en' ? item?.heading?.en : item?.heading?.nl}
          </Text>
          <Text style={styles.description}>
            {currentLanguage == 'en'
              ? item?.description?.en
              : item?.description?.nl}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.type}>{typeLabel}</Text>
            <Text style={styles.time}>{formattedTime}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActivityLogCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: width(3),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.semiLightText,
    paddingVertical: width(3),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    backgroundColor: COLORS.primary || '#EEE',
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  infoContainer: {
    flex: 1,
  },
  heading: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: 2,
  },
  description: {
    fontSize: 10,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansRegular,
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  type: {
    fontSize: 9,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  time: {
    fontSize: 9,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansRegular,
  },
});

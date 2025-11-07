import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import moment from 'moment';
import {COLORS, fontFamly} from '../../constants';

const ActivityLogCard = ({item, index, dataLength}) => {
  const isLastItem = index === dataLength - 1;

  const formattedTime = moment(item?.createdAt).format(
    'MMM DD, YYYY | hh:mm A',
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
          <Text style={styles.heading}>{item?.heading}</Text>
          <Text style={styles.description}>{item?.description}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.type}>{item?.type?.replace(/_/g, ' ')}</Text>
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
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 9,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansRegular,
  },
});

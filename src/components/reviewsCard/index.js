import moment from 'moment';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const ReviewsCard = ({item}) => {
  const {t} = useTranslation();

  const ratingValue = Number(item?.rating || 0);
  const user = item?.userId;

  return (
    <View style={styles.card}>
      {/* USER + DATE ROW */}
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user
              ? `${user?.firstName || ''} ${user?.lastName || ''}`
              : t('Anonymous')}
          </Text>

          {user?.email && <Text style={styles.emailText}>{user.email}</Text>}

          {/* RATING */}
          <View style={styles.ratingContainer}>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={12}
              readonly
              startingValue={ratingValue}
              fractions={1}
              tintColor={COLORS.white}
              ratingBackgroundColor="#E0E0E0"
            />
            <Text style={styles.ratingText}>{ratingValue.toFixed(1)} /5</Text>
          </View>
        </View>

        {/* DATE */}
        <View style={styles.dateContainer}>
          <Text style={styles.reviewDate}>
            {moment(item?.createdAt).format('DD MMM YYYY')}
          </Text>
        </View>
      </View>

      {/* REVIEW TEXT */}
      {item?.review && (
        <View style={styles.reviewTextContainer}>
          <Text style={styles.reviewText}>{item.review}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: width(3),
    width: '100%',
    padding: width(4),
    marginVertical: width(2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: width(3),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  emailText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    marginBottom: width(1),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(1),
  },
  ratingText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textLight,
    marginLeft: width(1),
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  reviewDate: {
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textLight,
  },
  reviewTextContainer: {
    marginTop: width(2),
  },
  reviewText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
});

export default ReviewsCard;

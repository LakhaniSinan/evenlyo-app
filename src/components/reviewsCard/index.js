import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const ReviewsCard = ({item}) => {
  const {t} = useTranslation();

  return (
    <View style={styles.card}>
      {/* User Info Row */}
      <View style={styles.userRow}>
        {/* Profile Image */}
        <View style={styles.profileContainer}>
          <Image
            source={IMAGES.profilePhoto}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user?.name}</Text>
          <View style={styles.ratingContainer}>
            <Rating
              count={5}
              defaultRating={item.rating || 4}
              imageSize={12}
              selectedColor={'#FCAD38'}
              isDisabled={true}
              readonly={true}
              style={{marginRight: 5}}
              ratingContainerStyle={{marginRight: 5}}
            />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <View style={styles.dateContainer}>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.reviewTextContainer}>
        <Text style={styles.reviewText}>{item.comment}</Text>
      </View>
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: width(3),
  },
  profileContainer: {
    marginRight: width(3),
    marginTop: width(1),
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: width(6),
    backgroundColor: COLORS.backgroundLight,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: width(1),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    alignSelf: 'flex-start',
    marginRight: width(2),
  },
  ratingText: {
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textLight,
  },
  dateContainer: {
    justifyContent: 'flex-start',
  },
  reviewDate: {
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textLight,
  },
  reviewTextContainer: {},
  reviewText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
});

export default ReviewsCard;

import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import ReviewsCard from '../../../components/reviewsCard';
import {COLORS, fontFamly} from '../../../constants';

const RatingSummary = ({
  averageRating = 0,
  totalRatings = 0,
  starCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0},
}) => {
  const total = Object.values(starCounts).reduce((a, b) => a + b, 0);

  const getPercentage = count => (total > 0 ? (count / total) * 100 : 0);

  return (
    <View style={styles.ratingContainer}>
      <Text style={styles.title}>Rating & Reviews</Text>

      <View style={styles.topSection}>
        <View style={styles.leftSection}>
          <Text style={styles.averageText}>
            {Number(averageRating || 0).toFixed(1)}
          </Text>
          <Rating
            count={5}
            readonly
            imageSize={16}
            showRating={false}
            startingValue={Number(averageRating || 0)}
          />
          <Text style={styles.totalText}>{totalRatings} Ratings</Text>
        </View>

        <View style={styles.rightSection}>
          {[5, 4, 3, 2, 1].map(star => (
            <View key={star} style={styles.barRow}>
              <Text style={styles.starLabel}>{star}</Text>
              <Text style={{color: '#FFCB02', fontSize: 16}}>★</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {width: `${getPercentage(starCounts[star] || 0)}%`},
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const AllReviews = ({data}) => {
  const reviewsFromApi = data?.reviews?.reviews || [];
  const reviews = reviewsFromApi.map((review, index) => ({
    _id: review?._id || `review-${index}`,
    rating: review?.rating || 0,
    review: review?.review || '',
    createdAt: review?.createdAt || data?.updatedAt || data?.createdAt,
    userId: {
      firstName:
        review?.userId?.firstName ||
        review?.vendor?.firstName ||
        review?.client?.firstName ||
        '',
      lastName:
        review?.userId?.lastName ||
        review?.vendor?.lastName ||
        review?.client?.lastName ||
        '',
      email:
        review?.userId?.email || review?.vendor?.email || review?.client?.email,
    },
  }));

  const starCounts = reviews.reduce(
    (acc, item) => {
      const rounded = Math.round(Number(item?.rating || 0));
      if (rounded >= 1 && rounded <= 5) acc[rounded] += 1;
      return acc;
    },
    {5: 0, 4: 0, 3: 0, 2: 0, 1: 0},
  );

  const averageRating =
    data?.reviews?.averageRating ??
    (reviews.length
      ? reviews.reduce((sum, item) => sum + Number(item?.rating || 0), 0) /
        reviews.length
      : 0);
  const totalRatings = data?.reviews?.totalReviews ?? reviews.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <RatingSummary
              averageRating={averageRating}
              totalRatings={totalRatings}
              starCounts={starCounts}
            />
            <View style={styles.recentHeadingWrapper}>
              <Text style={styles.recentHeadingText}>Most Recent</Text>
              <Text style={styles.recentCountText}>({reviews.length})</Text>
            </View>
          </>
        )}
        data={reviews}
        keyExtractor={item => item?._id}
        renderItem={({item}) => (
          <View style={{paddingHorizontal: width(3)}}>
            <ReviewsCard item={item} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Review Found!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AllReviews;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  ratingContainer: {
    padding: width(4),
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    marginBottom: width(3),
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    width: '35%',
    alignItems: 'flex-start',
  },
  averageText: {
    fontSize: 40,
    marginTop: -width(4),
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  totalText: {
    fontSize: 12,
    marginTop: 6,
    color: COLORS.semiLightText,
  },
  rightSection: {
    width: '65%',
    paddingLeft: width(3),
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  starLabel: {
    width: 16,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginRight: 4,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#FADAF0',
    borderRadius: 4,
    marginLeft: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF007F',
    borderRadius: 4,
  },
  emptyContainer: {
    height: width(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  recentHeadingWrapper: {
    paddingHorizontal: width(4),
    paddingVertical: width(2),
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentHeadingText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 16,
    color: COLORS.black,
  },
  recentCountText: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textLight,
    marginLeft: width(1),
  },
});

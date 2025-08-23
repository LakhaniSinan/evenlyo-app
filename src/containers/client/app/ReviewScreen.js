import React from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {ICONS} from '../../../assets';
import ReviewsCard from '../../../components/reviewsCard';
import {COLORS, fontFamly} from '../../../constants';

const RatingSummary = ({
  averageRating = 4.8,
  totalRatings = 40,
  starCounts = {5: 20, 4: 10, 3: 6, 2: 3, 1: 1},
}) => {
  const total = Object.values(starCounts).reduce((a, b) => a + b, 0);

  const getPercentage = count => (total > 0 ? (count / total) * 100 : 0);

  return (
    <View style={styles.ratingContainer}>
      <Text style={styles.title}>Rating & Reviews</Text>

      <View style={styles.topSection}>
        <View style={styles.leftSection}>
          <Text style={styles.averageText}>{averageRating}</Text>
          <Rating count={5} readonly imageSize={16} showRating={false} />
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

const AllReviews = () => {
  const reviews = [
    {
      id: 'r1',
      user: {
        name: 'Areeba Khan',
        avatar: 'https://example.com/images/user1.jpg',
      },
      rating: 5,
      date: '17 July 2025',
      comment:
        'Ahsan Bhai organized our wedding flawlessly. Everything was on point!',
    },
    {
      id: 'r2',
      user: {
        name: 'Hassan Ali',
        avatar: 'https://example.com/images/user2.jpg',
      },
      rating: 4,
      date: '10 July 2025',
      comment: 'Sound and lights were amazing. Highly recommended!',
    },
    {
      id: 'r3',
      user: {
        name: 'Maha Yousuf',
        avatar: 'https://example.com/images/user3.jpg',
      },
      rating: 5,
      date: '5 July 2025',
      comment: 'Professional and creative team. Loved the decor and stage.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <RatingSummary
              averageRating={4.8}
              totalRatings={40}
              starCounts={{5: 22, 4: 10, 3: 6, 2: 2, 1: 0}}
            />
            <TouchableOpacity
              style={{
                paddingHorizontal: width(4),
                paddingVertical: width(2),
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  fontSize: 16,
                  color: COLORS.black,
                }}>
                Most Recent
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  color: COLORS.textLight,
                }}>
                (7)
              </Text>
              <Image
                source={ICONS.arrowDown}
                resizeMode="contain"
                style={{
                  height: 12,
                  width: 12,
                  marginTop: width(2),
                  marginLeft: width(1),
                }}
              />
            </TouchableOpacity>
          </>
        )}
        data={reviews}
        keyExtractor={item => item.id}
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
});

import React from 'react';
import {ScrollView, Text, View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../../constants';
import ReviewsCard from '../../../components/reviewsCard';
import useTranslation from '../../../hooks/useTranslation';

const ReviewsDemo = () => {
  const {t} = useTranslation();

  // Sample reviews data
  const reviewsData = [
    {
      userName: 'Areeba Khan',
      rating: 4.5,
      reviewDate: '9 Feb 2025',
      reviewText: 'DJ RayBeatz absolutely lit up our mehndi night. The playlist was perfectly tailored, and everyone was on the dance floor all night. Highly recommended!',
    },
    {
      userName: 'Ahmed Ali',
      rating: 5.0,
      reviewDate: '15 Jan 2025',
      reviewText: 'Outstanding service! The sound quality was crystal clear and the music selection was perfect for our wedding celebration. Will definitely book again.',
    },
    {
      userName: 'Sarah Sheikh',
      rating: 4.0,
      reviewDate: '28 Dec 2024',
      reviewText: 'Great experience overall. The DJ was professional and responsive to our requests. The lighting setup was impressive too.',
    },
    {
      userName: 'Hassan Malik',
      rating: 4.8,
      reviewDate: '10 Dec 2024',
      reviewText: 'Fantastic entertainment for our corporate event. Everyone loved the music mix and the DJ kept the energy high throughout the evening.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('reviewsAndRatings')}</Text>
          <Text style={styles.subtitle}>{t('seeWhatClientsSaying')}</Text>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {reviewsData.map((review, index) => (
            <ReviewsCard
              key={index}
              userName={review.userName}
              rating={review.rating}
              reviewDate={review.reviewDate}
              reviewText={review.reviewText}
            />
          ))}
        </View>

        {/* Overall Rating Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('overallRating')}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.overallRating}>4.6</Text>
            <View style={styles.summaryStars}>
              <Text style={styles.starsText}>★★★★★</Text>
              <Text style={styles.reviewCount}>{t('basedOnReviews').replace('{count}', '127')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: width(4),
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: width(2),
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  reviewsList: {
    paddingVertical: width(2),
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    margin: width(3),
    borderRadius: width(3),
    padding: width(4),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: width(3),
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallRating: {
    fontSize: 48,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#FCAD38',
    marginRight: width(4),
  },
  summaryStars: {
    alignItems: 'flex-start',
  },
  starsText: {
    fontSize: 20,
    color: '#FCAD38',
    marginBottom: width(1),
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
  },
});

export default ReviewsDemo;

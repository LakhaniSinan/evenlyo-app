import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {getDistance} from '../../utils';
import ReviewsCard from '../reviewsCard';

const PRICING_LEGACY_KEYS = {
  perhour: 'Per Hour',
  hourly: 'Per Hour',
  hour: 'Per Hour',
  perday: 'Per Day',
  daily: 'Per Day',
  day: 'Per Day',
  perevent: 'Per Event',
  event: 'Per Event',
  perbooking: 'Per Event',
  booking: 'Per Event',
};

const PRICING_I18N_KEYS = {
  permonth: 'eventDetailPricingPerMonth',
  monthly: 'eventDetailPricingPerMonth',
  month: 'eventDetailPricingPerMonth',
  peryear: 'eventDetailPricingPerYear',
  yearly: 'eventDetailPricingPerYear',
  year: 'eventDetailPricingPerYear',
};

const normalizePricingType = type =>
  String(type ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '');

const getPricingTypeSuffix = (type, translate) => {
  if (!type) {
    return '';
  }
  const normalized = normalizePricingType(type);
  const specialKey = PRICING_I18N_KEYS[normalized];
  if (specialKey) {
    return `/${translate(specialKey)}`;
  }
  const legacyKey = PRICING_LEGACY_KEYS[normalized];
  if (legacyKey) {
    return `/${translate(legacyKey)}`;
  }
  return `/${translate('eventDetailPricingTypeFallback', {
    type: String(type).trim().toUpperCase(),
  })}`;
};

const resolveLocalizedLine = (value, lang) => {
  if (value == null || value === '') {
    return '';
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'object') {
    return lang === 'nl'
      ? String(value.nl || value.en || '').trim()
      : String(value.en || value.nl || '').trim();
  }
  return String(value).trim();
};

/** Supports array on root, nested reviews.reviews, or listing payloads. */
const normalizeReviewsList = data => {
  if (!data) {
    return [];
  }
  if (Array.isArray(data.reviews)) {
    return data.reviews;
  }
  if (Array.isArray(data?.reviews?.reviews)) {
    return data.reviews.reviews;
  }
  return [];
};

/**
 * Shows a customer-review summary above the listing description area.
 * Renders nothing if there are no reviews.
 */
export const EventListingReviewsSection = ({data}) => {
  const {t} = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const reviews = useMemo(() => normalizeReviewsList(data), [data]);

  const averageRating = useMemo(() => {
    const fromObj = Number(data?.reviews?.averageRating);
    if (!Number.isNaN(fromObj) && fromObj > 0) {
      return fromObj;
    }
    const fromRating = Number(data?.rating?.average);
    if (!Number.isNaN(fromRating) && fromRating > 0) {
      return fromRating;
    }
    if (!reviews.length) {
      return 0;
    }
    const sum = reviews.reduce((acc, r) => acc + Number(r?.rating || 0), 0);
    return sum / reviews.length;
  }, [data?.reviews?.averageRating, data?.rating?.average, reviews]);

  if (!reviews.length) {
    return null;
  }

  const avgLabel = Number.isFinite(averageRating)
    ? averageRating.toFixed(1)
    : '0.0';

  const first = reviews[0];
  let snippet = '';
  if (typeof first?.review === 'string' && first.review.trim().length > 0) {
    const raw = first.review.trim();
    snippet = raw.length > 130 ? `${raw.slice(0, 130)}…` : raw;
  } else if (typeof first?.comment === 'string' && first.comment.trim()) {
    const raw = first.comment.trim();
    snippet = raw.length > 130 ? `${raw.slice(0, 130)}…` : raw;
  }

  const displaySnippet = snippet || t('listingReviewsNoCommentSnippet');

  return (
    <>
      <View style={reviewsStyles.wrapper}>
        <View style={reviewsStyles.accentStrip} />

        <View style={reviewsStyles.cardBody}>
          <View style={reviewsStyles.rowBetween}>
            <Text style={reviewsStyles.sectionTitle}>
              {t('listingReviewsHeading')}
            </Text>
            <View style={reviewsStyles.avgPill}>
              <Icon name="star" size={12} color="#FFB800" />
              <Text
                style={[
                  reviewsStyles.avgPillText,
                  reviewsStyles.avgPillStarText,
                ]}>
                {avgLabel}
              </Text>
            </View>
          </View>

          <Text style={reviewsStyles.summaryLine}>
            {t('listingReviewsSummaryLine', {
              count: reviews.length,
              rating: avgLabel,
            })}
          </Text>

          <Rating
            type="star"
            ratingCount={5}
            imageSize={16}
            readonly
            startingValue={Math.min(5, Math.max(0, Number(avgLabel) || 0))}
            fractions={1}
            style={reviewsStyles.starsInline}
          />

          <View style={reviewsStyles.quoteBox}>
            <Icon
              name="chatbubble-ellipses-outline"
              size={18}
              color={COLORS.primary}
              style={reviewsStyles.quoteIcon}
            />
            <Text style={reviewsStyles.quoteText} numberOfLines={4}>
              {displaySnippet}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={reviewsStyles.cta}
            onPress={() => setModalVisible(true)}>
            <Text style={reviewsStyles.ctaText}>
              {t('listingReviewsSeeAll')} ({reviews.length})
            </Text>
            <Icon
              name="arrow-forward"
              size={16}
              color={COLORS.white}
              style={reviewsStyles.ctaIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={reviewsStyles.modalOverlay}>
          <View style={reviewsStyles.sheet}>
            <View style={reviewsStyles.sheetHeader}>
              <Text style={reviewsStyles.sheetTitle}>
                {t('listingReviewsModalTitle')}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('Close')}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                <Icon name="close" size={26} color={COLORS.black} />
              </TouchableOpacity>
            </View>
            <Text style={reviewsStyles.sheetSubtitle}>
              {t('listingReviewsModalSubtitle', {
                count: reviews.length,
                rating: avgLabel,
              })}
            </Text>

            <FlatList
              data={reviews}
              keyExtractor={(item, index) =>
                String(item?._id ?? item?.id ?? index)
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={reviewsStyles.listContent}
              renderItem={({item}) => (
                <View style={{width: '100%'}}>
                  <ReviewsCard item={item} />
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const EventAndPriceDetails = ({
  data,
  showrating,
  showDiscount,
  showSwitch,
  isLive,
  onStatusChange,
}) => {
  const {t, currentLanguage} = useTranslation();
  const locationData = useSelector(state => state.LocationSlice);

  const {coords} = locationData;
  const {distance} = getDistance(data?.location?.coordinates, coords);

  const distanceLabel = useMemo(() => {
    if (distance === undefined || distance === null || distance === '') {
      return t('eventDetailDistanceUnavailable');
    }
    const n = Number(distance);
    if (Number.isNaN(n)) {
      return t('eventDetailDistanceUnavailable');
    }
    return t('eventDetailKmAway', {distance: n.toFixed(1)});
  }, [distance, t]);

  const locationLine = useMemo(() => {
    const raw =
      data?.location?.userAddress ||
      data?.vendor?.businessLocation ||
      data?.details?.eventLocation;
    const line = resolveLocalizedLine(raw, currentLanguage);
    return line || t('notAvailable');
  }, [
    data?.location?.userAddress,
    data?.vendor?.businessLocation,
    data?.details?.eventLocation,
    currentLanguage,
    t,
  ]);

  const ratingLine = useMemo(() => {
    if (data?.rating?.average == null) {
      return t('eventDetailNoRatingsLine');
    }
    return t('eventDetailRatingLine', {
      average: Number(data.rating.average).toFixed(1),
      count: data?.rating?.totalReviews ?? 0,
    });
  }, [data?.rating?.average, data?.rating?.totalReviews, t]);

  const priceAmountLabel = useMemo(() => {
    const raw = data?.pricing?.amount;
    if (raw === null || raw === undefined || raw === '') {
      return t('notAvailable');
    }
    return String(raw);
  }, [data?.pricing?.amount, t]);

  const title =
    currentLanguage === 'nl'
      ? data?.title?.nl || data?.title?.en
      : data?.title?.en || data?.title?.nl;

  const averageStars = Number(data?.rating?.average) || 0;
  const pricingSuffix = data?.pricing?.type
    ? getPricingTypeSuffix(data.pricing.type, t)
    : '';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: showDiscount ? 'center' : 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: width(3),
      }}>
      <View style={{width: width(50)}}>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansSemiBold,
            color: COLORS.semiLightText,
            fontSize: 12,
          }}>
          {locationLine}
        </Text>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.textDark,
            fontSize: 15,
          }}>
          {title || t('notAvailable')}
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={ICONS.locationWithoutBg}
            resizeMode="contain"
            style={{height: 10, width: 10}}
            tintColor={COLORS.semiLightText}
          />
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              marginLeft: width(2),
              color: COLORS.semiLightText,
              fontSize: 11,
              flexShrink: 1,
            }}>
            {distanceLabel}
          </Text>
        </View>
        {showrating ? (
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              marginTop: width(1),
            }}>
            <Rating
              type="star"
              ratingCount={5}
              readonly
              startingValue={Math.min(5, Math.max(0, averageStars))}
              imageSize={15}
              fractions={1}
            />
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansSemiMedium,
                fontSize: 12,
                marginLeft: width(2),
                color: COLORS.semiLightText,
              }}>
              {ratingLine}
            </Text>
          </View>
        ) : null}
      </View>

      <View>
        {showDiscount ? (
          <View
            style={{
              backgroundColor: '#04C373',
              borderRadius: 100,
              marginBottom: width(2),
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: '#FFFF',
                fontSize: 12,
              }}>
              {t('eventDetailDiscountBadge', {
                percent: data?.discountPercent ?? data?.discount ?? 20,
              })}
            </Text>
          </View>
        ) : null}
        {showSwitch ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: width(2),
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: COLORS.green,
                fontSize: 12,
                marginRight: width(2),
              }}>
              {t('eventDetailLive')}
            </Text>

            <Switch
              value={data?.isActive}
              onValueChange={onStatusChange}
              trackColor={{
                false: '#E5E5E5',
                true: COLORS.primary,
              }}
              thumbColor={isLive ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E5E5E5"
              style={styles.switch}
            />
          </View>
        ) : null}
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: '#000',
            fontSize: 15,
          }}>
          € {priceAmountLabel}
        </Text>
        {pricingSuffix ? (
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              color: '#000',
              fontSize: 9,
            }}>
            {pricingSuffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default EventAndPriceDetails;

const styles = StyleSheet.create({
  switch: {
    transform: [{scaleX: 1.1}, {scaleY: 1.1}],
  },
});

const reviewsStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: width(4),
    marginTop: width(3),
    borderRadius: width(3),
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFF4',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  accentStrip: {
    height: 4,
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  cardBody: {
    paddingHorizontal: width(3.5),
    paddingVertical: width(3),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 13,
    color: COLORS.textDark,
    flex: 1,
    paddingRight: width(2),
  },
  avgPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    paddingHorizontal: width(2),
    paddingVertical: 4,
    borderRadius: 20,
  },
  avgPillText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.textDark,
  },
  avgPillStarText: {
    marginLeft: 4,
  },
  summaryLine: {
    marginTop: width(2),
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 11,
    color: COLORS.textLight,
  },
  starsInline: {
    alignSelf: 'flex-start',
    marginTop: width(1.5),
  },
  quoteBox: {
    marginTop: width(3),
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.backgroundLight,
    padding: width(2.5),
    borderRadius: width(2),
  },
  quoteIcon: {
    marginRight: width(2),
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textDark,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: width(3),
    backgroundColor: COLORS.primary,
    paddingVertical: width(3),
    borderRadius: width(2.5),
  },
  ctaText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 13,
    color: COLORS.white,
  },
  ctaIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: width(5),
    borderTopRightRadius: width(5),
    paddingHorizontal: width(4),
    paddingBottom: width(6),
    paddingTop: width(4),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 17,
    color: COLORS.black,
    flex: 1,
    paddingRight: width(3),
  },
  sheetSubtitle: {
    marginTop: width(1),
    marginBottom: width(3),
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 12,
    color: COLORS.textLight,
  },
  listContent: {
    padding: width(1),
    gap: 0,
  },
});

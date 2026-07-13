import React, {memo} from 'react';
import Categories from '../categories';
import HeadingComponent from '../headingComponent';
import HomeCard from '../homeCard';
import SubCategories from '../subCategories';
import HomeHeader from './HomeHeader';
import RelevantVendorsRow from './RelevantVendorsRow';

const HomeListSection = ({
  sectionId,
  t,
  currentLanguage,
  navigation,
  location,
  categories,
  selectedCategory,
  onCategorySelect,
  subCategories,
  selectedSubCategory,
  onSubCategorySelect,
  homeData,
  platformFeePercentage,
  onNotificationsPress,
  onFilterPress,
  onBookingCardPress,
  onVendorPress,
  onAddToWishList,
}) => {
  switch (sectionId) {
    case 'header':
      return (
        <HomeHeader
          city={location.city}
          regionState={location.regionState}
          address={location.address}
          onNotificationsPress={onNotificationsPress}
          onFilterPress={onFilterPress}
        />
      );

    case 'categories':
      return (
        <>
          <HeadingComponent
            heading={t('Explore')}
            gradientText={t('Categories')}
            rightArrow={false}
            onPress={() => navigation.navigate('EventListingScreen')}
          />
          <Categories
            data={categories}
            selected={selectedCategory}
            setSelected={onCategorySelect}
          />
        </>
      );

    case 'subcategories':
      return (
        <SubCategories
          data={subCategories}
          subSelected={selectedSubCategory}
          setsubSelected={onSubCategorySelect}
        />
      );

    case 'bookingHeading':
      return (
        <HeadingComponent
          heading={t('Booking')}
          gradientText={t('Items')}
          rightArrow
          onPress={() => navigation.navigate('EventListingScreen')}
        />
      );

    case 'bookingCards':
      return (
        <HomeCard
          key={`booking-${homeData?.bookingItems?.length || 0}`}
          data={homeData?.bookingItems || []}
          onBookingCardPress={onBookingCardPress}
          handleAddToWishList={onAddToWishList}
        />
      );

    case 'vendorsHeading':
      return (
        <HeadingComponent heading={t('relevant')} gradientText={t('vendors')} />
      );

    case 'vendors':
      return (
        <RelevantVendorsRow
          key={`vendors-${homeData?.releventVendors?.length || 0}`}
          vendors={homeData?.releventVendors || []}
          currentLanguage={currentLanguage}
          navigation={navigation}
          platformFeePercentage={platformFeePercentage}
          onVendorPress={onVendorPress}
          emptyLabel={t('noRelevantVendors')}
        />
      );

    default:
      return null;
  }
};

export default memo(HomeListSection);

import React, {useCallback, useMemo, useRef} from 'react';
import {FlatList, SafeAreaView, StyleSheet} from 'react-native';
import {width} from 'react-native-dimension';
import {useSelector} from 'react-redux';
import AuthModalsGroup from '../../../components/authModal/AuthModalsGroup';
import CommonAlert from '../../../components/commanAlert';
import HomeListSection from '../../../components/home/HomeListSection';
import Loader from '../../../components/loder';
import FilterModal from '../../../components/modals/FilterModal';
import {COLORS} from '../../../constants';
import useAuthModals from '../../../hooks/useAuthModals';
import useFirebaseMessaging from '../../../hooks/useFirebaseMessaging';
import useHomeScreen from '../../../hooks/useHomeScreen';
import useTranslation from '../../../hooks/useTranslation';

const Home = ({navigation}) => {
  const modalRef = useRef();
  const {t, currentLanguage} = useTranslation();
  const {address, city, state: regionState} = useSelector(
    state => state.LocationSlice,
  );

  const {
    showLogin,
    showForgot,
    showRegister,
    setShowLogin,
    setShowForgot,
    setShowRegister,
    openLogin,
    handlePressFun,
  } = useAuthModals();

  useFirebaseMessaging();

  const {
    categories,
    subCategories,
    homeData,
    selectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    platformFeePercentage,
    isFilterVisible,
    setFilterVisible,
    refreshing,
    isWishlistLoading,
    isSubCategoriesLoading,
    listSections,
    handleCategorySelect,
    onRefresh,
    onBookingCardPress,
    onVendorCardPress,
    handleAddToWishList,
    onApplyFilters,
  } = useHomeScreen({modalRef, navigation, openLogin});

  const location = useMemo(
    () => ({address, city, regionState}),
    [address, city, regionState],
  );

  const sectionProps = useMemo(
    () => ({
      t,
      currentLanguage,
      navigation,
      location,
      categories,
      selectedCategory,
      onCategorySelect: handleCategorySelect,
      subCategories,
      selectedSubCategory,
      onSubCategorySelect: setSelectedSubCategory,
      homeData,
      platformFeePercentage,
      onNotificationsPress: () => navigation.navigate('Notifications'),
      onFilterPress: () => setFilterVisible(true),
      onBookingCardPress,
      onVendorPress: onVendorCardPress,
      onAddToWishList: handleAddToWishList,
    }),
    [
      t,
      currentLanguage,
      navigation,
      location,
      categories,
      selectedCategory,
      handleCategorySelect,
      subCategories,
      selectedSubCategory,
      setSelectedSubCategory,
      homeData,
      platformFeePercentage,
      setFilterVisible,
      onBookingCardPress,
      onVendorCardPress,
      handleAddToWishList,
    ],
  );

  const renderSection = useCallback(
    ({item: sectionId}) => (
      <HomeListSection sectionId={sectionId} {...sectionProps} />
    ),
    [sectionProps],
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={listSections}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        renderItem={renderSection}
        keyExtractor={sectionId => sectionId}
        extraData={currentLanguage}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal
        isVisible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
        onApplyPress={onApplyFilters}
        modalRef={modalRef}
      />

      <CommonAlert ref={modalRef} />
      <Loader isLoading={isWishlistLoading || isSubCategoriesLoading} />

      <AuthModalsGroup
        showLogin={showLogin}
        showForgot={showForgot}
        showRegister={showRegister}
        setShowLogin={setShowLogin}
        setShowForgot={setShowForgot}
        setShowRegister={setShowRegister}
        handlePressFun={handlePressFun}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: width(6),
  },
});

export default Home;

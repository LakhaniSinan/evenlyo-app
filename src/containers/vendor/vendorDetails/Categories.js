import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import FastImage from 'react-native-fast-image';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import useCategories from '../../../hooks/getCategories';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

const CategoryItem = memo(({item, isSelected, onSelect, currentLanguage}) => {
  const iconUri = item?.icon?.endsWith('.svg')
    ? item.icon.replace('.svg', '.png')
    : item.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(item.id || item._id)}
      style={[
        styles.categoryBox,
        {backgroundColor: isSelected ? COLORS.white : COLORS.backgroundLight},
      ]}>
      {isSelected && (
        <View style={styles.checkIconWrapper}>
          <FastImage
            source={ICONS.cheackIcon}
            style={styles.checkIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      )}

      <View
        style={[
          styles.imageWrapper,
          {
            borderColor: isSelected ? COLORS.primary : COLORS.backgroundLight,
          },
        ]}>
        <FastImage
          source={{uri: iconUri}}
          style={styles.image}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>

      <Text style={styles.categoryName}>
        {currentLanguage === 'en' ? item?.name?.en : item?.name?.nl}
      </Text>
    </TouchableOpacity>
  );
});

const Categories = ({selectedCat, onPressBack, handleNextStep}) => {
  const {t, currentLanguage} = useTranslation();
  const modalRef = useRef(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const {categories, fetchCategories} = useCategories();

  useEffect(() => {
    loadCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCat) {
      setSelectedCategories(selectedCat);
    }
  }, [selectedCat]);

  const loadCategories = async () => {
    try {
      setIsFetching(true);
      setIsLoading(true);
      await fetchCategories();
    } catch (error) {
      console.log('Error fetching categories:', error);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  const toggleSelect = useCallback(id => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  }, []);

  const handleContinue = () => {
    if (!selectedCategories?.length) {
      return modalRef.current.show({
        status: 'error',
        message: 'Please select at least one category.',
      });
    }
    handleNextStep(selectedCategories);
  };

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {isFetching ? (
        <>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching categories...</Text>
        </>
      ) : (
        <Text style={styles.emptyText}>No categories found.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.form}>
      <Text style={styles.headerText}>{t('Select Your Categories')}</Text>
      <CommonAlert ref={modalRef} />

      <FlatList
        data={categories}
        keyExtractor={item => item._id?.toString()}
        renderItem={({item}) => (
          <CategoryItem
            item={item}
            isSelected={selectedCategories.includes(item.id || item._id)}
            onSelect={toggleSelect}
            currentLanguage={currentLanguage}
          />
        )}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={10}
        maxToRenderPerBatch={8}
        ListEmptyComponent={ListEmptyComponent}
      />

      <View style={styles.buttonContainer}>
        <GradientButton
          text={t('back')}
          useGradient
          onPress={onPressBack}
          type="outline"
          gradientColors={GRADIENT_COLORS}
          icon={ICONS.backIcon}
          styleProps={{flex: 1}}
          outlineButtonStyle={{flex: 1, paddingVertical: 0}}
          styleContainer={styles.backButton}
        />

        <GradientButton
          text={t('continue')}
          onPress={handleContinue}
          type="filled"
          gradientColors={GRADIENT_COLORS}
          styleProps={{flex: 1}}
          styleContainer={styles.continueButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 20,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 15,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: width(10),
  },
  categoryBox: {
    backgroundColor: COLORS.white,
    height: width(40),
    width: width(40),
    borderRadius: width(4),
    justifyContent: 'center',
    alignItems: 'center',
    margin: width(2),
    position: 'relative',
  },
  checkIconWrapper: {
    position: 'absolute',
    top: width(2),
    right: width(2),
  },
  checkIcon: {
    height: width(5),
    width: width(5),
  },
  imageWrapper: {
    height: width(20),
    width: width(20),
    borderRadius: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: width(2),
  },
  image: {
    height: width(8),
    width: width(8),
  },
  categoryName: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    textAlign: 'center',
    paddingHorizontal: width(1),
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(10),
    gap: width(2),
    justifyContent: 'flex-end',
  },
  backButton: {
    flex: 1,
    width: undefined,
    height: width(11),
  },
  continueButton: {
    flex: 1,
    width: undefined,
    height: width(11),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: width(10),
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});

export default Categories;

import React, {useCallback, useMemo, useRef} from 'react';
import {
  FlatList,
  Image,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  BRAND_BUTTON_GRADIENT_COLORS,
  BRAND_BUTTON_GRADIENT_LOCATIONS,
  COLORS,
  fontFamly,
} from '../../constants';
import {useTranslation} from '../../hooks';

const PRESS_COOLDOWN_MS = 500;

const isValidImageUri = uri =>
  typeof uri === 'string' && /^https?:\/\//i.test(uri.trim());

const getSubCategoryKey = item =>
  String(item?._id || item?.id || item?.slug || item?.name?.en || '');

const SubCategoryIcon = React.memo(({uri, size = 13}) => {
  const safeUri = typeof uri === 'string' ? uri.trim() : '';

  if (!isValidImageUri(safeUri)) {
    return (
      <View
        style={[
          styles.iconFallback,
          {width: size, height: size, borderRadius: size / 2},
        ]}
      />
    );
  }

  return (
    <Image
      source={{uri: safeUri}}
      style={{width: size, height: size}}
      resizeMode="contain"
    />
  );
});

const SubCategoryCard = React.memo(({item, isSelected, label, onPress}) => {
  const hasIcon = isValidImageUri(item?.icon);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.pillTouchable}
      onPress={onPress}>
      <View style={[styles.card, isSelected && styles.cardSelected]}>
        <View style={styles.iconSlot}>
          {isSelected && (
            <LinearGradient
              colors={BRAND_BUTTON_GRADIENT_COLORS}
              locations={BRAND_BUTTON_GRADIENT_LOCATIONS}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.iconGradient}
            />
          )}
          <View style={styles.iconCenter}>
            {hasIcon ? (
              <SubCategoryIcon uri={item?.icon} />
            ) : (
              <Text style={styles.iconInitial}>
                {label?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            )}
          </View>
        </View>
        <Text
          style={[styles.cardText, isSelected && styles.selectedText]}
          numberOfLines={1}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const SubCategories = ({data, subSelected, setsubSelected}) => {
  const {currentLanguage} = useTranslation();
  const isPressLockedRef = useRef(false);
  const selectedId = subSelected?._id || subSelected?.id;

  const subCategories = useMemo(
    () => (Array.isArray(data) ? data.filter(Boolean) : []),
    [data],
  );

  const getLabel = useCallback(
    item =>
      currentLanguage === 'en'
        ? item?.name?.en || item?.name || ''
        : item?.name?.nl || item?.name || '',
    [currentLanguage],
  );

  const handleSelect = useCallback(
    item => {
      const itemId = item?._id || item?.id;
      if (!itemId || itemId === selectedId || isPressLockedRef.current) {
        return;
      }

      isPressLockedRef.current = true;

      InteractionManager.runAfterInteractions(() => {
        setsubSelected(item);
      });

      setTimeout(() => {
        isPressLockedRef.current = false;
      }, PRESS_COOLDOWN_MS);
    },
    [selectedId, setsubSelected],
  );

  const renderItem = useCallback(
    ({item}) => {
      const itemId = item?._id || item?.id;
      return (
        <SubCategoryCard
          item={item}
          label={getLabel(item)}
          isSelected={Boolean(itemId && itemId === selectedId)}
          onPress={() => handleSelect(item)}
        />
      );
    },
    [getLabel, handleSelect, selectedId],
  );

  const keyExtractor = useCallback(item => getSubCategoryKey(item), []);

  if (!subCategories.length) {
    return null;
  }

  return (
    <FlatList
      data={subCategories}
      horizontal
      keyExtractor={keyExtractor}
      extraData={selectedId}
      contentContainerStyle={styles.listContent}
      showsHorizontalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={6}
      windowSize={7}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillTouchable: {
    marginRight: 10,
  },
  card: {
    minWidth: 108,
    height: 44,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  iconSlot: {
    height: 22,
    width: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  iconGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 11,
  },
  iconCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInitial: {
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.primary,
  },
  iconFallback: {
    backgroundColor: COLORS.border,
  },
  cardText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    flexShrink: 1,
  },
  selectedText: {
    color: COLORS.textDark,
  },
});

export default React.memo(SubCategories);

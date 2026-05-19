import React, {useCallback, useMemo, useRef} from 'react';
import {
  FlatList,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {SvgUri} from 'react-native-svg';
import {
  BRAND_BUTTON_GRADIENT_COLORS,
  BRAND_BUTTON_GRADIENT_LOCATIONS,
  COLORS,
  fontFamly,
} from '../../constants';
import {useTranslation} from '../../hooks';

const PRESS_COOLDOWN_MS = 500;
const failedIconUris = new Set();

const isSafeSvgUri = uri =>
  typeof uri === 'string' &&
  /^https?:\/\//i.test(uri.trim()) &&
  uri.toLowerCase().includes('.svg');

const getCategoryKey = item =>
  String(item?._id || item?.id || item?.slug || item?.name?.en || '');

const getInitial = label => {
  const trimmed = String(label || '').trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
};

const SafeCategoryIcon = React.memo(({uri, size = 16, enabled = false}) => {
  const safeUri = typeof uri === 'string' ? uri.trim() : '';

  if (!enabled || !isSafeSvgUri(safeUri) || failedIconUris.has(safeUri)) {
    return (
      <View
        style={[styles.iconFallback, {width: size, height: size, borderRadius: size / 2}]}
      />
    );
  }

  return (
    <SvgUri
      width={size}
      height={size}
      uri={safeUri}
      onError={() => {
        failedIconUris.add(safeUri);
      }}
    />
  );
});

const CategoryCard = React.memo(({item, isSelected, label, onPress}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cardTouchable}
      onPress={onPress}>
      <View style={[styles.cardShell, isSelected && styles.cardShellSelected]}>
        <View style={styles.iconWrapper}>
          {isSelected ? (
            <>
              <LinearGradient
                colors={BRAND_BUTTON_GRADIENT_COLORS}
                locations={BRAND_BUTTON_GRADIENT_LOCATIONS}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.activeIconGradient}
              />
              <View style={styles.iconCenter}>
                <SafeCategoryIcon uri={item?.icon} enabled />
              </View>
            </>
          ) : (
            <Text style={styles.iconInitial}>{getInitial(label)}</Text>
          )}
        </View>
        <Text style={styles.cardText} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const Categories = ({data, selected, setSelected}) => {
  const {currentLanguage} = useTranslation();
  const isPressLockedRef = useRef(false);
  const selectedId = selected?._id || selected?.id;

  const categories = useMemo(
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
        setSelected(item);
      });

      setTimeout(() => {
        isPressLockedRef.current = false;
      }, PRESS_COOLDOWN_MS);
    },
    [selectedId, setSelected],
  );

  const renderItem = useCallback(
    ({item}) => {
      const itemId = item?._id || item?.id;
      return (
        <CategoryCard
          item={item}
          label={getLabel(item)}
          isSelected={Boolean(itemId && itemId === selectedId)}
          onPress={() => handleSelect(item)}
        />
      );
    },
    [getLabel, handleSelect, selectedId],
  );

  const keyExtractor = useCallback(item => getCategoryKey(item), []);

  if (!categories.length) {
    return null;
  }

  return (
    <FlatList
      data={categories}
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
    paddingVertical: 8,
  },
  cardTouchable: {
    marginRight: 10,
  },
  cardShell: {
    width: 118,
    height: width(28),
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardShellSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  card: {
    width: 118,
    height: width(28),
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.backgroundLight,
  },
  iconWrapper: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  activeIconGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  iconCenter: {
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInitial: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.primary,
  },
  iconFallback: {
    backgroundColor: COLORS.border,
  },
  cardText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    marginTop: 8,
    color: COLORS.textDark,
  },
});

export default React.memo(Categories);

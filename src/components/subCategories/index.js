import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SvgUri} from 'react-native-svg';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const isSafeSvgUri = uri =>
  typeof uri === 'string' &&
  /^https?:\/\//i.test(uri.trim()) &&
  uri.toLowerCase().includes('.svg');

const SubCategories = ({data, subSelected, setsubSelected}) => {
  const {currentLanguage} = useTranslation();
  const renderSubCategoryIcon = icon => {
    if (!isSafeSvgUri(icon)) {
      return <View style={styles.iconFallback} />;
    }

    return <SvgUri width={13} height={13} uri={encodeURI(icon.trim())} />;
  };

  return (
    <FlatList
      data={data}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.listContent}
      showsHorizontalScrollIndicator={false}
      renderItem={({item}) => {
        const isSelected = subSelected?._id === item?._id;

        return (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.pillTouchable}
            onPress={() => setsubSelected(item)}>
            {isSelected ? (
              <View style={[styles.card, styles.selectedCard]}>
                <View style={[styles.iconWrapper, styles.selectedIconWrapper]}>
                  {renderSubCategoryIcon(item?.icon)}
                </View>
                <Text style={[styles.cardText, styles.selectedText]}>
                  {currentLanguage === 'en' ? item?.name?.en : item?.name?.nl}
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                <View style={styles.iconWrapper}>
                  {renderSubCategoryIcon(item?.icon)}
                </View>
                <Text style={styles.cardText}>
                  {currentLanguage === 'en' ? item?.name?.en : item?.name?.nl}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      }}
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
    borderRadius: 9,
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
  },
  selectedCard: {
    borderWidth: 1.2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.backgroundLight,
  },
  iconWrapper: {
    height: 22,
    width: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: COLORS.white,
  },
  selectedIconWrapper: {
    height: 22,
    width: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: COLORS.primary,
  },
  cardText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
  },
  selectedText: {
    color: COLORS.primary,
  },
  iconFallback: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#DADADA',
  },
});

export default SubCategories;

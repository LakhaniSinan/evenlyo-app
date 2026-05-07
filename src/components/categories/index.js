import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SvgUri} from 'react-native-svg';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const isSafeSvgUri = uri =>
  typeof uri === 'string' &&
  /^https?:\/\//i.test(uri.trim()) &&
  uri.toLowerCase().includes('.svg');

const Categories = ({data, selected, setSelected}) => {
  const {currentLanguage} = useTranslation();
  const renderCategoryIcon = icon => {
    if (!isSafeSvgUri(icon)) {
      return <View style={styles.iconFallback} />;
    }

    return <SvgUri width={16} height={16} uri={encodeURI(icon.trim())} />;
  };

  return (
    <FlatList
      data={data}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.listContent}
      showsHorizontalScrollIndicator={false}
      renderItem={({item}) => {
        const isSelected = selected?._id === item?._id;

        return (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.cardTouchable}
            onPress={() => setSelected(item)}>
            {isSelected ? (
              <View style={styles.selectedCardBorder}>
                <View style={[styles.card, styles.selectedCard]}>
                  <LinearGradient
                    colors={['#FF295D', '#E31B95', '#C817AE']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[styles.iconWrapper, styles.activeIconWrapper]}>
                    <View style={styles.iconCenter}>
                      {renderCategoryIcon(item?.icon)}
                    </View>
                  </LinearGradient>
                  <Text style={styles.cardText}>
                    {currentLanguage === 'en' ? item?.name?.en : item?.name?.nl}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.card}>
                <View style={styles.iconWrapper}>
                  <View style={styles.iconCenter}>
                    {renderCategoryIcon(item?.icon)}
                  </View>
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
    paddingVertical: 8,
  },
  cardTouchable: {
    marginRight: 10,
  },
  selectedCardBorder: {
    width: 118,
    minHeight: 104,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    padding: 1,
    backgroundColor: COLORS.backgroundLight,
    overflow: 'hidden',
  },
  selectedCard: {
    borderWidth: 0,
    borderRadius: 9,
    overflow: 'hidden',
  },
  card: {
    width: 118,
    minHeight: 104,
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: 'flex-start',
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
  },
  activeIconWrapper: {
    backgroundColor: 'transparent',
  },
  iconCenter: {
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconFallback: {
    height: 14,
    width: 14,
    borderRadius: 7,
    backgroundColor: '#DADADA',
  },
  cardText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    marginTop: 10,
    color: COLORS.textDark,
  },
});

export default Categories;

import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SvgUri} from 'react-native-svg';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const SubCategories = ({data, subSelected, setsubSelected}) => {
  const {currentLanguage} = useTranslation();
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
              <LinearGradient
                colors={['#FF295D', '#E31B95', '#C817AE']}
                style={styles.gradientBorder}>
                <View style={[styles.card, styles.selectedCard]}>
                  <View style={styles.selectedIconWrapper}>
                    <SvgUri width={13} height={13} uri={item?.icon} />
                  </View>
                  <Text style={[styles.cardText, styles.selectedText]}>
                    {currentLanguage === 'en' ? item?.name?.en : item?.name?.nl}
                  </Text>
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.card}>
                <View style={styles.iconWrapper}>
                  <SvgUri width={13} height={13} uri={item?.icon} />
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
  gradientBorder: {
    padding: 1,
    borderRadius: 10,
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
    backgroundColor: 'transparent',
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
    backgroundColor: COLORS.white,
  },
  cardText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
  },
  selectedText: {
    color: COLORS.white,
  },
});

export default SubCategories;

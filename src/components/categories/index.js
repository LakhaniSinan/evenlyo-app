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
              <LinearGradient
                colors={['#FFFFFF', '#FFE6F1', '#FF4D88', '#C817AE']}
                locations={[0, 0.22, 0.62, 1]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientBorder}>
                <View style={styles.innerCard}>
                  <View style={styles.card}>
                    <LinearGradient
                      colors={['#FF295D', '#E31B95', '#C817AE']}
                      style={styles.activeIconWrapper}>
                      <View style={styles.iconCenter}>
                        <SvgUri width={16} height={16} uri={item?.icon} />
                      </View>
                    </LinearGradient>
                    <Text style={styles.cardText}>
                      {currentLanguage === 'en' ? item?.name?.en : item?.name?.nl}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.card}>
                <View style={styles.iconWrapper}>
                  <View style={styles.iconCenter}>
                    <SvgUri width={16} height={16} uri={item?.icon} />
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
  gradientBorder: {
    padding: 1.5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 12,
    borderWidth: 2.2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 118,
    minHeight: 104,
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
  },
  activeIconWrapper: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
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

export default Categories;

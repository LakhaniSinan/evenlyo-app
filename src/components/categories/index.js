import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';

const Categories = ({data, selected, setSelected}) => {
  const {currentLanguage} = useTranslation();
  return (
    <FlatList
      data={data}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingHorizontal: 10}}
      showsHorizontalScrollIndicator={false}
      renderItem={({item, index}) => {
        const isSelected = selected?._id === item?._id;
        const CardContent = () => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: isSelected
                  ? 'transparent'
                  : COLORS.backgroundLight,
                height: isSelected ? 84 : 97,
                width: isSelected ? 99 : 120,
              },
            ]}>
            {isSelected ? (
              <LinearGradient
                colors={['#FF295D', '#E31B95', '#C817AE']}
                style={styles.activeIconWrapper}>
                <Text>{item?.icon}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.iconWrapper}>
                <Text>{item?.icon}</Text>
              </View>
            )}
            <Text style={styles.cardText}>
              {currentLanguage === 'en' ? item?.name?.en : item?.name.nl}
            </Text>
          </View>
        );

        return (
          <TouchableOpacity onPress={() => setSelected(item)}>
            {isSelected ? (
              <LinearGradient
                colors={[
                  'rgba(255,255,255,1)',
                  'rgba(255,255,255,0.8)',
                  '#FF295D',
                  '#E31B95',
                  '#C817AE',
                ]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientBorder}>
                <View style={styles.innerCard}>
                  <CardContent />
                </View>
              </LinearGradient>
            ) : (
              <CardContent />
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    padding: 1.5,
    borderRadius: 12,
  },
  innerCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 10.5,
    margin: 0.8,
    borderWidth: 4,
    borderColor: 'white',
  },
  card: {
    marginHorizontal: 5,
    paddingHorizontal: 10,
    height: 84,
    width: 99,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  iconWrapper: {
    height: 32,
    width: 32,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  activeIconWrapper: {
    height: 32,
    width: 32,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    height: 14,
    width: 14,
    resizeMode: 'contain',
  },
  cardText: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
    marginTop: 6,
    color: COLORS.textDark,
  },
});

export default Categories;

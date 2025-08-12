import React, {useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';

const data = [
  {label: 'All', icon: ICONS.four},
  {label: 'DJ', icon: ICONS.four},
  {label: 'Live Band', icon: ICONS.four},
  {label: 'Photo Booth', icon: ICONS.four},
];

const SubCategories = () => {
  const [selected, setSelected] = useState(0);

  return (
    <FlatList
      data={data}
      horizontal
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{paddingHorizontal: 10}}
      showsHorizontalScrollIndicator={false}
      renderItem={({item, index}) => {
        const isSelected = selected === index;

        const CardContent = () => (
          <View
            style={[
              styles.card,
              {
                backgroundColor: isSelected
                  ? 'transparent'
                  : COLORS.backgroundLight,
              },
            ]}>
            <View style={styles.iconWrapper}>
              <Image
                style={styles.icon}
                source={item.icon}
                tintColor={isSelected ? COLORS.white : COLORS.black}
              />
            </View>
            <Text
              style={[
                styles.cardText,
                {color: isSelected ? '#fff' : COLORS.textDark},
              ]}>
              {item.label}
            </Text>
          </View>
        );

        return (
          <TouchableOpacity onPress={() => setSelected(index)}>
            {isSelected ? (
              <LinearGradient
                colors={['#FF295D', '#E31B95', '#C817AE']}
                style={styles.gradientBorder}>
                <CardContent />
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
    padding: 0.8,
    borderRadius: 12,
  },
  card: {
    marginHorizontal: 5,
    paddingHorizontal: 10,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  iconWrapper: {
    height: 25,
    width: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  icon: {
    height: 12,
    width: 12,
    resizeMode: 'contain',
  },
  cardText: {
    textAlign: 'center',
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
  },
});

export default SubCategories;

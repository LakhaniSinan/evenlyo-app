import React, {useCallback, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

const categories = [
  {
    id: 1,
    name: 'Entertainment & Attractions',
    image: ICONS.entertintmentIcon,
    subCategories: [
      {id: 1, name: 'DJ', icon: ICONS.decoration7},
      {id: 2, name: 'Live Band', icon: ICONS.decoration6},
      {id: 3, name: 'Photo Booth', icon: ICONS.decoration5},
    ],
  },
  {
    id: 2,
    name: 'Food & Drinks',
    image: ICONS.foodIcon,
    subCategories: [
      {id: 4, name: 'LED Fairy Lights', icon: ICONS.decoration4},
      {id: 5, name: 'Table Floral Centerpieces', icon: ICONS.decoration3},
      {id: 6, name: 'Floral Chandelier', icon: ICONS.decoration2},
      {id: 7, name: 'Helium Balloon Setup', icon: ICONS.decoration1},
    ],
  },
  {
    id: 3,
    name: 'Decoration & Styling',
    image: ICONS.decorIcon,
    subCategories: [
      {id: 8, name: 'LED Fairy Lights', icon: ICONS.decoration4},
      {id: 9, name: 'Table Floral Centerpieces', icon: ICONS.decoration3},
      {id: 10, name: 'Floral Chandelier', icon: ICONS.decoration2},
      {id: 11, name: 'Helium Balloon Setup', icon: ICONS.decoration1},
    ],
  },
  {
    id: 4,
    name: 'Locations & Party Tents',
    image: ICONS.tentIcon,
    subCategories: [
      {id: 1, name: 'DJ', icon: ICONS.decoration7},
      {id: 2, name: 'Live Band', icon: ICONS.decoration6},
      {id: 3, name: 'Photo Booth', icon: ICONS.decoration5},
    ],
  },
  {
    id: 5,
    name: 'Staff & Services',
    image: ICONS.staffServices,
    subCategories: [
      {id: 4, name: 'LED Fairy Lights', icon: ICONS.decoration4},
      {id: 5, name: 'Table Floral Centerpieces', icon: ICONS.decoration3},
      {id: 6, name: 'Floral Chandelier', icon: ICONS.decoration2},
      {id: 7, name: 'Helium Balloon Setup', icon: ICONS.decoration1},
    ],
  },
];

const Categories = ({onPressBack, handleNextStep}) => {
  const {t} = useTranslation();
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleSelect = id => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  // ✅ Render category item
  const renderItem = useCallback(
    ({item}) => {
      const isSelected = selectedCategories.includes(item.id);

      return (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          onPress={() => toggleSelect(item.id)}
          style={[
            styles.categoryBox,
            {
              backgroundColor: isSelected
                ? COLORS.white
                : COLORS.backgroundLight,
            },
          ]}>
          {isSelected && (
            <View style={styles.checkIconWrapper}>
              <Image
                source={ICONS.cheackIcon}
                resizeMode="contain"
                style={styles.checkIcon}
              />
            </View>
          )}

          <View
            style={[
              styles.imageWrapper,
              {
                borderColor: isSelected
                  ? COLORS.primary
                  : COLORS.backgroundLight,
              },
            ]}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.categoryName}>{item.name}</Text>
        </TouchableOpacity>
      );
    },
    [selectedCategories],
  );

  return (
    <View style={styles.form}>
      <Text style={styles.headerText}>Select Your Categories</Text>

      <FlatList
        data={categories}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.buttonContainer}>
        <GradientButton
          text={t('back')}
          useGradient
          onPress={onPressBack}
          type="outline"
          styleProps={{paddingVertical: 14}}
          gradientColors={GRADIENT_COLORS}
          icon={ICONS.backIcon}
        />
        <GradientButton
          text={t('continue')}
          onPress={() => handleNextStep(selectedCategories)}
          type="filled"
          gradientColors={GRADIENT_COLORS}
          styleProps={{flex: 1}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: SIZES.lg,
  },
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
    height: width(6),
    width: width(6),
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
});

export default Categories;

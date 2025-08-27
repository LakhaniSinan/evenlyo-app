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
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

const categories = [
  {
    id: 1,
    name: 'Entertainment & Attractions',
    icon: ICONS.decoration4,
    subCategories: [
      {id: 1, name: 'DJ', icon: ICONS.decoration7},
      {id: 2, name: 'Live Band', icon: ICONS.decoration6},
      {id: 3, name: 'Photo Booth', icon: ICONS.decoration5},
    ],
  },
  {
    id: 2,
    name: 'Decoration & Styling',
    icon: ICONS.decoration4,
    subCategories: [
      {id: 4, name: 'LED Fairy Lights', icon: ICONS.decoration4},
      {id: 5, name: 'Table Floral Centerpieces', icon: ICONS.decoration3},
      {id: 6, name: 'Floral Chandelier', icon: ICONS.decoration2},
      {id: 7, name: 'Helium Balloon Setup', icon: ICONS.decoration1},
    ],
  },
];

const SubCategories = ({onPressBack, handleNextStep}) => {
  const {t} = useTranslation();
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelect = useCallback(id => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  }, []);

  const renderSubCategory = (subItem, isSelected) => {
    const containerStyle = isSelected
      ? styles.activeContainer
      : styles.inactiveContainer;

    const textStyle = isSelected ? styles.activeText : styles.inactiveText;

    return (
      <TouchableOpacity
        key={subItem.id}
        activeOpacity={0.8}
        onPress={() => toggleSelect(subItem.id)}
        style={styles.subCategoryWrapper}>
        {isSelected ? (
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={containerStyle}>
            <View style={styles.iconWrapper}>
              <Image
                resizeMode="contain"
                source={subItem.icon}
                style={styles.icon}
              />
            </View>
            <Text style={textStyle}>{subItem.name}</Text>
          </LinearGradient>
        ) : (
          <View style={containerStyle}>
            <View style={[styles.iconWrapper, styles.iconSpacing]}>
              <Image
                resizeMode="contain"
                source={subItem.icon}
                style={styles.icon}
              />
            </View>
            <Text style={textStyle}>{subItem.name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderItem = useCallback(
    ({item}) => (
      <View style={styles.categoryBox}>
        <Text style={styles.roleTitle}>{item.name}</Text>
        <View style={styles.subCategoryContainer}>
          {item.subCategories.map(subItem =>
            renderSubCategory(subItem, selectedItems.includes(subItem.id)),
          )}
        </View>
      </View>
    ),
    [selectedItems],
  );

  return (
    <View style={styles.form}>
      <Text style={styles.headerText}>Select Your Subcategories</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        scrollEnabled={false}
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
          onPress={() => handleNextStep(selectedItems)}
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
  categoryBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: width(2),
    padding: width(4),
  },
  roleTitle: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    marginBottom: 10,
  },
  subCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  subCategoryWrapper: {
    marginRight: 10,
    marginBottom: 10,
  },
  activeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: width(1.5),
    paddingHorizontal: width(4),
  },
  inactiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: width(2),
    paddingVertical: width(1.5),
    paddingHorizontal: width(4),
    backgroundColor: COLORS.white,
  },
  iconWrapper: {
    height: width(8),
    width: width(8),
    borderRadius: width(2),
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSpacing: {
    marginRight: width(2),
  },
  icon: {
    width: width(6),
    height: width(6),
  },
  activeText: {
    color: COLORS.white,
    fontSize: 12,
    marginLeft: width(2),
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  inactiveText: {
    color: COLORS.black,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(10),
    gap: width(2),
    justifyContent: 'flex-end',
  },
});

export default SubCategories;

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
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';

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

const SubCategoriesModal = ({isVisible, onClose, handleNextStep}) => {
  const {t} = useTranslation();
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelect = useCallback(id => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  }, []);

  const renderSubCategory = (subItem, isSelected) => (
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
          style={styles.activeContainer}>
          <View style={styles.iconWrapper}>
            <Image
              resizeMode="contain"
              source={subItem.icon}
              style={styles.icon}
            />
          </View>
          <Text style={styles.activeText}>{subItem.name}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.inactiveContainer}>
          <View style={[styles.iconWrapper, styles.iconSpacing]}>
            <Image
              resizeMode="contain"
              source={subItem.icon}
              style={styles.icon}
            />
          </View>
          <Text style={styles.inactiveText}>{subItem.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Add More Category')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subTitle}>Sub Category</Text>

        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.buttonRow}>
          <View style={{width: width(43)}}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelButton}
              activeOpacity={0.7}>
              <GradientText text={'Cancel'} />
            </TouchableOpacity>
          </View>
          <View style={{width: width(40)}}>
            <GradientButton
              text={t('Add')}
              onPress={() => handleNextStep(5)}
              type="filled"
              textStyle={styles.addButtonText}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  subTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    marginBottom: 10,
  },
  listContent: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(4),
    padding: width(3),
  },
  categoryBox: {
    borderRadius: 14,
    marginBottom: width(2),
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: '100%',
    paddingRight: 20,
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
  },
});

export default SubCategoriesModal;

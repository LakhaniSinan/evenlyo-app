import React, {useCallback} from 'react';
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
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

const SubCategoriesModal = ({
  allSubCategories = [],
  isVisible,
  onClose,
  handleNextStep,
  selectedItems,
  setSelectedItems,
}) => {
  const {t, currentLanguage} = useTranslation();

  console.log(
    selectedItems,
    'selectedItemsselectedItemsselectedItemsselectedItems',
  );

  const toggleSelect = useCallback(data => {
    setSelectedItems(prev => {
      if (prev?.includes(data)) {
        return prev.filter(item => item?._id !== data?._id);
      } else {
        let newObjjj = {
          name: data?.name,
          _id: data?._id,
        };
        return [...prev, newObjjj];
      }
    });
  }, []);

  const renderSubCategory = (subItem, isSelected) => {
    console.log(subItem, 'subItemsubItemsubItem144trgsdf');

    return (
      <TouchableOpacity
        key={subItem?._id}
        activeOpacity={0.8}
        onPress={() => toggleSelect(subItem)}
        style={styles.subCategoryWrapper}>
        {isSelected ? (
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.activeContainer}>
            <View style={styles.iconWrapper}>
              <Image
                source={{uri: subItem?.icon}}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.activeText}>
              {currentLanguage == 'en' ? subItem?.name?.en : subItem?.name?.nl}
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveContainer}>
            <View style={[styles.iconWrapper, styles.iconSpacing]}>
              <Image
                source={{uri: subItem?.icon}}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.inactiveText}>
              {currentLanguage == 'en' ? subItem?.name?.en : subItem?.name?.nl}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const isCategorySelected = id => {
    return selectedItems.some(item =>
      typeof item === 'string' ? item === id : item?._id === id,
    );
  };

  const renderItem = useCallback(
    ({item}) => {
      return (
        <View style={styles.categoryBox}>
          <Text style={styles.roleTitle}>
            {currentLanguage == 'en' ? item?.name?.en : item?.name?.nl}
          </Text>
          <View style={styles.subCategoryContainer}>
            {item.subcategories?.map(subItem =>
              renderSubCategory(subItem, isCategorySelected(subItem._id)),
            )}
          </View>
        </View>
      );
    },
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
          data={allSubCategories}
          renderItem={renderItem}
          keyExtractor={item => item._id.toString()}
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
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  subTitle: {
    color: COLORS.textDark,
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
    paddingVertical: width(2),
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

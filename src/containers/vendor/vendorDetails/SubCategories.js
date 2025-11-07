import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import SvgUri from 'react-native-svg-uri';
import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {fetchSubCategoriesByCategoryIds} from '../../../services/Categories';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

const SubCategories = ({categoriesSelected, onPressBack, handleNextStep}) => {
  const {t, currentLanguage} = useTranslation();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);
  const [allSubCategories, setAllSubCategories] = useState([]);

  useEffect(() => {
    handleGetAllSubCategories();
  }, []);

  const handleGetAllSubCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchSubCategoriesByCategoryIds({
        categoryIds: categoriesSelected,
      });
      setIsLoading(false);

      if (response?.status == 200 || response?.status == 201) {
        setAllSubCategories(response?.data?.data || []);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log('Error fetching subcategories:', error);
      modalRef.current?.showAlert('Error', 'Failed to load subcategories.');
    }
  }, []);

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
        key={subItem._id}
        activeOpacity={0.8}
        onPress={() => toggleSelect(subItem._id)}
        style={styles.subCategoryWrapper}>
        {isSelected ? (
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            style={containerStyle}>
            <View style={styles.iconWrapper}>
              <SvgUri source={{uri: subItem.icon}} width={20} height={20} />
            </View>
            <Text style={textStyle}>
              {currentLanguage == 'en' ? subItem?.name?.en : subItem?.name?.nl}
            </Text>
          </LinearGradient>
        ) : (
          <View style={containerStyle}>
            <View style={[styles.iconWrapper, styles.iconSpacing]}>
              <SvgUri source={{uri: subItem.icon}} width={20} height={20} />
            </View>
            <Text style={textStyle}>
              {currentLanguage == 'en' ? subItem?.name?.en : subItem?.name?.nl}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderItem = useCallback(
    ({item}) => {
      console.log(item, 'itemitemitemitemitem');

      return (
        <View style={styles.categoryBox}>
          <Text style={styles.roleTitle}>
            {currentLanguage == 'en' ? item.name?.en : item?.name?.nl}
          </Text>
          <View style={styles.subCategoryContainer}>
            {item.subcategories?.map(subItem =>
              renderSubCategory(subItem, selectedItems.includes(subItem._id)),
            )}
          </View>
        </View>
      );
    },
    [selectedItems],
  );

  return (
    <View style={styles.form}>
      <Text style={styles.headerText}>Select Your Subcategories</Text>
      <FlatList
        data={allSubCategories}
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
          onPress={() => {
            if (!selectedItems?.length) {
              Alert.alert(
                'Error',
                'Please select at least one category or subcategory.',
              );
              return;
            }
            handleNextStep(selectedItems);
          }}
          type="filled"
          gradientColors={GRADIENT_COLORS}
          styleProps={{flex: 1}}
        />
      </View>
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
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

import React, {useCallback, useEffect, useRef, useState, memo} from 'react';
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
import {SvgUri} from 'react-native-svg';

import {ICONS} from '../../../assets';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import {COLORS, fontFamly, SIZES} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {fetchSubCategoriesByCategoryIds} from '../../../services/Categories';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

const SubCategoryItem = memo(
  ({subItem, isSelected, toggleSelect, currentLanguage}) => {
    const name =
      currentLanguage === 'en' ? subItem?.name?.en : subItem?.name?.nl;

    const containerStyle = isSelected
      ? styles.activeContainer
      : styles.inactiveContainer;

    const textStyle = isSelected ? styles.activeText : styles.inactiveText;

    return (
      <TouchableOpacity
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
              <SvgUri width={20} height={20} uri={subItem?.icon} />
            </View>
            <Text style={textStyle}>{name}</Text>
          </LinearGradient>
        ) : (
          <View style={containerStyle}>
            <View style={[styles.iconWrapper, styles.iconSpacing]}>
              <SvgUri width={20} height={20} uri={subItem?.icon} />
            </View>
            <Text style={textStyle}>{name}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render), false if different (re-render)
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.currentLanguage === nextProps.currentLanguage &&
      prevProps.subItem._id === nextProps.subItem._id
    );
  },
);

const SubCategories = ({
  selectedSubCat = [],
  categoriesSelected = [],
  onPressBack,
  handleNextStep,
}) => {
  const {t, currentLanguage} = useTranslation();
  const modalRef = useRef(null);

  const [selectedItems, setSelectedItems] = useState(new Set(selectedSubCat));
  const [isLoading, setIsLoading] = useState(false);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [selectionVersion, setSelectionVersion] = useState(0);

  /* ---------------- FETCH ---------------- */

  const handleGetAllSubCategories = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetchSubCategoriesByCategoryIds({
        categoryIds: categoriesSelected,
      });

      if (response?.status === 200 || response?.status === 201) {
        setAllSubCategories(response?.data?.data || []);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      modalRef.current?.show({
        status: 'error',
        message: 'Failed to load subcategories.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [categoriesSelected]);

  useEffect(() => {
    handleGetAllSubCategories();
  }, [handleGetAllSubCategories]);

  /* ---------------- TOGGLE ---------------- */

  const toggleSelect = useCallback(id => {
    setSelectedItems(prev => {
      const updated = new Set(prev);
      updated.has(id) ? updated.delete(id) : updated.add(id);
      return updated;
    });
    setSelectionVersion(v => v + 1);
  }, []);

  /* ---------------- RENDER CATEGORY ---------------- */

  const renderItem = useCallback(
    ({item}) => {
      const title = currentLanguage === 'en' ? item?.name?.en : item?.name?.nl;

      return (
        <View style={styles.categoryBox}>
          <Text style={styles.roleTitle}>{title}</Text>

          <View style={styles.subCategoryContainer}>
            {item?.subcategories?.map(subItem => (
              <SubCategoryItem
                key={subItem._id}
                subItem={subItem}
                isSelected={selectedItems.has(subItem._id)}
                toggleSelect={toggleSelect}
                currentLanguage={currentLanguage}
              />
            ))}
          </View>
        </View>
      );
    },
    [currentLanguage, selectedItems, toggleSelect],
  );

  /* ---------------- CONTINUE ---------------- */

  const handleContinue = () => {
    if (selectedItems.size === 0) {
      Alert.alert(
        'Error',
        'Please select at least one category or subcategory.',
      );
      return;
    }

    handleNextStep(Array.from(selectedItems));
  };

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.form}>
      <Text style={styles.headerText}>Select Your Subcategories</Text>

      <FlatList
        data={allSubCategories}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        extraData={selectionVersion}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.buttonContainer}>
        <GradientButton
          text={t('back')}
          useGradient
          onPress={onPressBack}
          type="outline"
          styleProps={{flex: 1}}
          outlineButtonStyle={{flex: 1, paddingVertical: 0}}
          gradientColors={GRADIENT_COLORS}
          icon={ICONS.backIcon}
          styleContainer={styles.backButton}
        />

        <GradientButton
          text={t('continue')}
          onPress={handleContinue}
          type="filled"
          gradientColors={GRADIENT_COLORS}
          styleProps={{flex: 1}}
          styleContainer={styles.continueButton}
        />
      </View>

      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </View>
  );
};

export default SubCategories;

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
  backButton: {
    flex: 1,
    width: undefined,
    height: width(11),
  },
  continueButton: {
    flex: 1,
    width: undefined,
    height: width(11),
  },
});

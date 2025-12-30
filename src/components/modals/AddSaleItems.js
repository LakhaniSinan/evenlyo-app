import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {launchImageLibrary} from 'react-native-image-picker';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {helper} from '../../helper';
import {useTranslation} from '../../hooks';
import {
  fetchSubCategoriesByCategoryIds,
  getVendorCategories,
} from '../../services/Categories';
import {
  createSaleItem,
  getVendorListingsById,
  updateSaleItem,
} from '../../services/ListingsItem';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import DualLanguageCustomPicker from '../dualLanguagePicker';
import Loader from '../loder';
import TextField from '../textInput';

const AddNewSaleItems = ({isVisible, onClose, editSaleData}) => {
  console.log(editSaleData, 'editSaleDataeditSaleDataeditSaleData');

  const {t} = useTranslation();
  const {user} = useSelector(state => state.LoginSlice);
  const modalRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [vendorsCategories, setVendorsCategory] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  console.log(
    vendorsCategories,
    'vendorsCategoriesvendorsCategoriesvendorsCategories',
  );

  const [vendorListing, setVendorListing] = useState([]);

  const [formData, setFormData] = useState({
    selectedType: 'Others',
    title: {en: '', nl: ''},
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: '',
    productImage: '',
    mainCategory: '',
    subCategory: '',
    listingName: '',
  });

  console.log(formData, 'formDataformDataformDataformDataformData');

  const onSuccess = () => {
    setFormData({
      selectedType: 'Others',
      title: '',
      purchasePrice: '',
      sellingPrice: '',
      stockQuantity: '',
      productImage: '',
      mainCategory: '',
      subCategory: '',
      listingName: '',
    });
    modalRef.current.hide();
    onClose();
  };

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (formData?.selectedType == 'Listing') {
      handleGetVendorCategories();
      handleGetVendorListings();
    }
  }, [formData?.selectedType]);
  useEffect(() => {
    if (!isVisible) {setIsInitialized(false);}
  }, [isVisible]);

  // ✅ Fix: Set selected lsisting after vendorListing is loaded
  useEffect(() => {
    if (editSaleData && vendorListing?.length > 0) {
      const selectedListing = vendorListing.find(
        listing =>
          listing?._id?.toString()?.trim() ===
          editSaleData?.linkedListing?.toString()?.trim(),
      );

      if (selectedListing) {
        setFormData(prev => ({
          ...prev,
          listingName: selectedListing,
        }));
      }
    }
  }, [vendorListing, editSaleData]);

  useEffect(() => {
    const initFormData = async () => {
      if (!isVisible || isInitialized) {return;} // ✅ prevent reinitialization after first run

      if (editSaleData) {
        const saleItemType =
          editSaleData?.linkedListing !== null ? 'Listing' : 'Others';

        let selectedMainCategory = vendorsCategories?.find(
          cat =>
            cat?._id?.toString()?.trim() ===
            editSaleData?.mainCategory?._id?.toString()?.trim(),
        );

        let subCategories = [];
        let selectedSubCategory = null;

        if (selectedMainCategory?._id) {
          try {
            setIsLoading(true);
            const response = await fetchSubCategoriesByCategoryIds({
              categoryIds: [selectedMainCategory._id],
            });
            if (response?.status === 200 || response?.status === 201) {
              subCategories = response?.data?.data?.[0]?.subcategories || [];
              selectedSubCategory = subCategories.find(
                sub =>
                  sub?._id?.toString()?.trim() ===
                  editSaleData?.subCategory?._id?.toString()?.trim(),
              );
              setAllSubCategories(subCategories);
            }
          } catch (err) {
            console.log('Error fetching subcategories:', err);
          } finally {
            setIsLoading(false);
          }
        }

        setFormData(prev => ({
          ...prev,
          selectedType: saleItemType,
          title: {
            en: editSaleData?.title?.en || '',
            nl: editSaleData?.title?.nl || '',
          },
          purchasePrice: editSaleData?.PurchasePrice?.toString() || '',
          sellingPrice: editSaleData?.SellingPrice?.toString() || '',
          stockQuantity: editSaleData?.Stock?.toString() || '',
          productImage: editSaleData?.image || '',
          mainCategory: selectedMainCategory || '',
          subCategory: selectedSubCategory || '',
        }));
      } else {
        // New item
        setFormData({
          selectedType: 'Others',
          title: {en: '', nl: ''},
          purchasePrice: '',
          sellingPrice: '',
          stockQuantity: '',
          productImage: '',
          mainCategory: '',
          subCategory: '',
          listingName: '',
        });
      }

      setIsInitialized(true); // ✅ mark initialization done
    };

    initFormData();
  }, [isVisible, editSaleData, vendorsCategories]);

  const handleGetVendorListings = async () => {
    try {
      const response = await getVendorListingsById(user?.id);
      if (response.status == 200 || response.status == 201) {
        let data = response.data?.data;
        let result = data?.map(item => ({
          name: item?.title,
          _id: item?._id,
        }));
        setVendorListing(result);
      }
    } catch (error) {
      console.log(error, 'errorerrorerrorerrorerrorasdasdzz');
    }
  };

  const handleGetVendorCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getVendorCategories(user?.id);
      if (response.status == 200 || response?.status) {
        let data = response.data.data[0];
        setVendorsCategory(data?.mainCategories);
      }
    } catch (error) {
      console.log('Error fetching vendor categorie', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectValue = async (key, value, lang) => {
    if (key === 'title') {
      setFormData(prev => ({
        ...prev,
        title: {...prev.title, [lang]: value},
      }));
    } else {
      setFormData(prev => ({...prev, [key]: value}));
    }

    // ✅ When a main category is selected — fetch subcategories automatically
    if (key === 'mainCategory' && value?._id) {
      setIsLoading(true);
      try {
        const response = await fetchSubCategoriesByCategoryIds({
          categoryIds: [value._id],
        });

        if (response?.status === 200 || response?.status === 201) {
          const subs = response?.data?.data?.[0]?.subcategories || [];
          setAllSubCategories(subs);

          // reset previously selected subcategory if new main category chosen
          setFormData(prev => ({...prev, subCategory: ''}));
        } else {
          modalRef.current?.show({
            status: 'error',
            message:
              response?.data?.message || 'Failed to fetch subcategories.',
          });
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
        modalRef.current?.show({
          status: 'error',
          message: 'Error loading subcategories.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateImage = () => {
    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (response.didCancel) {return;}
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      const asset = response.assets?.[0];
      if (!asset) {return;}

      const file = {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || `upload.${asset.type?.split('/')[1]}`,
      };

      try {
        setIsLoading(true);
        const result = await helper.uploadMediaToCloudinary(file);
        handleSelectValue('productImage', result?.url);
      } catch (err) {
        console.error('Upload error:', err);
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setIsLoading(false);
      }
    });
  };

  const validateForm = () => {
    const {
      title,
      purchasePrice,
      sellingPrice,
      stockQuantity,
      productImage,
      selectedType,
      mainCategory,
      subCategory,
      listingName,
    } = formData;

    if (!title.trim())
      {return modalRef.current.show({
        status: 'error',
        message: 'Title is required',
      });}
    if (!purchasePrice.trim())
      {return modalRef.current.show({
        status: 'error',
        message: 'Purchase price is required',
      });}
    if (!sellingPrice.trim())
      {return modalRef.current.show({
        status: 'error',
        message: 'Selling price is required',
      });}
    if (!stockQuantity.trim())
      {return modalRef.current.show({
        status: 'error',
        message: 'Stock quantity is required',
      });}
    if (!productImage)
      {return modalRef.current.show({
        status: 'error',
        message: 'Please upload a product image',
      });}
    if (
      selectedType === 'Listing' &&
      (!mainCategory || !subCategory || !listingName)
    )
      {return modalRef.current.show({
        status: 'error',
        message: 'Please select all listing fields',
      });}

    return true;
  };

  const handleUpdateListing = async () => {
    // if (!validateForm()) return;

    const {
      selectedType,
      title,
      purchasePrice,
      sellingPrice,
      stockQuantity,
      productImage,
      mainCategory,
      subCategory,
      listingName,
    } = formData;

    const params = {
      vendorId: user?.id,
      title,
      purchasePrice,
      sellingPrice,
      image: productImage,
      stockQuantity,
      type: selectedType,
      mainCategory:
        formData?.selectedType == 'Others' ? '' : mainCategory?._id || '',
      subCategory:
        formData?.selectedType == 'Others' ? '' : subCategory?._id || '',
      linkedListing:
        formData?.selectedType == 'Others' ? null : listingName?._id || '',
    };

    try {
      setIsLoading(true);
      const response = editSaleData
        ? await updateSaleItem(editSaleData?.itemId, params)
        : await createSaleItem(params);

      setIsLoading(false);
      if (response.status == 200 || response?.status == 201) {
        modalRef.current.show({
          status: 'ok',
          message: response?.data?.message || 'Sale item created successfully',
          handlePressOk: onSuccess,
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const renderUploadBox = (label, onPress) => (
    <TouchableOpacity style={styles.uploadBox} onPress={onPress}>
      <Image source={ICONS.uploadIcon} style={styles.uploadIcon} />
      <Text style={styles.uploadText}>{label}</Text>
    </TouchableOpacity>
  );

  const {
    selectedType,
    title,
    purchasePrice,
    sellingPrice,
    stockQuantity,
    productImage,
    mainCategory,
    subCategory,
    listingName,
  } = formData;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard
      propagateSwipe>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Add New Listing')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{flex: 1}}>
          <View style={styles.section}>
            {/* ✅ Checkbox Section */}
            <Text style={styles.sectionTitle}>{t('Basic Information')}</Text>
            {/* 🔤 Language Selector */}
            <View style={styles.languageSelector}>
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => setSelectedLanguage('en')}>
                <Icon
                  name={
                    selectedLanguage === 'en'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.languageText}>EN (English)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => setSelectedLanguage('nl')}>
                <Icon
                  name={
                    selectedLanguage === 'nl'
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.languageText}>NL (Dutch)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleSelectValue('selectedType', 'Others')}>
                <Icon
                  name={
                    selectedType === 'Others' ? 'checkbox' : 'square-outline'
                  }
                  size={22}
                  color={COLORS.primary}
                />
                <Text style={styles.checkboxLabel}>Others</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleSelectValue('selectedType', 'Listing')}>
                <Icon
                  name={
                    selectedType === 'Listing' ? 'checkbox' : 'square-outline'
                  }
                  size={22}
                  color={COLORS.primary}
                />
                <Text style={styles.checkboxLabel}>Link to a Listings</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>{t('Basic Information')}</Text>

            <TextField
              bgColor={COLORS.white}
              label={`Title (${selectedLanguage.toUpperCase()})`}
              placeholder={`Enter title in ${
                selectedLanguage === 'en' ? 'English' : 'Dutch'
              }`}
              value={formData.title[selectedLanguage]}
              onChangeText={text =>
                handleSelectValue('title', text, selectedLanguage)
              }
            />

            <TextField
              bgColor={COLORS.white}
              label={t('Purchase Price')}
              placeholder={t('Enter purchase price')}
              value={purchasePrice}
              keyboardType="numeric"
              onChangeText={text => handleSelectValue('purchasePrice', text)}
            />
            <TextField
              bgColor={COLORS.white}
              label={t('Selling Price')}
              placeholder={t('Enter selling price')}
              value={sellingPrice}
              keyboardType="numeric"
              onChangeText={text => handleSelectValue('sellingPrice', text)}
            />
            <TextField
              bgColor={COLORS.white}
              label={t('Stock Quantity')}
              placeholder={t('Enter stock quantity')}
              value={stockQuantity}
              keyboardType="numeric"
              onChangeText={text => handleSelectValue('stockQuantity', text)}
            />

            {selectedType === 'Listing' && (
              <>
                <DualLanguageCustomPicker
                  label="Main Category"
                  labelll="Select Main Category"
                  dropdownContainerStyle={{backgroundColor: COLORS.white}}
                  value={mainCategory}
                  listData={vendorsCategories}
                  name="mainCategory"
                  handleSelectValue={handleSelectValue}
                />
                <DualLanguageCustomPicker
                  label="Sub Category"
                  labelll="Select Sub Category"
                  dropdownContainerStyle={{backgroundColor: COLORS.white}}
                  value={subCategory}
                  listData={allSubCategories}
                  name="subCategory"
                  handleSelectValue={handleSelectValue}
                />
                <DualLanguageCustomPicker
                  label="Listing Name"
                  labelll="Select Listing"
                  value={listingName}
                  dropdownContainerStyle={{backgroundColor: COLORS.white}}
                  listData={vendorListing}
                  name="listingName"
                  handleSelectValue={handleSelectValue}
                />
              </>
            )}

            {/* ✅ Product Picture */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('Product Picture')}</Text>
              <View style={styles.row}>
                {!productImage ? (
                  renderUploadBox('Click to upload picture', handleUpdateImage)
                ) : (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{uri: productImage}}
                      resizeMode="cover"
                      style={{height: '100%', width: '100%'}}
                    />
                    <TouchableOpacity
                      onPress={() => handleSelectValue('productImage', '')}
                      style={styles.removeImageBtn}>
                      <Image
                        source={ICONS.redcross}
                        resizeMode="cover"
                        style={{height: '100%', width: '100%'}}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {!isKeyboardVisible && (
          <View style={styles.buttonRow}>
            <View style={{width: width(43)}}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
              </TouchableOpacity>
            </View>
            <View style={{width: width(43)}}>
              <GradientButton
                iconTintColor={COLORS.white}
                text={
                  editSaleData ? t('Update New Listing') : t('Add New Listing')
                }
                onPress={handleUpdateListing}
                type="filled"
                textStyle={styles.applyText}
              />
            </View>
          </View>
        )}
      </View>
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </Modal>
  );
};

export default AddNewSaleItems;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    backgroundColor: '#8b8b8b66',
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  languageText: {
    marginLeft: 6,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },

  container: {
    height: '80%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
    elevation: 5,
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
  },
  section: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(4),
    padding: width(4),
    marginBottom: width(3),
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    marginVertical: width(3),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  checkboxLabel: {
    marginLeft: 6,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: width(2),
    paddingVertical: width(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    width: 25,
    height: 25,
    marginBottom: 6,
    tintColor: COLORS.gray,
  },
  uploadText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  imageContainer: {
    position: 'relative',
    height: width(40),
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    height: width(7),
    width: width(7),
    borderRadius: 100,
  },
  buttonRow: {
    paddingTop: width(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#666',
  },
  applyText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: 'white',
  },
});

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import BookingListingCard from '../../../components/bookinglistingCard';
import CommonAlert from '../../../components/commanAlert';
import EventListingCard from '../../../components/eventListingCards';
import Loader from '../../../components/loder';
import EventListingModal from '../../../components/modals/AddEventListing';
import AddMoreCategory from '../../../components/modals/AddMoreCategory';
import AddNewDataModal from '../../../components/modals/AddNewDataModal';
import AddNewSaleItems from '../../../components/modals/AddSaleItems';
import SubCategoriesModal from '../../../components/modals/AddSubCategories';
import CategoryEditSuccess from '../../../components/modals/CategoryEditSuccess';
import EventFilterModal from '../../../components/modals/EventFilter';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  fetchSubCategoriesByCategoryIds,
  getVendorCategories,
} from '../../../services/Categories';
import {
  deleteSaleItem,
  getVendorBookingListings,
  getVendorListings,
} from '../../../services/ListingsItem';
import {
  deleteVendorListing,
  updateVendorDetails,
} from '../../../services/Vendor';

const renderTabs = ['Booking Items', 'Sale Items'];
const requested = [];
// const saleItem = [];

const EventListingScreen = ({navigation}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Booking Items');
  const [showSucessModal, setShowSuccessModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [showMoreCategory, setShowMoreCategory] = useState(false);
  const [saleItem, setSaleItems] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSubCategory, setShowSubCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [vendorSubCategory, setVendorsSubCategory] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [eventModal, setEventModal] = useState(false);
  const [vendroBookingListings, setVendorBookingListings] = useState([]);
  const [editData, setEditData] = useState(null);

  console.log(
    vendroBookingListings,
    'editDataeditDataeditDataeditDataeditDatasada',
  );

  const [editSaleData, setEditSaleData] = useState(null);
  const [showAddSaleItem, setShowAddSaleItem] = useState(false);
  const {user} = useSelector(state => state.LoginSlice);

  useEffect(() => {
    handleGetVendorCategories();
    handleGetAllListings();
    handleGetAllBookingListings();
  }, [activeTab]);

  useEffect(() => {
    if (selectedCategory?.length > 0) {
      handleGetAllSubCategories();
    }
  }, [selectedCategory, handleGetAllSubCategories]);

  useEffect(() => {
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000);
  }, [showSubCategory]);

  const handleGetAllSubCategories = useCallback(async () => {
    if (!selectedCategory || selectedCategory.length === 0) {
      return;
    }
    let categoryIds = selectedCategory.map(item => item?._id);
    try {
      setIsLoading(true);
      const response = await fetchSubCategoriesByCategoryIds({categoryIds});
      console.log(response, 'responseresponseresponseresponse123123');

      if (response?.status === 200 || response?.status === 201) {
        const subcats = response?.data?.data || [];
        setAllSubCategories(subcats);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log('❌ Error fetching subcategories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  const handleGetVendorCategories = async () => {
    try {
      setIsLoading(true);
      const response = await getVendorCategories(user?.id);
      let mainCategories = response?.data?.data[0]?.mainCategories || [];

      let subCategories = response?.data?.data[0]?.subCategories || [];
      if (response.status === 200 || response?.status === 201) {
        setSelectedCategory(mainCategories || []);
        setVendorsSubCategory(subCategories || []);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log('Error fetching vendor categorie', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAllListings = async () => {
    try {
      setIsLoading(true);
      const response = await getVendorListings();
      if (response.status == 200 || response.status == 201) {
        setSaleItems(response?.data?.itemsTable);
      }
    } catch (error) {
      console.log('Error fetching vendor categorie', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAllBookingListings = async () => {
    try {
      setIsLoading(true);
      const response = await getVendorBookingListings();
      if (response.status == 200 || response.status == 201) {
        setVendorBookingListings(response?.data?.listingTable);
      }
    } catch (error) {
      console.log('Error fetching vendor categorie', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = type => {
    setTimeout(() => {
      setShowAddNew(false);
      setShowMoreCategory(false);
      setShowSubCategory(false);
      setShowSuccessModal(false);
      setEventModal(false);
    }, 300);

    if (type == 1) {
      setTimeout(() => {
        setShowMoreCategory(true);
      }, 500);
    } else if (type == 2) {
      setTimeout(() => {
        setEventModal(true);
      }, 500);
    } else if (type == 3) {
      setTimeout(() => {
        setShowAddSaleItem(true);
      }, 500);
    } else if (type == 4) {
      setTimeout(() => {
        setShowSubCategory(true);
      }, 500);
    } else if (type == 5) {
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 500);
    } else {
      setTimeout(() => {
        setShowMoreCategory(true);
      }, 500);
    }
  };

  const handleSelectCategory = data => {
    setSelectedCategory(prev => {
      const isAlreadySelected = prev.some(item => item._id === data._id);
      if (isAlreadySelected) {
        return prev.filter(item => item._id !== data._id);
      } else {
        return [...prev, data];
      }
    });
  };

  const handleUpdateCategory = async () => {
    setShowSubCategory(false);
    let mainCategoryIds = selectedCategory.map(item => item?._id);
    let subCategoryIds = vendorSubCategory.map(item => item?._id);

    let params = {
      mainCategories: mainCategoryIds,
      subCategories: subCategoryIds,
    };
    try {
      setIsLoading(true);
      const response = await updateVendorDetails(params);
      if (response.status == 201 || response.status === 200) {
        modalRef.current.show({
          status: 'ok',
          message: response.data?.message,
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response.data?.message,
          handleOkPress: () => {
            modalRef.current.show();
            setShowSubCategory(true);
          },
        });
      }
    } catch (error) {
      setShowSubCategory(true);
      console.log(error, 'errorerrorerrorerrorqoiwnrwe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBooking = async item => {
    modalRef.current.show({
      status: 'alert',
      message: 'Are you sure you want to delete this listing?',
      handlePressOk: async () => {
        try {
          setIsLoading(true);
          const response = await deleteVendorListing(item?._id);
          if (response.status == 200 || response.status == 201) {
            modalRef.current.show({
              status: 'ok',
              message: response.data?.message,
              handlePressOk: () => {
                modalRef.current.hide();
                handleGetAllBookingListings();
              },
            });
          } else {
            modalRef.current.show({
              status: 'error',
              message: response.data?.message,
            });
          }
        } catch (error) {
          console.log(error, 'errorerrorerrorerrorerrormaslkdnasd');
        } finally {
          setIsLoading(false);
        }
      },
    });
  };
  const handleEditBooking = async item => {
    setEventModal(true);
    setEditData(item);
  };
  const handleDeleteSaleItem = async item => {
    modalRef.current.show({
      status: 'alert',
      message: 'Are you sure you want to delete this sale item?',
      handlePressOk: async () => {
        try {
          setIsLoading(true);
          const response = await deleteSaleItem(item?.itemId);
          if (response.status == 200 || response.status == 201) {
            modalRef.current.show({
              status: 'ok',
              message: response.data?.message,
              handlePressOk: () => {
                modalRef.current.hide();
                handleGetAllBookingListings();
              },
            });
          } else {
            modalRef.current.show({
              status: 'error',
              message: response.data?.message,
            });
          }
        } catch (error) {
          console.log(error, 'errorerrorerrorerrorerrormaslkdnasd');
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleEditSaleItem = async item => {
    setEditSaleData(item);
    setShowAddSaleItem(true);
  };

  const handleCloseAddSaleItem = () => {
    setShowAddSaleItem(!showAddSaleItem);
    handleGetAllListings();
  };

  const handleCloseListingModal = () => {
    setEventModal(!eventModal);
    handleGetAllBookingListings();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <ScrollView>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: COLORS.backgroundLight,
            borderBottomRightRadius: 20,
            borderBottomLeftRadius: 20,
          }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: width(2),
              paddingHorizontal: width(2),
            }}>
            <TouchableOpacity
              style={{marginLeft: width(2)}}
              onPress={() => navigation.openDrawer()}>
              <Image
                resizeMode="contain"
                style={{width: 40, height: 40}}
                source={ICONS.drawerIcon}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: COLORS.textDark,
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 14,
              }}>
              {t('All Listings')}
            </Text>
            <TouchableOpacity
              style={{borderRadius: 20}}
              onPress={() => setShowAddNew(true)}>
              <Image
                resizeMode="contain"
                style={{width: 40, height: 40}}
                source={ICONS.plusIcon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.tabContainer}>
            {renderTabs.map(tab => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                {activeTab === tab ? (
                  <LinearGradient
                    colors={['#FF295D', '#E31B95', '#C817AE']}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}
                    style={styles.activeTab}>
                    <Text style={styles.activeText}>{tab}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveTab}>
                    <Text style={styles.inactiveText}>{tab}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View
            style={{
              flex: 1,
              width: '100%',
              paddingLeft: width(4),
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: width(3),
              justifyContent: 'space-between',
            }}>
            <TextField
              placeholder={t('searchEvent')}
              placeholderTextColor="#aaa"
              bgColor={COLORS.white}
              startIcon={ICONS.search}
              inputContainer={{
                paddingVertical: 0,
                paddingHorizontal: 10,
                height: 45,
                width: '80%',
                marginTop: 0,
              }}
              styleProps={{
                fontSize: 14,
                color: '#000',
              }}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginRight: 10,
              }}>
              <Image
                resizeMode="contain"
                style={{width: 40, height: 40}}
                source={ICONS.filters}
              />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          data={
            activeTab === 'Booking Items'
              ? vendroBookingListings
              : saleItem || []
          }
          keyExtractor={(item, index) =>
            item?.id ? String(item.id) : String(index)
          }
          renderItem={({item}) =>
            activeTab === 'Booking Items' ? (
              <BookingListingCard
                item={item}
                onDeleteIconPress={handleDeleteBooking}
                onEditIconPress={handleEditBooking}
              />
            ) : (
              <EventListingCard
                item={item}
                onDeleteIconPress={handleDeleteSaleItem}
                onEditIconPress={handleEditSaleItem}
              />
            )
          }
          contentContainerStyle={{
            padding: 16,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          // ✅ Empty List Component
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'Booking Items'
                  ? 'No booking items found'
                  : 'No sale items found'}
              </Text>
            </View>
          )}
          // ✅ Pull to Refresh
          refreshing={isLoading}
          onRefresh={() => {
            if (activeTab === 'Booking Items') {
              handleGetAllBookingListings();
            } else {
              handleGetAllListings();
            }
          }}
        />
      </ScrollView>
      <EventFilterModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <AddNewDataModal
        isVisible={showAddNew}
        selectedOption={selectedOption}
        onClose={() => setShowAddNew(false)}
        handleSelect={handleSelect}
      />
      <AddMoreCategory
        isVisible={showMoreCategory}
        onClose={() => setShowMoreCategory(false)}
        selectedOption={selectedCategory}
        handleSelect={handleSelectCategory}
        handleNext={handleSelect}
      />
      <SubCategoriesModal
        selectedItems={vendorSubCategory || []}
        setSelectedItems={setVendorsSubCategory}
        allSubCategories={allSubCategories}
        isVisible={showSubCategory}
        onClose={() => setShowSubCategory(false)}
        onPressBack={() => console.log('Back pressed')}
        handleNextStep={handleUpdateCategory}
      />
      <EventListingModal
        toEditData={editData}
        isVisible={eventModal}
        onClose={handleCloseListingModal}
      />
      <AddNewSaleItems
        editSaleData={editSaleData}
        isVisible={showAddSaleItem}
        onClose={handleCloseAddSaleItem}
      />
      <CategoryEditSuccess visible={showSucessModal} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
};

export default EventListingScreen;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width(1),
    alignItems: 'center',
    marginHorizontal: width(3),
    backgroundColor: COLORS.white,
    padding: width(1),
    borderRadius: width(4),
    marginTop: width(2),
  },
  activeTab: {
    paddingVertical: 16,
    width: width(44.5),
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  inactiveTab: {
    paddingVertical: 16,
    width: width(44.5),
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  activeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  inactiveText: {
    color: '#333',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

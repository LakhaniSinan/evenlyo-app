import React, {useEffect, useState} from 'react';
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
import {ICONS} from '../../../assets';
import EventListingCard from '../../../components/eventListingCards';
import EventListingModal from '../../../components/modals/AddEventListing';
import AddMoreCategory from '../../../components/modals/AddMoreCategory';
import AddNewDataModal from '../../../components/modals/AddNewDataModal';
import SubCategoriesModal from '../../../components/modals/AddSubCategories';
import CategoryEditSuccess from '../../../components/modals/CategoryEditSuccess';
import EventFilterModal from '../../../components/modals/EventFilter';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {requested} from '../../client/app/EventListingScreen';
import {saleItem} from '../../client/app/CartScreen';

const EventListingScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState('Booking Items');
  const [showSucessModal, setShowSuccessModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [showMoreCategory, setShowMoreCategory] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSubCategory, setShowSubCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [eventModal, setEventModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000);
  }, [showSubCategory]);

  const handleSelect = type => {
    console.log(type, 'typetypetypetypetype');

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
        setShowMoreCategory(true);
      }, 500);
    } else if (type == 3) {
      setTimeout(() => {
        setEventModal(true);
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

  const handleSelectCategory = id => {
    setSelectedCategory(prev => {
      if (prev.includes(id)) {
        // agar already select hai to remove kardo
        return prev.filter(item => item !== id);
      } else {
        // otherwise add kardo
        return [...prev, id];
      }
    });
  };

  const renderTabs = ['Booking Items', 'Sale Items'];

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
          data={activeTab == 'Booking Items' ? requested : saleItem || []}
          keyExtractor={item => item.id}
          renderItem={({item}) => <EventListingCard item={item} />}
          contentContainerStyle={{padding: 16}}
          showsVerticalScrollIndicator={false}
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
        isVisible={showSubCategory}
        onClose={() => setShowSubCategory(false)}
        onPressBack={() => console.log('Back pressed')}
        handleNextStep={handleSelect}
      />
      <EventListingModal
        isVisible={eventModal}
        onClose={() => setEventModal(!eventModal)}
      />
      <CategoryEditSuccess visible={showSucessModal} />
    </SafeAreaView>
  );
};

export default EventListingScreen;

const styles = StyleSheet.create({
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

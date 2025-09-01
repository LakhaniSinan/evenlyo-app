import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
import EventListingCard from '../../../components/eventListingCards';
import AddMoreCategory from '../../../components/modals/AddMoreCategory';
import AddNewDataModal from '../../../components/modals/AddNewDataModal';
import SubCategoriesModal from '../../../components/modals/AddSubCategories';
import CategoryEditSuccess from '../../../components/modals/CategoryEditSuccess';
import EventFilterModal from '../../../components/modals/EventFilter';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import EventListingModal from '../../../components/modals/AddEventListing';
const bookingsData = [
  {
    id: '1',
    name: 'DJ Ray Vibes',
    location: 'Los Angeles, CA',
    price: '$300',
    status: 'Completed',
    image: IMAGES.backgroundImage, // 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
    category: 'DJ',
  },
  {
    id: '2',
    name: 'DJ Ray Vibes',
    location: 'Los Angeles, CA',
    price: '$300',
    status: 'New Request',
    image: IMAGES.backgroundImage, // 'https://images.unsplash.com/photo-1502767089025-6572583495b0',
    category: 'DJ',
  },
  {
    id: '3',
    name: 'DJ Ray Vibes',
    location: 'Los Angeles, CA',
    price: '$300',
    status: 'In Progress',
    image: IMAGES.backgroundImage, // 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    category: 'DJ',
  },
  {
    id: '4',
    name: 'Food Truck Express',
    location: 'San Francisco, CA',
    price: '$450',
    status: 'Completed',
    image: IMAGES.backgroundImage, // 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
    category: 'Food',
  },
  {
    id: '5',
    name: 'Party Planner Pro',
    location: 'New York, NY',
    price: '$200',
    status: 'New Request',
    image: IMAGES.backgroundImage, // 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
    category: 'Event',
  },
  {
    id: '6',
    name: 'Live Band Rock',
    location: 'Chicago, IL',
    price: '$500',
    status: 'In Progress',
    image: IMAGES.backgroundImage, // 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    category: 'Music',
  },
];

const EventListingScreen = ({navigation}) => {
  const {t} = useTranslation();
  const [showSucessModal, setShowSuccessModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [showMoreCategory, setShowMoreCategory] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showSubCategory, setShowSubCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000);
  }, [showSubCategory]);

  const handleSelect = type => {
    setTimeout(() => {
      setShowAddNew(false);
      setShowMoreCategory(false);
      setShowSubCategory(false);
      setShowSuccessModal(false);
    }, 300);

    if (type == 1) {
      setTimeout(() => {
        setShowMoreCategory(true);
      }, 500);
    } else if (type == 2) {
      setTimeout(() => {
        setShowMoreCategory(true);
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
              All Listings
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
          data={bookingsData}
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
      <EventListingModal isVisible={false} />
      <CategoryEditSuccess visible={showSucessModal} />
    </SafeAreaView>
  );
};

export default EventListingScreen;

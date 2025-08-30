import React, {useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../../assets';
import EventListingCard from '../../../components/eventListingCards';
import EventFilterModal from '../../../components/modals/EventFilter';
import TextField from '../../../components/textInput';
import {COLORS} from '../../../constants';
import {useTranslation} from '../../../hooks';
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
  const [modalVisible, setModalVisible] = useState(false);

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
            paddingTop: width(10),
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
            <TouchableOpacity style={{marginLeft: width(2)}} onPress={() => {}}>
              <Image
                resizeMode="contain"
                style={{width: 40, height: 40}}
                source={ICONS.drawerIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{borderRadius: 20}} onPress={() => {}}>
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
    </SafeAreaView>
  );
};

export default EventListingScreen;

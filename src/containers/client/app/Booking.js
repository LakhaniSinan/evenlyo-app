import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import BookingList from '../../../components/bookingCard';
import {COLORS, fontFamly} from '../../../constants';
import {getAllBookingHistory} from '../../../services/ListingsItem';
import Loader from '../../../components/loder';
import CommonAlert from '../../../components/commanAlert';

// 🔹 Added "Completed" & "Rejected"
const renderTabs = [
  'All Order',
  'pending',
  'accepted',
  'completed',
  'rejected',
];

const BooKings = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All Order');
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    handleGetBookingHistory();
  }, [activeTab]);

  const handleGetBookingHistory = async () => {
    try {
      setIsLoading(true);
      const response = await getAllBookingHistory('', 1, 10);
      setIsLoading(false);
      if (response.status == 200 || response.status == 201) {
        let data = response?.data?.data?.bookings;
        setBookingHistory(data);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error, 'errorerrorerrorerrorerror');
    }
  };

  const renderTabItem = ({item}) => (
    <TouchableOpacity onPress={() => setActiveTab(item)}>
      {activeTab === item ? (
        <LinearGradient
          colors={['#FF295D', '#E31B95', '#C817AE']}
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          style={styles.activeTab}>
          <Text style={styles.activeText}>
            {item?.charAt(0).toUpperCase() + item?.slice(1).toLowerCase()}
          </Text>
        </LinearGradient>
      ) : (
        <View style={styles.inactiveTab}>
          <Text style={styles.inactiveText}>
            {item?.charAt(0).toUpperCase() + item?.slice(1).toLowerCase()}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'Booking'}
        rightIcon={ICONS.chatIcon}
        onRightIconPress={() => navigation.navigate('MessagesScreen')}
      />

      {/* 🔹 Horizontal Scroll Tabs */}
      <View style={styles.tabWrapper}>
        <FlatList
          data={renderTabs}
          renderItem={renderTabItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        />
      </View>

      {/* 🔹 Booking List based on active tab */}
      <BookingList bookings={bookingHistory} activeTab={activeTab} />
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabWrapper: {
    marginVertical: 15,
  },
  tabContainer: {
    paddingHorizontal: width(3),
  },
  activeTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 10,
  },
  inactiveTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    marginRight: 10,
  },
  activeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  inactiveText: {
    color: '#333',
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

export default BooKings;

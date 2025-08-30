import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import BookingHistoryCard from '../../../components/bookingHistoryCard.js';
import {COLORS, fontFamly} from '../../../constants';

const renderTabs = ['Booking Items', 'Sale Items'];

const BookingHistory = ({route}) => {
  const data = route.params;
  console.log(data, 'datadatadatadatas');

  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Booking Items');

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={data?.title}
        leftIcon={ICONS.leftArrowIcon}
        onLeftIconPress={() => navigation.goBack()}
        rightIcon={ICONS.notificationIcon}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />

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
      <BookingHistoryCard activeTab={activeTab} status={data.title} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width(1),
    alignItems: 'center',
    marginHorizontal: width(3),
    backgroundColor: COLORS.backgroundLight,
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

export default BookingHistory;

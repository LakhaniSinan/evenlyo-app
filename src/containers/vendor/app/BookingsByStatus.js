import React, {useState} from 'react';
import {
  FlatList,
  Image,
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
import {COLORS, fontFamly} from '../../../constants';
import {ALL_ITEMS} from './DummyData';

const TABS = ['Booking Items', 'Sale Items'];

const TabButton = ({tab, isActive, onPress}) =>
  isActive ? (
    <LinearGradient
      colors={['#FF295D', '#E31B95', '#C817AE']}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={styles.activeTab}>
      <Text style={styles.activeText}>{tab}</Text>
    </LinearGradient>
  ) : (
    <TouchableOpacity style={styles.inactiveTab} onPress={onPress}>
      <Text style={styles.inactiveText}>{tab}</Text>
    </TouchableOpacity>
  );
const BookingsByStatus = ({navigation, route}) => {
  const {title} = route.params;
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const BookingCard = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('BookingDetails', {...item, tab: activeTab})
      }>
      <View style={styles.cardImageWrapper}>
        <Image
          source={item.image}
          resizeMode="cover"
          style={styles.cardImage}
        />
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.cardHeader}>
          <Text style={styles.organizer}>{item.organizer}</Text>
          <View
            style={[styles.statusWrapper, {backgroundColor: item.statusColor}]}>
            <Text style={[styles.statusText, {color: item.statusTextColor}]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        {item?.type == 'Sale' ? (
          <Text style={styles.bookingId}>
            With over 7 years of event experience, DJ Ray...
          </Text>
        ) : (
          <Text style={styles.bookingId}>Booking ID: {item.bookingId}</Text>
        )}
        <View
          style={[
            styles.dateTimeWrapper,
            {marginTop: item?.type == 'Sale' ? width(5) : width(8)},
          ]}>
          <Text style={styles.dateTime}>Date: {item.date}</Text>
          <Text style={styles.dateTime}>Time: {item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getData = () => {
    return ALL_ITEMS.filter(
      item =>
        item.type === (activeTab === 'Booking Items' ? 'Booking' : 'Sale') &&
        item.status === title,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText={title}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
          <TabButton
            key={tab}
            tab={tab}
            isActive={activeTab === tab}
            onPress={() => setActiveTab(tab)}
          />
        ))}
      </View>

      <FlatList
        data={getData()}
        keyExtractor={item => item.id}
        renderItem={({item}) => <BookingCard item={item} />}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 20, color: 'gray'}}>
            No items found for "{title}"
          </Text>
        }
        contentContainerStyle={{paddingBottom: 20}}
      />
    </SafeAreaView>
  );
};

export default BookingsByStatus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: width(3),
    backgroundColor: COLORS.backgroundLight,
    padding: width(1),
    borderRadius: width(4),
    marginTop: width(2),
  },
  activeTab: {
    paddingVertical: 16,
    width: width(44.5),
    borderRadius: 12,
  },
  inactiveTab: {
    paddingVertical: 16,
    width: width(44.5),
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
  card: {
    flexDirection: 'row',
    borderRadius: 15,
    marginHorizontal: width(3),
    marginTop: width(3),
    paddingHorizontal: width(3),
    backgroundColor: COLORS.backgroundLight,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImageWrapper: {
    height: width(30),
    width: width(30),
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: width(3),
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  cardDetails: {
    width: width(55),
    marginVertical: width(3),
    paddingHorizontal: width(2),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizer: {
    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
    color: COLORS.textLight,
    fontSize: 9,
  },
  statusWrapper: {
    paddingHorizontal: width(4),
    borderRadius: 100,
    paddingVertical: width(1),
  },
  statusText: {
    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
    fontSize: 9,
  },
  title: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    fontSize: 12,
    paddingRight: width(8),
  },
  bookingId: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
    fontSize: 10,
    paddingRight: width(8),
  },
  dateTimeWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width(8),
  },
  dateTime: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
    fontSize: 10,
  },
});

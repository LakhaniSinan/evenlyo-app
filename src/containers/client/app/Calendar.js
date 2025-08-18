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
import BookingList from '../../../components/bookingCard';
import {COLORS, fontFamly} from '../../../constants';

const renderTabs = ['All Order', 'New Requests', 'In Progress'];

const BooKings = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All Order');

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={'Booking'}
        rightIcon={ICONS.chatIcon}
        onRightIconPress={() => navigation.navigate('Messages')}
        onLeftIconPress={() => navigation.goBack()}
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
      <BookingList activeTab={activeTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: width(3),
    alignItems: 'center',
    marginVertical: 15,
  },
  activeTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  inactiveTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
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

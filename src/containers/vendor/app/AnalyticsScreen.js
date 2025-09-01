import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
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
import AppHeader from '../../../components/appHeader';
import BookingTable from '../../../components/bookingTable/index.js';
import LineChartComponent from '../../../components/charts/LineChart.js';
import PieChartComponent from '../../../components/charts/PiaCart.js';
import AnalyticsFilter from '../../../components/modals/AnalyticsFilter.js';
import AnalyticsCard from '../../../components/reportAndAnalyticsCard/index.js';
import {COLORS, fontFamly} from '../../../constants';

const renderTabs = ['Booking Items', 'Sale Items'];

const dashboardData = [
  {
    title: 'Today Earning',
    icon: ICONS.earningIcon,
    value: 2450,
    percentage: 10,
  },
  {
    title: 'Last Week Earning',
    icon: ICONS.dollerSignIcon,
    value: 18500,
    percentage: 10,
  },
];

const tableData = [
  {
    bookingId: 'ITM001',
    bookingItem: 'DJ',
    totalCost: '$1,195',
    earning: '$359',
  },
  {
    bookingId: 'ITM002',
    bookingItem: 'DJ',
    totalCost: '$1,195',
    earning: '$359',
  },
  {
    bookingId: 'ITM003',
    bookingItem: 'DJ',
    totalCost: '$1,195',
    earning: '$359',
  },
  {
    bookingId: 'ITM004',
    bookingItem: 'DJ',
    totalCost: '$1,195',
    earning: '$359',
  },
];

const AnalyticsReport = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Booking Items');

  const onPressBtn = buttonText => {
    if (buttonText == 'Filter') setModalVisible(true);
  };
  const handleDownload = () => {
    setModalVisible(true);
  };
  const renderFilterButton = (buttonIcon, buttonText) => {
    return (
      <TouchableOpacity
        onPress={() => onPressBtn(buttonText)}
        style={{
          width: width(30),
          borderWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor: COLORS.border,
          paddingVertical: width(3),
          borderRadius: width(3),
        }}>
        <Image
          source={buttonIcon}
          resizeMode="contain"
          style={{height: 19, width: 19, marginRight: width(3)}}
        />
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            color: COLORS.textLight,
            fontSize: 12,
          }}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'Analytics & Report'}
        leftIcon={ICONS.drawerIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => {
          navigation.openDrawer();
        }}
        onRightIconPress={() => {
          navigation.navigate('Notifications');
        }}
      />

      <ScrollView style={{flex: 1}}>
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
            gap: width(4),
            flexWrap: 'wrap',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: width(8),
            marginTop: width(2),
          }}>
          {dashboardData.map(item => {
            return <AnalyticsCard item={item} />;
          })}
        </View>

        <View
          style={{
            padding: width(4),
            backgroundColor: COLORS.backgroundLight,
            marginHorizontal: width(7),
            marginTop: width(2),
            height: 95,
            borderRadius: width(3),
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <Text
              style={{
                fontSize: 10,
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
              }}>
              Total Earning
            </Text>
            <View
              style={{
                width: 22.32,
                height: 22.32,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: COLORS.border,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}>
              <Image
                source={ICONS.incrimentIcon}
                resizeMode="contain"
                style={{width: 10, height: 10}}
              />
            </View>
          </View>
          <Text
            style={{fontFamily: fontFamly.PlusJakartaSansBold, fontSize: 20}}>
            $125,000
          </Text>
          <Text
            style={{fontFamily: fontFamly.PlusJakartaSansBold, fontSize: 8}}>
            +8.7% from last month
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: width(3),
          }}>
          {renderFilterButton(ICONS.filterIcon, 'Filter')}
          {renderFilterButton(ICONS.blackDownloadIcon, 'Export CSV')}
          {renderFilterButton(ICONS.blackDownloadIcon, 'Export PDF')}
        </View>

        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            marginTop: width(3),
            marginHorizontal: width(3),
            borderRadius: 12,
            paddingVertical: width(4),
          }}>
          <LineChartComponent
            labelll={
              activeTab == 'Booking Items'
                ? 'Booking Earnings'
                : 'Sale Earnings'
            }
          />
        </View>

        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            marginTop: width(3),
            marginHorizontal: width(3),
            borderRadius: 12,
            paddingVertical: width(4),
          }}>
          <PieChartComponent
            labelll={
              activeTab == 'Booking Items'
                ? 'Booking Earnings'
                : 'Sale Earnings'
            }
          />
        </View>

        <View style={{padding: width(3)}}>
          <BookingTable data={tableData} canDownload={handleDownload} />
        </View>
      </ScrollView>

      <AnalyticsFilter
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
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

export default AnalyticsReport;

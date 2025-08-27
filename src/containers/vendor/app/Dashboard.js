import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import DashboardCard from '../../../components/dashboardCard';
import {COLORS, fontFamly} from '../../../constants';

const dashboardData = [
  {
    title: 'All Clients',
    icon: ICONS.groupIcon,
    value: 1247,
    percentage: 10,
  },
  {
    title: 'Total Items',
    icon: ICONS.groupIcon,
    value: 89,
    percentage: 10,
  },
];
function Dashboard() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'Dashboard'}
        leftIcon={ICONS.drawerIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => {
          //   navigation.openDrawer();
        }}
        onRightIconPress={() => {
          //   navigation.navigate('Notifications');
        }}
      />
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={{flex: 1, padding: width(4)}}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
            }}>
            Welcome, John Doe
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: fontFamly.PlusJakartaSansMedium,
              color: COLORS.textLight,
            }}>
            Role: Vendor • Here's an overview of your business performance
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            gap: width(4),
            flexWrap: 'wrap',
          }}>
          {dashboardData.map(item => {
            return <DashboardCard item={item} />;
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Dashboard;

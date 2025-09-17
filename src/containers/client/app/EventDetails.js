import React, {useState} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import TabItem from '../../../components/tabsComponent';
import {COLORS} from '../../../constants';
import {useTranslation} from '../../../hooks';
import DetailsContent from './EventDetailContent';
import AllReviews from './ReviewScreen';

const data = [1, 2, 3, 4, 5];

const getTabsData = t => [
  {
    id: 'details',
    title: t('Details'),
    activeIcon: ICONS.infoIconActive,
    inactiveIcon: ICONS.infoIconInActive,
  },
  {
    id: 'gallery',
    title: t('Gallery'),
    activeIcon: ICONS.galleryIconActive,
    inactiveIcon: ICONS.galleryIconInActive,
  },
  {
    id: 'reviews',
    title: t('Reviews'),
    activeIcon: ICONS.starIconActive,
    inactiveIcon: ICONS.starIconInActive,
  },
];

const EventDetails = ({navigation}) => {
  const {t} = useTranslation();
  const [selectedTab, setSelectedTab] = useState('details');
  const Tabs = ({tabsData, selectedTab, onPress}) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: width(3),
        }}>
        {tabsData.map((item, index) => (
          <TabItem
            key={item.id}
            item={item}
            isActive={selectedTab === item.id}
            onPress={onPress}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <ScrollView>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          headingText={'Details'}
          rightIcon={ICONS.notificationIcon}
          onRightIconPress={() => navigation.navigate('Notifications')}
          onLeftIconPress={() => navigation.goBack()}
        />

        <Tabs
          tabsData={getTabsData(t)}
          selectedTab={selectedTab}
          onPress={setSelectedTab}
        />

        {selectedTab === 'details' && (
          <DetailsContent
            data={data}
            selectedTab={selectedTab}
            navigation={navigation}
          />
        )}
        {selectedTab === 'gallery' && (
          <DetailsContent data={data} selectedTab={selectedTab} />
        )}
        {selectedTab === 'reviews' && <AllReviews data={data} />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventDetails;

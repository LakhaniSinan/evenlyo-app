import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import TabItem from '../../../components/tabsComponent';
import {COLORS} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getBookingDetails} from '../../../services/ListingsItem';
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

const EventDetails = ({route, navigation}) => {
  const item = route?.params;
  const {t} = useTranslation();
  const modalRef = useRef();
  const [selectedDates, setSelectedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('details');
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    handleGetBookingDetails();
  }, []);

  const handleGetBookingDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getBookingDetails(item?._id);

      console.log(response, 'responseresponseresponseresponseadasd');

      setIsLoading(false);
      if (response.status == 200 || response.status == 201) {
        setBookingDetails(response?.data?.data);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error, 'errorerrorerrorerror123435');
    }
  };

  const handleDaySelect = data => {
    console.log(data, 'handleDaySelecthandleDaySelect');
  };

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
            selectedDates={selectedDates}
            setSelectedDates={setSelectedDates}
            data={bookingDetails}
            selectedTab={selectedTab}
            navigation={navigation}
            handleDaySelect={handleDaySelect}
          />
        )}
        {selectedTab === 'gallery' && (
          <DetailsContent data={data} selectedTab={selectedTab} />
        )}
        {selectedTab === 'reviews' && <AllReviews data={data} />}
      </ScrollView>
      <Loader isLoading={isLoading} />
      <CommonAlert isLoading={modalRef} />
    </SafeAreaView>
  );
};

export default EventDetails;

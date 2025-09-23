import React, {memo, useCallback, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import CarouselComponent from '../../../components/carousel';
import EventAndPriceDetails from '../../../components/eventDetailAndPrice';
import CategoryEditSuccess from '../../../components/modals/CategoryEditSuccess';
import DeleteRequestModal from '../../../components/modals/DeleteRequestModal';
import OrderBooking from '../../../components/modals/OrderBookingModal';
import RequestConfirmation from '../../../components/modals/RequestConfirmation';
import {COLORS, fontFamly} from '../../../constants';

function EventDetailsScreen({navigation}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [resuestModalVisible, setResuestModalVisible] = useState(false);
  const [deleteRequest, setDeteleRequest] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const handleSendBookingRequest = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => {
      setResuestModalVisible(true);
    }, 500);
  }, []);
  const data = [1, 2, 3, 4, 5];

  const scheduleData = [
    {
      id: 1,
      day: 'Mon',
      opning: '10:00 AM',
      closing: '11:00 PM',
      isAvailable: true,
    },
    {
      id: 2,
      day: 'Tue',
      opning: '10:00 AM',
      closing: '11:00 PM',
      isAvailable: true,
    },
    {
      id: 3,
      day: 'Wed',
      opning: '10:00 AM',
      closing: '11:00 PM',
      isAvailable: false,
    },
    {
      id: 4,
      day: 'Thu',
      opning: '10:00 AM',
      closing: '11:00 PM',
      isAvailable: true,
    },
    {
      id: 5,
      day: 'Fri',
      opning: '10:00 AM',
      closing: '11:00 PM',
      isAvailable: false,
    },
    {
      id: 6,
      day: 'Sat',
      opning: '10:00 AM',
      closing: '11:00 PM',
      isAvailable: true,
    },
    {
      id: 7,
      day: 'Sun',
      opning: '10:00 AM',
      closing: '11:00 PM',
      isAvailable: true,
    },
  ];

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const menuContent = [
    {icon: ICONS.viewIcon, title: 'View As Client'},
    {icon: ICONS.editGridientIcon, title: 'Edit'},
    {icon: ICONS.deleteIcon, title: 'Delete'},
  ];
  const [commentType, setCommentType] = useState('public');

  useEffect(() => {
    handleNavigations();
  }, [commentType]);

  const handleNavigations = () => {
    setCommentType('');
    if (commentType == 'Delete') setDeteleRequest(true);
  };

  const onClose = () => {
    setDeteleRequest(false);
  };

  const handleTrackBooking = () => {
    setDeteleRequest(false);
    setTimeout(() => {
      setSuccessModal(true);
    }, 500);

    setTimeout(() => {
      setSuccessModal(false);
    }, 2000);
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        headingText={'Details'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.gridientMenuIcon}
        onLeftIconPress={handleBackPress}
        onRightIconPress={() => {}}
        isMenu={true}
        isShowMenuIcon={true}
        menuContent={menuContent || []}
        setCommentType={setCommentType}
        commentType={commentType}
      />

      <ScrollView style={{flex: 1}}>
        <CarouselComponent data={data} />
        <View style={{marginHorizontal: 10, marginTop: width(3)}}>
          <EventAndPriceDetails
            showrating={true}
            showDiscount={false}
            showSwitch={true}
          />
        </View>

        <View style={{paddingVertical: width(3), marginHorizontal: 20}}>
          <Text
            style={{fontFamily: fontFamly.PlusJakartaSansBold, fontSize: 12}}>
            Description:
          </Text>
          <Text
            numberOfLines={4}
            style={{
              fontFamily: fontFamly.PlusJakartaSansMedium,
              fontSize: 10,
              color: COLORS.textLight,
            }}>
            With over 7 years of event experience, DJ RayBeatz is known for
            high-energy dance floors, seamless transitions, and crowd-pleasing
            remixes. From desi weddings to corporate raves, he brings the
            perfect vibe for every crow With over 7...
          </Text>
        </View>
        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            margin: width(4),
            borderRadius: width(3),
            padding: width(4),
          }}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,

              color: COLORS.black,
            }}>
            Opening/ Closing: Day & Time
          </Text>
          {scheduleData.map(item => {
            return (
              <View
                style={{
                  height: width(10),
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: width(2),
                  borderBottomColor: COLORS.border,
                  borderBottomWidth: item?.id === 7 ? 0 : 1,
                }}>
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansMedium,
                    fontSize: 11,
                    color: COLORS.textLight,
                  }}>
                  {item?.day}
                </Text>
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansMedium,
                    fontSize: 11,
                    color: COLORS.textLight,
                  }}>
                  {item?.isAvailable
                    ? `${item?.opning} to ${item?.closing}`
                    : 'Closed'}
                </Text>
              </View>
            );
          })}
        </View>
        <OrderBooking
          isVisible={modalVisible}
          onClose={() => setModalVisible(false)}
          nestedFilter={true}
          handleSendBookingRequest={handleSendBookingRequest}
        />
        <RequestConfirmation
          visible={resuestModalVisible}
          onClose={() => setResuestModalVisible(false)}
          navigation={navigation}
        />
        <DeleteRequestModal
          visible={deleteRequest}
          onClose={onClose}
          navigation={navigation}
          handleTrackBooking={handleTrackBooking}
        />
        <CategoryEditSuccess
          visible={successModal}
          type={'Successfully Delete !'}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default memo(EventDetailsScreen);

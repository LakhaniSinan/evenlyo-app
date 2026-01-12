import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';

import {ICONS} from '../../../assets';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import FilterModal from '../../../components/modals/FilterModal';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getVendorNotifications} from '../../../services/Notifications';
import {getTimeAgoStatus} from '../../../utils';

const Notification = ({navigation}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const modalRef = useRef();

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vendorNotifications, setVendorNotifications] = useState([]);

  const {t, currentLanguage} = useTranslation();

  useEffect(() => {
    handlGetVendorNotifications();
  }, []);

  const handlGetVendorNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await getVendorNotifications();

      if (response?.status === 200 || response.status == 201) {
        setVendorNotifications(response?.data?.data || []);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log('Notification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    handlGetVendorNotifications();
  }, []);

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          marginTop: 20,
          alignItems: 'center',
        }}>
        <View
          style={{
            marginLeft: 15,
            flexDirection: 'column',
            borderLeftWidth: item?.isRead ? 5 : 0,
            borderLeftColor: COLORS.primary,
            paddingLeft: width(3),
          }}>
          <Text
            style={{
              color: COLORS.black,
              fontSize: 15,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
            }}>
            New Booking Request
          </Text>

          <Text
            style={{
              color: '#6D6D6D',
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              marginVertical: 4,
            }}>
            {currentLanguage === 'en' ? item?.message?.en : item?.message?.nl}
          </Text>

          <Text
            style={{
              color: COLORS.textLight,
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            }}>
            {getTimeAgoStatus(item?.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: COLORS.backgroundLight,
          borderBottomRightRadius: 20,
          borderBottomLeftRadius: 20,
        }}>
        {/* Header */}
        <View
          style={{
            paddingVertical: width(2),
            paddingHorizontal: width(2),
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              resizeMode="contain"
              style={{width: 40, height: 40}}
              source={ICONS.leftArrowIcon}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.black,
              fontSize: 16,
            }}>
            {t('Notifications')}
          </Text>

          <View style={{width: 40}} />
        </View>

        {/* Search */}
        <View
          style={{
            width: '100%',
            paddingLeft: width(4),
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: width(3),
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
              width: '95%',
            }}
            styleProps={{
              fontSize: 14,
              color: '#000',
            }}
          />
        </View>
      </View>
      <FlatList
        data={vendorNotifications}
        renderItem={renderItem}
        keyExtractor={item => item?._id}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !isLoading && (
            <Text
              style={{
                textAlign: 'center',
                color: COLORS.textLight,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              }}>
              No notifications found
            </Text>
          )
        }
      />

      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />

      <CommonAlert ref={modalRef} />

      <Loader isLoading={isLoading && !refreshing} />
    </>
  );
};

export default Notification;

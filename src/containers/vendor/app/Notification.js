import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/nl';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';

import {ICONS} from '../../../assets';
import CommonAlert from '../../../components/commanAlert';
import FilterModal from '../../../components/modals/FilterModal';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getVendorNotifications} from '../../../services/Notifications';

const Notification = ({navigation}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const modalRef = useRef();

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vendorNotifications, setVendorNotifications] = useState([]);

  const {t, currentLanguage} = useTranslation();
  const skeletonData = useMemo(() => Array(6).fill({}), []);

  const getLocalizedField = useCallback(
    field => {
      if (!field) {
        return '';
      }
      if (typeof field === 'string') {
        return field.trim();
      }
      const primary =
        currentLanguage === 'en' ? field?.en : field?.nl;
      const fallback =
        currentLanguage === 'en' ? field?.nl : field?.en;
      return String(primary || fallback || '').trim();
    },
    [currentLanguage],
  );

  const resolveApiMessage = useCallback(
    message => {
      if (!message) {
        return t('Something went wrong');
      }
      if (typeof message === 'string') {
        return message;
      }
      return getLocalizedField(message) || t('Something went wrong');
    },
    [getLocalizedField, t],
  );

  const getRelativeTime = useCallback(
    timestamp => {
      if (!timestamp) {
        return '';
      }
      const locale = currentLanguage === 'nl' ? 'nl' : 'en';
      const now = moment();
      const time = moment(timestamp).locale(locale);

      const diffInMinutes = now.diff(time, 'minutes');
      const diffInHours = now.diff(time, 'hours');
      const diffInDays = now.diff(time, 'days');

      if (diffInMinutes < 1) {
        return t('timeRelativeJustNow');
      }
      if (diffInMinutes < 60) {
        return t('timeRelativeMinutesAgo', {count: diffInMinutes});
      }
      if (diffInHours < 24) {
        return t('timeRelativeHoursAgo', {count: diffInHours});
      }
      if (diffInDays === 1) {
        return t('timeRelativeYesterday');
      }
      if (diffInDays < 7) {
        return t('timeRelativeDaysAgo', {count: diffInDays});
      }
      return time.format('MMM D, YYYY');
    },
    [currentLanguage, t],
  );

  const handlGetVendorNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getVendorNotifications();

      if (response?.status === 200 || response.status == 201) {
        setVendorNotifications(response?.data?.data || []);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: resolveApiMessage(response?.data?.message),
        });
      }
    } catch (error) {
      console.log('Notification error:', error);
      modalRef.current?.show({
        status: 'error',
        message: t('Something went wrong'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [resolveApiMessage, t]);

  useFocusEffect(
    useCallback(() => {
      handlGetVendorNotifications();
    }, [handlGetVendorNotifications]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handlGetVendorNotifications();
    setRefreshing(false);
  }, [handlGetVendorNotifications]);

  const renderItem = useCallback(
    ({item}) => {
      if (isLoading) {
        return (
          <View style={styles.itemContainer}>
            <View style={[styles.imageWrapper, styles.skeletonCircle]} />
            <View style={styles.messageContainer}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonMessage} />
            </View>
          </View>
        );
      }

      return (
        <View style={styles.itemContainer}>
          <View style={styles.leftContainer}>
            <View style={styles.imageWrapper}>
              <Image
                style={styles.image}
                source={ICONS.notificationIcon}
                resizeMode="contain"
              />
              {!item?.isRead && <View style={styles.statusDot} />}
            </View>

            <View style={styles.messageContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>
                  {getLocalizedField(item?.title)}
                </Text>
                <View style={styles.rightContainer}>
                  <Text style={styles.timeText}>
                    {getRelativeTime(item?.createdAt)}
                  </Text>
                  <Image
                    source={ICONS.bellIcon}
                    style={styles.bellIcon}
                    tintColor={COLORS.black}
                  />
                </View>
              </View>
              <Text style={styles.subHeading}>
                {getLocalizedField(item?.message)}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [getLocalizedField, getRelativeTime, isLoading],
  );

  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              resizeMode="contain"
              style={styles.backIcon}
              source={ICONS.leftArrowIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('Notifications')}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>
      <FlatList
        keyExtractor={(item, index) => item?._id || index.toString()}
        data={isLoading ? skeletonData : vendorNotifications}
        renderItem={renderItem}
        extraData={currentLanguage}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('No Notifications')}</Text>
            </View>
          )
        }
      />

      <FilterModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />

      <CommonAlert ref={modalRef} />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    paddingVertical: width(2),
  },
  headerTop: {
    paddingVertical: width(2),
    paddingHorizontal: width(2),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backIcon: {width: 40, height: 40},
  headerTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 16,
    color: COLORS.black,
  },
  headerSpacer: {width: 40},
  listContent: {paddingBottom: 10},
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
  },
  itemContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 14,
    alignItems: 'center',
  },
  leftContainer: {flexDirection: 'row'},
  imageWrapper: {
    height: width(13),
    width: width(13),
    borderRadius: 100,
    position: 'relative',
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {height: '100%', width: '100%', borderRadius: 100},
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 100,
    padding: width(1),
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.primary,
  },
  messageContainer: {
    paddingHorizontal: width(2),
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    width: width(55),
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },
  subHeading: {
    color: '#6D6D6D',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginTop: 3,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width(22),
  },
  timeText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    fontSize: 10,
    marginHorizontal: width(1),
  },
  bellIcon: {height: width(3), width: width(3), marginTop: width(1)},
  skeletonCircle: {backgroundColor: '#eee'},
  skeletonTitle: {
    height: 15,
    backgroundColor: '#eee',
    width: '70%',
    borderRadius: 4,
  },
  skeletonMessage: {
    height: 12,
    backgroundColor: '#ddd',
    width: '90%',
    marginTop: 6,
    borderRadius: 4,
  },
});

export default Notification;

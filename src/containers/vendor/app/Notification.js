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
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  getVendorNotifications,
  markVendorNotificationAsRead,
} from '../../../services/Notifications';

const FILTER_OPTIONS = ['all', 'read', 'unread'];

const Notification = ({navigation}) => {
  const modalRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vendorNotifications, setVendorNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState('all');

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
      const primary = currentLanguage === 'en' ? field?.en : field?.nl;
      const fallback = currentLanguage === 'en' ? field?.nl : field?.en;
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
      return time.format('DD/MM/YYYY');
    },
    [currentLanguage, t],
  );

  const handlGetVendorNotifications = useCallback(
    async ({isRefresh = false} = {}) => {
      try {
        if (!isRefresh) {
          setIsLoading(true);
        }
        const response = await getVendorNotifications();

        if (response?.status === 200 || response?.status === 201) {
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
        if (!isRefresh) {
          setIsLoading(false);
        }
      }
    },
    [resolveApiMessage, t],
  );

  useFocusEffect(
    useCallback(() => {
      handlGetVendorNotifications();
    }, [handlGetVendorNotifications]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await handlGetVendorNotifications({isRefresh: true});
    setRefreshing(false);
  }, [handlGetVendorNotifications]);

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return vendorNotifications.filter(item => {
      const title = getLocalizedField(item?.title).toLowerCase();
      const matchesSearch = !query || title.includes(query);

      const matchesFilter =
        readFilter === 'all' ||
        (readFilter === 'read' && item?.isRead) ||
        (readFilter === 'unread' && !item?.isRead);

      return matchesSearch && matchesFilter;
    });
  }, [vendorNotifications, searchQuery, readFilter, getLocalizedField]);

  const handleNotificationPress = useCallback(
    async item => {
      if (!item?._id) {
        return;
      }

      if (!item?.isRead) {
        setVendorNotifications(prev =>
          prev.map(notification =>
            notification._id === item._id
              ? {...notification, isRead: true}
              : notification,
          ),
        );

        try {
          await markVendorNotificationAsRead(item._id);
        } catch (error) {
          console.log('markVendorNotificationAsRead error:', error);
        }
      }

      const bookingId = item?.bookingId;
      if (!bookingId) {
        return;
      }

      const parent = navigation.getParent?.();
      if (parent) {
        parent.navigate('AllBookingStack', {
          screen: 'BookingDetails',
          params: {_id: String(bookingId)},
        });
        return;
      }

      navigation.navigate('BookingDetails', {_id: String(bookingId)});
    },
    [navigation],
  );

  const renderFilterChip = useCallback(
    filterKey => {
      const isActive = readFilter === filterKey;
      const labelKey =
        filterKey === 'all'
          ? 'notificationsFilterAll'
          : filterKey === 'read'
          ? 'notificationsFilterRead'
          : 'notificationsFilterUnread';

      return (
        <TouchableOpacity
          key={filterKey}
          style={[styles.filterChip, isActive && styles.filterChipActive]}
          onPress={() => setReadFilter(filterKey)}>
          <Text
            style={[
              styles.filterChipText,
              isActive && styles.filterChipTextActive,
            ]}>
            {t(labelKey)}
          </Text>
        </TouchableOpacity>
      );
    },
    [readFilter, t],
  );

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
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.itemContainer}
          onPress={() => handleNotificationPress(item)}>
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
        </TouchableOpacity>
      );
    },
    [getLocalizedField, getRelativeTime, handleNotificationPress, isLoading],
  );

  const listHeader = useMemo(
    () => (
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

        <View style={styles.searchContainer}>
          <TextField
            placeholder={t('notificationsSearchPlaceholder')}
            placeholderTextColor="#aaa"
            bgColor={COLORS.white}
            startIcon={ICONS.search}
            value={searchQuery}
            onChangeText={setSearchQuery}
            inputContainer={styles.inputContainer}
            styleProps={styles.inputText}
          />
        </View>

        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map(renderFilterChip)}
        </View>
      </View>
    ),
    [navigation, t, searchQuery, renderFilterChip],
  );

  return (
    <>
      <FlatList
        keyExtractor={(item, index) => item?._id || index.toString()}
        ListHeaderComponent={listHeader}
        data={isLoading ? skeletonData : filteredNotifications}
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
  searchContainer: {
    width: '100%',
    paddingHorizontal: width(4),
    marginTop: width(2),
  },
  inputContainer: {
    paddingVertical: 0,
    paddingHorizontal: 10,
    height: 45,
    width: '100%',
    marginTop: 0,
  },
  inputText: {fontSize: 14, color: '#000'},
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width(2),
    paddingHorizontal: width(4),
    paddingTop: width(3),
    paddingBottom: width(2),
    width: '100%',
  },
  filterChip: {
    paddingHorizontal: width(3.5),
    paddingVertical: width(1.8),
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 12,
    color: COLORS.textDark,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
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
  leftContainer: {flexDirection: 'row', flex: 1},
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

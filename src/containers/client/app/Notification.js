import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import useNotifications from '../../../hooks/notifications';
import {markClientNotificationAsRead} from '../../../services/Notifications';
import {formatRelativeTime} from '../../../utils';
import AppHeader from '../../../components/appHeader';

const Notification = ({navigation}) => {
  const {t, currentLanguage} = useTranslation();
  const {fetchNotifications, loading, notification, setNotificaiton} =
    useNotifications();
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const skeletonData = useMemo(() => Array(6).fill({}), []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications({isRefresh: true});
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      setMarkAllLoading(true);
      // const responce = await markClientNotificationAsRead('all');

      setNotificaiton(prev =>
        prev.map(item => ({
          ...item,
          isClientRead: true,
          isRead: true,
        })),
      );

      await fetchNotifications();
    } catch (error) {
    } finally {
      setMarkAllLoading(false);
    }
  }, [fetchNotifications, setNotificaiton]);

  const getLocalizedField = useCallback(
    (field, language = currentLanguage) => {
      if (!field) {
        return '';
      }
      if (typeof field === 'string') {
        return field.trim();
      }
      const primary = language === 'en' ? field?.en : field?.nl;
      const fallback = language === 'en' ? field?.nl : field?.en;
      return String(primary || fallback || '').trim();
    },
    [currentLanguage],
  );

  const handleNotificationPress = useCallback(
    async item => {
      if (!item?._id) {
        return;
      }

      const isRead = Boolean(item?.isClientRead ?? item?.isRead);

      if (!isRead) {
        setNotificaiton(prev =>
          prev.map(notificationItem =>
            notificationItem._id === item._id
              ? {...notificationItem, isClientRead: true, isRead: true}
              : notificationItem,
          ),
        );

        try {
          await markClientNotificationAsRead(item._id);
          await fetchNotifications();
        } catch (error) {
          console.log('markClientNotificationAsRead error:', error);
        }
      }

      const bookingId = item?.bookingId;
      if (!bookingId) {
        return;
      }

      const parent = navigation.getParent?.();
      if (parent) {
        parent.navigate('Calendar', {
          screen: 'BookingDetails',
          params: {_id: String(bookingId)},
        });
        return;
      }

      navigation.navigate('BookingDetails', {_id: String(bookingId)});
    },
    [navigation, setNotificaiton],
  );

  const renderItem = useCallback(
    ({item}) => {
      if (loading) {
        return (
          <View style={styles.itemContainer}>
            <View style={[styles.imageWrapper, {backgroundColor: '#eee'}]} />
            <View style={styles.messageContainer}>
              <View
                style={{
                  height: 15,
                  backgroundColor: '#eee',
                  width: '70%',
                  borderRadius: 4,
                }}
              />
              <View
                style={{
                  height: 12,
                  backgroundColor: '#ddd',
                  width: '90%',
                  marginTop: 6,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        );
      }

      const isUnread = !(item?.isClientRead ?? item?.isRead);

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
              {isUnread && <View style={styles.statusDot} />}
            </View>

            <View style={styles.messageContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.titleText}>
                  {getLocalizedField(item?.title)}
                </Text>
                <View style={styles.rightContainer}>
                  <Text style={styles.timeText}>
                    {formatRelativeTime(item?.createdAt)}
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
    [getLocalizedField, handleNotificationPress, loading],
  );

  return (
    <View>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={t('Notifications')}
        onLeftIconPress={() => navigation.goBack()}
      />
      <FlatList
        keyExtractor={(item, index) => item?._id || index.toString()}
        data={loading ? skeletonData : notification}
        ListHeaderComponent={
          <View style={styles.container}>
            {/* <TouchableOpacity
              style={styles.button}
              disabled={markAllLoading}
              onPress={handleMarkAllAsRead}>
              <Text style={styles.markAllText}>
                {markAllLoading ? t('Reading...') : t('Mark all as read')}
              </Text>
            </TouchableOpacity> */}
          </View>
        }
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('No Notifications')}</Text>
            </View>
          )
        }
      />
    </View>
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
  markAllText: {
    textAlign: 'right',
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.white,
  },
  button: {
    height: width(10),
    width: width(40),
    borderRadius: width(5),
    marginVertical: width(3),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: width(3),
  },
});

export default Notification;

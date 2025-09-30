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
import {ICONS, IMAGES} from '../../../assets';
import Loader from '../../../components/loder';
import FilterModal from '../../../components/modals/FilterModal';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import useNotifications from '../../../hooks/notifications';
import {formatRelativeTime} from '../../../utils';

const Notification = ({navigation}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const {t} = useTranslation();
  const {fetchNotifications, loading, notification} = useNotifications();

  // fallback dummy data if nothing fetched
  const fallbackData = useMemo(
    () =>
      Array(6).fill({
        image: IMAGES.profilePhoto,
        heading: 'Get Disc 20%',
        subHeading: 'Thanks for the quick response',
      }),
    [],
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleItemPress = useCallback(
    () => navigation.navigate('NotificationDetails'),
    [navigation],
  );

  const renderItem = useCallback(
    ({item}) => {
      return (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={handleItemPress}>
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
                <Text style={styles.titleText} numberOfLines={1}>
                  {item?.title || 'Notification'}
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
              <Text style={styles.subHeading} numberOfLines={2}>
                {item?.message || item?.subHeading}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [handleItemPress],
  );

  return (
    <>
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        ListHeaderComponent={
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
                placeholder={t('searchEvent')}
                placeholderTextColor="#aaa"
                bgColor={COLORS.white}
                startIcon={ICONS.search}
                inputContainer={styles.inputContainer}
                styleProps={styles.inputText}
              />
            </View>
          </View>
        }
        data={notification && notification.length ? notification : fallbackData}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
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
      <Loader isLoading={loading} />
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
  headerTitle: {fontFamily: fontFamly.PlusJakartaSansBold, fontSize: 16},
  headerSpacer: {width: 40},
  searchContainer: {
    flex: 1,
    width: '100%',
    paddingLeft: width(4),
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: width(3),
    justifyContent: 'space-between',
  },
  inputContainer: {
    paddingVertical: 0,
    paddingHorizontal: 10,
    height: 45,
    width: '95%',
    marginTop: 0,
  },
  inputText: {fontSize: 14, color: '#000'},
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
    justifyContent: 'space-between',
  },
  leftContainer: {flexDirection: 'row', alignItems: 'center'},
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
});

export default Notification;

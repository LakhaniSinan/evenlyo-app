import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import {useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {conversationService} from '../../../services/Chat';

const Messages = ({navigation}) => {
  const {t} = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useSelector(state => state.LoginSlice);
  console.log(user, 'useruseruseruseruseruseruser');

  const [isError, setIsError] = useState(false);
  const [allConversations, setAllConversations] = useState([]);
  console.log(
    allConversations,
    'allConversationsallConversationsallConversationsallConversations',
  );

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllConversations();
  }, [refreshing]);

  const formatedParticipants = useCallback(participantsData => {
    const participants = {};
    participantsData?.forEach(({role, refPath, userId}) => {
      if (refPath === 'Vendor') {
        participants[role === 'vendor' ? 'vendor' : 'user'] = {
          userId: userId?._id,
          name: userId?.businessName,
          photo: userId?.businessLogo || null,
          email: userId?.businessEmail,
          role: 'vendor',
        };
      } else {
        participants.user = {
          userId: userId?._id,
          name: `${userId?.firstName || ''} ${userId?.lastName || ''}`.trim(),
          photo:
            userId?.profileImage ||
            userId?.businessLogo ||
            userId?.photo ||
            null,
          email: userId?.email,
          role: 'user',
        };
      }
    });
    return participants;
  }, []);

  const fetchAllConversations = useCallback(
    async (isRefreshing = false) => {
      try {
        if (!isRefreshing) {
          setIsLoading(true);
        }
        setIsError(false);

        const response = await conversationService.fetchAllConversations(
          user?.id,
          'user',
        );

        console.log(response?.data, 'responseresponseresponseresponseresponse');

        if (response?.success && Array.isArray(response?.data)) {
          const formattedData = response.data.map(item => ({
            ...item,
            participants: formatedParticipants(item?.participants),
          }));
          setAllConversations(formattedData);
        } else {
          setIsError(true);
        }
      } catch {
        setIsError(true);
      } finally {
        if (isRefreshing) {
          setRefreshing(false);
        }
        if (!isRefreshing) {
          setIsLoading(false);
        }
      }
    },
    [user?.vendorId, formatedParticipants],
  );

  const renderChatItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('ChatDetail', item)}>
        <View style={styles.avatarContainer}>
          {item.participants?.vendor?.photo ? (
            <Image
              source={{uri: item.participants?.vendor?.photo}}
              style={styles.avatar}
            />
          ) : (
            <Image
              source={IMAGES.avatarIcon}
              resizeMethod="cover"
              style={styles.avatar}
            />
          )}
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName}>
              {item.participants?.vendor?.name || 'Unknown Vendor'}
            </Text>
            <View style={styles.rightSection}>
              <Text style={styles.timeText}>{item.time}</Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || "Let's start a conversation"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <View
        style={{
          backgroundColor: COLORS.backgroundLight,
          borderBottomLeftRadius: width(10),
          borderBottomRightRadius: width(10),
        }}>
        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          headingText={t('Messages')}
          onLeftIconPress={() => navigation.goBack()}
          showSearchbar={true}
        />

        <View style={styles.searchContainer}>
          <TextField
            startIcon={ICONS.search}
            bgColor={COLORS.white}
            placeholder={t('Search')}
            placeholderTextColor={COLORS.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
      <FlatList
        data={allConversations}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchContainer: {
    paddingHorizontal: width(5),
    paddingVertical: height(2),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    paddingHorizontal: width(4),
    paddingVertical: height(1.5),
    minHeight: height(6),
  },
  searchIcon: {
    width: width(4),
    height: width(4),
    tintColor: COLORS.textLight,
    marginRight: width(3),
  },
  searchInput: {
    flex: 1,
    fontSize: screenWidth > 400 ? 14 : 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width(5),
    paddingVertical: height(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    minHeight: height(9),
  },
  avatarContainer: {
    position: 'relative',
    marginRight: width(3),
  },
  avatar: {
    width: width(12),
    height: width(12),
    borderRadius: width(6),
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: width(3),
    height: width(3),
    borderRadius: width(1.5),
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height(0.5),
  },
  chatName: {
    fontSize: screenWidth > 400 ? 16 : 14,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    minWidth: width(15),
  },
  timeText: {
    fontSize: screenWidth > 400 ? 12 : 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    marginBottom: height(0.3),
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: width(2.5),
    minWidth: width(5),
    height: width(5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width(1.5),
  },
  unreadText: {
    fontSize: screenWidth > 400 ? 11 : 9,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.white,
  },
  lastMessage: {
    fontSize: screenWidth > 400 ? 14 : 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    marginTop: height(0.3),
    lineHeight: screenWidth > 400 ? 18 : 16,
  },
});

export default Messages;

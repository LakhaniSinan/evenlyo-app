import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../../assets';
import GradientButton from '../../../components/button';
import {COLORS, fontFamly} from '../../../constants';
import {SocketContext} from '../../../context';
import {useTranslation} from '../../../hooks';
import {resetOffer} from '../../../redux/slice/offers';
import {formatEuro} from '../../../utils';

const OfferPreviewScreen = ({navigation, route}) => {
  const {t, currentLanguage} = useTranslation();
  const dispatch = useDispatch();
  const {socket} = useContext(SocketContext);
  const offerItems = useSelector(state => state.OffersSlice.items || []);
  const {activeChat} = useSelector(state => state.activeChat);
  const {user} = useSelector(state => state.LoginSlice);
  const [notesByItem, setNotesByItem] = useState({});

  const selectedItems = useMemo(() => offerItems || [], [offerItems]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleGoBack();
          return true;
        },
      );
      return () => subscription.remove();
    }, [handleGoBack]),
  );

  const handleChangeNote = (key, value) => {
    setNotesByItem(prev => ({...prev, [key]: value}));
  };

  const calculateOfferTotals = items =>
    (items || []).reduce(
      (sum, item) =>
        sum + Number(item?.pricingBreakdown?.total || item?.total || 0),
      0,
    );

  const handleSendOffer = () => {
    if (!selectedItems.length) {
      Alert.alert('Error', 'No selected items found.');
      return;
    }

    const subtotal = selectedItems.reduce((sum, item) => {
      const baseAmount =
        item?.type === 'booking'
          ? item?.pricingBreakdown?.basePrice ||
            item?.pricingBreakdown?.baseAmount ||
            item?.basePrice
          : item?.price;
      return sum + Number(baseAmount || 0);
    }, 0);

    const totalDiscount = selectedItems.reduce((sum, item) => {
      if (item?.type === 'booking') {
        const basePrice =
          item?.pricingBreakdown?.basePrice ||
          item?.pricingBreakdown?.baseAmount ||
          item?.basePrice;
        return (
          sum + (Number(basePrice || 0) - Number(item?.discountedPrice || 0))
        );
      }
      return (
        sum + (Number(item?.price || 0) * Number(item?.discount || 0)) / 100
      );
    }, 0);

    const totalExtraTime = selectedItems.reduce((sum, item) => {
      return (
        sum +
        Number(
          item?.pricingBreakdown?.extraTimeCost || item?.extraTimeCost || 0,
        )
      );
    }, 0);

    const totalSecurity = selectedItems
      .filter(item => item?.type === 'booking')
      .reduce((sum, item) => sum + Number(item?.securityFee || 0), 0);

    const totalDistance = selectedItems.reduce((sum, item) => {
      return (
        sum +
        Number(item?.pricingBreakdown?.distanceCost || item?.distanceCost || 0)
      );
    }, 0);

    const finalTotal = calculateOfferTotals(selectedItems);

    const itemsArray = selectedItems.map(item => ({
      ...item,
      specialRequest:
        notesByItem[item?.uniqueId || item?.id || item?._id] ??
        item?.specialRequest,
      offerStatus: 'PENDING',
    }));

    const uniqueId = `temp-${Date.now()}-${Math.random()}`;

    const finalObject = {
      items: itemsArray,
      subtotal,
      totalDiscount,
      totalExtraTime,
      totalSecurity,
      totalDistance,
      finalTotal,
      status: 'PENDING',
      uniqueId,
    };

    const receiverId =
      activeChat?.participants?.user?.userId ||
      route?.params?.chatParams?.participants?.user?.userId ||
      activeChat?.participants?.user?.id;
    const conversationId =
      activeChat?.conversationId || route?.params?.chatParams?.conversationId;

    if (!socket || !conversationId || !receiverId || !user?.vendorId) {
      Alert.alert('Error', 'Unable to send offer right now.');
      return;
    }

    const finalMessage = {
      _id: `temp-${Date.now()}-${Math.random()}`,
      conversationId,
      senderId: user.vendorId,
      receiverId,
      senderRole: 'vendor',
      receiverRole: 'user',
      senderRefrence: 'Vendor',
      receiverRefrence: 'User',
      message: '',
      conversationType: 'vender-to-user',
      timestamp: new Date().toISOString(),
      isPending: true,
      isOffer: true,
      offerObject: finalObject,
    };

    socket.emit('send_message', finalMessage);
    dispatch(resetOffer());
    navigation.navigate('ChatDetails', {
      ...(route?.params?.chatParams || {}),
      sentOfferMessage: {
        ...finalMessage,
        isPending: false,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image
            source={ICONS.leftArrowIcon}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.headerIconBox}>
          <Image
            source={ICONS.cartIcon}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerTitle}>{t('Offer Preview')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{t('Selected Items')}</Text>

        {selectedItems.map(item => {
          const key = item?.uniqueId || item?.id || item?._id;
          const title =
            currentLanguage === 'en' ? item?.title?.en : item?.title?.nl;
          const subtotalWithSecurity =
            item?.pricingBreakdown?.subtotal !== undefined
              ? Number(item?.pricingBreakdown?.subtotal || 0) +
                Number(item?.securityFee || 0)
              : undefined;
          const price =
            item?.offerPrice ??
            item?.pricingBreakdown?.offerPrice ??
            subtotalWithSecurity ??
            item?.discountedPrice ??
            item?.pricing?.amount ??
            0;

          return (
            <View key={String(key)} style={styles.itemRow}>
              <View style={styles.itemLeftWrap}>
                <Image
                  source={
                    item?.images?.[0]
                      ? {uri: item.images[0]}
                      : IMAGES.backgroundImage2
                  }
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {title}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatEuro(price || 0, {space: false})}
              </Text>
            </View>
          );
        })}

        <Text style={[styles.sectionTitle, {marginTop: width(8)}]}>
          {t('Notes/Terms')}
        </Text>

        {selectedItems.map(item => {
          const key = item?.uniqueId || item?.id || item?._id;
          const title =
            currentLanguage === 'en' ? item?.title?.en : item?.title?.nl;

          return (
            <View key={`note-${String(key)}`} style={styles.noteCard}>
              <Text style={styles.noteTitle}>
                {title} - {t('Special Request')}
              </Text>
              <TextInput
                value={notesByItem[key] ?? item?.specialRequest ?? ''}
                onChangeText={text => handleChangeNote(key, text)}
                style={styles.noteInput}
                placeholder={t('Add note')}
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footerBtnWrap}>
        <GradientButton
          text={t('Send Offer')}
          type="filled"
          onPress={handleSendOffer}
          textStyle={styles.sendBtnText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(3),
    paddingHorizontal: width(4),
  },
  backBtn: {
    paddingRight: width(2),
    paddingVertical: 4,
  },
  backIcon: {
    width: width(10),
    height: width(10),
  },
  headerIconBox: {
    width: width(10),
    height: width(10),
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: width(2),
  },
  headerIcon: {
    width: width(4),
    height: width(4),
    tintColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  contentContainer: {
    paddingHorizontal: width(4),
    paddingBottom: width(30),
  },
  sectionTitle: {
    marginTop: width(8),
    marginBottom: width(3),
    fontSize: 18,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: width(3),
  },
  itemLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: width(2),
  },
  itemImage: {
    width: width(24),
    height: width(24),
    borderRadius: 12,
  },
  itemTitle: {
    marginLeft: width(3),
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
    flex: 1,
  },
  itemPrice: {
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  noteCard: {
    backgroundColor: '#EFF1F4',
    borderRadius: 14,
    paddingHorizontal: width(4),
    paddingVertical: width(3),
    marginBottom: width(3),
  },
  noteTitle: {
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  noteInput: {
    marginTop: width(2),
    padding: 0,
    fontSize: 16,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  footerBtnWrap: {
    position: 'absolute',
    left: width(4),
    right: width(4),
    bottom: width(6),
  },
  sendBtnText: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

export default OfferPreviewScreen;

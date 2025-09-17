import React, {useEffect, useState} from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {FlatList} from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';
import NewRequestCard from '../newRequestCard';

const NewRequestModal = ({isVisible, onClose, onContinueToShipping}) => {
  const {t} = useTranslation();

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // 🔹 Keyboard listeners
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      show?.remove();
      hide?.remove();
    };
  }, []);

  const data = [
    {
      iamge: IMAGES.backgroundImage2,
      title: 'DJ Abz Wine...',
      pricePerDay: '300',
      subtotal: '$99.99',
      tax: '$0.0',
      securityFee: '$25',
      discount: '30%',
      kilometre: '$2Par Km',
      total: '$99.99',
    },
    {
      iamge: IMAGES.backgroundImage2,
      title: 'DJ Abz Wine...',
      pricePerDay: '300',
      subtotal: '$99.99',
      tax: '$0.0',
      securityFee: '$25',
      discount: '30%',
      kilometre: '$2Par Km',
      total: '$99.99',
    },
  ];
  const data2 = [
    {
      iamge: IMAGES.vase,
      title: 'Elegant Vase',
      pricePerDay: '$300',
      subtotal: '$99.99',
      tax: '$0.0',
      securityFee: '$25',
      discount: '30%',
      kilometre: '$2Par Km',
      total: '$99.99',
    },
    {
      iamge: IMAGES.vase,
      title: 'Elegant Vase',
      pricePerDay: '300',
      subtotal: '$99.99',
      tax: '$0.0',
      securityFee: '$25',
      discount: '30%',
      kilometre: '$2Par Km',
      total: '$99.99',
    },
  ];

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard
      propagateSwipe>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Offer Preview')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: COLORS.backgroundLight,
              marginVertical: width(3),
              padding: width(3),
              borderRadius: 12,
            }}>
            <Image
              source={IMAGES.profilePhoto}
              style={{
                height: width(13),
                width: width(13),
                borderRadius: 100,
              }}
            />
            <View style={{margin: width(2)}}>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  fontSize: 12,
                  color: COLORS.textDark,
                }}>
                Sarah Johnson
              </Text>
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  fontSize: 10,
                  color: COLORS.textLight,
                }}>
                Thanks for the quick res....
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.textDark,
              marginVertical: width(2),
            }}>
            Booking Items
          </Text>
          <View
            style={{
              backgroundColor: COLORS.backgroundLight,
              borderRadius: 15,
              padding: width(3),
            }}>
            <FlatList
              data={data}
              renderItem={({item}) => <NewRequestCard item={item} />}
            />
          </View>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.textDark,
              marginVertical: width(2),
            }}>
            Sale Items
          </Text>
          <View
            style={{
              backgroundColor: COLORS.backgroundLight,
              borderRadius: 15,
              padding: width(3),
            }}>
            <FlatList
              data={data}
              renderItem={({item}) => <NewRequestCard item={item} />}
            />
          </View>
          <View style={styles.progressNotesCard}>
            <View style={styles.itemsList}>
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>Subtotal</Text>
                <Text style={styles.itemPrice}>$600</Text>
              </View>
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>Security Fee</Text>
                <Text style={styles.itemPrice}>$25</Text>
              </View>
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>Kilometre Fee</Text>
                <Text style={styles.itemPrice}>$5</Text>
              </View>
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>Service Charges</Text>
                <Text style={styles.itemPrice}>$60</Text>
              </View>
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>Evenlyo Protect</Text>
                <Text style={styles.itemPrice}>$25</Text>
              </View>
              <View style={[styles.itemRow, {borderBottomColor: COLORS.white}]}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalAmount}>$690</Text>
              </View>
            </View>
          </View>
          <View style={{padding: width(3)}}></View>
        </ScrollView>

        {/* Footer */}
        {!isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.addToWishlistButton}>
              <GradientText text="Reject Offer" />
            </TouchableOpacity>
            <View style={{width: width(50)}}>
              <GradientButton
                styleContainer={{height: width(12.5)}}
                text="Accept Offer"
                onPress={() => onClose()}
                type="filled"
                textStyle={styles.sendRequestText}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {margin: 0, justifyContent: 'flex-end', backgroundColor: '#8b8b8b66'},
  container: {
    height: '90%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: COLORS.white,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 25,
    borderBottomColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  scrollView: {flex: 1},
  buttonContainer: {
    paddingTop: width(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addToWishlistButton: {
    width: width(35),
    backgroundColor: COLORS.backgroundLight,
    height: width(13),
    borderRadius: width(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendRequestText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: 'white',
  },
  progressNotesCard: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    padding: width(4),
    marginVertical: width(4),
  },
  itemsList: {
    gap: width(3),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: width(1),
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
  },
  subtotalRow: {
    borderBottomWidth: 0,
  },
  subtotalText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
  },
  subtotalPrice: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  totalText: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },

  totalAmount: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
});

export default NewRequestModal;

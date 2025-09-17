import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS, IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import GradientText from '../gradiantText';
import TextField from '../textInput';

const InfoModal = ({isVisible, onClose, onContinueToShipping}) => {
  const {t} = useTranslation();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isActiveHeart, setIsActiveHeart] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    city: '',
    postalCode: '',
    address: '',
    apartment: '',
  });

  // 🔹 Pricing with dummy values
  const [pricing, setPricing] = useState({
    subtotal: 0,
    shipping: 0,
    total: 0,
  });

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

  // 🔹 Dummy pricing update
  useEffect(() => {
    const dummySubtotal = 120.5;
    const dummyShipping = 15.0;
    setPricing({
      subtotal: dummySubtotal,
      shipping: dummyShipping,
      total: dummySubtotal + dummyShipping,
    });
  }, []);

  const handleChange = (field, value) => {
    let newValue = value;
    if (field === 'phone' || field === 'postalCode') {
      newValue = value.replace(/[^0-9]/g, '');
    }
    setFormData(prev => ({...prev, [field]: newValue}));
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard
      propagateSwipe>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Information')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              height: 150,
              backgroundColor: COLORS.backgroundLight,
              alignItems: 'center',
              paddingHorizontal: width(2.2),
              borderRadius: 15,
              marginVertical: width(3),
              flexDirection: 'row',
            }}>
            <ImageBackground
              source={IMAGES.backgroundImage2}
              style={{
                height: 130,
                width: 130,
                overflow: 'hidden',
                backgroundColor: '#FFF',
                alignItems: 'flex-end',
                borderRadius: 15,
                padding: 12,
              }}>
              <TouchableOpacity
                onPress={() => setIsActiveHeart(!isActiveHeart)}
                style={{
                  height: width(8),
                  width: width(8),
                  borderRadius: 9,
                  backgroundColor: 'rgba(255, 245, 245, 0.35)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={
                    isActiveHeart
                      ? ICONS.activeHeartIocn
                      : ICONS.inactiveHeartIcon
                  }
                  style={{height: width(4), width: width(4)}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </ImageBackground>
            <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <View style={styles.titleSection}>
                  <Text style={styles.title}>DJ Ray Vibes </Text>
                  <View style={styles.statusRow}>
                    <Text style={styles.status}>{t('inStock')}</Text>
                    <Image
                      source={ICONS.verifyedIcon}
                      style={styles.verifiedIcon}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.artistRow}>
                <View style={styles.artistAvatarContainer}>
                  <Image
                    source={IMAGES.profilePhoto}
                    style={styles.artistAvatar}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.artistName}>Jaydeep</Text>
              </View>
              <Text style={styles.title}>$ 300 </Text>
            </View>
          </View>
          <View style={styles.section}>
            <TextField
              label="Email*"
              placeholder="usamaarshad123@gmail.com"
              value={formData.apartment}
              onChangeText={text => handleChange('apartment', text)}
              endIcon={ICONS.editIcon}
            />
          </View>
          <View style={styles.section}>
            <TextField
              label="Address*"
              placeholder="Your address"
              value={formData.address}
              onChangeText={text => handleChange('address', text)}
              endIcon={ICONS.editIcon}
            />
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Pricing Summary</Text>

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Subtotal:</Text>
              <Text style={styles.pricingValue}>
                ${pricing.subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Shipping:</Text>
              <Text style={styles.pricingValue}>
                ${pricing.shipping.toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.pricingRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${pricing.total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Terms */}
          <View style={styles.termsSection}>
            <TouchableOpacity
              onPress={() => setAcceptTerms(!acceptTerms)}
              style={styles.termsContainer}>
              <View
                style={[
                  styles.checkbox,
                  acceptTerms && styles.checkboxChecked,
                ]}>
                {acceptTerms && (
                  <Icon name="checkmark" size={16} color="white" />
                )}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>I Accept The Company's </Text>
                <TouchableOpacity>
                  <GradientText
                    text={'Terms & Conditions'}
                    customStyles={styles.termsLink}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
          <GradientButton
            text="Continue to Payment"
            onPress={() => acceptTerms && onContinueToShipping()}
            type="filled"
            textStyle={styles.sendRequestText}
          />
        </ScrollView>
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
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: width(3),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: width(1),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width(1.5),
  },
  verifiedIcon: {
    width: width(4.5),
    height: width(4.5),
  },
  shareButton: {
    padding: width(1),
  },
  editIcon: {
    width: width(4),
    height: width(4),
  },
  status: {
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: '#4CAF50',
  },
  scrollView: {flex: 1},
  section: {marginBottom: width(4)},
  pricingSection: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    paddingHorizontal: width(4),
    paddingVertical: width(3),
    marginBottom: width(4),
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width(2),
  },
  artistAvatarContainer: {
    width: width(6),
    height: width(6),
    borderRadius: width(3),
    overflow: 'hidden',
  },
  artistAvatar: {
    width: '100%',
    height: '100%',
  },
  artistName: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
  },
  pricingTitle: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  pricingValue: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  divider: {height: 1, backgroundColor: '#e0e0e0', marginVertical: 15},
  totalLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  totalValue: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  termsSection: {marginBottom: 25},
  termsContainer: {flexDirection: 'row', alignItems: 'flex-start'},
  termsTextContainer: {flexDirection: 'row', flexWrap: 'wrap', flex: 1},
  termsText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  termsLink: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF295D',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {backgroundColor: '#FF295D'},
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
});

export default InfoModal;

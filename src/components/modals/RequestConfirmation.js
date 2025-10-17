import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import GradientButton from '../button';
import GradientText from '../gradiantText';

const RequestConfirmation = ({responeData, visible, onClose}) => {
  const navigation = useNavigation();
  const handleBackToListing = () => {
    onClose();
    navigation.navigate('EventListingScreen');
  };

  const handleTrackBooking = () => {
    onClose();
    navigation.navigate('TrackingDetails');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Request Sent Successfully!</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          {/* Main Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              Our request has been sent to vendor{' '}
              <Text style={styles.vendorCode}>
                #{responeData?.vendorId?.businessName}
              </Text>
              . Please wait for their confirmation.
            </Text>
          </View>

          {/* Location Input Field */}
          <View style={styles.locationSection}>
            <Text style={styles.locationLabel}>Copy Tracking Id *</Text>
            <View style={styles.locationInputContainer}>
              <Text style={styles.locationInputText}>
                {responeData?.trackingId}
              </Text>
              <TouchableOpacity style={styles.copyButton}>
                <Image
                  source={ICONS.copyIcon}
                  style={{height: 20, width: 20}}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.backToListingButton}
              onPress={handleBackToListing}>
              <GradientText text="Back To Listing" />
            </TouchableOpacity>

            <GradientButton
              text="Track Booking"
              onPress={handleTrackBooking}
              type="filled"
              textStyle={{
                fontSize: 13,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                color: 'white',
              }}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    width: width(85),
    maxHeight: height(70),
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    flex: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF295D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  vendorCode: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  locationSection: {
    marginBottom: 12,
    padding: width(3),
    borderRadius: width(4),
    backgroundColor: COLORS.backgroundLight,
  },
  locationLabel: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  locationInputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  locationInputText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    flex: 1,
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  backToListingButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RequestConfirmation;

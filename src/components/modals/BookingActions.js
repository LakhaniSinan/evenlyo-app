import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import moment from 'moment';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import GradientButton from '../button';
import GradientText from '../gradiantText';

const BookingActions = ({
  isKeyboardVisible,
  handleAddToWishList,
  handleBooking,
  data,
  startDateStr,
  endDateStr,
  selectedCoords,
  instructions,
  distance,
  startTime,
  endTime,
}) => {
  if (isKeyboardVisible) {return null;}

  const details = {
    listingId: data?._id,
    startDate: startDateStr,
    endDate: endDateStr,
    eventLocation: selectedCoords?.userAddress || '',
    specialRequests: instructions,
    distanceKm: Number(distance) || 0,
  };

  if (startDateStr === endDateStr && startTime && endTime) {
    details.startTime = moment(startTime).format('hh:mm A');
    details.endTime = moment(endTime).format('hh:mm A');
  }

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={() => handleAddToWishList(details)}
        style={styles.wishlistBtn}>
        <GradientText text="Add To Wishlist" />
      </TouchableOpacity>
      <View style={{width: width(50)}}>
        <GradientButton
          text="Send Booking Request"
          onPress={handleBooking}
          type="filled"
          textStyle={styles.buttonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingTop: width(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wishlistBtn: {
    width: width(35),
    backgroundColor: COLORS.backgroundLight,
    height: width(13),
    borderRadius: width(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: 'white',
  },
});

export default BookingActions;

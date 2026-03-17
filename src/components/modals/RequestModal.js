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
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS, IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';
import DateRangePicker from '../customDatePicker';
import GradientText from '../gradiantText';
import GooglePlacesInput from '../locationField';

const NewRequestModal = ({
  isVisible,
  onClose,
  type,
  navigation,
  selectedListing,
  settingsData,
}) => {
  const {t} = useTranslation();
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [singleDay, setSingleDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const normalizeCoords = coords => {
    if (!coords) return null;

    if (coords.latitude !== undefined && coords.longitude !== undefined) {
      return {latitude: coords.latitude, longitude: coords.longitude};
    }

    if (coords.lat !== undefined && coords.lng !== undefined) {
      return {latitude: coords.lat, longitude: coords.lng};
    }

    if (coords.latLng) {
      return normalizeCoords(coords.latLng);
    }

    return null;
  };

  const distanceBetweenCoordsKm = (from, to) => {
    const a = normalizeCoords(from);
    const b = normalizeCoords(to);
    if (!a || !b) return null;

    const toRad = deg => (deg * Math.PI) / 180;

    const R = 6371; // Earth radius in km
    const dLat = toRad(b.latitude - a.latitude);
    const dLon = toRad(b.longitude - a.longitude);
    const lat1 = toRad(a.latitude);
    const lat2 = toRad(b.latitude);

    const sinLat = Math.sin(dLat / 2);
    const sinLon = Math.sin(dLon / 2);

    const haversine =
      sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

    const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

    return R * c;
  };

  const listingCoords = normalizeCoords(
    selectedListing?.location?.coordinates || selectedListing?.location,
  );

  const distanceToSelectedListingKm = React.useMemo(() => {
    if (!selectedCoords || !listingCoords) return null;
    return distanceBetweenCoordsKm(selectedCoords, listingCoords);
  }, [selectedCoords, listingCoords]);

  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const getWeekdayKey = date => {
    if (!date || !(date instanceof Date)) return null;
    return DAY_KEYS[date.getDay()];
  };

  const countAvailableDays = (start, end, allowedDays = []) => {
    if (!start || !end || !(start instanceof Date) || !(end instanceof Date))
      return 0;

    const cleanStart = new Date(start);
    const cleanEnd = new Date(end);

    if (cleanEnd < cleanStart) return 0;

    const allowedSet = new Set((allowedDays || []).map(d => d?.toLowerCase()));
    let count = 0;
    const cursor = new Date(cleanStart);

    while (cursor <= cleanEnd) {
      const key = getWeekdayKey(cursor);
      if (allowedSet.has(key)) count += 1;
      cursor.setDate(cursor.getDate() + 1);
    }

    return count;
  };

  const parseTimeString = timeStr => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const [hourRaw, minRaw] = timeStr.split(':');
    const hour = parseInt(hourRaw, 10);
    const minute = parseInt(minRaw, 10);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return {hour, minute};
  };

  const getTimeOfDayHours = date => {
    if (!(date instanceof Date)) return 0;
    return date.getHours() + date.getMinutes() / 60;
  };

  const getRequestedHoursPerDay = () => {
    // Use only the time-of-day difference (e.g. 10:00 -> 19:00 = 9 hours)
    const start = getTimeOfDayHours(startDate);
    const end = getTimeOfDayHours(endDate);
    const diff = end - start;
    return diff > 0 ? diff : 0;
  };

  const getAvailableSlotHours = () => {
    const slot = selectedListing?.availability?.availableTimeSlots?.[0];
    if (!slot) return 0;

    const start = parseTimeString(slot.startTime);
    const end = parseTimeString(slot.endTime);
    if (!start || !end) return 0;

    const startMs = start.hour * 60 + start.minute;
    const endMs = end.hour * 60 + end.minute;

    return Math.max(0, (endMs - startMs) / 60);
  };

  const selectedDaysCount = React.useMemo(() => {
    if (singleDay) return 1;
    return countAvailableDays(
      startDate,
      endDate,
      selectedListing?.availability?.availableDays || [],
    );
  }, [singleDay, startDate, endDate, selectedListing]);

  const requestedHoursPerDay = getRequestedHoursPerDay();
  const availableHoursPerDay = getAvailableSlotHours();
  const extraHoursPerDay = Math.max(
    0,
    requestedHoursPerDay - availableHoursPerDay,
  );

  const baseHourlyRate = selectedListing?.pricing?.amount || 0;
  const extraHourlyRate = selectedListing?.pricing?.extratimeCost || 0;

  const perDayBaseCost = baseHourlyRate * requestedHoursPerDay;
  const perDayExtraCost = extraHoursPerDay * extraHourlyRate;
  const totalExtraCost = perDayExtraCost * selectedDaysCount;

  const totalPerDayCost = perDayBaseCost + perDayExtraCost;
  const totalDaysCost = totalPerDayCost * selectedDaysCount;

  const distanceCost =
    distanceToSelectedListingKm != null
      ? distanceToSelectedListingKm *
        (selectedListing?.pricing?.pricePerKm || 0)
      : 0;

  const securityFee = selectedListing?.pricing?.securityFee || 0;

  const bookingItemPlatformFee = settingsData?.bookingItemPlatformFee || 0;

  const platformFee = (totalDaysCost * bookingItemPlatformFee) / 100;

  const grandTotal = totalDaysCost + distanceCost + platformFee + securityFee;

  useEffect(() => {
    if (isVisible) {
      setSingleDay(false);
      setStartDate(new Date());
      setEndDate(new Date());
      setSelectedCoords(null);
    }
  }, [isVisible]);

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
              backgroundColor: COLORS.backgroundLight,
              marginVertical: width(3),
              borderRadius: 12,
              height: width(50),
            }}>
            <Image
              source={
                selectedListing?.images
                  ? {uri: selectedListing.images[0]}
                  : IMAGES.backgroundImage2
              }
              resizeMode="contain"
              style={{height: '100%', width: '100%', borderRadius: 12}}
            />
          </View>
          <View
            style={{
              backgroundColor: COLORS.backgroundLight,
              borderRadius: 15,
              padding: width(3),
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                source={ICONS.infoIconInActive}
                resizeMode="contain"
                style={{
                  height: width(5),
                  width: width(5),
                  marginRight: width(2),
                }}
              />
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  color: COLORS.textDark,
                  marginVertical: width(2),
                }}>
                Pricing Information
              </Text>
            </View>
            <View
              style={{
                padding: width(4),
                backgroundColor: COLORS.white,
                borderRadius: width(3),
              }}>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.primary,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Pricing Type :{' '}
                {selectedListing?.pricing?.type?.toUpperCase() || 'N/A'}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.textLight,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Base Rate : €{selectedListing?.pricing?.amount || 'N/A'}{' '}
                {selectedListing?.pricing?.type}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.red,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Extra Time Cost : €
                {selectedListing?.pricing?.extratimeCost || 'N/A'}{' '}
                {selectedListing?.pricing?.type} beyond scheduled time
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.navyBlue,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Distance Cost: €{selectedListing?.pricing?.pricePerKm || 'N/A'}{' '}
                per km from vendor location
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.green,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Stock Available: {selectedListing?.quantity}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: COLORS.backgroundLight,
              borderRadius: 15,
              marginVertical: width(2),
              padding: width(3),
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                source={ICONS.calenderIcon}
                resizeMode="contain"
                tintColor={COLORS.textDark}
                style={{
                  height: width(5),
                  width: width(5),
                  marginRight: width(2),
                }}
              />
              <Text
                style={{
                  fontFamily: fontFamly.PlusJakartaSansBold,
                  color: COLORS.textDark,
                  marginVertical: width(2),
                }}>
                Scheduled Date & Time
              </Text>
            </View>
            <DateRangePicker
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              singleDay={singleDay}
              onChangeSingleDay={setSingleDay}
            />
            <View
              style={{
                padding: width(3),
                backgroundColor: COLORS.white,
                borderRadius: 12,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.navyBlue,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Availability:
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.navyBlue,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Time Slots:{' '}
                {selectedListing?.availability?.availableTimeSlots[0]
                  ?.startTime || 'N/A'}{' '}
                -{' '}
                {selectedListing?.availability?.availableTimeSlots[0]
                  ?.endTime || 'N/A'}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.navyBlue,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Time Slots:{' '}
                {selectedListing?.availability?.availableDays
                  ?.map(day => day.toUpperCase())
                  .join(', ') || 'N/A'}
              </Text>
              {distanceToSelectedListingKm != null && (
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.navyBlue,
                    fontFamily: fontFamly.PlusJakartaSansBold,
                  }}>
                  Distance to selected location:{' '}
                  {distanceToSelectedListingKm.toFixed(2)} km
                </Text>
              )}
            </View>
            <View
              style={{
                padding: width(3),
                backgroundColor: COLORS.white,
                borderRadius: 12,
                marginVertical: width(3),
              }}>
              <GooglePlacesInput
                selectedLocation={selectedCoords}
                setSelectedLocation={v => setSelectedCoords(v)}
                onEndIconPress={() => {
                  setSelectedCoords(null);
                }}
                placeholder="Enter Location"
                bgcolor={COLORS.white}
                showRightIcon={ICONS.locationIcon}
                lable="Add Location *"
              />
            </View>
          </View>
          <View
            style={{
              backgroundColor: COLORS.backgroundLight,
              borderRadius: 15,
              marginVertical: width(2),
              padding: width(3),
            }}>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>Base Cost (per day)</Text>
              <Text style={styles.itemPrice}>
                €{perDayBaseCost * selectedDaysCount}
              </Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>
                Available days in selected range
              </Text>
              <Text style={styles.itemPrice}>{selectedDaysCount} Days</Text>
            </View>

            {selectedCoords && (
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>
                  Distance cost ({distanceToSelectedListingKm?.toFixed(2)} km)
                </Text>
                <Text style={styles.itemPrice}>
                  €{distanceCost?.toFixed(2) || '0.00'}
                </Text>
              </View>
            )}

            {extraHoursPerDay > 0 && (
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>
                  Extra Hours ({extraHoursPerDay.toFixed(2)} hrs / day)
                </Text>
                <Text style={styles.itemPrice}>
                  €{perDayExtraCost.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.itemRow}>
              <Text style={styles.itemName}>Platform Fee</Text>
              <Text style={styles.itemPrice}>€{platformFee?.toFixed(2)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>Security Fee</Text>
              <Text style={styles.itemPrice}>€{securityFee?.toFixed(2)}</Text>
            </View>
            <View style={[styles.itemRow, {borderBottomColor: COLORS.white}]}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalAmount}>€{grandTotal?.toFixed(2)}</Text>
            </View>
          </View>

          <View
            style={{
              padding: width(3),
              backgroundColor: COLORS.backgroundLight,
              borderRadius: width(3),
              marginBottom: width(2),
            }}>
            <Text
              style={[
                styles.totalText,
                {fontSize: 12, marginBottom: width(2)},
              ]}>
              Notes/Terms
            </Text>
            <Text
              style={[
                styles.itemName,
                {color: COLORS.textLight, fontSize: 10},
              ]}>
              With over 7 years of event experience, DJ Ray With over 7 years of
              event experience, DJ Ray With over 7 years of event experience, DJ
              Ray With over 7 years of event experience, DJ Ray...
            </Text>
          </View>
        </ScrollView>

        {type !== 'vendor' ? (
          <>
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
          </>
        ) : (
          <View style={{width: width(90)}}>
            <GradientButton
              styleContainer={{height: width(12.5)}}
              text="Send Offer"
              onPress={() => {
                onClose();
                navigation.navigate('ChatDetails', {offreShow: true});
              }}
              type="filled"
              textStyle={styles.sendRequestText}
            />
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
  // scrollView: {flex: 1},
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

  itemName: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
});

export default NewRequestModal;

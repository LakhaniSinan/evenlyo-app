import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS, IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {sendBookingRequest} from '../../services/ListingsItem';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import DateRangePicker from '../customDatePicker';
import GradientText from '../gradiantText';
import Loader from '../loder';
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
  const modalRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [singleDay, setSingleDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [specialRequest, setSpecialRequest] = useState('');
  const [includeSecurityFee, setIncludeSecurityFee] = useState(true);
  const [offerAmount, setOfferAmount] = useState('');
  const [priceError, setPriceError] = useState('');

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

  const discountBasePrice = perDayBaseCost * selectedDaysCount;
  const enteredOfferAmount = Number(offerAmount || 0);
  const safeOfferAmount =
    Number.isFinite(enteredOfferAmount) && enteredOfferAmount >= 0
      ? enteredOfferAmount
      : 0;
  const conditionalSecurityFee = includeSecurityFee ? securityFee : 0;
  const grandTotal =
    safeOfferAmount +
    totalExtraCost +
    distanceCost +
    platformFee +
    conditionalSecurityFee;
  const discountPercent =
    discountBasePrice > 0
      ? Math.max(
          0,
          Math.round(
            ((discountBasePrice - safeOfferAmount) / discountBasePrice) * 100,
          ),
        )
      : 0;

  useEffect(() => {
    if (isVisible) {
      setSingleDay(false);
      setStartDate(new Date());
      setEndDate(new Date());
      setSelectedCoords(null);
      setSpecialRequest('');
      setIncludeSecurityFee(true);
      setPriceError('');
    }
  }, [isVisible]);

  useEffect(() => {
    setOfferAmount(
      String((perDayBaseCost * selectedDaysCount || 0).toFixed(2)),
    );
  }, [perDayBaseCost, selectedDaysCount]);

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

  const resetForm = () => {
    setSingleDay(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setSelectedCoords(null);
    setSpecialRequest('');
    setIncludeSecurityFee(true);
    setOfferAmount('');
    setPriceError('');
  };

  const handleCancel = () => {
    resetForm();
    onClose?.();
  };

  const handleAddItem = async () => {
    if (!selectedListing?._id) {
      modalRef.current?.show({
        status: 'error',
        message: t('Unable to add this item right now.'),
      });
      return;
    }

    if (!selectedCoords?.userAddress) {
      modalRef.current?.show({
        status: 'error',
        message: t('Please add event location first.'),
      });
      return;
    }

    const normalizedCoords = normalizeCoords(selectedCoords?.latLng);
    if (!normalizedCoords) {
      modalRef.current?.show({
        status: 'error',
        message: t('Please select a valid location.'),
      });
      return;
    }

    if (selectedListing?.quantity <= 0) {
      modalRef.current?.show({
        status: 'error',
        message: t('This item is out of stock and cannot be booked.'),
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedStartDate = new Date(startDate);
    selectedStartDate.setHours(0, 0, 0, 0);
    if (selectedStartDate < today) {
      modalRef.current?.show({
        status: 'error',
        message: t('Start date cannot be in the past'),
      });
      return;
    }

    if (!singleDay && endDate < startDate) {
      modalRef.current?.show({
        status: 'error',
        message: t('End date must be later than start date'),
      });
      return;
    }

    if (
      distanceToSelectedListingKm == null ||
      distanceToSelectedListingKm <= 0
    ) {
      modalRef.current?.show({
        status: 'error',
        message: t(
          'Distance must be calculated. Please select a valid location.',
        ),
      });
      return;
    }

    if (priceError) {
      modalRef.current?.show({
        status: 'error',
        message: t('Please fix price validation errors'),
      });
      return;
    }

    const payload = {
      listingId: selectedListing?._id,
      vendorId: selectedListing?.vendorId || selectedListing?.vendor?._id,
      details: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(singleDay ? startDate : endDate).format('YYYY-MM-DD'),
        startTime: moment(startDate).format('HH:mm'),
        endTime: moment(endDate).format('HH:mm'),
        eventLocation: selectedCoords?.userAddress,
        eventLatitude: normalizedCoords.latitude,
        eventLongitude: normalizedCoords.longitude,
        distanceKm: Number(distanceToSelectedListingKm) || 0,
        specialRequests: specialRequest?.trim() || '',
        specialRequest: specialRequest?.trim() || '',
        discountedPrice: Number(safeOfferAmount.toFixed(2)),
        discount: discountPercent,
        basePrice: Number(discountBasePrice.toFixed(2)),
        extraTimeCost: Number(totalExtraCost.toFixed(2)),
        distanceCost: Number(distanceCost.toFixed(2)),
        total: Number(grandTotal.toFixed(2)),
        securityFee: Number(conditionalSecurityFee.toFixed(2)),
        unit: selectedListing?.pricing?.type || 'per-day',
        pricingBreakdown: {
          baseAmount: Number(discountBasePrice.toFixed(2)),
          extraTimeCost: Number(totalExtraCost.toFixed(2)),
          distanceCost: Number(distanceCost.toFixed(2)),
          securityFee: Number(conditionalSecurityFee.toFixed(2)),
          platformFee: Number(platformFee.toFixed(2)),
          subtotal: Number(
            (safeOfferAmount + totalExtraCost + distanceCost).toFixed(2),
          ),
          total: Number(grandTotal.toFixed(2)),
          breakdown: [
            {
              label: `Base Service (${selectedDaysCount} days)`,
              amount: Number(discountBasePrice.toFixed(2)),
              explanation: '',
            },
            {
              label: 'Extra Time Fee',
              amount: Number(totalExtraCost.toFixed(2)),
              explanation: '',
            },
            {
              label: `Travel Cost (${Number(
                distanceToSelectedListingKm || 0,
              ).toFixed(2)}km)`,
              amount: Number(distanceCost.toFixed(2)),
              explanation: '',
            },
            {
              label: 'Security Deposit(Refundable)',
              amount: Number(conditionalSecurityFee.toFixed(2)),
              explanation: '',
            },
            {
              label: `Platform Service Fee (${bookingItemPlatformFee}%)`,
              amount: Number(platformFee.toFixed(2)),
              explanation: '',
            },
          ],
          validationErrors: [],
          pricingType: selectedListing?.pricing?.type || 'per hour',
          numDays: selectedDaysCount,
          isSingleDate: singleDay,
          paymentPolicy:
            selectedListing?.paymentPolicy || selectedListing?.subCategory,
        },
      },
    };

    try {
      setIsLoading(true);
      const response = await sendBookingRequest(payload);

      if (response?.status === 200 || response?.status === 201) {
        modalRef.current?.show({
          status: 'ok',
          message: response?.data?.message || t('Item added successfully'),
          handlePressOk: () => {
            modalRef.current?.hide?.();
            handleCancel();
            navigation?.navigate?.('ChatDetails', {offreShow: true});
          },
        });
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message || t('Failed to add item'),
        });
      }
    } catch (error) {
      modalRef.current?.show({
        status: 'error',
        message: t('Something went wrong while adding item'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfferAmountChange = value => {
    const numeric = value.replace(/[^0-9.]/g, '');
    const parsed = Number(numeric || 0);
    const maxPrice = discountBasePrice || 0;

    if (parsed > maxPrice) {
      setPriceError(`Price cannot exceed €${maxPrice.toFixed(2)}`);
    } else {
      setPriceError('');
    }

    setOfferAmount(numeric);
  };

  let baseCost = discountBasePrice;
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleCancel}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard
      propagateSwipe>
      <Loader isLoading={isLoading} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Offer Preview')}</Text>
          <TouchableOpacity onPress={handleCancel}>
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
                {(selectedListing?.pricing?.type || 'N/A').toLowerCase()}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.textLight,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Base Rate: €
                {Number(selectedListing?.pricing?.amount || 0).toFixed(2)}{' '}
                {selectedListing?.pricing?.type === 'perhour'
                  ? 'per hour'
                  : selectedListing?.pricing?.type}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.red,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Extra Time Cost: €
                {Number(selectedListing?.pricing?.extratimeCost || 0).toFixed(
                  2,
                )}{' '}
                per hour beyond scheduled time
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.navyBlue,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Distance Cost: €
                {Number(selectedListing?.pricing?.pricePerKm || 0).toFixed(2)} /
                km per km from vendor location
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.green,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                Stock Available:{' '}
                {Number(selectedListing?.quantity || 0) > 0
                  ? selectedListing?.quantity
                  : 'Out of Stock'}
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
              <Text style={styles.itemPrice}>€{baseCost?.toFixed(2)}</Text>
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
              <Text style={styles.itemPrice}>
                €{conditionalSecurityFee?.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.itemRow, {borderBottomColor: COLORS.white}]}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalAmount}>€{grandTotal?.toFixed(2)}</Text>
            </View>
            {grandTotal > 0 && (
              <View style={styles.finalTotalInfoBox}>
                <Text style={styles.finalTotalHeading}>Final Total:</Text>
                <Text style={styles.finalTotalAmount}>
                  €{grandTotal?.toFixed(2)}
                </Text>
                <Text style={styles.finalTotalDescription}>
                  Final total includes your offer amount, extra charges,
                  optional security fee, platform fee, and VAT.
                </Text>
              </View>
            )}
            {extraHoursPerDay > 0 && (
              <View style={styles.extraTimeInfoBox}>
                <Text style={styles.extraTimeInfoText}>
                  ℹ️ Booking outside available hours (
                  {selectedListing?.availability?.availableTimeSlots?.[0]
                    ?.startTime || 'N/A'}
                  -
                  {selectedListing?.availability?.availableTimeSlots?.[0]
                    ?.endTime || 'N/A'}
                  ) will include an extra time fee of €
                  {totalExtraCost.toFixed(2)} ({extraHoursPerDay.toFixed(0)}{' '}
                  hours)
                </Text>
              </View>
            )}

            <View style={{marginTop: width(2)}}>
              <Text style={[styles.itemName, {fontSize: 12}]}>
                Your Offer Price
              </Text>
              <TextInput
                value={offerAmount}
                onChangeText={handleOfferAmountChange}
                keyboardType="decimal-pad"
                placeholder="Enter discounted price"
                style={styles.input}
              />
              {!!priceError && (
                <Text style={styles.errorText}>{priceError}</Text>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.checkboxRow}
              onPress={() => setIncludeSecurityFee(prev => !prev)}>
              <View
                style={[
                  styles.checkbox,
                  includeSecurityFee && styles.checkboxChecked,
                ]}>
                {includeSecurityFee ? (
                  <Icon name="checkmark" size={12} color={COLORS.white} />
                ) : null}
              </View>
              <Text style={styles.checkboxLabel}>
                Include Security Fee (€{securityFee?.toFixed(2)})
              </Text>
            </TouchableOpacity>

            <View style={[styles.itemRow, {borderBottomWidth: 0}]}>
              <Text style={styles.itemName}>Discount</Text>
              <Text style={[styles.itemPrice, {color: COLORS.green}]}>
                {discountPercent}%
              </Text>
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
              Special Request (optional)
            </Text>
            <TextInput
              value={specialRequest}
              onChangeText={setSpecialRequest}
              placeholder="Enter special request (optional)"
              multiline
              placeholderTextColor={COLORS.textLight}
              style={[styles.input, styles.textarea]}
            />
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
          <View style={styles.buttonRow}>
            <View style={{width: width(40)}}>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
                activeOpacity={0.7}>
                <GradientText text={'Cancel'} />
              </TouchableOpacity>
            </View>

            <View style={{width: width(40)}}>
              <GradientButton
                text={t('Add Item')}
                onPress={handleAddItem}
                type="filled"
                textStyle={styles.applyText}
              />
            </View>
          </View>
        )}
      </View>
      <CommonAlert ref={modalRef} />
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
  buttonRow: {
    paddingTop: width(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
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
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: COLORS.textDark,
    marginTop: width(1),
  },
  textarea: {
    minHeight: width(22),
    textAlignVertical: 'top',
  },
  errorText: {
    marginTop: 4,
    color: COLORS.red,
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(2),
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  finalTotalInfoBox: {
    marginTop: width(2),
    borderRadius: 10,
    backgroundColor: '#F2F6FF',
    padding: 10,
  },
  finalTotalHeading: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  finalTotalAmount: {
    marginTop: 2,
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  finalTotalDescription: {
    marginTop: 6,
    fontSize: 10,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    lineHeight: 15,
  },
  extraTimeInfoBox: {
    marginTop: width(2),
    borderRadius: 10,
    backgroundColor: '#EEF6FF',
    padding: 10,
  },
  extraTimeInfoText: {
    fontSize: 10,
    color: COLORS.navyBlue,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    lineHeight: 15,
  },
});

export default NewRequestModal;

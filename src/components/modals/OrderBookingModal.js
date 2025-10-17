import moment from 'moment';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {width} from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {getDistance} from '../../utils';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import GradientText from '../gradiantText';
import GooglePlacesInput from '../locationField';
import TextField from '../textInput';

const INITIAL_PRICING = {
  duration: 8,
  ratePerHour: 108,
  securityFee: 25,
  kmRate: 0.5,
};

const OrderBooking = ({
  data,
  onClose,
  isVisible,
  selectedDate,
  handleSendBookingRequest,
  handleAddToWishList,
}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [kilometer, setKilometer] = useState('0');
  const [instructions, setInstructions] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const startDateStr = selectedDate?.startDate
    ? moment(selectedDate.startDate).format('YYYY-MM-DD')
    : null;
  const endDateStr = selectedDate?.endDate
    ? moment(selectedDate.endDate).format('YYYY-MM-DD')
    : null;

  useEffect(() => {
    if (
      isSingleDateSelected &&
      data?.availability?.availableTimeSlots?.length > 0
    ) {
      const slot = data.availability.availableTimeSlots[0];
      const today = new Date();

      const start = slot?.startTime
        ? moment(slot.startTime, ['hh:mm A'])
            .set({
              year: today.getFullYear(),
              month: today.getMonth(),
              date: today.getDate(),
            })
            .toDate()
        : null;

      const end = slot?.endTime
        ? moment(slot.endTime, ['hh:mm A'])
            .set({
              year: today.getFullYear(),
              month: today.getMonth(),
              date: today.getDate(),
            })
            .toDate()
        : null;

      setStartTime(start);
      setEndTime(end);
    }
  }, [data, isSingleDateSelected]);

  useEffect(() => {
    const onShow = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const onHide = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const calculatedPricing = useMemo(() => {
    const kmValue = parseFloat(kilometer) || 0;
    let durationValue = 0;
    if (startTime && endTime) {
      const diffMs = moment(endTime).diff(moment(startTime));
      durationValue = diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
    }

    const {
      type,
      amount = 0,
      extratimeCost = 0,
      securityFee = 0,
      pricePerKm = 0,
      escrowFee = 0,
      totalPrice = 0,
    } = data?.pricing || {};

    let subtotal = 0;
    let total = 0;
    let kmCost = kmValue * pricePerKm;

    if (type === 'perhour') {
      const baseHours = durationValue > 1 ? 1 : durationValue;
      const extraHours = durationValue > 1 ? durationValue - 1 : 0;

      const baseCost = baseHours * amount;
      const extraCost = extraHours * extratimeCost;

      subtotal = baseCost + extraCost + kmCost;
      total = subtotal + securityFee + escrowFee;
    } else if (type === 'fixed') {
      subtotal = totalPrice;
      total = subtotal + securityFee + escrowFee;
    }

    return {
      duration: durationValue,
      ratePerHour: amount,
      extraHourRate: extratimeCost,
      kmRate: pricePerKm,
      kmValue,
      kmCost,
      securityFee,
      escrowFee,
      subtotal,
      total,
    };
  }, [kilometer, data, startTime, endTime]);

  const handleKilometerChange = useCallback(text => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    if ((cleaned.match(/\./g) || []).length <= 1) setKilometer(cleaned);
  }, []);

  const toggleState = useCallback(setter => setter(prev => !prev), []);

  const isSingleDateSelected = selectedDate?.endDate == selectedDate?.startDate;

  const {distance} = getDistance(
    data?.location?.coordinates,
    selectedCoords?.latLng,
  );

  const handleBooking = useCallback(() => {
    if (selectedCoords == null) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please add address first.',
      });
      return;
    }
    if (startDateStr && !endDateStr) {
      endDateStr = startDateStr;
    }

    if (!startDateStr && !endDateStr) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please select start date and end date first.',
      });
      return;
    }

    if (!startDateStr && endDateStr) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please select start date first.',
      });
      return;
    }

    if (startDateStr === endDateStr) {
      if (!startTime && !endTime) {
        modalRef.current?.show({
          status: 'error',
          message: 'Please select start and end time.',
        });
        return;
      }
      if (!startTime) {
        modalRef.current?.show({
          status: 'error',
          message: 'Please select start time first.',
        });
        return;
      }
      if (!endTime) {
        modalRef.current?.show({
          status: 'error',
          message: 'Please select end time first.',
        });
        return;
      }
    }

    if (!acceptTerms) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please accept terms and conditions first.',
      });
      return;
    }

    let details = {
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

    console.log(details, 'Booking Details ✅');
    handleSendBookingRequest(details);
  }, [
    selectedDate,
    startTime,
    endTime,
    acceptTerms,
    selectedCoords,
    instructions,
    distance,
    handleSendBookingRequest,
  ]);

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
          <Text style={styles.title}>Order Booking</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <View style={styles.dateTimeHeader}>
              <Text style={styles.label}>Selected Date & Time</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                {selectedDate?.startDate && (
                  <Text style={styles.dateValue}>
                    {moment(selectedDate.startDate).format('dddd, MMMM D')}
                  </Text>
                )}
                {selectedDate?.endDate && (
                  <Text style={styles.dateValue}>
                    , {moment(selectedDate.endDate).format('dddd, MMMM D')}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {isSingleDateSelected && (
            <View style={styles.section}>
              <Text style={styles.label}>Time Range *</Text>

              <View style={styles.dateRangeContainer}>
                {[
                  {
                    label: 'Start Time',
                    value: startTime,
                    setter: setShowStartPicker,
                  },
                  {label: 'End Time', value: endTime, setter: setShowEndPicker},
                ].map(({label, value, setter}, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dateInput, idx === 0 && {marginRight: 10}]}
                    onPress={() => setter(true)}>
                    <Text style={styles.dateInputText}>
                      {value ? moment(value).format('hh:mm A') : label}
                    </Text>
                    <Image
                      source={ICONS.clockIcon}
                      style={styles.iconSmall}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <DatePicker
                modal
                open={showStartPicker}
                date={startTime || new Date()}
                mode="time"
                onConfirm={date => {
                  setShowStartPicker(false);
                  setStartTime(date);
                }}
                onCancel={() => setShowStartPicker(false)}
              />

              <DatePicker
                modal
                open={showEndPicker}
                date={endTime || new Date()}
                mode="time"
                onConfirm={date => {
                  setShowEndPicker(false);
                  setEndTime(date);
                }}
                onCancel={() => setShowEndPicker(false)}
              />
            </View>
          )}

          <GooglePlacesInput
            selectedLocation={selectedCoords}
            setSelectedLocation={setSelectedCoords}
            placeholder="Enter Location"
            showRightIcon={ICONS.locationIcon}
            lable="Add Location *"
          />

          <View style={styles.section}>
            <TextField
              label="Kilometer *"
              placeholder="Kilometer"
              editable={false}
              value={distance}
              onChangeText={handleKilometerChange}
              keyboardType="numeric"
              endIcon={ICONS.currentLoactionIcon}
            />
          </View>

          <View style={styles.section}>
            <TextField
              label="Add Instructions *"
              placeholder="Any Special Requirements Or Setup Instructions..."
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              onPress={() => toggleState(setIsChecked)}
              style={[styles.checkboxBox, isChecked && {borderWidth: 0}]}>
              {isChecked && (
                <Image
                  source={ICONS.cheackIcon}
                  style={styles.checkboxIcon}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
            <Text style={styles.protectText}>
              {t('Enable Evenlyo Protect (+25)')}
            </Text>

            <Text
              style={[
                styles.protectText,
                {fontSize: 8, color: COLORS.textLight},
              ]}>
              {t('(Non Refundable)')}
            </Text>
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.pricingTitle}>Pricing Summary</Text>
            {[
              {
                label: 'Duration:',
                value: `${calculatedPricing.duration} hours`,
                right: `$${calculatedPricing.ratePerHour}/Hr`,
              },
              {
                label: 'Extra Time:',
                value: '',
                right: `$${calculatedPricing.extraHourRate}/Extra Hr`,
              },
              {
                label: 'Kilometer:',
                value: `${calculatedPricing.kmValue} km`,
                right: `$${calculatedPricing.kmCost?.toFixed(2) || 0}`,
              },
              {
                label: 'Security Fee:',
                right: `$${calculatedPricing.securityFee.toFixed(2)}`,
              },
              {
                label: 'Escrow Fee:',
                right: `$${calculatedPricing.escrowFee.toFixed(2)}`,
              },
              {
                label: 'Subtotal:',
                right: `$${calculatedPricing.subtotal.toFixed(2)}`,
              },
            ].map((row, i) => (
              <View style={styles.pricingRow} key={i}>
                <Text style={styles.pricingLabel}>{row.label}</Text>
                <Text style={styles.pricingValue}>{row.right}</Text>
              </View>
            ))}

            <View style={styles.divider} />
            <View style={styles.pricingRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                ${calculatedPricing.total.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.termsSection}>
            <TouchableOpacity
              onPress={() => toggleState(setAcceptTerms)}
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
                    text="Terms & Conditions"
                    customStyles={styles.termsLink}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {!isKeyboardVisible && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                // let details = {
                //   listingId: data?._id,
                //   startDate: startDateStr,
                //   endDate: endDateStr,
                //   eventLocation: selectedCoords?.userAddress || '',
                //   specialRequests: instructions,
                //   distanceKm: Number(distance) || 0,
                //   evenlyoProtect: isChecked,
                // };
                let details = {
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

                handleAddToWishList(details);
              }}
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  section: {marginBottom: width(4)},
  label: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: width(2),
  },
  dateTimeHeader: {
    backgroundColor: COLORS.backgroundLight,
    padding: width(4),
    borderRadius: width(3),
    marginTop: width(3),
  },
  dateValue: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  dateRangeContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  dateInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  dateInputText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  iconSmall: {height: width(5), width: width(5)},
  checkboxRow: {
    flexDirection: 'row',
    marginBottom: width(5),
    alignItems: 'center',
  },
  checkboxBox: {
    height: width(6),
    width: width(6),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxIcon: {height: width(6), width: width(6)},
  protectText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginLeft: width(3),
    color: COLORS.black,
  },
  pricingSection: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    paddingHorizontal: width(4),
    paddingVertical: width(3),
    marginBottom: width(4),
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF295D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {backgroundColor: '#FF295D'},
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

export default React.memo(OrderBooking);

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
import {Calendar} from 'react-native-calendars';
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

const getInitialMarkedDates = (availableDays, referenceDate = moment()) => {
  const marked = {};
  const start = referenceDate.clone();
  const end = referenceDate.clone().add(6, 'months');

  for (let m = start.clone(); m.isBefore(end); m.add(1, 'day')) {
    const dayName = m.format('ddd').toLowerCase();
    const dateStr = m.format('YYYY-MM-DD');
    const isPast = m.isBefore(referenceDate, 'day');
    const isAvailable = availableDays.includes(dayName);

    marked[dateStr] =
      isPast || !isAvailable
        ? {
            disabled: true,
            disableTouchEvent: true,
            customStyles: {
              container: {backgroundColor: '#f0f0f0'},
              text: {color: '#999'},
            },
          }
        : {
            disabled: false,
            customStyles: {
              container: {backgroundColor: '#fff'},
              text: {color: '#000'},
            },
          };
  }

  return marked;
};

/**
 * Calculate available days and hours
 */
export const calculateAvailableDaysWithHours = ({
  startDate,
  endDate,
  startTime,
  endTime,
  availableDays = [],
  defaultHoursPerDay = 10,
}) => {
  if (!startDate) {
    return {
      totalSelectedDays: 0,
      availableSelectedDays: 0,
      hoursPerDay: 0,
      totalHours: 0,
      availableDates: [],
      unavailableDates: [],
    };
  }

  const start = moment(startDate);
  const end = endDate ? moment(endDate) : moment(startDate);

  let totalSelectedDays = 0;
  let availableSelectedDays = 0;
  let availableDates = [];
  let unavailableDates = [];

  let curr = start.clone();

  // ---- HOURS PER DAY ----
  let hoursPerDay = defaultHoursPerDay;

  // Single day → calculate from time
  if (start.isSame(end, 'day') && startTime && endTime) {
    hoursPerDay = moment(endTime).diff(moment(startTime), 'hours', true);
  }

  while (curr.isSameOrBefore(end)) {
    totalSelectedDays++;

    const dayName = curr.format('ddd').toLowerCase();
    const dateStr = curr.format('YYYY-MM-DD');

    if (availableDays.includes(dayName)) {
      availableSelectedDays++;
      availableDates.push(dateStr);
    } else {
      unavailableDates.push(dateStr);
    }

    curr.add(1, 'day');
  }

  const totalHours = availableSelectedDays * hoursPerDay;

  return {
    totalSelectedDays,
    availableSelectedDays,
    hoursPerDay,
    totalHours,
    availableDates,
    unavailableDates,
  };
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
  const [referenceDate, setReferenceDate] = useState(moment());
  const [localStartDate, setLocalStartDate] = useState(null);
  const [localEndDate, setLocalEndDate] = useState(null);
  let availableDays = data?.availability?.availableDays || [];
  const [markedDates, setMarkedDates] = useState(() =>
    getInitialMarkedDates(availableDays, moment()),
  );

  const {availableSelectedDays, hoursPerDay, totalHours} =
    calculateAvailableDaysWithHours({
      startDate: localStartDate,
      endDate: localEndDate,
      startTime,
      endTime,
      availableDays,
    });

  useEffect(() => {
    if (isVisible) {
      const ref = moment();
      setReferenceDate(ref);

      setMarkedDates(getInitialMarkedDates(availableDays, ref));

      if (selectedDate?.startDate) {
        const s = moment(selectedDate.startDate).format('YYYY-MM-DD');
        const e = selectedDate?.endDate
          ? moment(selectedDate.endDate).format('YYYY-MM-DD')
          : null;

        setLocalStartDate(s);
        setLocalEndDate(e);

        if (s) {
          const updated = getInitialMarkedDates(availableDays, ref);

          if (e) {
            const start = moment(s);
            const end = moment(e);

            while (start.isSameOrBefore(end)) {
              const d = start.format('YYYY-MM-DD');
              const dayName = start.format('ddd').toLowerCase();

              // ✅ highlight only available days inside range
              if (availableDays.includes(dayName)) {
                updated[d] = {
                  ...(updated[d] || {}),
                  customStyles: {
                    container: {
                      backgroundColor: '#FF295D',
                      borderRadius: d === s || d === e ? 5 : 0,
                    },
                    text: {color: '#fff', fontWeight: 'bold'},
                  },
                };
              }

              start.add(1, 'day');
            }
          } else {
            updated[s] = {
              ...(updated[s] || {}),
              customStyles: {
                container: {backgroundColor: '#FF295D', borderRadius: 5},
                text: {color: '#fff', fontWeight: 'bold'},
              },
            };
          }

          setMarkedDates(updated);
        }
      } else {
        setLocalStartDate(null);
        setLocalEndDate(null);
      }
    } else {
      setSelectedCoords(null);
      setKilometer('0');
      setInstructions('');
      setIsChecked(false);
      setAcceptTerms(false);
      setShowStartPicker(false);
      setShowEndPicker(false);
      setStartTime(null);
      setEndTime(null);
      setLocalStartDate(null);
      setLocalEndDate(null);
      setMarkedDates(getInitialMarkedDates(availableDays, moment()));
      setReferenceDate(moment());
    }
  }, [isVisible, selectedDate]);

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

  const handleKilometerChange = useCallback(text => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    if ((cleaned.match(/\./g) || []).length <= 1) setKilometer(cleaned);
  }, []);

  const toggleState = useCallback(setter => setter(prev => !prev), []);

  const distance = useMemo(() => {
    return (
      getDistance(data?.location?.coordinates, selectedCoords?.latLng)
        ?.distance || 0
    );
  }, [data?.location?.coordinates, selectedCoords]);

  const calculatedPricing = useMemo(() => {
    const pricePerHour = Number(data?.pricing?.amount || 0);
    const pricePerKm = Number(data?.pricing?.pricePerKm || 0);
    const securityDeposit = Number(data?.paymentPolicy?.securityDeposit || 500);
    const extratimeCost = Number(data?.pricing?.extratimeCost || 0);

    const platformFeePercent = Number(
      data?.paymentPolicy?.platformFeePercent || 5,
    );

    const protectPercent = Number(
      data?.paymentPolicy?.evenlyoProtectFeePercent || 0,
    );
    const serviceCost = totalHours * pricePerHour;
    const travelCost = (Number(distance) || 0) * pricePerKm;

    const availableHoursPerDay = Number(
      data?.availability?.defaultHoursPerDay || 10,
    );

    const extraHours =
      totalHours > availableHoursPerDay ? totalHours - availableHoursPerDay : 0;

    const extraTimeAmount = extraHours * extratimeCost;
    const subTotal = serviceCost + travelCost + extraTimeAmount;

    const platformFee = (subTotal * platformFeePercent) / 100;

    const evenlyoProtect = isChecked ? (subTotal * protectPercent) / 100 : 0;

    const total = subTotal + platformFee + evenlyoProtect + securityDeposit;

    return {
      serviceCost,
      travelCost,
      extraHours,
      extraTimeAmount,
      subTotal,
      platformFee,
      evenlyoProtect,
      securityDeposit,
      total,
      pricePerHour,
      extratimeCost,
    };
  }, [totalHours, distance, isChecked, data]);

  const startDateStr = localStartDate || null;
  const endDateStr = localEndDate || null;

  const isSingleDateSelected =
    !!startDateStr && (!endDateStr || startDateStr === endDateStr);

  useEffect(() => {
    if (
      isSingleDateSelected &&
      data?.availability?.availableTimeSlots?.length > 0
    ) {
      const slot = data.availability.availableTimeSlots[0];
      const ref = referenceDate || moment();
      const selDate = moment(
        startDateStr || ref.format('YYYY-MM-DD'),
        'YYYY-MM-DD',
      );

      const start = slot?.startTime
        ? moment(slot.startTime, ['hh:mm A'])
            .set({
              year: selDate.year(),
              month: selDate.month(),
              date: selDate.date(),
            })
            .toDate()
        : null;

      const end = slot?.endTime
        ? moment(slot.endTime, ['hh:mm A'])
            .set({
              year: selDate.year(),
              month: selDate.month(),
              date: selDate.date(),
            })
            .toDate()
        : null;

      setStartTime(start);
      setEndTime(end);
    }
  }, [data, isSingleDateSelected, startDateStr, referenceDate]);

  const handleBooking = useCallback(() => {
    if (!selectedCoords) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please add address first.',
      });
      return;
    }

    if (!startDateStr) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please select start date first.',
      });
      return;
    }

    if (isSingleDateSelected && (!startTime || !endTime)) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please select start and end time.',
      });
      return;
    }

    if (!acceptTerms) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please accept terms and conditions first.',
      });
      return;
    }

    const payload = {
      listingId: data?._id,
      vendorId: data?.vendorId || data?.vendor?._id,

      details: {
        startDate: startDateStr,
        endDate: endDateStr || startDateStr,

        startTime:
          startTime && isSingleDateSelected
            ? moment(startTime).format('HH:mm')
            : null,

        endTime:
          endTime && isSingleDateSelected
            ? moment(endTime).format('HH:mm')
            : null,

        eventLocation: selectedCoords?.userAddress || '',
        specialRequests: instructions || null,
        contactPreference: 'email',

        distanceKm: Number(distance) || 0,
        evenyloProtect: isChecked,
        willPayUpfront: paymentRequirement?.type === 'HALF',

        pricingBreakdown: {
          baseAmount: calculatedPricing.serviceCost,
          extraTimeCost: calculatedPricing.extraTimeAmount,
          distanceCost: calculatedPricing.travelCost,
          securityFee: calculatedPricing.securityDeposit,

          subtotal: calculatedPricing.subTotal,
          platformFee: calculatedPricing.platformFee,
          evenyloProtectFee: calculatedPricing.evenlyoProtect,

          upfrontFee: paymentRequirement?.payableAmount || 0,
          total: calculatedPricing.total,

          calculationDetails: isSingleDateSelected
            ? `Standard pricing: ${totalHours} hours × $${calculatedPricing.pricePerHour}/hour`
            : `Standard pricing: ${availableSelectedDays} days`,

          breakdown: [
            {
              label: isSingleDateSelected
                ? `Standard Service (${totalHours} hours)`
                : `Standard Service (${availableSelectedDays} days)`,
              amount: calculatedPricing.serviceCost,
              explanation: isSingleDateSelected
                ? `${totalHours} hours × $${calculatedPricing.pricePerHour}/hour`
                : `${availableSelectedDays} days`,
            },
            {
              label: `Travel Cost (${distance}km)`,
              amount: calculatedPricing.travelCost,
              explanation: '',
            },
            {
              label: 'Security Deposit(Refundable)',
              amount: calculatedPricing.securityDeposit,
              explanation: '',
            },
            {
              label: `Platform Service Fee (${
                data?.paymentPolicy?.platformFeePercent || 5
              }%)`,
              amount: calculatedPricing.platformFee,
              explanation: '',
            },
          ],

          validationErrors: [],
          requiresFullPayment: paymentRequirement?.type === 'FULL',

          paymentPolicy: data?.paymentPolicy,
          pricingType: 'per hour',
          numDays: availableSelectedDays,
          isSingleDate: isSingleDateSelected,
        },
      },
    };

    handleSendBookingRequest(payload);
  }, [
    selectedCoords,
    startDateStr,
    endDateStr,
    startTime,
    endTime,
    acceptTerms,
    instructions,
    distance,
    isChecked,
    calculatedPricing,
    paymentRequirement,
    isSingleDateSelected,
    totalHours,
    availableSelectedDays,
    data,
    handleSendBookingRequest,
  ]);

  const handleDayPress = day => {
    const date = day.dateString;
    const m = moment(date, 'YYYY-MM-DD');
    const isPast = m.isBefore(referenceDate, 'day');

    if (isPast) return;

    let updatedMarks = getInitialMarkedDates(availableDays, referenceDate);

    if (!localStartDate) {
      setLocalStartDate(date);
      setLocalEndDate(null);

      updatedMarks[date] = {
        ...updatedMarks[date],
        customStyles: {
          container: {backgroundColor: '#FF295D', borderRadius: 5},
          text: {color: '#fff', fontWeight: 'bold'},
        },
      };
      setMarkedDates(updatedMarks);
      return;
    }

    if (localStartDate && !localEndDate) {
      const start = moment(localStartDate);
      const end = moment(date);
      if (end.isBefore(start)) {
        setLocalStartDate(date);
        setLocalEndDate(null);

        updatedMarks[date] = {
          ...updatedMarks[date],
          customStyles: {
            container: {backgroundColor: '#FF295D', borderRadius: 5},
            text: {color: '#fff', fontWeight: 'bold'},
          },
        };
        setMarkedDates(updatedMarks);
        return;
      }

      let curr = start.clone();
      while (curr.isSameOrBefore(end)) {
        const d = curr.format('YYYY-MM-DD');
        updatedMarks[d] = {
          ...(updatedMarks[d] || {}),
          customStyles: {
            container: {
              backgroundColor: '#FF295D',
              borderRadius: d === localStartDate || d === date ? 5 : 0,
            },
            text: {color: '#fff', fontWeight: 'bold'},
          },
        };
        curr.add(1, 'day');
      }

      setLocalEndDate(date);
      setMarkedDates(updatedMarks);
      return;
    }

    if (localStartDate && localEndDate) {
      setLocalStartDate(date);
      setLocalEndDate(null);

      updatedMarks[date] = {
        ...updatedMarks[date],
        customStyles: {
          container: {backgroundColor: '#FF295D', borderRadius: 5},
          text: {color: '#fff', fontWeight: 'bold'},
        },
      };
      setMarkedDates(updatedMarks);
    }
  };

  const getPaymentRequirement = ({
    startDate,
    totalAmount,
    today = moment(),
  }) => {
    if (!startDate) return null;

    const selected = moment(startDate, 'YYYY-MM-DD');
    const diffInDays = selected.diff(today, 'days');

    if (diffInDays <= 3) {
      return {
        type: 'FULL',
        title: 'Full Payment Required',
        description: `Since your booking is within 3 days, full payment of $${totalAmount.toFixed(
          2,
        )} is required at the time of booking.`,
        payableAmount: totalAmount,
      };
    }

    return {
      type: 'HALF',
      title: 'Upfront Payment Required',
      description: `Since your booking is more than 3 days away, an upfront payment of $${(
        totalAmount / 2
      ).toFixed(
        2,
      )} is required to secure your reservation. The remaining balance should be cleared ASAP before the event date.`,
      payableAmount: totalAmount / 2,
    };
  };

  const paymentRequirement = useMemo(() => {
    return getPaymentRequirement({
      startDate: startDateStr,
      totalAmount: calculatedPricing.total,
    });
  }, [startDateStr, calculatedPricing.total]);

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
          <TouchableOpacity
            onPress={() => {
              onClose?.();
            }}>
            <Icon name="close" size={18} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="custom"
            minDate={referenceDate.format('YYYY-MM-DD')}
            maxDate={referenceDate
              .clone()
              .add(6, 'months')
              .format('YYYY-MM-DD')}
            theme={{
              todayTextColor: 'red',
              arrowColor: 'blue',
            }}
            disableAllTouchEventsForDisabledDays
          />

          <View style={styles.section}>
            <View style={styles.dateTimeHeader}>
              <Text style={styles.label}>Selected Date & Time</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                {localStartDate && (
                  <Text style={styles.dateValue}>
                    {moment(localStartDate).format('dddd, MMMM D')}
                  </Text>
                )}
                {localEndDate && (
                  <Text style={styles.dateValue}>
                    , {moment(localEndDate).format('dddd, MMMM D')}
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
              {t(
                `Enable Evenlyo Protect (+${data?.paymentPolicy?.evenlyoProtectFeePercent}%)`,
              )}
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

            <View style={styles.pricingRow}>
              <View>
                <Text style={styles.pricingLabel}>
                  {`Multi-day Service (${availableSelectedDays} days × ${hoursPerDay}h)`}
                </Text>
                <Text style={styles.pricingLabel}>
                  {totalHours} hours × ${calculatedPricing.pricePerHour}/hour
                </Text>
              </View>
              <Text style={styles.pricingValue}>
                $ {calculatedPricing.serviceCost.toFixed(2)}
              </Text>
            </View>

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>
                Travel Cost ({distance} km)
              </Text>
              <Text style={styles.pricingValue}>
                $ {calculatedPricing.travelCost.toFixed(2)}
              </Text>
            </View>

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>
                Security Deposit (Refundable)
              </Text>
              <Text style={styles.pricingValue}>
                $ {calculatedPricing.securityDeposit.toFixed(2)}
              </Text>
            </View>

            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>
                Platform Service Fee (
                {data?.paymentPolicy?.platformFeePercent || 5}%)
              </Text>
              <Text style={styles.pricingValue}>
                $ {calculatedPricing.platformFee.toFixed(2)}
              </Text>
            </View>

            {isChecked && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  Evenlyo Protect (
                  {data?.paymentPolicy?.evenlyoProtectFeePercent}%)
                </Text>
                <Text style={styles.pricingValue}>
                  $ {calculatedPricing.evenlyoProtect.toFixed(2)}
                </Text>
              </View>
            )}

            {calculatedPricing.extraHours > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  Extra Time ({calculatedPricing.extraHours} hours × $
                  {calculatedPricing.extratimeCost})
                </Text>
                <Text style={styles.pricingValue}>
                  $ {calculatedPricing.extraTimeAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            {paymentRequirement && (
              <View
                style={[
                  styles.paymentAlert,
                  paymentRequirement?.type === 'FULL'
                    ? styles.fullPaymentBg
                    : styles.halfPaymentBg,
                ]}>
                <View style={styles.alertHeader}>
                  <Icon
                    name="alert-circle"
                    size={18}
                    color={
                      paymentRequirement?.type === 'FULL'
                        ? '#D32F2F'
                        : '#92400E'
                    }
                    style={{marginRight: 6}}
                  />
                  <Text
                    style={[
                      styles.alertTitle,
                      {
                        color:
                          paymentRequirement?.type === 'FULL'
                            ? '#D32F2F'
                            : '#92400E',
                      },
                    ]}>
                    {paymentRequirement?.title}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.alertDesc,
                    {
                      color:
                        paymentRequirement?.type === 'FULL'
                          ? '#D32F2F'
                          : '#b45309',
                    },
                  ]}>
                  {paymentRequirement?.description}
                </Text>
              </View>
            )}

            <View style={styles.pricingRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                $ {calculatedPricing.total.toFixed(2)}
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
                const details = {
                  listingId: data?._id,
                  startDate: startDateStr,
                  endDate: endDateStr,
                  eventLocation: selectedCoords?.userAddress || '',
                  specialRequests: instructions,
                  distance: Number(distance) || 0,
                };

                if (startDateStr === endDateStr && startTime && endTime) {
                  details.startTime = moment(startTime).format('hh:mm A');
                  details.endTime = moment(endTime).format('hh:mm A');
                }

                console.log(details, 'detailsdetailsdetailsdetails');

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

export default React.memo(OrderBooking);

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    backgroundColor: '#8b8b8b66',
  },

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

  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

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

  iconSmall: {
    height: width(5),
    width: width(5),
  },

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

  checkboxIcon: {
    height: width(6),
    width: width(6),
  },

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

  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 15,
  },

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

  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

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

  checkboxChecked: {
    backgroundColor: '#FF295D',
  },

  termsTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },

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

  paymentAlert: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 15,
  },

  fullPaymentBg: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFCDD2',
  },

  halfPaymentBg: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFE0B2',
  },

  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  alertTitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  alertDesc: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    lineHeight: 18,
  },
});

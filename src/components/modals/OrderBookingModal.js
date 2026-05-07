import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DatePicker from 'react-native-date-picker';
import { width } from 'react-native-dimension';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import { ICONS } from '../../assets';
import { COLORS, fontFamly } from '../../constants';
import { useTranslation } from '../../hooks';
import { onUpdateCart } from '../../services/ListingsItem';
import {
  calculateAvailableDaysWithHours,
  getDistance,
  getInitialMarkedDates,
} from '../../utils';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import GradientText from '../gradiantText';
import GooglePlacesInput from '../locationField';
import Loader from '../loder';
import TextField from '../textInput';

const TERMS_AND_CONDITIONS_TEXT = `I accept the terms and conditions

Welcome to Evenlyo
By accessing and using our platform, you agree to the following terms and conditions.

These terms are designed to protect both clients and vendors, ensuring a safe, fair, and transparent experience for everyone.

1. General Terms
Evenlyo acts as a platform to connect clients and vendors for event services.
Users must provide accurate information when creating bookings and profiles.
All communications and transactions are the user's responsibility and not Evenlyo's.

2. Platform Usage Rules
Clients may book services directly through Evenlyo.
Vendors are responsible for keeping their service details, pricing, and availability up-to-date.
Both clients and vendors must communicate respectfully and in good faith.

3. Payments Fees
Payments are processed securely through our integrated system.
Fees for vendors (if applicable) will be disclosed clearly before sign-up.
Refund policies are subject to vendor policies and platform rules.

4. Liability Cancellations
Evenlyo is not a party to contracts between clients and vendors.
Cancellation policies are determined by individual vendors.
Vendors are responsible for service delivery.
Clients are responsible for timely payments and providing accurate event details.
Neither party may hold Evenlyo liable for any performance or service issues.
If full payment is not completed before the event, Evenlyo or the supplier reserves the right to cancel the booking without refunding the deposit.`;

const OrderBooking = ({
  data,
  type,
  onClose,
  isVisible,
  selectedDate,
  handleAddToWishList,
  handleSendBookingRequest,
}) => {
  const { t } = useTranslation();
  const modalRef = useRef(null);
  const [isLoadding, setIsLoadding] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [referenceDate, setReferenceDate] = useState(moment());
  const [localStartDate, setLocalStartDate] = useState(null);
  const [localEndDate, setLocalEndDate] = useState(null);
  let availableDays =
    data?.availability?.availableDays ||
    data?.listingId?.availability?.availableDays ||
    [];

  const [markedDates, setMarkedDates] = useState(() =>
    getInitialMarkedDates(availableDays, moment()),
  );
  const openTermsModal = () => setShowTermsModal(true);

  const {
    hoursPerDay,
    totalHours: calcTotalHours,
    availableSelectedDays,
  } = calculateAvailableDaysWithHours({
    startDate: localStartDate || data?.startDate,
    endDate: localEndDate || data?.endDate,
    startTime: startTime,
    endTime: endTime,
    availableDays,
  });

  useEffect(() => {
    if (isVisible) {
      const ref = moment();
      setReferenceDate(ref);

      setMarkedDates(getInitialMarkedDates(availableDays, ref));

      // If editing an existing cart/item, prefill modal with `data` values
      if (type === 'edit' && data?.startDate) {
        const s = moment(data.startDate).format('YYYY-MM-DD');
        const e = data?.endDate
          ? moment(data.endDate).format('YYYY-MM-DD')
          : null;

        setLocalStartDate(s);
        setLocalEndDate(e);

        // prefill location (address + coords) if available
        if (data?.eventLocation) {
          const coords = {
            latitude: data.eventLatitude || data?.lat || 0,
            longitude: data.eventLongitude || data?.lng || 0,
          };

          setSelectedCoords({
            userAddress: data.eventLocation || '',
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude,
              lat: coords.latitude,
              lng: coords.longitude,
            },
          });
        }

        setIsChecked(Boolean(data?.evenyloProtect || false));
        setInstructions(data?.specialRequests || data?.instructions || '');

        if (data?.startTime) {
          const st = moment(data.startTime, ['HH:mm', 'hh:mm A']).set({
            year: moment(s).year(),
            month: moment(s).month(),
            date: moment(s).date(),
          });
          setStartTime(st.isValid() ? st.toDate() : null);
        }

        if (data?.endTime) {
          const en = moment(data.endTime, ['HH:mm', 'hh:mm A']).set({
            year: moment(s).year(),
            month: moment(s).month(),
            date: moment(s).date(),
          });
          setEndTime(en.isValid() ? en.toDate() : null);
        }

        if (s) {
          const updated = getInitialMarkedDates(availableDays, ref);

          if (e) {
            const start = moment(s);
            const end = moment(e);

            while (start.isSameOrBefore(end)) {
              const d = start.format('YYYY-MM-DD');
              const dayName = start.format('ddd').toLowerCase();

              if (availableDays.includes(dayName)) {
                updated[d] = {
                  ...(updated[d] || {}),
                  customStyles: {
                    container: {
                      backgroundColor: '#FF295D',
                      borderRadius: d === s || d === e ? 5 : 0,
                    },
                    text: { color: '#fff', fontWeight: 'bold' },
                  },
                };
              }

              start.add(1, 'day');
            }
          } else {
            updated[s] = {
              ...(updated[s] || {}),
              customStyles: {
                container: { backgroundColor: '#FF295D', borderRadius: 5 },
                text: { color: '#fff', fontWeight: 'bold' },
              },
            };
          }

          setMarkedDates(updated);
        }
      } else if (selectedDate?.startDate) {
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

              if (availableDays.includes(dayName)) {
                updated[d] = {
                  ...(updated[d] || {}),
                  customStyles: {
                    container: {
                      backgroundColor: '#FF295D',
                      borderRadius: d === s || d === e ? 5 : 0,
                    },
                    text: { color: '#fff', fontWeight: 'bold' },
                  },
                };
              }

              start.add(1, 'day');
            }
          } else {
            updated[s] = {
              ...(updated[s] || {}),
              customStyles: {
                container: { backgroundColor: '#FF295D', borderRadius: 5 },
                text: { color: '#fff', fontWeight: 'bold' },
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

  const toggleState = useCallback(setter => setter(prev => !prev), []);

  const resetLocalState = useCallback(() => {
    setSelectedCoords(null);
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
    onClose();
  }, [availableDays]);

  const listingCoordinates = useMemo(() => {
    const rawCoordinates =
      data?.location?.coordinates ||
      data?.listingDetails?.location?.coordinates ||
      data?.listingId?.location?.coordinates;

    if (Array.isArray(rawCoordinates)) {
      return {
        latitude: Number(rawCoordinates?.[1] || 0),
        longitude: Number(rawCoordinates?.[0] || 0),
      };
    }

    return {
      latitude: Number(rawCoordinates?.latitude || rawCoordinates?.lat || 0),
      longitude: Number(rawCoordinates?.longitude || rawCoordinates?.lng || 0),
    };
  }, [data]);

  const distance = useMemo(() => {
    return (
      getDistance(listingCoordinates, selectedCoords?.latLng)?.distance || 0
    );
  }, [listingCoordinates, selectedCoords]);

  const startDateStr = localStartDate || null;
  const endDateStr = localEndDate || null;

  const isSingleDateSelected =
    !!startDateStr && (!endDateStr || startDateStr === endDateStr);

  const calculatedPricing = useMemo(() => {
    const pricePerHour = Number(data?.pricing?.amount || 0);
    const pricePerKm = Number(data?.pricing?.pricePerKm || 0);
    const securityDeposit = Number(data?.paymentPolicy?.securityDeposit || 500);
    const extratimeCost = Number(data?.pricing?.extratimeCost || 0);

    const platformFeePercent = Number(
      data?.paymentPolicy?.platformFeePercent || 5,
    );
    const vatPercent = Number(
      data?.settings?.vat ??
      data?.vatFeePercent ??
      data?.pricingBreakdown?.vatFeePercent ??
      0,
    );

    const protectPercent = Number(
      data?.paymentPolicy?.evenlyoProtectFeePercent || 0,
    );

    // Determine vendor's standard available hours per day from availability slot
    const slot = data?.availability?.availableTimeSlots?.[0];
    let vendorHoursPerDay = hoursPerDay;
    if (slot && slot.startTime && slot.endTime) {
      const tryFormats = ['HH:mm', 'hh:mm A', 'h:mm A'];
      const s = moment(slot.startTime, tryFormats);
      const e = moment(slot.endTime, tryFormats);
      if (s.isValid() && e.isValid()) {
        vendorHoursPerDay = e.diff(s, 'hours', true);
      }
    }

    // For single-date selection, requested hours come from startTime/endTime
    let requestedHours = calcTotalHours;
    if (isSingleDateSelected && startTime && endTime) {
      requestedHours = moment(endTime).diff(moment(startTime), 'hours', true);
    }

    // Base hours charged using vendorHoursPerDay (don't include extra hours in base)
    const baseHours = isSingleDateSelected
      ? Math.min(requestedHours, vendorHoursPerDay || requestedHours)
      : calcTotalHours;

    const extraHours = isSingleDateSelected
      ? Math.max(0, requestedHours - (vendorHoursPerDay || 0))
      : 0;

    // Extra time cost should use extratimeCost if provided, otherwise pricePerHour
    const perExtraHourRate = extratimeCost || pricePerHour;
    const extraTimeAmount = extraHours * perExtraHourRate;

    const serviceCost = baseHours * pricePerHour;
    const travelCost = (Number(distance) || 0) * pricePerKm;

    const subTotal = serviceCost + travelCost + extraTimeAmount;
    const vatFee = (subTotal * vatPercent) / 100;

    const platformFee = (subTotal * platformFeePercent) / 100;

    const evenlyoProtect = isChecked ? (subTotal * protectPercent) / 100 : 0;

    const total =
      subTotal + vatFee + platformFee + evenlyoProtect + securityDeposit;

    return {
      serviceCost,
      travelCost,
      extraHours,
      extraTimeAmount,
      subTotal,
      vatFee,
      vatPercent,
      platformFee,
      evenlyoProtect,
      securityDeposit,
      total,
      pricePerHour,
      extratimeCost,
      vendorHoursPerDay,
      requestedHours,
      totalHours: baseHours,
    };
  }, [
    calcTotalHours,
    distance,
    isChecked,
    data,
    startTime,
    endTime,
    hoursPerDay,
    isSingleDateSelected,
  ]);

  useEffect(() => {
    if (
      isSingleDateSelected &&
      data?.availability?.availableTimeSlots?.length > 0
    ) {
      // If explicit times are provided (editing existing booking) or
      // start/end are already set in state, do not override them with
      // the vendor's availability slot defaults.
      if (data?.startTime || data?.endTime || startTime || endTime) {
        return;
      }
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
  }, [
    data,
    isSingleDateSelected,
    startDateStr,
    referenceDate,
    startTime,
    endTime,
  ]);

  const handleBooking = useCallback(() => {
    if (!selectedCoords) {
      modalRef.current?.show({
        status: 'error',
        message: t('pleaseAddAddressFirst'),
      });
      return;
    }

    if (!startDateStr) {
      modalRef.current?.show({
        status: 'error',
        message: t('pleaseSelectStartDateFirst'),
      });
      return;
    }

    if (isSingleDateSelected && (!startTime || !endTime)) {
      modalRef.current?.show({
        status: 'error',
        message: t('pleaseSelectStartAndEndTime'),
      });
      return;
    }

    if (!acceptTerms) {
      modalRef.current?.show({
        status: 'error',
        message: t('pleaseAcceptTermsAndConditionsFirst'),
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

        eventLocation: selectedCoords?.userAddress,
        eventLatitude:
          selectedCoords?.latLng?.latitude || selectedCoords?.latLng?.lat || 0,
        eventLongitude:
          selectedCoords?.latLng?.longitude || selectedCoords?.latLng?.lng || 0,

        specialRequests: instructions || null,
        contactPreference: 'email',

        distanceKm: Number(distance) || 0,
        evenyloProtect: isChecked,
        willPayUpfront: paymentRequirement?.type === 'HALF',

        pricingBreakdown: {
          baseAmount: calculatedPricing.serviceCost?.toFixed(2),
          extraTimeCost: calculatedPricing.extraTimeAmount?.toFixed(2),
          distanceCost: calculatedPricing.travelCost,
          securityFee: calculatedPricing.securityDeposit?.toFixed(2),

          subtotal: calculatedPricing.subTotal?.toFixed(2),
          vatFeePercent: calculatedPricing.vatPercent,
          vatFee: calculatedPricing.vatFee?.toFixed(2),
          platformFee: calculatedPricing.platformFee?.toFixed(2),
          evenyloProtectFee: calculatedPricing.evenlyoProtect?.toFixed(2),

          upfrontFee: paymentRequirement?.payableAmount?.toFixed(2) || 0,
          total: calculatedPricing.total?.toFixed(2),

          calculationDetails: isSingleDateSelected
            ? `Standard pricing: ${calculatedPricing.totalHours} hours × €${calculatedPricing.pricePerHour}/hour`
            : `Standard pricing: ${availableSelectedDays} days`,

          breakdown: [
            {
              label: isSingleDateSelected
                ? `Standard Service (${calculatedPricing.totalHours} hours)`
                : `Standard Service (${availableSelectedDays} days)`,
              amount: calculatedPricing.serviceCost,
              explanation: isSingleDateSelected
                ? `${calculatedPricing.totalHours} hours × €${calculatedPricing.pricePerHour}/hour`
                : `${availableSelectedDays} days`,
            },
            {
              label: `Extra Time Fee`,
              amount: calculatedPricing.extraTimeAmount,
              explanation: '',
            },
            {
              label: `Travel Cost (${distance}km)`,
              amount: calculatedPricing.travelCost,
              explanation: '',
            },
            {
              label: `VAT (${calculatedPricing.vatPercent}%)`,
              amount: calculatedPricing.vatFee,
              explanation: '',
            },
            {
              label: 'Security Deposit(Refundable)',
              amount: calculatedPricing.securityDeposit,
              explanation: '',
            },
            {
              label: `Platform Service Fee (${data?.paymentPolicy?.platformFeePercent || 5
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
          container: { backgroundColor: '#FF295D', borderRadius: 5 },
          text: { color: '#fff', fontWeight: 'bold' },
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
            container: { backgroundColor: '#FF295D', borderRadius: 5 },
            text: { color: '#fff', fontWeight: 'bold' },
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
            text: { color: '#fff', fontWeight: 'bold' },
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
          container: { backgroundColor: '#FF295D', borderRadius: 5 },
          text: { color: '#fff', fontWeight: 'bold' },
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
        title: t('fullPaymentRequiredTitle'),
        description: t('fullPaymentRequiredDescription', {
          amount: totalAmount.toFixed(2),
        }),
        payableAmount: totalAmount,
      };
    }

    return {
      type: 'HALF',
      title: t('upfrontPaymentRequiredTitle'),
      description: t('upfrontPaymentRequiredDescription', {
        amount: (totalAmount / 2).toFixed(2),
      }),
      payableAmount: totalAmount / 2,
    };
  };

  const paymentRequirement = useMemo(() => {
    return getPaymentRequirement({
      startDate: startDateStr,
      totalAmount: calculatedPricing.total,
    });
  }, [startDateStr, calculatedPricing.total]);

  const handleUpdateCart = async () => {
    try {
      const slot = data?.availability?.availableTimeSlots?.[0] || {};
      const slotStart = slot.startTime || '';
      const slotEnd = slot.endTime || '';
      const baseAmount = Number(calculatedPricing.serviceCost || 0);
      const extraTimeCost = Number(calculatedPricing.extraTimeAmount || 0);
      const distanceCost = Number(calculatedPricing.travelCost || 0);
      const securityFee = Number(calculatedPricing.securityDeposit || 0);
      const subtotal = Number(calculatedPricing.subTotal || 0);
      const vatFee = Number(calculatedPricing.vatFee || 0);
      const platformFee = Number(calculatedPricing.platformFee || 0);
      const evenyloProtectFee = Number(calculatedPricing.evenlyoProtect || 0);
      const upfrontFee = Number(paymentRequirement?.payableAmount || 0);
      const total = Number(calculatedPricing.total || 0);

      const validationErrors = [];
      if ((calculatedPricing.extraHours || 0) > 0) {
        validationErrors.push(
          `ℹ️ Booking outside available hours (${slotStart}-${slotEnd}) will include an extra time fee of €${extraTimeCost.toFixed(
            2,
          )} (${calculatedPricing.extraHours} extra hours)`,
        );
      }

      const params = {
        listingId: data?._id,
        startDate: startDateStr || '',
        endDate: endDateStr || startDateStr || '',

        eventLocation: selectedCoords?.userAddress,
        eventLatitude:
          selectedCoords?.latLng?.latitude ?? selectedCoords?.latLng?.lat ?? 0,
        evenongitude:
          selectedCoords?.latLng?.longitude ?? selectedCoords?.latLng?.lng ?? 0,

        startTime:
          startTime && isSingleDateSelected
            ? moment(startTime).format('HH:mm')
            : null,
        endTime:
          endTime && isSingleDateSelected
            ? moment(endTime).format('HH:mm')
            : null,
        specialRequests: instructions || '',
        distanceKm: Number(distance) || 0,
        evenyloProtect: isChecked,
        pricingBreakdown: {
          baseAmount,
          extraTimeCost,
          distanceCost,
          securityFee,

          subtotal,
          vatFeePercent: Number(calculatedPricing.vatPercent || 0),
          vatFee,
          platformFee,
          evenyloProtectFee,

          upfrontFee,
          total,

          calculationDetails: isSingleDateSelected
            ? `Standard pricing: ${calculatedPricing.totalHours} hours × €${calculatedPricing.pricePerHour}/hour`
            : `Standard pricing: ${availableSelectedDays} days`,

          breakdown: [
            {
              label: isSingleDateSelected
                ? `Standard Service (${calculatedPricing.totalHours} hours)`
                : `Standard Service (${availableSelectedDays} days)`,
              amount: baseAmount,
              explanation: isSingleDateSelected
                ? `${calculatedPricing.totalHours} hours × €${calculatedPricing.pricePerHour}/hour`
                : `${availableSelectedDays} days`,
            },
            {
              label: 'Extra Time Fee',
              amount: extraTimeCost,
              explanation: '',
            },
            {
              label: `Travel Cost (${distance}km)`,
              amount: distanceCost,
              explanation: '',
            },
            {
              label: `VAT (${Number(calculatedPricing.vatPercent || 0)}%)`,
              amount: vatFee,
              explanation: '',
            },
            {
              label: 'Security Deposit(Refundable)',
              amount: securityFee,
              explanation: '',
            },
            {
              label: `Platform Service Fee (${data?.paymentPolicy?.platformFeePercent}%)`,
              amount: platformFee,
              explanation: '',
            },
            {
              label: `Evenlyo Protect (${data?.paymentPolicy?.evenlyoProtectFeePercent || 0
                }%)`,
              amount: evenyloProtectFee,
              explanation: '',
            },
          ],
          validationErrors,
          requiresUpfront: paymentRequirement?.type === 'HALF',
          requiresFullPayment: paymentRequirement?.type === 'FULL',
          paymentPolicy: data?.paymentPolicy,
          pricingType: data?.pricing?.type || 'per hour',
          numDays: availableSelectedDays,
          isSingleDate: isSingleDateSelected,
        },
      };
      setIsLoadding(true);
      const response = await onUpdateCart(data?._id, params);
      if (response.status == 200 || response.status == 201) {
        modalRef.current.show({
          status: 'ok',
          message: response?.data?.message,
          handlePressOk: resetLocalState,
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'lasndasdnsadasdasdasndkasld');
    } finally {
      setIsLoadding(false);
    }
  };

  const handleAddToCart = () => {
    const details = {
      listingId: data?._id,
      startDate: startDateStr,
      endDate: endDateStr,
      eventLocation: selectedCoords?.userAddress,
      eventLatitude:
        selectedCoords?.latLng?.latitude || selectedCoords?.latLng?.lat || 0,
      eventLongitude:
        selectedCoords?.latLng?.longitude || selectedCoords?.latLng?.lng || 0,
      specialRequests: instructions,
      distance: Number(distance) || 0,
      paymentPolicy: data?.paymentPolicy,
      evenyloProtect: isChecked,
      startTime: moment(startTime).format('hh:mm A'),
      endTime: moment(endTime).format('hh:mm A'),
    };

    handleAddToWishList(details);
  };

  return (
    <>
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        style={styles.modal}
        backdropOpacity={0.5}
        avoidKeyboard
        propagateSwipe>
        <Loader isLoading={isLoadding} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('orderBooking')}</Text>
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
                <Text style={styles.label}>{t('selectedDateAndTime')}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
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
                <Text style={styles.label}>{t('timeRangeRequired')}</Text>

                <View style={styles.dateRangeContainer}>
                  {[
                    {
                      label: t('startTime'),
                      value: startTime,
                      setter: setShowStartPicker,
                    },
                    {
                      label: t('endTime'),
                      value: endTime,
                      setter: setShowEndPicker,
                    },
                  ].map(({ label, value, setter }, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dateInput, idx === 0 && { marginRight: 10 }]}
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
              placeholder={t('enterLocation')}
              showRightIcon={ICONS.locationIcon}
              lable={t('addLocationRequired')}
            />

            <View style={styles.section}>
              <TextField
                label={t('kilometerRequired')}
                placeholder={t('kilometer')}
                editable={false}
                value={distance}
                keyboardType="numeric"
                endIcon={ICONS.currentLoactionIcon}
              />
            </View>

            <View style={styles.section}>
              <TextField
                label={t('addInstructionsRequired')}
                placeholder={t('specialRequirementsPlaceholder')}
                value={instructions}
                onChangeText={setInstructions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {data?.paymentPolicy?.isEvenlyoProtectEnabled && (
              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  onPress={() => toggleState(setIsChecked)}
                  style={[styles.checkboxBox, isChecked && { borderWidth: 0 }]}>
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
                    { fontSize: 8, color: COLORS.textLight },
                  ]}>
                  {t('(Non Refundable)')}
                </Text>
              </View>
            )}

            <View style={styles.pricingSection}>
              <Text style={styles.pricingTitle}>{t('pricingSummary')}</Text>

              <View style={styles.pricingRow}>
                <View>
                  {isSingleDateSelected ? (
                    <Text style={styles.pricingLabel}>
                      {t('standardServiceHours', {
                        hours: calculatedPricing.totalHours,
                      })}
                    </Text>
                  ) : (
                    <Text style={styles.pricingLabel}>
                      {t('multiDayService', {
                        days: availableSelectedDays,
                        hours: hoursPerDay,
                      })}
                    </Text>
                  )}
                  <Text style={styles.pricingLabel}>
                    {t('standardServiceRate', {
                      hours: calculatedPricing.totalHours,
                      rate: calculatedPricing.pricePerHour,
                    })}
                  </Text>
                </View>
                <Text style={styles.pricingValue}>
                  € {calculatedPricing.serviceCost.toFixed(2)}
                </Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  {t('travelCostWithDistance', { distance })}
                </Text>
                <Text style={styles.pricingValue}>
                  € {calculatedPricing.travelCost.toFixed(2)}
                </Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  {t('securityDepositRefundable')}
                </Text>
                <Text style={styles.pricingValue}>
                  € {calculatedPricing.securityDeposit.toFixed(2)}
                </Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  {t('platformServiceFeeWithPercent', {
                    percent: data?.paymentPolicy?.platformFeePercent || 5,
                  })}
                </Text>
                <Text style={styles.pricingValue}>
                  € {calculatedPricing.platformFee.toFixed(2)}
                </Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  VAT ({calculatedPricing.vatPercent}%)
                </Text>
                <Text style={styles.pricingValue}>
                  € {calculatedPricing.vatFee.toFixed(2)}
                </Text>
              </View>

              {isChecked && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>
                    {t('evenlyoProtectWithPercent', {
                      percent: data?.paymentPolicy?.evenlyoProtectFeePercent,
                    })}
                  </Text>
                  <Text style={styles.pricingValue}>
                    € {calculatedPricing.evenlyoProtect.toFixed(2)}
                  </Text>
                </View>
              )}

              {calculatedPricing.extraHours > 0 && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>
                    {t('extraTimeWithRate', {
                      hours: calculatedPricing.extraHours,
                      rate:
                        calculatedPricing.extratimeCost ||
                        calculatedPricing.pricePerHour,
                    })}
                  </Text>
                  <Text style={styles.pricingValue}>
                    € {calculatedPricing.extraTimeAmount.toFixed(2)}
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
                      style={{ marginRight: 6 }}
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
                <Text style={styles.totalLabel}>{t('totalLabel')}</Text>
                <Text style={styles.totalValue}>
                  € {calculatedPricing.total.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.termsSection}>
              <View style={styles.termsContainer}>
                <TouchableOpacity onPress={() => toggleState(setAcceptTerms)}>
                  <View
                    style={[
                      styles.checkbox,
                      acceptTerms && styles.checkboxChecked,
                    ]}>
                    {acceptTerms && (
                      <Icon name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>{t('acceptCompanyPrefix')}</Text>
                  <TouchableOpacity style={styles.termsLink} onPress={openTermsModal}>
                    <GradientText text={t('termsAndConditions')} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {!isKeyboardVisible && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={type == 'add' ? handleAddToCart : handleUpdateCart}
                style={styles.wishlistBtn}>
                <GradientText
                  text={
                    type === 'edit'
                      ? t('updateWishlist')
                      : t('addToWishlistButton')
                  }
                />
              </TouchableOpacity>

              <View style={{ width: width(50) }}>
                <GradientButton
                  text={t('sendBookingRequest')}
                  onPress={handleBooking}
                  type="filled"
                  textStyle={styles.buttonText}
                />
              </View>
            </View>
          )}
        </View>

        <CommonAlert ref={modalRef} />
        {showTermsModal && (
          <View style={styles.termsModalOverlay}>
            <View style={styles.termsModalContainer}>
              <View style={styles.termsModalHeader}>
                <Text style={styles.termsModalTitle}>Terms & Conditions</Text>
                <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                  <Icon name="close" size={20} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.termsModalContent}>
                <Text style={styles.termsBodyText}>
                  {TERMS_AND_CONDITIONS_TEXT}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
    </>
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

  scrollView: { flex: 1 },

  section: { marginBottom: width(4) },

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

  termsSection: { marginBottom: 25 },

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
  termsModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 999,
  },
  termsModalContainer: {
    maxHeight: '78%',
    borderRadius: 16,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  termsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  termsModalTitle: {
    fontSize: 16,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  termsModalContent: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  termsBodyTitle: {
    fontSize: 13,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginTop: 10,
    marginBottom: 6,
  },
  termsBodyText: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    marginBottom: 6,
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
    height: width(11),
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

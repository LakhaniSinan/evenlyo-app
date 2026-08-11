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
import {onUpdateCart} from '../../services/ListingsItem';
import {
  calculateAvailableDaysWithHours,
  formatEuro,
  formatPrice,
  getDistance,
  getInitialMarkedDates,
  resolveAvailableDays,
} from '../../utils';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import GradientText from '../gradiantText';
import GooglePlacesInput from '../locationField';
import Loader from '../loder';
import TextField from '../textInput';

const TERMS_AND_CONDITIONS_TEXT = {
  en: `I accept the terms and conditions

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
If full payment is not completed before the event, Evenlyo or the supplier reserves the right to cancel the booking without refunding the deposit.`,
  nl: `Ik accepteer de algemene voorwaarden

Welkom bij Evenlyo
Door toegang te krijgen tot en gebruik te maken van ons platform, gaat u akkoord met de volgende algemene voorwaarden.

Deze voorwaarden zijn bedoeld om zowel klanten als leveranciers te beschermen, en zorgen voor een veilige, eerlijke en transparante ervaring voor iedereen.

1. Algemene voorwaarden
Evenlyo fungeert als platform om klanten en leveranciers te verbinden voor evenementdiensten.
Gebruikers moeten accurate informatie verstrekken bij het aanmaken van boekingen en profielen.
Alle communicatie en transacties zijn de verantwoordelijkheid van de gebruiker en niet van Evenlyo.

2. Regels voor platformgebruik
Klanten kunnen diensten rechtstreeks via Evenlyo boeken.
Leveranciers zijn verantwoordelijk voor het up-to-date houden van hun dienstdetails, prijzen en beschikbaarheid.
Zowel klanten als leveranciers moeten respectvol en te goeder trouw communiceren.

3. Betalingen en kosten
Betalingen worden veilig verwerkt via ons geïntegreerde systeem.
Kosten voor leveranciers (indien van toepassing) worden duidelijk vermeld vóór de aanmelding.
Restitutiebeleid is onderhevig aan het beleid van de leverancier en de platformregels.

4. Aansprakelijkheid en annuleringen
Evenlyo is geen partij bij contracten tussen klanten en leveranciers.
Annuleringsvoorwaarden worden bepaald door individuele leveranciers.
Leveranciers zijn verantwoordelijk voor de dienstverlening.
Klanten zijn verantwoordelijk voor tijdige betalingen en het verstrekken van accurate evenementgegevens.
Geen van beide partijen mag Evenlyo aansprakelijk stellen voor prestatie- of dienstproblemen.
Als de volledige betaling niet vóór het evenement is voltooid, behoudt Evenlyo of de leverancier het recht om de boeking te annuleren zonder restitutie van de aanbetaling.`,
};
const DAY_KEY_ALIASES = {
  mon: 'mon',
  monday: 'mon',
  maandag: 'mon',
  tue: 'tue',
  tues: 'tue',
  tuesday: 'tue',
  dinsdag: 'tue',
  wed: 'wed',
  wednesday: 'wed',
  woensdag: 'wed',
  thu: 'thu',
  thur: 'thu',
  thurs: 'thu',
  thursday: 'thu',
  donderdag: 'thu',
  fri: 'fri',
  friday: 'fri',
  vrijdag: 'fri',
  sat: 'sat',
  saturday: 'sat',
  zaterdag: 'sat',
  sun: 'sun',
  sunday: 'sun',
  zondag: 'sun',
};

const normalizeDayKey = day => {
  const key = String(day || '')
    .trim()
    .toLowerCase();
  return DAY_KEY_ALIASES[key] || null;
};

const getDayKeyFromMoment = dateMoment => {
  const isoDay = dateMoment.isoWeekday();
  const map = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  return map[isoDay - 1] || null;
};

const TIME_PARSE_FORMATS = ['HH:mm', 'H:mm', 'hh:mm A', 'h:mm A'];

const formatTime24 = date => {
  if (!date) {
    return '';
  }
  return moment(date).format('HH:mm');
};

const normalizeToHour = date => {
  if (!date) {
    return null;
  }
  return moment(date).minute(0).second(0).millisecond(0).toDate();
};

const getPickerTimeDate = existingTime => {
  if (existingTime) {
    return normalizeToHour(existingTime);
  }
  return moment().minute(0).second(0).millisecond(0).toDate();
};

const MIN_BOOKING_HOURS = 1;

const getTimeRangeHours = (referenceDate, startTime, endTime) => {
  if (!startTime || !endTime) {
    return null;
  }

  const dateStr = referenceDate
    ? moment(referenceDate, 'YYYY-MM-DD', true).isValid()
      ? moment(referenceDate, 'YYYY-MM-DD').format('YYYY-MM-DD')
      : moment(referenceDate).format('YYYY-MM-DD')
    : moment().format('YYYY-MM-DD');

  const start = moment(dateStr, 'YYYY-MM-DD')
    .hour(moment(startTime).hour())
    .minute(0)
    .second(0)
    .millisecond(0);
  const end = moment(dateStr, 'YYYY-MM-DD')
    .hour(moment(endTime).hour())
    .minute(0)
    .second(0)
    .millisecond(0);

  return end.diff(start, 'hours', true);
};

const OrderBooking = ({
  data,
  type,
  onClose,
  isVisible,
  selectedDate,
  onSelectedDateChange,
  handleAddToWishList,
  handleSendBookingRequest,
}) => {
  const {t, currentLanguage} = useTranslation();
  const modalRef = useRef(null);
  const isSubmittingRef = useRef(false);
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
  const availabilitySource =
    data?.availability ?? data?.listingId?.availability ?? null;
  const fallbackAvailableDays =
    data?.availableDays ?? data?.listingId?.availableDays;
  const availableDaysKey = availabilitySource
    ? JSON.stringify(availabilitySource?.availableDays ?? fallbackAvailableDays)
    : 'all-days';
  const selectedDateKey =
    selectedDate?.startDate || selectedDate?.endDate
      ? `${selectedDate?.startDate || ''}|${selectedDate?.endDate || ''}`
      : '';
  const editPrefillKey = `${data?.startDate || ''}|${data?.endDate || ''}|${
    data?.startTime || ''
  }|${data?.endTime || ''}|${data?.eventLocation || ''}|${
    data?.eventLatitude || ''
  }|${data?.eventLongitude || ''}|${data?.evenyloProtect ? '1' : '0'}|${
    data?.specialRequests || data?.instructions || ''
  }`;
  const availableDays = useMemo(
    () => resolveAvailableDays(availabilitySource, fallbackAvailableDays),
    [availabilitySource, fallbackAvailableDays],
  );
  const availableDaysSet = useMemo(
    () => new Set(availableDays),
    [availableDays],
  );

  const [markedDates, setMarkedDates] = useState(() =>
    getInitialMarkedDates(availableDays, moment()),
  );
  const openTermsModal = () => setShowTermsModal(true);
  const formatAmount = useCallback(value => formatEuro(value), []);

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
          const st = moment(data.startTime, TIME_PARSE_FORMATS).set({
            year: moment(s).year(),
            month: moment(s).month(),
            date: moment(s).date(),
          });
          setStartTime(st.isValid() ? normalizeToHour(st.toDate()) : null);
        }

        if (data?.endTime) {
          const en = moment(data.endTime, TIME_PARSE_FORMATS).set({
            year: moment(s).year(),
            month: moment(s).month(),
            date: moment(s).date(),
          });
          setEndTime(en.isValid() ? normalizeToHour(en.toDate()) : null);
        }

        if (s) {
          const updated = getInitialMarkedDates(availableDays, ref);

          if (e) {
            const start = moment(s);
            const end = moment(e);

            while (start.isSameOrBefore(end)) {
              const d = start.format('YYYY-MM-DD');
              const dayName = getDayKeyFromMoment(start);

              if (availableDaysSet.has(dayName)) {
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
              const dayName = getDayKeyFromMoment(start);

              if (availableDaysSet.has(dayName)) {
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
      isSubmittingRef.current = false;
      setIsLoadding(false);
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
  }, [isVisible, selectedDateKey, availableDaysKey, editPrefillKey, type]);

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
  }, [availableDaysKey]);

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
  const roundedDistanceKm = useMemo(
    () => Math.round(Number(distance) || 0),
    [distance],
  );

  const startDateStr = localStartDate || null;
  const endDateStr = localEndDate || null;

  const isSingleDateSelected =
    !!startDateStr && (!endDateStr || startDateStr === endDateStr);
  const normalizedPricingType = String(data?.pricing?.type || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  const isPerHourPricing =
    normalizedPricingType === 'perhour' || normalizedPricingType === 'hourly';
  const isPerDayPricing =
    normalizedPricingType === 'perday' || normalizedPricingType === 'daily';
  const isPerEventPricing =
    normalizedPricingType === 'perevent' || normalizedPricingType === 'event';
  // Time pickers only for single-day bookings; multi-day ranges hide them
  const requiresTimeSelection = isSingleDateSelected;
  const chargedDays = Math.max(
    Number(availableSelectedDays || 0),
    startDateStr ? 1 : 0,
  );

  const calculatedPricing = useMemo(() => {
    const pricePerHour = Number(data?.pricing?.amount || 0);
    const pricePerKm = Number(data?.pricing?.pricePerKm || 0);
    const securityDeposit = Number(
      data?.paymentPolicy?.securityDeposit ?? data?.pricing?.securityFee ?? 500,
    );
    const extratimeCost = Number(data?.pricing?.extratimeCost || 0);

    const platformFeePercent = Number(
      data?.settings?.bookingItemPlatformFee ??
        data?.paymentPolicy?.platformFeePercent ??
        5,
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
      const tryFormats = TIME_PARSE_FORMATS;
      const s = moment(slot.startTime, tryFormats);
      const e = moment(slot.endTime, tryFormats);
      if (s.isValid() && e.isValid()) {
        vendorHoursPerDay = e.diff(s, 'hours', true);
      }
    }

    // For single-date selection, requested hours come from startTime/endTime
    let requestedHours = calcTotalHours;
    if (requiresTimeSelection && startTime && endTime) {
      const rangeHours = getTimeRangeHours(startDateStr, startTime, endTime);
      requestedHours = rangeHours > 0 ? rangeHours : 0;
    }

    let baseHours = calcTotalHours;
    let extraHours = 0;
    let extraTimeAmount = 0;
    let serviceCost = 0;

    if (isPerHourPricing) {
      // Base hours charged using vendorHoursPerDay (don't include extra hours in base)
      baseHours = isSingleDateSelected
        ? Math.min(requestedHours, vendorHoursPerDay || requestedHours)
        : calcTotalHours;

      extraHours = isSingleDateSelected
        ? Math.max(0, requestedHours - (vendorHoursPerDay || 0))
        : 0;

      // Extra time cost should use extratimeCost if provided, otherwise pricePerHour
      const perExtraHourRate = extratimeCost || pricePerHour;
      extraTimeAmount = extraHours * perExtraHourRate;
      serviceCost = baseHours * pricePerHour;
    } else if (isPerDayPricing || isPerEventPricing) {
      // Per day and per event are both charged by selected booking days.
      serviceCost = chargedDays * pricePerHour;
      baseHours = 0;
    } else {
      serviceCost = chargedDays * pricePerHour;
      baseHours = 0;
    }

    const travelCost = roundedDistanceKm * pricePerKm;

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
      platformFeePercent,
      pricingLabelDays: chargedDays,
      pricingTypeMode: isPerEventPricing
        ? 'perEvent'
        : isPerDayPricing
        ? 'perDay'
        : isPerHourPricing
        ? 'perHour'
        : 'other',
    };
  }, [
    calcTotalHours,
    roundedDistanceKm,
    isChecked,
    data,
    startDateStr,
    startTime,
    endTime,
    hoursPerDay,
    isSingleDateSelected,
    isPerHourPricing,
    isPerDayPricing,
    isPerEventPricing,
    requiresTimeSelection,
    chargedDays,
  ]);

  useEffect(() => {
    if (
      requiresTimeSelection &&
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
        ? normalizeToHour(
            moment(slot.startTime, TIME_PARSE_FORMATS)
              .set({
                year: selDate.year(),
                month: selDate.month(),
                date: selDate.date(),
              })
              .toDate(),
          )
        : null;

      const end = slot?.endTime
        ? normalizeToHour(
            moment(slot.endTime, TIME_PARSE_FORMATS)
              .set({
                year: selDate.year(),
                month: selDate.month(),
                date: selDate.date(),
              })
              .toDate(),
          )
        : null;

      setStartTime(start);
      setEndTime(end);
    }
  }, [data, requiresTimeSelection, startDateStr, referenceDate, startTime, endTime]);

  const validateTimeSelection = useCallback(() => {
    if (!requiresTimeSelection) {
      return true;
    }

    if (!startTime || !endTime) {
      modalRef.current?.show({
        status: 'error',
        message: t('pleaseSelectStartAndEndTime'),
      });
      return false;
    }

    const hoursDiff = getTimeRangeHours(startDateStr, startTime, endTime);

    if (hoursDiff <= 0) {
      modalRef.current?.show({
        status: 'error',
        message: t('endTimeMustBeAfterStartTime'),
      });
      return false;
    }

    if (hoursDiff < MIN_BOOKING_HOURS) {
      modalRef.current?.show({
        status: 'error',
        message: t('minimumBookingDurationOneHour'),
      });
      return false;
    }

    return true;
  }, [requiresTimeSelection, startTime, endTime, startDateStr, t]);

  const handleBooking = useCallback(async () => {
    if (isSubmittingRef.current) {
      return;
    }

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

    if (!validateTimeSelection()) {
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
      vendorId: data?.vendor?._id || data?.vendor || data?.vendorId,

      details: {
        startDate: startDateStr,
        endDate: endDateStr || startDateStr,

        startTime:
          startTime && requiresTimeSelection
            ? moment(startTime).format('HH:mm')
            : null,

        endTime:
          endTime && requiresTimeSelection
            ? moment(endTime).format('HH:mm')
            : null,

        eventLocation: selectedCoords?.userAddress,
        eventLatitude:
          selectedCoords?.latLng?.latitude || selectedCoords?.latLng?.lat || 0,
        eventLongitude:
          selectedCoords?.latLng?.longitude || selectedCoords?.latLng?.lng || 0,

        specialRequests: instructions || null,
        contactPreference: 'email',

        distanceKm: roundedDistanceKm,
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

          calculationDetails: isPerHourPricing
            ? `Standard pricing: ${calculatedPricing.totalHours} hours × ${formatEuro(calculatedPricing.pricePerHour)}/hour`
            : `Standard pricing: ${calculatedPricing.pricingLabelDays} days × ${formatEuro(calculatedPricing.pricePerHour)}`,

          breakdown: [
            {
              label: isPerHourPricing
                ? `Standard Service (${calculatedPricing.totalHours} hours)`
                : isPerEventPricing
                ? `Per Event (${calculatedPricing.pricingLabelDays} days)`
                : `Daily Service (${calculatedPricing.pricingLabelDays} day(s))`,
              amount: calculatedPricing.serviceCost,
              explanation: isPerHourPricing
                ? `${calculatedPricing.totalHours} hours × ${formatEuro(calculatedPricing.pricePerHour)}/hour`
                : `${calculatedPricing.pricingLabelDays} × ${formatEuro(calculatedPricing.pricePerHour)}`,
            },
            {
              label: `Extra Time Fee`,
              amount: calculatedPricing.extraTimeAmount,
              explanation: '',
            },
            {
              label: `Travel Cost (${roundedDistanceKm}km)`,
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
              label: `Platform Service Fee (${
                calculatedPricing.platformFeePercent
              }%)`,
              amount: calculatedPricing.platformFee,
              explanation: '',
            },
          ],

          validationErrors: [],
          requiresFullPayment: paymentRequirement?.type === 'FULL',

          paymentPolicy: data?.paymentPolicy,
          pricingType: data?.pricing?.type || 'per hour',
          numDays: calculatedPricing.pricingLabelDays,
          isSingleDate: isSingleDateSelected,
        },
      },
    };

    isSubmittingRef.current = true;
    setIsLoadding(true);

    try {

      console.log(payload,"payloadpayloadpayloadpayloadpayload");
      
      await handleSendBookingRequest(payload);
    } catch (error) {
      console.log(error, 'handleBooking error');
    } finally {
      isSubmittingRef.current = false;
      setIsLoadding(false);
    }
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
    requiresTimeSelection,
    isPerHourPricing,
    isPerEventPricing,
    availableSelectedDays,
    data,
    handleSendBookingRequest,
    validateTimeSelection,
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
      onSelectedDateChange?.(date, null);

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
        onSelectedDateChange?.(date, null);

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

      // Same date tapped again = still a single-day booking (keep times)
      if (date === localStartDate) {
        setLocalEndDate(date);
        onSelectedDateChange?.(localStartDate, date);
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

      // Multi-day range: clear time selection
      setStartTime(null);
      setEndTime(null);
      setShowStartPicker(false);
      setShowEndPicker(false);
      setLocalEndDate(date);
      setMarkedDates(updatedMarks);
      onSelectedDateChange?.(localStartDate, date);
      return;
    }

    if (localStartDate && localEndDate) {
      setLocalStartDate(date);
      setLocalEndDate(null);
      setStartTime(null);
      setEndTime(null);
      setShowStartPicker(false);
      setShowEndPicker(false);
      onSelectedDateChange?.(date, null);

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

  const getBookingStartMoment = (startDate, startTime) => {
    if (!startDate) {
      return null;
    }

    let bookingStart = moment(startDate, 'YYYY-MM-DD', true);
    if (!bookingStart.isValid()) {
      return null;
    }

    if (startTime) {
      const timePart = moment(startTime);
      if (timePart.isValid()) {
        return bookingStart
          .hour(timePart.hour())
          .minute(timePart.minute())
          .second(0)
          .millisecond(0);
      }
    }

    return bookingStart.startOf('day');
  };

  const getPaymentRequirement = ({
    startDate,
    startTime,
    totalAmount,
    now = moment(),
  }) => {
    const bookingStart = getBookingStartMoment(startDate, startTime);
    if (!bookingStart) {
      return null;
    }

    const hoursUntilBooking = bookingStart.diff(now, 'hours', true);

    const isBookingToday = bookingStart.isSame(now, 'day');
    const isWithinNext72Hours =
      hoursUntilBooking > 0 && hoursUntilBooking <= 72;

    if (!isBookingToday && isWithinNext72Hours) {
      return {
        type: 'FULL',
        title: t('fullPaymentRequiredTitle'),
        description: t('fullPaymentRequiredDescription', {
          amount: formatAmount(totalAmount),
        }),
        payableAmount: totalAmount,
      };
    }

    return {
      type: 'HALF',
      title: t('upfrontPaymentRequiredTitle'),
      description: t('upfrontPaymentRequiredDescription', {
        amount: formatAmount(totalAmount / 2),
      }),
      payableAmount: totalAmount / 2,
    };
  };

  const paymentRequirement = useMemo(() => {
    return getPaymentRequirement({
      startDate: startDateStr,
      startTime: requiresTimeSelection ? startTime : null,
      totalAmount: calculatedPricing.total,
    });
  }, [
    startDateStr,
    startTime,
    requiresTimeSelection,
    calculatedPricing.total,
    t,
  ]);

  const handleUpdateCart = async () => {
    if (!validateTimeSelection()) {
      return;
    }

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
          `ℹ️ Booking outside available hours (${slotStart}-${slotEnd}) will include an extra time fee of ${formatEuro(extraTimeCost)} (${calculatedPricing.extraHours} extra hours)`,
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
          startTime && requiresTimeSelection
            ? moment(startTime).format('HH:mm')
            : null,
        endTime:
          endTime && requiresTimeSelection
            ? moment(endTime).format('HH:mm')
            : null,
        specialRequests: instructions || '',
        distanceKm: roundedDistanceKm,
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

          calculationDetails: isPerHourPricing
            ? `Standard pricing: ${calculatedPricing.totalHours} hours × ${formatEuro(calculatedPricing.pricePerHour)}/hour`
            : `Standard pricing: ${calculatedPricing.pricingLabelDays} days × ${formatEuro(calculatedPricing.pricePerHour)}`,

          breakdown: [
            {
              label: isPerHourPricing
                ? `Standard Service (${calculatedPricing.totalHours} hours)`
                : isPerEventPricing
                ? `Per Event (${calculatedPricing.pricingLabelDays} days)`
                : `Daily Service (${calculatedPricing.pricingLabelDays} day(s))`,
              amount: baseAmount,
              explanation: isPerHourPricing
                ? `${calculatedPricing.totalHours} hours × ${formatEuro(calculatedPricing.pricePerHour)}/hour`
                : `${calculatedPricing.pricingLabelDays} × ${formatEuro(calculatedPricing.pricePerHour)}`,
            },
            {
              label: 'Extra Time Fee',
              amount: extraTimeCost,
              explanation: '',
            },
            {
              label: `Travel Cost (${roundedDistanceKm}km)`,
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
              label: `Platform Service Fee (${calculatedPricing.platformFeePercent}%)`,
              amount: platformFee,
              explanation: '',
            },
            {
              label: `Evenlyo Protect (${
                data?.paymentPolicy?.evenlyoProtectFeePercent || 0
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
          numDays: calculatedPricing.pricingLabelDays,
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
    if (!validateTimeSelection()) {
      return;
    }

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
      distance: roundedDistanceKm,
      paymentPolicy: data?.paymentPolicy,
      evenyloProtect: isChecked,
      startTime:
        startTime && requiresTimeSelection ? formatTime24(startTime) : null,
      endTime: endTime && requiresTimeSelection ? formatTime24(endTime) : null,
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
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  {localStartDate && (
                    <Text style={styles.dateValue}>
                      {moment(localStartDate).format('DD/MM/YYYY')}
                    </Text>
                  )}
                  {localEndDate && localEndDate !== localStartDate && (
                    <Text style={styles.dateValue}>
                      , {moment(localEndDate).format('DD/MM/YYYY')}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {requiresTimeSelection && (
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
                  ].map(({label, value, setter}, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dateInput, idx === 0 && {marginRight: 10}]}
                      onPress={() => setter(true)}>
                      <Text style={styles.dateInputText}>
                        {value ? formatTime24(value) : label}
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
                  date={getPickerTimeDate(startTime)}
                  mode="time"
                  is24hourSource
                  locale="nl"
                  minuteInterval={60}
                  onConfirm={date => {
                    setShowStartPicker(false);
                    const normalized = normalizeToHour(date);
                    if (endTime) {
                      const hoursDiff = getTimeRangeHours(
                        startDateStr,
                        normalized,
                        endTime,
                      );
                      if (hoursDiff <= 0) {
                        modalRef.current?.show({
                          status: 'error',
                          message: t('endTimeMustBeAfterStartTime'),
                        });
                        return;
                      }
                      if (hoursDiff < MIN_BOOKING_HOURS) {
                        modalRef.current?.show({
                          status: 'error',
                          message: t('minimumBookingDurationOneHour'),
                        });
                        return;
                      }
                    }
                    setStartTime(normalized);
                  }}
                  onCancel={() => setShowStartPicker(false)}
                />

                <DatePicker
                  modal
                  open={showEndPicker}
                  date={getPickerTimeDate(endTime)}
                  mode="time"
                  is24hourSource
                  locale="nl"
                  minuteInterval={60}
                  onConfirm={date => {
                    setShowEndPicker(false);
                    const normalized = normalizeToHour(date);
                    if (startTime) {
                      const hoursDiff = getTimeRangeHours(
                        startDateStr,
                        startTime,
                        normalized,
                      );
                      if (hoursDiff <= 0) {
                        modalRef.current?.show({
                          status: 'error',
                          message: t('endTimeMustBeAfterStartTime'),
                        });
                        return;
                      }
                      if (hoursDiff < MIN_BOOKING_HOURS) {
                        modalRef.current?.show({
                          status: 'error',
                          message: t('minimumBookingDurationOneHour'),
                        });
                        return;
                      }
                    }
                    setEndTime(normalized);
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
                value={String(roundedDistanceKm)}
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
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {data?.paymentPolicy?.isEvenlyoProtectEnabled && (
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
            )}

            <View style={styles.pricingSection}>
              <Text style={styles.pricingTitle}>{t('pricingSummary')}</Text>

              <View style={styles.pricingRow}>
                <View>
                  {isPerHourPricing ? (
                    <Text style={styles.pricingLabel}>
                      {t('standardServiceHours', {
                        hours: calculatedPricing.totalHours,
                      })}
                    </Text>
                  ) : isPerEventPricing ? (
                    <Text style={styles.pricingLabel}>
                      Per Event ({calculatedPricing.pricingLabelDays} day(s))
                    </Text>
                  ) : (
                    <Text style={styles.pricingLabel}>
                      Daily Service ({calculatedPricing.pricingLabelDays} day(s))
                    </Text>
                  )}
                  {isPerHourPricing ? (
                    <Text style={styles.pricingLabel}>
                      {t('standardServiceRate', {
                        hours: calculatedPricing.totalHours,
                        rate: formatPrice(calculatedPricing.pricePerHour),
                      })}
                    </Text>
                  ) : (
                    <Text style={styles.pricingLabel}>
                      {calculatedPricing.pricingLabelDays} day(s) x {formatEuro(calculatedPricing.pricePerHour)}/
                      {isPerEventPricing ? 'event' : 'day'}
                    </Text>
                  )}
                </View>
                <Text style={styles.pricingValue}>
                  {formatAmount(calculatedPricing.serviceCost)}
                </Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  {t('travelCostWithDistance', {distance: roundedDistanceKm})}
                </Text>
                <Text style={styles.pricingValue}>
                  {formatAmount(calculatedPricing.travelCost)}
                </Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  {t('securityDepositRefundable')}
                </Text>
                <Text style={styles.pricingValue}>
                  {formatAmount(calculatedPricing.securityDeposit)}
                </Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>{t('Subtotal')}</Text>
                <Text style={styles.pricingValue}>
                  {formatAmount(calculatedPricing.subTotal)}
                </Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  {t('platformServiceFeeWithPercent', {
                    percent: calculatedPricing.platformFeePercent,
                  })}
                </Text>
                <Text style={styles.pricingValue}>
                  {formatAmount(calculatedPricing.platformFee)}
                </Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  VAT ({calculatedPricing.vatPercent}%)
                </Text>
                <Text style={styles.pricingValue}>
                  {formatAmount(calculatedPricing.vatFee)}
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
                    {formatAmount(calculatedPricing.evenlyoProtect)}
                  </Text>
                </View>
              )}

              {isPerHourPricing && calculatedPricing.extraHours > 0 && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>
                    {t('extraTimeWithRate', {
                      hours: calculatedPricing.extraHours,
                      rate: formatPrice(
                        calculatedPricing.extratimeCost ||
                          calculatedPricing.pricePerHour,
                      ),
                    })}
                  </Text>
                  <Text style={styles.pricingValue}>
                    {formatAmount(calculatedPricing.extraTimeAmount)}
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
                <Text style={styles.totalLabel}>{t('totalLabel')}</Text>
                <Text style={styles.totalValue}>
                  {formatAmount(calculatedPricing.total)}
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
                  <Text style={styles.termsText}>
                    {t('acceptCompanyPrefix')}
                  </Text>
                  <TouchableOpacity
                    style={styles.termsLink}
                    onPress={openTermsModal}>
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

              <View
                style={{width: width(50), opacity: isLoadding ? 0.6 : 1}}
                pointerEvents={isLoadding ? 'none' : 'auto'}>
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

        {showTermsModal && (
          <View style={styles.termsModalOverlay}>
            <View style={styles.termsModalContainer}>
              <View style={styles.termsModalHeader}>
                <Text style={styles.termsModalTitle}>
                  {t('termsAndConditions')}
                </Text>
                <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                  <Icon name="close" size={20} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.termsModalContent}>
                <Text style={styles.termsBodyText}>
                  {currentLanguage === 'nl'
                    ? TERMS_AND_CONDITIONS_TEXT.nl
                    : TERMS_AND_CONDITIONS_TEXT.en}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>
      <CommonAlert ref={modalRef} />
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

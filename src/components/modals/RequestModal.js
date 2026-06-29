import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {
  Image,
  InteractionManager,
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
import {useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS, IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {addItem} from '../../redux/slice/offers';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import DateRangePicker from '../customDatePicker';
import GradientText from '../gradiantText';
import Loader from '../loder';
import GooglePlacesInput from '../locationField';
import {formatEuro} from '../../utils';

const NESTED_MODAL_DISMISS_MS = 480;

const NewRequestModal = ({
  isVisible,
  onClose,
  type,
  navigation,
  selectedListing,
  editingItem,
  settingsData,
}) => {
  const {t} = useTranslation();
  const modalRef = useRef(null);
  const dispatch = useDispatch();
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [geocodedListingCoords, setGeocodedListingCoords] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [singleDay, setSingleDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [specialRequest, setSpecialRequest] = useState('');
  const [includeSecurityFee, setIncludeSecurityFee] = useState(true);
  const [offerAmount, setOfferAmount] = useState('');
  const [priceError, setPriceError] = useState('');
  const [showOfferInfoModal, setShowOfferInfoModal] = useState(false);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyC6ekBoPRfJYPUFXwSD6J_vZKrmmlzuT3c';

  const normalizeCoords = coords => {
    if (!coords) return null;

    // Support GeoJSON-style coordinates: [lng, lat]
    if (Array.isArray(coords) && coords.length >= 2) {
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {latitude: lat, longitude: lng};
      }
      return null;
    }

    if (coords.latitude !== undefined && coords.longitude !== undefined) {
      const lat = Number(coords.latitude);
      const lng = Number(coords.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {latitude: lat, longitude: lng};
      }
    }

    if (coords.lat !== undefined && coords.lng !== undefined) {
      const lat = Number(coords.lat);
      const lng = Number(coords.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {latitude: lat, longitude: lng};
      }
    }

    if (coords.latLng) {
      return normalizeCoords(coords.latLng);
    }

    return null;
  };

  const resolveEventCoords = selected => {
    if (!selected) return null;
    return normalizeCoords(selected.latLng ?? selected);
  };

  const resolveListingCoords = listing => {
    if (!listing) return null;

    const location = listing.location || {};
    const locationCoordinates = location.coordinates;

    const candidates = [
      locationCoordinates,
      locationCoordinates?.coordinates,
      location,
      listing.coordinates,
      listing.latLng,
      listing.latitude != null && listing.longitude != null
        ? {latitude: listing.latitude, longitude: listing.longitude}
        : null,
      listing.eventLatitude != null && listing.eventLongitude != null
        ? {latitude: listing.eventLatitude, longitude: listing.eventLongitude}
        : null,
    ];

    for (const candidate of candidates) {
      const normalized = normalizeCoords(candidate);
      if (normalized) {
        return normalized;
      }
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

  const listingCoords =
    resolveListingCoords(selectedListing) || geocodedListingCoords;
  console.log(listingCoords, 'listingCoordslistingCoordslistingCoords');

  const distanceToSelectedListingKm = React.useMemo(() => {
    const eventCoords = resolveEventCoords(selectedCoords);
    if (!eventCoords || !listingCoords) return null;
    return distanceBetweenCoordsKm(eventCoords, listingCoords);
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

  const baseRate = Number(selectedListing?.pricing?.amount || 0);
  const extraHourlyRate = Number(selectedListing?.pricing?.extratimeCost || 0);

  const normalizedPricingType = String(selectedListing?.pricing?.type || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  const isPerHourPricing =
    normalizedPricingType === 'perhour' || normalizedPricingType === 'hourly';
  const isPerDayPricing =
    normalizedPricingType === 'perday' || normalizedPricingType === 'daily';
  const isPerEventPricing =
    normalizedPricingType === 'perevent' || normalizedPricingType === 'event';
  const isFixedPricing =
    normalizedPricingType === 'fixed' ||
    normalizedPricingType === 'fixedprice' ||
    normalizedPricingType === 'onetime';

  const chargedDays = Math.max(selectedDaysCount, 0);

  let discountBasePrice = 0;
  let totalExtraCost = 0;

  if (isPerHourPricing) {
    const vendorHours = availableHoursPerDay || requestedHoursPerDay;

    if (singleDay || chargedDays <= 1) {
      const baseHours = Math.min(
        requestedHoursPerDay,
        vendorHours || requestedHoursPerDay,
      );
      const extraHours = Math.max(
        0,
        requestedHoursPerDay - (availableHoursPerDay || 0),
      );
      const perExtraHourRate = extraHourlyRate || baseRate;

      discountBasePrice = baseHours * baseRate;
      totalExtraCost = extraHours * perExtraHourRate;
    } else {
      discountBasePrice = requestedHoursPerDay * chargedDays * baseRate;
      totalExtraCost = 0;
    }
  } else if (isPerDayPricing || isPerEventPricing) {
    discountBasePrice = chargedDays * baseRate;
    totalExtraCost = 0;
  } else if (isFixedPricing) {
    discountBasePrice = baseRate;
    totalExtraCost = 0;
  } else {
    discountBasePrice = chargedDays * baseRate;
    totalExtraCost = 0;
  }

  const distanceCost =
    distanceToSelectedListingKm != null
      ? distanceToSelectedListingKm *
        (selectedListing?.pricing?.pricePerKm || 0)
      : 0;

  const securityFee = Number(
    selectedListing?.pricing?.securityFee ||
      selectedListing?.paymentPolicy?.securityDeposit ||
      0,
  );

  const parsePercent = value => {
    if (value === null || value === undefined) return 0;
    const numeric = Number(String(value).replace('%', '').trim());
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const bookingItemPlatformFee = parsePercent(
    settingsData?.bookingItemPlatformFee ||
      selectedListing?.paymentPolicy?.platformFeePercent ||
      11,
  );
  const bookingVatFeePercent = parsePercent(
    settingsData?.vat ||
      settingsData?.bookingVatFee ||
      settingsData?.vatFee ||
      settingsData?.vatPercentage ||
      settingsData?.vatPercent ||
      19,
  );

  const enteredOfferAmount = Number(offerAmount || 0);
  const hasEnteredOffer =
    offerAmount?.trim() !== '' && Number.isFinite(enteredOfferAmount);
  const safeOfferAmount =
    hasEnteredOffer && enteredOfferAmount >= 0 ? enteredOfferAmount : 0;
  const platformFee =
    hasEnteredOffer && safeOfferAmount > 0
      ? (safeOfferAmount * bookingItemPlatformFee) / 100
      : 0;
  const vatFee =
    hasEnteredOffer && safeOfferAmount > 0
      ? (safeOfferAmount * bookingVatFeePercent) / 100
      : 0;
  const conditionalSecurityFee = includeSecurityFee ? securityFee : 0;
  const appliedSecurityFee = hasEnteredOffer ? conditionalSecurityFee : 0;
  const systemCalculatedOfferPrice = Number(discountBasePrice.toFixed(2));
  const normalizedDistanceCost = Number(distanceCost.toFixed(2));
  const normalizedExtraTimeCost = Number(totalExtraCost.toFixed(2));
  const roundedDistanceKm =
    distanceToSelectedListingKm != null
      ? Math.round(distanceToSelectedListingKm)
      : null;
  const calculatedPricingTotal = Number(
    (
      systemCalculatedOfferPrice +
      normalizedDistanceCost +
      normalizedExtraTimeCost
    ).toFixed(2),
  );
  const grandTotal =
    (hasEnteredOffer ? safeOfferAmount : 0) +
    platformFee +
    vatFee +
    appliedSecurityFee;
  const discountPercent =
    discountBasePrice > 0
      ? Math.max(
          0,
          Math.round(
            ((discountBasePrice - safeOfferAmount) / discountBasePrice) * 100,
          ),
        )
      : 0;

  const isDateTimeSelected = Boolean(startDate && endDate);

  const validateDateTime = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedStartDate = new Date(startDate);
    selectedStartDate.setHours(0, 0, 0, 0);

    if (selectedStartDate < today) {
      modalRef.current?.show({
        status: 'error',
        message: t('Start date cannot be in the past'),
      });
      return false;
    }

    if (!singleDay && endDate < startDate) {
      modalRef.current?.show({
        status: 'error',
        message: t('End date must be later than start date'),
      });
      return false;
    }

    return true;
  };

  const calculateDiscount = () => discountPercent;

  const sanitizeBreakdown = (breakdown = [], shouldIncludeSecurityFee = true) =>
    (breakdown || []).filter(
      row =>
        shouldIncludeSecurityFee ||
        !String(row?.label || '')
          .toLowerCase()
          .includes('security'),
    );

  const calculateOfferFees = (offerPrice, listing, offerSettings) => {
    const platformFeePercent = parsePercent(
      offerSettings?.bookingItemPlatformFee ||
        listing?.paymentPolicy?.platformFeePercent ||
        5,
    );
    const vatFeePercent = parsePercent(
      offerSettings?.vat ||
        offerSettings?.bookingVatFee ||
        offerSettings?.vatFee ||
        offerSettings?.vatPercentage ||
        offerSettings?.vatPercent ||
        0,
    );
    const platformFee = (offerPrice * platformFeePercent) / 100;
    const vatFee = (offerPrice * vatFeePercent) / 100;

    return {
      platformFeePercent,
      vatFeePercent,
      platformFee: Number(platformFee.toFixed(2)),
      vatFee: Number(vatFee.toFixed(2)),
      evenlyoProtectFee: 0,
    };
  };

  useEffect(() => {
    if (isVisible) {
      setSingleDay(false);
      setStartDate(new Date());
      setEndDate(new Date());
      setSelectedCoords(null);
      setGeocodedListingCoords(null);
      setSpecialRequest('');
      setIncludeSecurityFee(true);
      setOfferAmount('');
      setPriceError('');
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !selectedListing) {
      setGeocodedListingCoords(null);
      return;
    }

    const directCoords = resolveListingCoords(selectedListing);
    if (directCoords) {
      setGeocodedListingCoords(null);
      return;
    }

    const listingAddress =
      selectedListing?.location?.userAddress ||
      selectedListing?.location?.fullAddress ||
      selectedListing?.location?.address;

    if (!listingAddress?.trim()) {
      setGeocodedListingCoords(null);
      return;
    }

    let cancelled = false;

    const geocodeListingAddress = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            listingAddress.trim(),
          )}&key=${GOOGLE_MAPS_API_KEY}`,
        );
        const json = await response.json();
        const location = json?.results?.[0]?.geometry?.location;
        if (cancelled || !location) {
          return;
        }

        const normalized = normalizeCoords({
          latitude: location.lat,
          longitude: location.lng,
        });
        if (normalized) {
          setGeocodedListingCoords(normalized);
        }
      } catch (error) {
        console.log('Listing geocode error:', error);
      }
    };

    geocodeListingAddress();

    return () => {
      cancelled = true;
    };
  }, [isVisible, selectedListing]);

  useEffect(() => {
    if (!isVisible || !editingItem) return;

    const parsedStart = editingItem?.startDate
      ? new Date(editingItem.startDate)
      : new Date();
    const parsedEnd = editingItem?.endDate
      ? new Date(editingItem.endDate)
      : parsedStart;

    setSingleDay(
      Boolean(editingItem?.startDate && editingItem?.endDate) &&
        editingItem?.startDate === editingItem?.endDate,
    );
    setStartDate(parsedStart);
    setEndDate(parsedEnd);
    setSelectedCoords({
      userAddress: editingItem?.eventLocation || '',
      latLng: normalizeCoords(editingItem?.locationData?.latLng),
    });
    setSpecialRequest(editingItem?.specialRequest || '');
    setIncludeSecurityFee(Number(editingItem?.securityFee || 0) > 0);
    setOfferAmount(
      editingItem?.discountedPrice !== undefined
        ? String(editingItem.discountedPrice)
        : '',
    );
    setPriceError('');
  }, [isVisible, editingItem]);

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
    setGeocodedListingCoords(null);
    setSpecialRequest('');
    setIncludeSecurityFee(true);
    setOfferAmount('');
    setPriceError('');
  };

  const closeRequestModal = () => {
    resetForm();
    onClose?.();
  };

  const handleCancel = () => {
    closeRequestModal();
  };

  const closeAfterSuccessAlert = () => {
    resetForm();
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        onClose?.();
      }, NESTED_MODAL_DISMISS_MS);
    });
  };

  const handleAddItem = () => {
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

    const normalizedCoords = resolveEventCoords(selectedCoords);
    if (!normalizedCoords) {
      modalRef.current?.show({
        status: 'error',
        message: t(
          'Please select a valid location from search or use the location icon.',
        ),
      });
      return;
    }

    const resolvedListingCoords = listingCoords;
    const submitDistanceKm = distanceBetweenCoordsKm(
      normalizedCoords,
      resolvedListingCoords,
    );

    if (selectedListing?.quantity <= 0) {
      modalRef.current?.show({
        status: 'error',
        message: t('This item is out of stock and cannot be booked.'),
      });
      return;
    }

    if (!isDateTimeSelected) {
      modalRef.current?.show({
        status: 'error',
        message: t('Please fill in all date and time fields'),
      });
      return;
    }

    if (!validateDateTime()) {
      return;
    }

    if (
      !resolvedListingCoords ||
      submitDistanceKm == null ||
      Number.isNaN(submitDistanceKm) ||
      submitDistanceKm < 0
    ) {
      modalRef.current?.show({
        status: 'error',
        message: t(
          resolvedListingCoords
            ? 'Distance must be calculated. Please select a valid event location.'
            : 'This listing has no service location configured. Please update the listing location first.',
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

    if (!hasEnteredOffer || safeOfferAmount <= 0) {
      modalRef.current?.show({
        status: 'error',
        message: t('Please enter your offer price'),
      });
      return;
    }

    const offerPrice = Number(safeOfferAmount.toFixed(2));
    const finalSecurityFee = includeSecurityFee
      ? selectedListing?.pricing?.securityFee || 0
      : 0;
    const pricingBreakdown = {
      baseAmount: Number(discountBasePrice.toFixed(2)),
      extraTimeCost: Number(totalExtraCost.toFixed(2)),
      distanceCost: Number(distanceCost.toFixed(2)),
      subtotal: offerPrice,
      total: Number(grandTotal.toFixed(2)),
      pricingType: selectedListing?.pricing?.type || 'perhour',
      paymentPolicy:
        selectedListing?.paymentPolicy || selectedListing?.subCategory,
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
          label: `Travel Cost (${Number(submitDistanceKm || 0).toFixed(2)}km)`,
          amount: Number(distanceCost.toFixed(2)),
          explanation: '',
        },
        {
          label: 'Security Deposit(Refundable)',
          amount: Number(finalSecurityFee.toFixed(2)),
          explanation: '',
        },
        {
          label: `Platform Service Fee (${bookingItemPlatformFee}%)`,
          amount: Number(platformFee.toFixed(2)),
          explanation: '',
        },
        {
          label: `VAT Fee (${bookingVatFeePercent}%)`,
          amount: Number(vatFee.toFixed(2)),
          explanation: '',
        },
      ],
      validationErrors: [],
      numDays: selectedDaysCount,
      isSingleDate: singleDay,
    };

    const finalBreakdown = sanitizeBreakdown(
      pricingBreakdown.breakdown,
      includeSecurityFee && finalSecurityFee > 0,
    );
    const offerFees = calculateOfferFees(
      offerPrice,
      selectedListing,
      settingsData || {bookingItemPlatformFee: 5},
    );
    const payloadTotal = Number(
      (
        offerPrice +
        finalSecurityFee +
        offerFees.platformFee +
        offerFees.vatFee
      ).toFixed(2),
    );

    const finalItem = {
      ...selectedListing,
      id: selectedListing?._id || selectedListing?.id,
      type: 'booking',
      discount: calculateDiscount(),
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(singleDay ? startDate : endDate).format('YYYY-MM-DD'),
      startTime: moment(startDate).format('HH:mm'),
      endTime: moment(endDate).format('HH:mm'),
      eventLocation: selectedCoords?.userAddress?.trim(),
      locationData: {
        ...selectedCoords,
        latLng: normalizedCoords,
      },
      distanceKm: Number(submitDistanceKm) || 0,
      total: payloadTotal,
      basePrice: pricingBreakdown.baseAmount,
      extraTimeCost: pricingBreakdown.extraTimeCost,
      distanceCost: pricingBreakdown.distanceCost,
      unit: selectedListing?.pricing?.type || 'perday',
      specialRequest: specialRequest.trim(),
      discountedPrice: offerPrice,
      securityFee: finalSecurityFee,
      offerPrice: Number((offerPrice + finalSecurityFee).toFixed(2)),
      pricingBreakdown: {
        ...pricingBreakdown,
        breakdown: finalBreakdown,
        securityFee: finalSecurityFee,
        platformFeePercent: offerFees.platformFeePercent,
        vatFeePercent: offerFees.vatFeePercent,
        platformFee: offerFees.platformFee,
        vatFee: offerFees.vatFee,
        evenlyoProtectFee: offerFees.evenlyoProtectFee,
        offerPrice: Number((offerPrice + finalSecurityFee).toFixed(2)),
        total: payloadTotal,
      },
      totalWithoutDiscount: 0,
      paymentPolicy: pricingBreakdown.paymentPolicy,
      uniqueId: editingItem?.uniqueId,
    };

    dispatch(addItem(finalItem));
    modalRef.current?.show({
      status: 'ok',
      message: t('Item added to offer!'),
      handlePressOk: closeAfterSuccessAlert,
    });
  };

  const handleOfferAmountChange = value => {
    const cleaned = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const numeric =
      parts.length > 1
        ? `${parts[0]}.${parts.slice(1).join('').slice(0, 2)}`
        : parts[0];
    setPriceError('');
    setOfferAmount(numeric);
  };

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
                {t('Pricing Information')}
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
                {t('Pricing Type')} :{' '}
                {(selectedListing?.pricing?.type || 'N/A').toLowerCase()}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.textLight,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                {t('Base Rate')}:{' '}
                {formatEuro(selectedListing?.pricing?.amount || 0)}{' '}
                {selectedListing?.pricing?.type === 'perhour'
                  ? t('per hour')
                  : selectedListing?.pricing?.type}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.red,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                {t('Extra Time Cost')}:{' '}
                {formatEuro(selectedListing?.pricing?.extratimeCost || 0)}{' '}
                {t('per hour beyond scheduled time')}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.navyBlue,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                {t('Distance Cost')}:{' '}
                {formatEuro(selectedListing?.pricing?.pricePerKm || 0)} /
                {t('km per km from vendor location')}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.green,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                {t('Stock Available')}:{' '}
                {Number(selectedListing?.quantity || 0) > 0
                  ? selectedListing?.quantity
                  : t('outOfStock')}
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
                {t('Scheduled Date & Time')}
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
                {t('Availability')}:
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.navyBlue,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                {t('Time Slots')}:{' '}
                {selectedListing?.availability?.availableTimeSlots[0]
                  ?.startTime || t('N/A')}{' '}
                -{' '}
                {selectedListing?.availability?.availableTimeSlots[0]
                  ?.endTime || t('N/A')}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.navyBlue,
                  fontFamily: fontFamly.PlusJakartaSansBold,
                }}>
                {t('Time Slots')}:{' '}
                {selectedListing?.availability?.availableDays
                  ?.map(day => day.toUpperCase())
                  .join(', ') || t('N/A')}
              </Text>
              {distanceToSelectedListingKm != null && (
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.navyBlue,
                    fontFamily: fontFamly.PlusJakartaSansBold,
                  }}>
                  {t('Distance to selected location')}:{' '}
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
                placeholder={t('Enter Location')}
                bgcolor={COLORS.white}
                showRightIcon={ICONS.locationIcon}
                lable={t('Add Location *')}
              />
              {selectedCoords?.userAddress && roundedDistanceKm != null && (
                <View style={styles.distanceCalculatedRow}>
                  <Icon
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.green}
                  />
                  <Text style={styles.distanceCalculatedText}>
                    {t('distanceCalculated', {km: roundedDistanceKm})}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.pricingCard}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitleIcon}>€</Text>
              <Text style={styles.sectionTitleText}>
                {t('Pricing Breakdown')}
              </Text>
            </View>

            <View style={styles.offerLabelRow}>
              <Text style={styles.offerInputLabel}>
                {t('Your Offer Price (€)')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowOfferInfoModal(true)}>
                <Icon
                  name="information-circle-outline"
                  size={17}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              value={offerAmount}
              onChangeText={handleOfferAmountChange}
              keyboardType="decimal-pad"
              placeholder={t('Enter your offer price')}
              placeholderTextColor={COLORS.textLight}
              style={styles.offerInput}
            />
            {!!priceError && <Text style={styles.errorText}>{priceError}</Text>}

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
              <Icon
                name="shield-outline"
                size={15}
                color={COLORS.primary}
                style={{marginRight: 6}}
              />
              <Text style={styles.checkboxLabel}>
                {t('Include Security Fee')} (
                {formatEuro(securityFee || 0, {space: false})})
              </Text>
            </TouchableOpacity>

            <View style={styles.feeContainer}>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>
                  {t('Security Fee')} (
                  {includeSecurityFee ? t('Included') : t('Excluded')})
                </Text>
                <Text style={styles.feeAmount}>
                  +{formatEuro(appliedSecurityFee, {space: false})}
                </Text>
              </View>
              {platformFee > 0 && (
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>
                    {t('Platform Fee')} ({bookingItemPlatformFee}%)
                  </Text>
                  <Text style={styles.feeAmount}>
                    +{formatEuro(platformFee, {space: false})}
                  </Text>
                </View>
              )}
              {vatFee > 0 && (
                <View style={[styles.feeRow, {borderBottomWidth: 0}]}>
                  <Text style={styles.feeLabel}>
                    {t('VAT Fee')} ({bookingVatFeePercent}%)
                  </Text>
                  <Text style={styles.feeAmount}>
                    +{formatEuro(vatFee, {space: false})}
                  </Text>
                </View>
              )}
            </View>

            {hasEnteredOffer && safeOfferAmount > 0 && (
              <View style={styles.finalTotalInfoBox}>
                <View style={styles.finalTotalRow}>
                  <Text style={styles.finalTotalHeading}>
                    {t('Final Total')}:
                  </Text>
                  <Text style={styles.finalTotalAmount}>
                    {formatEuro(grandTotal, {space: false})}
                  </Text>
                </View>
                <Text style={styles.finalTotalDescription}>
                  {t('finalTotalDescription')}
                </Text>
              </View>
            )}

            {extraHoursPerDay > 0 && isPerHourPricing && (
              <View style={styles.extraTimeInfoBox}>
                <Text style={styles.extraTimeInfoText}>
                  {t('bookingOutsideHoursExtraFee', {
                    start:
                      selectedListing?.availability?.availableTimeSlots?.[0]
                        ?.startTime || t('N/A'),
                    end:
                      selectedListing?.availability?.availableTimeSlots?.[0]
                        ?.endTime || t('N/A'),
                    amount: formatEuro(totalExtraCost),
                  })}
                </Text>
              </View>
            )}
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
              {t('Special Request (optional)')}
            </Text>
            <TextInput
              value={specialRequest}
              onChangeText={setSpecialRequest}
              placeholder={t('Enter special request (optional)')}
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
                  <GradientText text={t('Reject Offer')} />
                </TouchableOpacity>
                <View style={{width: width(50)}}>
                  <GradientButton
                    styleContainer={{height: width(12.5)}}
                    text={t('Accept Offer')}
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
                <GradientText text={t('Cancel')} />
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
      <Modal
        isVisible={showOfferInfoModal}
        onBackdropPress={() => setShowOfferInfoModal(false)}
        style={styles.infoModalWrap}
        backdropOpacity={0.4}>
        <View style={styles.infoModalCard}>
          <Text style={styles.infoModalTitle}>
            {t('Calculated pricing details')}
          </Text>

          <View style={styles.infoModalRow}>
            <Text style={styles.infoModalLabel}>
              {t('Calculated offer price')}
            </Text>
            <Text style={styles.infoModalValue}>
              {formatEuro(systemCalculatedOfferPrice, {space: false})}
            </Text>
          </View>

          {normalizedDistanceCost > 0 && roundedDistanceKm != null && (
            <View style={styles.infoModalRow}>
              <Text
                style={[styles.infoModalLabel, styles.infoModalDistanceLabel]}>
                {t('distanceCostWithKm', {km: roundedDistanceKm})}
              </Text>
              <Text
                style={[styles.infoModalValue, styles.infoModalDistanceValue]}>
                +{formatEuro(normalizedDistanceCost, {space: false})}
              </Text>
            </View>
          )}

          {normalizedExtraTimeCost > 0 && (
            <View style={styles.infoModalRow}>
              <Text
                style={[styles.infoModalLabel, styles.infoModalExtraTimeLabel]}>
                {t('Extra Time Cost')}
              </Text>
              <Text
                style={[styles.infoModalValue, styles.infoModalExtraTimeValue]}>
                +{formatEuro(normalizedExtraTimeCost, {space: false})}
              </Text>
            </View>
          )}

          <View style={[styles.infoModalRow, styles.infoModalTotalRow]}>
            <Text style={styles.infoModalTotalLabel}>
              {t('Calculated Total')}
            </Text>
            <Text style={styles.infoModalTotalValue}>
              {formatEuro(calculatedPricingTotal, {space: false})}
            </Text>
          </View>
        </View>
      </Modal>
      <CommonAlert ref={modalRef} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {margin: 0, justifyContent: 'flex-end', backgroundColor: '#8b8b8b66'},
  container: {
    height: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#F8F8FA',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
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
    paddingBottom: 14,
    borderBottomColor: '#ECECF2',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 19,
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
  pricingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginVertical: width(2),
    padding: width(3),
    borderWidth: 1,
    borderColor: '#ECECF2',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: width(2),
  },
  sectionTitleIcon: {
    fontSize: 24,
    lineHeight: 26,
    marginRight: 8,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.primary,
  },
  sectionTitleText: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#1F2937',
  },
  offerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  offerInputLabel: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: '#111827',
  },
  offerInput: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
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
    marginTop: width(2.2),
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
    fontSize: 13,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  feeContainer: {
    marginTop: width(2),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFB',
    paddingHorizontal: 10,
  },
  feeRow: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECF2',
  },
  feeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: fontFamly.PlusJakartaSansMedium,
    flex: 1,
    paddingRight: 10,
  },
  feeAmount: {
    fontSize: 32 / 2,
    color: '#2C2C2C',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  finalTotalInfoBox: {
    marginTop: width(2),
    borderRadius: 12,
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#B7E4C8',
    padding: 12,
  },
  finalTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  finalTotalHeading: {
    fontSize: 16,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  finalTotalAmount: {
    fontSize: 34 / 2,
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
    backgroundColor: COLORS.white,
    padding: 10,
  },
  extraTimeInfoText: {
    fontSize: 10,
    color: COLORS.navyBlue,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    lineHeight: 15,
  },
  distanceCalculatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(2),
  },
  distanceCalculatedText: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.green,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  infoModalWrap: {
    justifyContent: 'center',
    marginHorizontal: width(5),
  },
  infoModalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F4BCD8',
    padding: 14,
  },
  infoModalTitle: {
    fontSize: 22 / 2,
    color: '#111827',
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: 8,
  },
  infoModalRow: {
    minHeight: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECF2',
  },
  infoModalLabel: {
    fontSize: 24 / 2,
    color: '#32363F',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  infoModalValue: {
    fontSize: 24 / 2,
    color: '#32363F',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  infoModalDistanceLabel: {
    color: '#7C3AED',
  },
  infoModalDistanceValue: {
    color: '#7C3AED',
  },
  infoModalExtraTimeLabel: {
    color: '#FF5B00',
  },
  infoModalExtraTimeValue: {
    color: '#FF5B00',
  },
  infoModalTotalRow: {
    borderBottomWidth: 0,
    marginTop: 2,
  },
  infoModalTotalLabel: {
    fontSize: 14,
    color: '#111827',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  infoModalTotalValue: {
    fontSize: 15,
    color: '#111827',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

export default NewRequestModal;

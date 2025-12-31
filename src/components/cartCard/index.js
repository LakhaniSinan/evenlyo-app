import React from 'react';
import {Image, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import moment from 'moment';

const CartCard = ({
  item,
  type = 'requested',
  onBookNow,
  onRemoveItemFromCart,
}) => {
  const {t, currentLanguage} = useTranslation();
  let title = item?.listingId?.title || item?.listingDetails?.title;
  title = currentLanguage == 'en' ? title?.en : title.nl;

  return (
    <View
      style={{
        backgroundColor: '#F6F6F6',
        marginBottom: width(2),
        marginHorizontal: width(3),
        borderRadius: width(3),
        padding: width(2),
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              height: width(5),
              width: width(5),
              borderWidth: 1,
              borderColor: COLORS.primary,
              marginRight: width(2),
              borderRadius: width(1),
            }}></View>
          <View
            style={{
              height: width(20),
              width: width(20),
              borderRadius: width(3),
              backgroundColor: COLORS.white,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              style={{height: '80%', width: '80%'}}
              source={{
                uri:
                  item.listingDetails?.featuredImage ||
                  item?.listingId?.images[0],
              }}
              resizeMode="contain"
            />
          </View>
        </View>
        <View
          style={{
            // height: width(20),
            width: width(60),
            marginLeft: width(2),
          }}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 15,
              color: COLORS.black,
            }}>
            {title}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.textLight,
              }}>
              Active
            </Text>
            <Image
              style={{
                height: width(4),
                width: width(4),
                marginTop: 1,
                marginLeft: 1,
              }}
              source={ICONS.verifyedIcon}
              resizeMode="contain"
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: width(3),
            }}>
            <View
              style={{
                height: width(8),
                width: width(8),
                marginRight: width(2),
                borderRadius: width(100),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.white,
              }}>
              <Image
                style={{
                  height: width(5),
                  width: width(5),
                  marginTop: 1,
                  marginLeft: 1,
                }}
                source={ICONS.personalIcon}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                fontSize: 12,
                color: COLORS.textLight,
              }}>
              {item?.listingId?.vendor?.fullName || item?.vendorId?.fullName}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.textLight,
            }}>
            Start Date: {moment(item?.details?.startDate).format('MM/DD/YYYY')}
          </Text>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.textLight,
            }}>
            End Date: {moment(item?.details?.endDate).format('MM/DD/YYYY')}
          </Text>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.textLight,
            }}>
            Time {item?.details?.startTime}
          </Text>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 12,
              color: COLORS.textLight,
            }}>
            {item?.details?.eventLocation || item?.vendorId?.fullName}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CartCard;

const asad = {
  details: {
    duration: {
      hours: 8,
      days: 1,
      totalHours: 8,
      isMultiDay: false,
    },
    specialRequests: {
      en: 'asda',
      nl: 'asda',
    },
    startDate: '2025-12-30T00:00:00.000Z',
    endDate: '2025-12-30T00:00:00.000Z',
    startTime: '09:00',
    endTime: '17:00',
    eventLocation: 'Lahore City, Pakistan',
    schedule: [],
    contactPreference: 'email',
  },
  cancellationDetails: {
    refundAmount: 0,
  },
  claimDetails: {
    status: 'pending',
    amount: 0,
    stockUpdated: false,
  },
  _id: '6948ec459259692de7cc4005',
  userId: '69131c49ac4721065935afca',
  vendorId: {
    _id: '6911b7d4e8478c7b209eb558',
    firstName: 'Hammad',
    lastName: 'Abbasi',
    fullName: 'Hammad Abbasi',
    id: '6911b7d4e8478c7b209eb558',
  },
  listingId: '6926f83f5c1d49ce48b400c6',
  listingDetails: {
    title: {
      en: 'New Secure listingss en',
      nl: 'New Secure listing nl',
    },
    subtitle: {
      en: 'New Secure listingss en',
      nl: 'New Secure listing nl',
    },
    description: {
      en: 'New Secure listing en',
      nl: 'New Secure listing nl',
    },
    featuredImage:
      'https://res.cloudinary.com/dv0imczul/image/upload/v1764159791/pxlhpesriobg3jfjd7pf.png',
    images: [
      'https://res.cloudinary.com/dv0imczul/image/upload/v1764159791/pxlhpesriobg3jfjd7pf.png',
    ],
    pricing: {
      type: 'per hour',
      amount: 600,
      extratimeCost: 500,
      securityFee: 500,
      pricePerKm: 500,
      days: 1,
    },
    category: {
      _id: '68943d2ca1a765a1f78a635b',
      name: {
        en: 'Decoration & Styling',
        nl: 'Decoration & Styling',
      },
    },
    subCategory: {
      _id: '692457736f7216eb2150f682',
      name: {
        en: 'Apple Pie en',
        nl: 'Apple Pie nl',
      },
    },
    serviceDetails: {
      serviceType: 'human',
    },
    features: [],
    rating: {
      average: 0,
      totalReviews: 0,
    },
  },
  status: 'accepted',
  paymentStatus: 'pending',
  rejectionReason: '',
  pricingBreakdown: {
    baseAmount: 600,
    extraTimeCost: 0,
    distanceCost: 238500,
    securityFee: 500,
    subtotal: 239600,
    platformFee: 11980,
    evenyloProtectFee: 4792,
    upfrontFee: 5127.44,
    total: 256372,
    calculationDetails: 'Standard pricing: 1 day at $600 per day',
    breakdown: [
      {
        label: 'Standard Service (1 day)',
        amount: 600,
        explanation: '1 day × $600/day',
      },
      {
        label: 'Travel Cost (477km)',
        amount: 238500,
        explanation: '',
      },
      {
        label: 'Security Deposit(Refundable)',
        amount: 500,
        explanation: '',
      },
      {
        label: 'Platform Service Fee (5%)',
        amount: 11980,
        explanation: '',
      },
      {
        label: 'Evenlyo Protect (2%)',
        amount: 4792,
        explanation: '',
      },
    ],
    validationErrors: [],
    requiresFullPayment: false,
    paymentPolicy: {
      name: {
        en: 'Apple Pie en',
        nl: 'Apple Pie nl',
      },
      description: {
        en: 'Apple Pie en',
        nl: 'Apple Pie nl',
      },
      _id: '692457736f7216eb2150f682',
      icon: 'https://res.cloudinary.com/dv0imczul/image/upload/v1763987180/pdj7acafzazcxmbzmptt.svg',
      isUpfrontEnabled: true,
      upfrontFeePercent: 2,
      escrowHours: 2,
      isEvenlyoProtectEnabled: true,
      evenlyoProtectFeePercent: 2,
    },
    pricingType: 'per hour',
    numDays: 1,
    isSingleDate: true,
  },
  platformFee: 11980,
  itemPlatformFee: 0,
  isFullyPaid: false,
  isUpfrontPaid: false,
  willPayUpfront: true,
  AmountPaid: 0,
  AmountLeft: 256372,
  paymentIntentId: '',
  paymentPolicy: null,
  reminderSent: false,
  trackingId: 'TRK1766386757178R13O4TC5W',
  statusHistory: [
    {
      notes: {
        en: 'Status updated',
        nl: 'Status bijgewerkt',
      },
      status: 'accepted',
      timestamp: '2025-12-22T13:44:34.168Z',
      _id: '69494b42b41e74381b17e598',
    },
  ],
  createdAt: '2025-12-22T06:59:17.180Z',
  updatedAt: '2025-12-22T13:44:34.168Z',
  __v: 1,
};

const asa = {
  tempDetails: {
    startDate: '2026-01-06T00:00:00.000Z',
    endDate: '2026-01-06T00:00:00.000Z',
    startTime: '09:00',
    endTime: '09:00',
    eventLocation: 'Karachi City, Pakistan',
  },
  listingSnapshot: {
    title: "{ en: 'New Secure listingss en', nl: 'New Secure listing nl' }",
    vendorId: '6911b7d4e8478c7b209eb558',
  },
  listingId: {
    title: {
      en: 'New Secure listingss en',
      nl: 'New Secure listing nl',
    },
    _id: '6926f83f5c1d49ce48b400c6',
    vendor: {
      _id: '6911b7d4e8478c7b209eb558',
      fullName: 'undefined undefined',
      id: '6911b7d4e8478c7b209eb558',
    },
    pricing: {
      type: 'per hour',
      amount: 600,
      extratimeCost: 500,
      securityFee: 500,
      pricePerKm: 500,
      escrowFee: 0,
      totalPrice: 1600,
    },
    images: [
      'https://res.cloudinary.com/dv0imczul/image/upload/v1764159791/pxlhpesriobg3jfjd7pf.png',
    ],
    status: 'active',
    isActive: true,
    id: '6926f83f5c1d49ce48b400c6',
  },
  addedAt: '2025-12-29T07:22:56.601Z',
  _id: '69522c5091dd43cce3c7d57b',
  id: '69522c5091dd43cce3c7d57b',
};

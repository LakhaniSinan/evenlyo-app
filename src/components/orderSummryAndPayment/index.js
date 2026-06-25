import {CardField} from '@stripe/stripe-react-native';
import React, {memo, useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {formatPrice} from '../../utils';
import GradientButton from '../button';
import GradientText from '../gradiantText';
import GooglePlacesInput from '../locationField';
import TextField from '../textInput';

const OrderSummary = memo(
  ({
    selectedProductsArray = [],
    selectedTotal = 0,
    deliveryLocation,
    distanceKm = 0,
    deliveryCharges = 0,
    extraDeliveryCharges = 0,
    platformFee = 0,
    total = 0,
    onLocationSelect,
    onCheckout,
    showStripeform = false,
    inputValues = {},
    handleCahnge,
    t,
    onpayPress,
    onCancelPress,
    setCardDetails,
  }) => {
    if (!selectedProductsArray.length) {
      return null;
    }

    const vendor = selectedProductsArray[0]?.vendor;
    const deliveryTotal = useMemo(
      () => deliveryCharges + extraDeliveryCharges,
      [deliveryCharges, extraDeliveryCharges],
    );

    const renderItems = useMemo(
      () =>
        selectedProductsArray.map(item => (
          <View key={item._id} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.title?.en} × {item.quantity}
            </Text>
            <Text style={styles.itemPrice}>
              € {formatPrice(item.sellingPrice * item.quantity)}
            </Text>
          </View>
        )),
      [selectedProductsArray],
    );

    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Order Summary</Text>

        {renderItems}

        <View style={styles.deliveryBox}>
          <Text style={styles.deliveryLabel}>Delivery Location *</Text>
          <GooglePlacesInput
            selectedLocation={deliveryLocation}
            setSelectedLocation={onLocationSelect}
            placeholder="Enter Location"
            bgcolor={COLORS.white}
            lable="Add Location *"
          />
        </View>

        {deliveryLocation && (
          <View style={styles.deliveryChargesBox}>
            <Text style={styles.deliveryTitle}>Delivery Charges</Text>

            <View style={styles.row}>
              <Text style={styles.deliveryLabel}>Distance {distanceKm} Km</Text>
              <Text style={styles.deliveryLabel}>
                Base rate: ${vendor?.deliveryCharges || 0}/km
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.deliveryLabel}>Base delivery charge</Text>
              <Text style={styles.deliveryLabel}>
                € {formatPrice(deliveryCharges)}
              </Text>
            </View>

            {extraDeliveryCharges > 0 && (
              <View style={styles.row}>
                <Text style={styles.deliveryLabel}>Extra charges</Text>
                <Text style={styles.deliveryLabel}>
                  € {formatPrice(extraDeliveryCharges)}
                </Text>
              </View>
            )}

            <View style={styles.rowBold}>
              <Text style={styles.deliveryLabel}>Total Delivery</Text>
              <Text style={styles.deliveryLabel}>
                € {formatPrice(deliveryTotal)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.bold}>Subtotal</Text>
          <Text style={styles.primary}>€ {formatPrice(selectedTotal)}</Text>
        </View>

        {deliveryTotal > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.bold}>Delivery</Text>
            <Text style={styles.primary}>€ {formatPrice(deliveryTotal)}</Text>
          </View>
        )}

        <View style={styles.totalRow}>
          <Text style={styles.bold}>
            Platform Fee {selectedProductsArray[0]?.platformFeePercentage || 0}%
          </Text>
          <Text style={styles.primary}>€ {formatPrice(platformFee)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.bold}>Total</Text>
          <Text style={styles.primary}>€ {formatPrice(total)}</Text>
        </View>

        <View style={{height: width(8)}} />

        {!showStripeform ? (
          <GradientButton
            text={
              deliveryLocation
                ? 'Proceed to Checkout'
                : 'Enter Valid Location to Continue'
            }
            type="filled"
            disabled={!deliveryLocation}
            onPress={() => {
              deliveryLocation &&
                onCheckout(selectedProductsArray, deliveryLocation);
            }}
          />
        ) : (
          <>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Customer Information *</Text>

              <TextField
                label={t('Full Name')}
                placeholder={t('Enter Full Name')}
                value={inputValues.fullname}
                onChangeText={v => handleCahnge('fullname', v)}
              />
              <TextField
                label={t('Email')}
                placeholder={t('Enter Email')}
                keyboardType="email-address"
                autoCapitalize="none"
                value={inputValues.email}
                onChangeText={v => handleCahnge('email', v)}
              />
              <TextField
                label={t('Phone Number')}
                placeholder={t('Enter Phone Number')}
                keyboardType="number-pad"
                value={inputValues.phoneNumber}
                onChangeText={v => handleCahnge('phoneNumber', v)}
              />
            </View>

            <View style={[styles.box, {marginTop: width(4)}]}>
              <Text style={styles.boxTitle}>Card Information *</Text>

              <CardField
                postalCodeEnabled={false}
                style={styles.cardFieldContainer}
                cardStyle={styles.cardField}
                onCardChange={setCardDetails}
              />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={onCancelPress}
                style={styles.cancelBtn}
                activeOpacity={0.7}>
                <GradientText text="Cancel" />
              </TouchableOpacity>

              <GradientButton
                text={t('Pay € {{amount}}', {amount: formatPrice(total)})}
                onPress={onpayPress}
                type="filled"
              />
            </View>
          </>
        )}
      </View>
    );
  },
);

export default OrderSummary;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: width(5),
    padding: width(4),
    marginHorizontal: width(3),
    elevation: 5,
  },

  heading: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: 12,
    color: COLORS.black,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemName: {fontSize: 14, color: COLORS.textDark},
  itemPrice: {fontWeight: '600'},

  deliveryBox: {
    backgroundColor: '#FDF0FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 12,
    marginVertical: 12,
  },
  deliveryLabel: {fontWeight: '600', color: COLORS.textLight},

  deliveryChargesBox: {
    backgroundColor: '#EFFFF4',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  deliveryTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#1B7F4B',
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  rowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    fontWeight: '700',
  },

  bold: {fontFamily: fontFamly.PlusJakartaSansBold, color: COLORS.black},
  primary: {color: COLORS.primary, fontFamily: fontFamly.PlusJakartaSansBold},

  box: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: width(3),
  },
  boxTitle: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginBottom: width(3),
    color: COLORS.black,
  },

  cardFieldContainer: {height: 50},
  cardField: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    textColor: COLORS.black,
    placeholderColor: COLORS.textLight,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width(5),
  },
  cancelBtn: {
    width: width(42),
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
});

import React, {memo, useEffect, useMemo, useState} from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';

/* ---------------- REUSABLE ROW ---------------- */

const PriceRow = ({label, value}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

/* ---------------- MAIN COMPONENT ---------------- */

const CustomOfferModal = ({isVisible, onClose, offerObject}) => {
  const {t, currentLanguage} = useTranslation();
  const [evenlyoProtect, setEvenlyoProtect] = useState(true);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {});
    const hide = Keyboard.addListener('keyboardDidHide', () => {});
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const item = offerObject?.items?.[0];
  const breakdown = item?.pricingBreakdown;
  const paymentPolicy = breakdown?.paymentPolicy;

  /* ---------------- FEES ---------------- */

  const serviceTimeRow = useMemo(() => {
    return breakdown?.breakdown?.find(row =>
      row?.label?.startsWith('Service Time'),
    );
  }, [breakdown]);

  const platformFee = useMemo(() => breakdown?.platformFee || 0, [breakdown]);

  const platformPercent = useMemo(() => {
    const row = breakdown?.breakdown?.find(b =>
      b?.label?.includes('Platform Fee'),
    );
    return row ? row.label.match(/\d+/)?.[0] : 0;
  }, [breakdown]);

  const evenlyoProtectFee = useMemo(() => {
    if (!evenlyoProtect) return 0;
    return breakdown?.evenlyoProtectFee || 0;
  }, [evenlyoProtect, breakdown]);

  const totalPayable = useMemo(() => {
    return offerObject?.finalTotal + evenlyoProtectFee;
  }, [offerObject, evenlyoProtectFee]);

  /* ---------------- RENDER ---------------- */

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('Offer Preview')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ITEMS */}
          {offerObject?.items?.map((v, i) => (
            <View key={i} style={styles.itemCard}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{uri: v?.images?.[0]}}
                  resizeMode="contain"
                  style={styles.image}
                />
              </View>

              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>
                  {currentLanguage === 'en' ? v?.title?.en : v?.title?.nl}
                </Text>
                <Text style={styles.itemSubTitle}>
                  {currentLanguage === 'en' ? v?.subtitle?.en : v?.subtitle?.nl}
                </Text>

                <View style={styles.discountRow}>
                  <Text style={styles.discountText}>{v?.discount}%</Text>
                  <Text style={styles.priceText}>
                    ${offerObject?.finalTotal}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* BREAKDOWN */}
          {serviceTimeRow && (
            <PriceRow
              label={serviceTimeRow.label}
              value={`$${serviceTimeRow.amount}`}
            />
          )}

          <PriceRow
            label="Extra Time"
            value={`$${offerObject?.totalExtraTime}`}
          />

          <PriceRow
            label={`Travel (${item?.distanceKm}km)`}
            value={`$${offerObject?.totalDistance}`}
          />

          <PriceRow
            label="Security Fee"
            value={`$${offerObject?.totalSecurity}`}
          />

          <PriceRow
            label={`Platform Fee (${platformPercent}%)`}
            value={`$${platformFee}`}
          />

          {/* EVENLYO PROTECT */}
          {paymentPolicy?.isEvenlyoProtectEnabled && (
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setEvenlyoProtect(!evenlyoProtect)}>
              <Icon
                name={evenlyoProtect ? 'checkbox' : 'square-outline'}
                size={22}
                color={COLORS.primary}
              />
              <Text style={styles.checkboxText}>
                Evenlyo Protect ({paymentPolicy?.evenlyoProtectFeePercent}%)
              </Text>
              <Text style={styles.checkboxAmount}>${evenlyoProtectFee}</Text>
            </TouchableOpacity>
          )}

          {/* TOTAL */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>${totalPayable}</Text>
          </View>

          {/* ACCEPT */}
          <GradientButton
            text="Accept Offer"
            type="filled"
            style={{marginTop: width(4)}}
          />

          <Text style={styles.acceptText}>
            By continuing, you agree to our Terms of Service and Payment Policy.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default memo(CustomOfferModal);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: width(8),
    borderTopRightRadius: width(8),
    paddingHorizontal: 16,
    paddingTop: 14,
    height: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamly.bold,
    color: COLORS.black,
  },
  itemCard: {
    flexDirection: 'row',
    marginTop: width(2),
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(4),
    paddingVertical: width(2),
  },
  imageWrapper: {
    height: width(15),
    width: width(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: '60%',
    width: '60%',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    marginLeft: width(2),
    color: COLORS.black,
  },
  itemSubTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 10,
    marginLeft: width(2),
    color: COLORS.textLight,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    marginLeft: width(2),
    color: COLORS.green,
  },
  priceText: {
    marginLeft: width(2),
    color: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: width(2),
  },
  rowLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  rowValue: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(3),
  },
  checkboxText: {
    flex: 1,
    marginLeft: width(2),
    fontSize: 13,
    color: COLORS.black,
  },
  checkboxAmount: {
    fontSize: 14,
    fontFamily: fontFamly.bold,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: width(4),
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  totalValue: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  acceptText: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: width(2),
  },
});

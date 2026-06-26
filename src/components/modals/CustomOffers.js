import React, {memo, useMemo} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {width} from 'react-native-dimension';
import {IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {formatEuro, getOfferItemImage, getOfferItemTitle, getOfferPricingSummary} from '../../utils';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';

const CustomOfferModal = ({isVisible, onClose, offerObject, onAccept, isAccepting}) => {
  const {t, currentLanguage} = useTranslation();

  const offerPricing = useMemo(
    () => getOfferPricingSummary(offerObject || {}),
    [offerObject],
  );
  const isMultiItem = offerPricing.itemCount > 1;
  const offerItems = offerObject?.items || [];
  const evenlyoProtectByItem = offerItems.map(() => true);
  const selectedItems = offerItems.map(() => true);

  const totalAmount = Number(
    offerPricing.payableTotal || offerObject?.finalTotal || 0,
  );
  const formatEuroAmount = value => formatEuro(value, {space: false});

  const getItemSubtitle = item => {
    if (currentLanguage === 'en') {
      return item?.subtitle?.en || item?.subtitle || '';
    }
    return item?.subtitle?.nl || item?.subtitle || '';
  };

  const singleItemBreakdown = offerPricing.items[0]?.item?.pricingBreakdown || {};
  const platformPercent = Number(singleItemBreakdown?.platformFeePercent || 0);

  const renderBreakdown = ({
    securityFee,
    platformFee,
    vatFee,
    offerBasePrice,
    platformPercentValue = platformPercent,
  }) => (
    <View style={styles.breakdownBox}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Security Deposit(Refundable)</Text>
        <Text style={styles.rowValue}>{formatEuroAmount(securityFee)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>
          Platform Service Fee ({platformPercentValue}%)
        </Text>
        <Text style={styles.rowValue}>{formatEuroAmount(platformFee)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>VAT</Text>
        <Text style={styles.rowValue}>{formatEuroAmount(vatFee)}</Text>
      </View>
      <View style={styles.offerPriceRow}>
        <Text style={styles.offerPriceLabel}>Offer Price</Text>
        <Text style={styles.offerPriceValue}>
          {formatEuroAmount(offerBasePrice)}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      avoidKeyboard>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconWrap}>
              <Icon name="gift-outline" size={16} color={COLORS.white} />
            </View>
            <Text style={styles.title}>{t('Custom Offer')}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.selectedHeading}>{t('selected')}</Text>

          {offerPricing.items.map((row, index) => {
            const itemImage = getOfferItemImage(row.item);
            const itemTitle = getOfferItemTitle(row.item, currentLanguage);
            const itemSubtitle = getItemSubtitle(row.item);
            const itemDisplayPrice = isMultiItem
              ? row.payableTotal
              : totalAmount;

            return (
              <View
                key={row.key}
                style={[styles.itemCard, index > 0 && styles.itemCardSpacing]}>
                <View style={styles.itemTopRow}>
                  <View style={styles.imageWrapper}>
                    <Image
                      source={
                        itemImage
                          ? {uri: itemImage}
                          : IMAGES.backgroundImage2
                      }
                      resizeMode="cover"
                      style={styles.image}
                    />
                  </View>

                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{itemTitle}</Text>
                    {!!itemSubtitle && (
                      <Text style={styles.itemSubTitle}>{itemSubtitle}</Text>
                    )}
                    <Text style={styles.mainPrice}>
                      {formatEuroAmount(itemDisplayPrice)}
                    </Text>
                  </View>
                </View>

                {!isMultiItem &&
                  renderBreakdown({
                    securityFee: row.securityFee,
                    platformFee: row.platformFee,
                    vatFee: row.vatFee,
                    offerBasePrice: row.offerSubtotal,
                  })}
              </View>
            );
          })}

          {isMultiItem ? (
            <View style={[styles.itemCard, styles.itemCardSpacing]}>
              {renderBreakdown({
                securityFee: offerPricing.securityFee,
                platformFee: offerPricing.platformFee,
                vatFee: offerPricing.vatFee,
                offerBasePrice: offerPricing.offerSubtotal,
              })}
            </View>
          ) : null}

          <Text style={styles.summaryHeading}>{t('Order Summary')}</Text>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatEuroAmount(totalAmount)}</Text>
          </View>

          <View
            style={{
              margin: width(4),
            }}>
            <GradientButton
              text={isAccepting ? 'Processing...' : 'View & Accept Offer'}
              type="filled"
              onPress={() => onAccept?.(evenlyoProtectByItem, selectedItems)}
              style={{marginTop: width(4)}}
            />
          </View>

          <Text style={styles.hintText}>
            {t(
              'You can add to wishlist without dates and specify them later, or select dates first for convenience',
            )}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default memo(CustomOfferModal);

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#F8F8FA',
    borderTopLeftRadius: width(6),
    borderTopRightRadius: width(6),
    paddingBottom: width(4),
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: width(3),
    paddingHorizontal: width(4),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: width(9),
    height: width(9),
    borderRadius: width(2.8),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width(2.5),
  },
  title: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },
  selectedHeading: {
    marginTop: width(4),
    marginHorizontal: width(4),
    fontSize: 14,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  itemCard: {
    marginTop: width(3),
    marginHorizontal: width(4),
    borderWidth: 1,
    borderColor: '#F6C2E2',
    borderRadius: width(3),
    backgroundColor: '#F5F5F8',
    overflow: 'hidden',
  },
  itemCardSpacing: {
    marginTop: width(2),
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width(3),
  },
  imageWrapper: {
    height: width(15),
    width: width(15),
    borderRadius: width(2.5),
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  itemContent: {
    flex: 1,
    marginLeft: width(2.5),
  },
  itemTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    color: COLORS.black,
  },
  itemSubTitle: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 12,
    marginTop: 2,
    color: COLORS.textLight,
  },
  mainPrice: {
    marginTop: width(1.2),
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 16,
    color: COLORS.primary,
  },
  breakdownBox: {
    borderTopWidth: 1,
    borderTopColor: '#F6C2E2',
    backgroundColor: '#F7F7FA',
    paddingHorizontal: width(3),
    paddingVertical: width(2),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: width(1),
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  rowValue: {
    fontSize: 14,
    color: '#6B6B6B',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerPriceRow: {
    borderTopWidth: 1,
    borderTopColor: '#E3E3E7',
    paddingTop: width(2),
    marginTop: width(1),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  offerPriceLabel: {
    fontSize: 14,
    color: COLORS.green,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  offerPriceValue: {
    fontSize: 14,
    color: COLORS.green,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  summaryHeading: {
    marginTop: width(4),
    marginHorizontal: width(4),
    fontSize: 14,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  totalCard: {
    marginTop: width(2),
    marginHorizontal: width(4),
    borderWidth: 1,
    borderColor: '#F6C2E2',
    borderRadius: width(3),
    backgroundColor: '#F6EEF6',
    paddingHorizontal: width(3),
    paddingVertical: width(3.2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  totalValue: {
    fontSize: 18,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  hintText: {
    marginHorizontal: width(4),
    marginTop: width(4),
    paddingHorizontal: width(3),
    paddingVertical: width(3),
    borderRadius: width(3),
    borderWidth: 1,
    borderColor: '#BFD8FF',
    backgroundColor: '#EAF3FF',
    fontSize: 11,
    color: '#5F646E',
    textAlign: 'center',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
});

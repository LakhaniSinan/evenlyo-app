import React, {memo, useEffect, useMemo, useState} from 'react';
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
import {ICONS, IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {
  formatEuro,
  getOfferItemImage,
  getOfferItemTitle,
  getOfferPricingSummary,
} from '../../utils';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';

const CustomOfferModal = ({
  isVisible,
  onClose,
  offerObject,
  onAccept,
  isAccepting,
}) => {
  const {t, currentLanguage} = useTranslation();

  const offerPricing = useMemo(
    () => getOfferPricingSummary(offerObject || {}),
    [offerObject],
  );
  const isMultiItem = offerPricing.itemCount > 1;
  const offerItems = offerObject?.items || [];
  const [evenlyoProtectByItem, setEvenlyoProtectByItem] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    setEvenlyoProtectByItem(offerItems.map(() => true));
    setSelectedItems(offerItems.map(() => true));
  }, [offerObject?.uniqueId, offerItems.length]);

  const getProtectPercent = row =>
    Number(
      row?.item?.pricingBreakdown?.evenlyoProtectFeePercent ||
        row?.item?.paymentPolicy?.evenlyoProtectFeePercent ||
        0,
    );

  const isProtectAvailable = row =>
    Boolean(row?.item?.paymentPolicy?.isEvenlyoProtectEnabled) ||
    getProtectPercent(row) > 0 ||
    Number(row?.item?.pricingBreakdown?.evenlyoProtectFee || 0) > 0;

  const getProtectFee = row => {
    if (!isProtectAvailable(row)) {
      return 0;
    }
    const storedFee = Number(
      row?.evenlyoProtectFee ||
        row?.item?.pricingBreakdown?.evenlyoProtectFee ||
        0,
    );
    if (storedFee > 0) {
      return storedFee;
    }
    const percent = getProtectPercent(row);
    if (percent > 0) {
      return Number(((row.offerSubtotal * percent) / 100).toFixed(2));
    }
    return 0;
  };

  const hasProtectOption = row =>
    isProtectAvailable(row) && getProtectFee(row) > 0;

  const getItemBaseTotal = row => {
    const breakdown = row.item?.pricingBreakdown || {};
    const storedTotal = Number(breakdown.total || 0);
    const storedProtect = Number(breakdown.evenlyoProtectFee || 0);
    if (storedTotal > 0) {
      return storedTotal;
    }
    return Number(
      (row.offerSubtotal + row.platformFee + row.vatFee).toFixed(2),
    );
  };

  const getItemDisplayPrice = (row, index) => {
    const protectFee = evenlyoProtectByItem[index] ? getProtectFee(row) : 0;
    return Number((getItemBaseTotal(row) + protectFee).toFixed(2));
  };

  const getItemOrderTotal = (row, index) => {
    const displayPrice = getItemDisplayPrice(row, index);
    const protectFee = evenlyoProtectByItem[index] ? getProtectFee(row) : 0;

    return Number((displayPrice + protectFee).toFixed(2));
  };

  const totalAmount = useMemo(() => {
    return offerPricing.items.reduce((sum, row, idx) => {
      if (!selectedItems[idx]) {
        return sum;
      }

      return sum + getItemDisplayPrice(row, idx);
    }, 0);
  }, [offerPricing.items, evenlyoProtectByItem, selectedItems]);

  const formatEuroAmount = (value, options = {}) =>
    formatEuro(value, {space: false, ...options});

  const toggleProtect = index => {
    setEvenlyoProtectByItem(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const toggleItemSelection = index => {
    setSelectedItems(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const getItemSubtitle = item => {
    if (currentLanguage === 'en') {
      return item?.subtitle?.en || item?.subtitle || '';
    }
    return item?.subtitle?.nl || item?.subtitle || '';
  };

  const getPlatformPercent = row =>
    Number(row?.item?.pricingBreakdown?.platformFeePercent || 0);

  const renderCheckbox = (isChecked, onPress, size = width(5.5)) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.checkboxBox,
        {height: size, width: size},
        isChecked && styles.checkboxBoxChecked,
      ]}>
      {isChecked && (
        <Image
          source={ICONS.cheackIcon}
          style={{height: size, width: size}}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );

  const renderProtectRow = (row, itemIndex) => {
    if (!hasProtectOption(row)) {
      return null;
    }

    const protectPercent = getProtectPercent(row);
    const protectFee = getProtectFee(row);
    const isSelected = Boolean(evenlyoProtectByItem[itemIndex]);

    return (
      <View style={styles.protectSection}>
        <View style={styles.protectTopRow}>
          {renderCheckbox(isSelected, () => toggleProtect(itemIndex))}
          <View style={styles.protectContent}>
            <View style={styles.protectLabelRow}>
              <Text style={styles.protectLabel}>
                {t('evenlyoProtectWithPercent', {percent: protectPercent})}
              </Text>
              <Text style={styles.protectValue}>
                {formatEuroAmount(protectFee)}
              </Text>
            </View>
            <Text style={styles.protectDescription}>
              {t(
                'Non-refundable additional security coverage for extra peace of mind during your event.',
              )}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBreakdown = (row, itemIndex) => (
    <View style={styles.breakdownBox}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Security Deposit(Refundable)</Text>
        <Text style={styles.rowValue}>{formatEuroAmount(row.securityFee)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>
          Platform Service Fee ({getPlatformPercent(row)}%)
        </Text>
        <Text style={styles.rowValue}>{formatEuroAmount(row.platformFee)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>VAT</Text>
        <Text style={styles.rowValue}>{formatEuroAmount(row.vatFee)}</Text>
      </View>
      <View style={styles.offerPriceRow}>
        <Text style={styles.offerPriceLabel}>Offer Price</Text>
        <Text style={styles.offerPriceValue}>
          {formatEuroAmount(row.offerSubtotal)}
        </Text>
      </View>
      {renderProtectRow(row, itemIndex)}
    </View>
  );

  const renderSelectRow = (row, index) => {
    const itemImage = getOfferItemImage(row.item);
    const itemTitle = getOfferItemTitle(row.item, currentLanguage);
    const itemSubtitle = getItemSubtitle(row.item);
    const isChecked = Boolean(selectedItems[index]);

    return (
      <TouchableOpacity
        key={`select-${row.key}`}
        activeOpacity={0.85}
        onPress={() => toggleItemSelection(index)}
        style={[styles.selectRow, index > 0 && styles.selectRowSpacing]}>
        {renderCheckbox(isChecked, () => toggleItemSelection(index))}
        <View style={styles.selectImageWrapper}>
          <Image
            source={itemImage ? {uri: itemImage} : IMAGES.backgroundImage2}
            resizeMode="cover"
            style={styles.selectImage}
          />
        </View>
        <View style={styles.selectContent}>
          <Text style={styles.itemTitle}>{itemTitle}</Text>
          {!!itemSubtitle && (
            <Text style={styles.itemSubTitle}>{itemSubtitle}</Text>
          )}
        </View>
        <Text style={styles.selectPrice}>
          {formatEuroAmount(getItemDisplayPrice(row, index), {decimals: 0})}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSelectedItemCard = (row, index) => {
    const itemImage = getOfferItemImage(row.item);
    const itemTitle = getOfferItemTitle(row.item, currentLanguage);
    const itemSubtitle = getItemSubtitle(row.item);

    return (
      <View
        key={`selected-${row.key}`}
        style={[styles.itemCard, index > 0 && styles.itemCardSpacing]}>
        <View style={styles.itemTopRow}>
          <View style={styles.imageWrapper}>
            <Image
              source={itemImage ? {uri: itemImage} : IMAGES.backgroundImage2}
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
              {formatEuroAmount(getItemDisplayPrice(row, index))}
            </Text>
          </View>
        </View>
        {renderBreakdown(row, index)}
      </View>
    );
  };

  const selectedRows = offerPricing.items.filter((_, index) =>
    Boolean(selectedItems[index]),
  );

  const hasSelectedItems = selectedItems.some(Boolean);

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
          {isMultiItem ? (
            <>
              <Text style={styles.sectionHeading}>{t('Select Dates')}</Text>
              <View style={styles.selectListCard}>
                {offerPricing.items.map((row, index) =>
                  renderSelectRow(row, index),
                )}
              </View>
            </>
          ) : null}

          <Text style={styles.sectionHeading}>{t('selected')}</Text>

          {(isMultiItem ? selectedRows : offerPricing.items).map(
            (row, index) => {
              const itemIndex = isMultiItem
                ? offerPricing.items.findIndex(item => item.key === row.key)
                : index;
              return renderSelectedItemCard(row, itemIndex);
            },
          )}

          {!hasSelectedItems ? (
            <Text style={styles.emptySelectionText}>
              {t('Please select at least one item to continue.')}
            </Text>
          ) : null}

          <Text style={styles.summaryHeading}>{t('Order Summary')}</Text>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatEuroAmount(totalAmount)}
            </Text>
          </View>

          <View style={styles.buttonWrap}>
            <GradientButton
              text={isAccepting ? 'Processing' : 'View & Accept Offer'}
              type="filled"
              onPress={() => {
                if (!hasSelectedItems || isAccepting) {
                  return;
                }
                onAccept?.(evenlyoProtectByItem, selectedItems);
              }}
              styleContainer={styles.acceptBtnContainer}
              styleProps={[
                styles.acceptBtnPressable,
                {opacity: hasSelectedItems ? 1 : 0.5},
              ]}
              textStyle={styles.acceptBtnText}
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
  sectionHeading: {
    marginTop: width(4),
    marginHorizontal: width(4),
    fontSize: 14,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  selectListCard: {
    marginTop: width(2.5),
    marginHorizontal: width(4),
    borderWidth: 1,
    borderColor: '#F6C2E2',
    borderRadius: width(3),
    backgroundColor: '#F5F5F8',
    padding: width(2.5),
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F6C2E2',
    borderRadius: width(2.5),
    backgroundColor: '#F7F7FA',
    padding: width(2.5),
  },
  selectRowSpacing: {
    marginTop: width(2),
  },
  selectImageWrapper: {
    height: width(12),
    width: width(12),
    borderRadius: width(2),
    overflow: 'hidden',
    marginLeft: width(2),
  },
  selectImage: {
    height: '100%',
    width: '100%',
  },
  selectContent: {
    flex: 1,
    marginLeft: width(2),
    marginRight: width(2),
  },
  selectPrice: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    color: COLORS.primary,
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
    backgroundColor: '#F5F5F8',
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
    flex: 1,
    paddingRight: width(2),
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
  protectSection: {
    borderTopWidth: 1,
    borderTopColor: '#E3E3E7',
    marginTop: width(2),
    paddingTop: width(2.5),
  },
  protectTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    borderRadius: width(1.2),
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    borderWidth: 0,
    backgroundColor: COLORS.primary,
  },
  protectContent: {
    flex: 1,
    marginLeft: width(2.5),
  },
  protectLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  protectLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginRight: width(2),
  },
  protectValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  protectDescription: {
    marginTop: width(1),
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  emptySelectionText: {
    marginTop: width(3),
    marginHorizontal: width(4),
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    textAlign: 'center',
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
  buttonWrap: {
    margin: width(4),
  },
  acceptBtnContainer: {
    height: width(13),
    minHeight: width(13),
  },
  acceptBtnPressable: {
    flex: 1,
    height: '100%',
    paddingVertical: width(2),
    paddingHorizontal: width(3),
  },
  acceptBtnText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
    textAlign: 'center',
  },
  hintText: {
    marginHorizontal: width(4),
    marginTop: width(1),
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

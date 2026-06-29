import moment from 'moment';
import React, {memo, useMemo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';

import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {formatEuro, formatPrice} from '../../utils';

const CartCard = ({
  item,
  type = 'requested',
  onEditData,
  onRemoveItemFromCart,
  onSelectToPay,
  isSelected,
}) => {
  const {t, currentLanguage} = useTranslation();

  const title = useMemo(() => {
    const data = item?.listingId?.title || item?.listingDetails?.title;
    return currentLanguage === 'en' ? data?.en : data?.nl;
  }, [item, currentLanguage]);

  const activeStatusText = useMemo(
    () => (currentLanguage === 'nl' ? 'Actief' : 'Active'),
    [currentLanguage],
  );

  const imageUri = useMemo(
    () => item?.listingDetails?.featuredImage || item?.listingId?.images?.[0],
    [item],
  );

  const vendorName = useMemo(
    () => item?.listingId?.vendor?.firstName || item?.vendorId?.firstName,
    [item],
  );

  const isUpfrontPaid = useMemo(
    () =>
      Boolean(
        item?.isUpfrontPaid ||
          item?.paymentStatus === 'upfront_paid' ||
          item?.paymentStatus === 'paid',
      ),
    [item?.isUpfrontPaid, item?.paymentStatus],
  );

  const paymentRows = useMemo(
    () => [
      {
        key: 'totalCost',
        label: t('Total Cost'),
        value: item?.pricingBreakdown?.total,
        color: COLORS.textLight,
      },
      {
        key: 'upfrontPaid',
        label: t('Upfront Paid'),
        value: isUpfrontPaid ? t('Paid') : t('Un Paid'),
        color: COLORS.navyBlue,
      },
      {
        key: 'upfrontAmount',
        label: t('Upfront Amount'),
        value: item?.pricingBreakdown?.upfrontFee,
        color: COLORS.navyBlue,
      },
      {
        key: 'totalPaid',
        label: t('Total Paid Amount'),
        value: item?.AmountPaid,
        color: isUpfrontPaid ? COLORS.green : COLORS.red,
      },
      {
        key: 'remaining',
        label: t('Remaining'),
        value: item?.AmountLeft,
        color: COLORS.red,
      },
    ],
    [item, t, isUpfrontPaid],
  );

  const renderDate = (labelKey, date) =>
    date ? (
      <Text style={styles.metaText}>
        {t(labelKey)}: {moment(date).format('DD/MM/YYYY')}
      </Text>
    ) : null;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.row}>
          {type !== 'requested' && (
            <TouchableOpacity
              onPress={() => onSelectToPay?.(item)}
              style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && (
                <Image
                  source={ICONS.cheackIcon}
                  style={styles.checkIcon}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          )}

          <View style={styles.imageBox}>
            <Image
              source={{uri: imageUri}}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        </View>

        <View
          style={[
            styles.info,
            {width: type !== 'requested' ? width(60) : width(67)},
          ]}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>

          <View style={styles.spaceBetween}>
            <View style={styles.row}>
              <Text style={styles.status}>{activeStatusText}</Text>
              <Image
                source={ICONS.verifyedIcon}
                style={styles.verifyIcon}
                resizeMode="contain"
              />
            </View>

            {type === 'requested' && (
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => onEditData?.(item)}
                  style={styles.iconBtn}>
                  <Image
                    source={ICONS.editGridientIcon}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onRemoveItemFromCart?.(item)}
                  style={styles.iconBtn}>
                  <Image
                    source={ICONS.deleteIcon}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.vendorRow}>
            <View style={styles.avatar}>
              <Image
                source={ICONS.personalIcon}
                style={styles.avatarIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.metaText}>{vendorName}</Text>
          </View>

          {renderDate('Start Date', item?.tempDetails?.startDate)}
          {renderDate('End Date', item?.tempDetails?.endDate)}
          {renderDate('Start Date', item?.details?.startDate)}
          {renderDate('End Date', item?.details?.endDate)}

          {type !== 'requested' && (
            <>
              <Text style={styles.metaText}>
                {t('Start Time')} {item?.details?.startTime}
              </Text>
              <Text style={styles.metaText}>
                {t('End Time')} {item?.details?.endTime}
              </Text>
            </>
          )}
        </View>
      </View>

      {type !== 'requested' && (
        <>
          <View style={styles.bottom}>
            <Text style={styles.metaText}>
              {item?.details?.eventLocation || vendorName}
            </Text>

            {paymentRows.map(row => {
              if (!row?.value > 0) {
                return;
              }
              if (!item?.willPayUpfront && row?.key === 'upfrontPaid') {
                return;
              }
              if (!item?.willPayUpfront && row?.key === 'upfrontAmount') {
                return;
              }
              return (
                <View key={row.key} style={styles.spaceBetween}>
                  <Text style={[styles.metaText, {color: row.color}]}>
                    {row.label}
                  </Text>
                  <Text style={[styles.metaText, {color: row.color}]}>
                    {!isNaN(row.value)
                      ? formatEuro(row.value, {space: false})
                      : row.value}
                  </Text>
                </View>
              );
            })}
          </View>

          {item?.pricingBreakdown?.requiresFullPayment ? (
            <View
              style={[
                styles.warningBox,
                {backgroundColor: '#FEE2E2', borderColor: COLORS.red},
              ]}>
              <Text style={[styles.warningText, {color: COLORS.red}]}>
                {t('cartFullPaymentRequired', {
                  amount: formatPrice(item?.pricingBreakdown?.total),
                })}
              </Text>
            </View>
          ) : (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                {t('cartRemainingBalanceWarning', {
                  amount: item?.AmountLeft
                    ? formatEuro(item?.AmountLeft, {space: false})
                    : '',
                })}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default memo(CartCard);

/* ===========================
   Styles
=========================== */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6F6F6',
    marginBottom: width(2),
    marginHorizontal: width(3),
    borderRadius: width(3),
    padding: width(2),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  checkbox: {
    height: width(5),
    width: width(5),
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: width(1),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width(2),
  },

  checkboxSelected: {
    borderWidth: 0,
    opacity: 0.9,
  },

  checkIcon: {
    height: '100%',
    width: '100%',
  },

  imageBox: {
    height: width(20),
    width: width(20),
    borderRadius: width(3),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    height: '80%',
    width: '80%',
  },

  info: {
    marginLeft: width(2),
  },

  title: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 15,
    color: COLORS.black,
  },

  status: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.textLight,
  },

  verifyIcon: {
    height: width(4),
    width: width(4),
    marginLeft: 2,
  },

  iconBtn: {
    height: width(7),
    width: width(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width(2),
  },

  icon: {
    height: '70%',
    width: '70%',
  },

  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: width(3),
  },

  avatar: {
    height: width(8),
    width: width(8),
    borderRadius: width(100),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width(2),
  },

  avatarIcon: {
    height: width(5),
    width: width(5),
  },

  metaText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.black,
  },

  bottom: {
    padding: width(3),
  },

  warningBox: {
    padding: width(2),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },

  warningText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: '#92400E',
  },
});

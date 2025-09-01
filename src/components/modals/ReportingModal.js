import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import BookingTable from '../bookingTable';
import GradientButton from '../button';
import GradientText from '../gradiantText';

const ReportingModal = ({visible, onClose}) => {
  const {t} = useTranslation();

  const tableData = [
    {
      bookingId: 'ITM001',
      bookingItem: 'DJ',
      totalCost: '$1,195',
      earning: '$359',
    },
    {
      bookingId: 'ITM002',
      bookingItem: 'DJ',
      totalCost: '$1,195',
      earning: '$359',
    },
    {
      bookingId: 'ITM003',
      bookingItem: 'DJ',
      totalCost: '$1,195',
      earning: '$359',
    },
    {
      bookingId: 'ITM004',
      bookingItem: 'DJ',
      totalCost: '$1,195',
      earning: '$359',
    },
  ];

  const earningsData = [
    {label: 'Report Date:', value: '1/15/2024'},
    {label: 'Today Earning:', value: '$2,450'},
    {label: 'Last Week Earning:', value: '$18,500'},
    {label: 'Total Earning:', value: '$125,000'},
  ];

  const renderEarningItem = ({item}) => (
    <View style={styles.earningRow}>
      <Text style={styles.earningLabel}>{item.label}</Text>
      <Text style={styles.earningValue}>{item.value}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('Analytics & Report')}</Text>
            <TouchableOpacity onPress={onClose}>
              <GradientText text="✕" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Earnings Info */}
            <View style={styles.cardRow}>
              <FlatList
                data={earningsData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderEarningItem}
              />
            </View>

            {/* Booking Table */}
            <View style={{minHeight: width(60)}}>
              <BookingTable data={tableData} canDownload={false} />
            </View>

            <GradientButton
              icon={ICONS.downloadIcon}
              text="Export PDF"
              textStyle={styles.buttonText}
              // onPress={handleDownloadPDF}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ReportingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: width(95),
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.semiLightText,
    paddingVertical: 12,
    paddingHorizontal: width(4),
  },
  title: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  body: {
    paddingHorizontal: width(4),
    marginTop: width(3),
  },
  cardRow: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: width(3),
    marginBottom: width(5),
  },
  earningRow: {
    flexDirection: 'row',
    marginBottom: width(1.5),
  },
  earningLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  earningValue: {
    fontSize: 11,
    color: COLORS.black,
    marginLeft: width(2),
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.white,
  },
});

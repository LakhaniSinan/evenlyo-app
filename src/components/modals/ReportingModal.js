import React, {useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {useTranslation} from '../../hooks';
import {COLORS, fontFamly} from '../../constants';
import GradientText from '../gradiantText';
import SubscriptionTable from '../subscriptionTabel';
import GradientButton from '../button';
import {ICONS} from '../../assets';

const ReportingModal = ({visible, onClose}) => {
  const {t} = useTranslation();
  const [paymentType, setPaymentType] = useState('');
  const [cardDetails, setCardDetails] = useState(null);
  const dummyData = [
    {
      billingId: 'INV-001',
      date: '6/15/2024',
      plan: 'Basic',
      amount: 0,
      status: 'Paid',
    },
    {
      billingId: 'INV-002',
      date: '6/18/2024',
      plan: 'Premium',
      amount: 20,
      status: 'Left',
    },
  ];

  const renderCardData = (left, center, right) => (
    <View style={[styles.cardRow, {borderWidth: 0, paddingVertical: width(0)}]}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text
          style={[
            styles.leftText,
            {
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              fontSize: 10,
              color: COLORS.textDark,
            },
          ]}>
          {left}
        </Text>
        {center && (
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.black,
              marginLeft: width(2),
            }}>
            {center}
          </Text>
        )}
      </View>
      {right && <Text style={styles.rightText}>{right}</Text>}
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
          <View style={styles.header}>
            <Text style={styles.title}>{t('Invoice INV-2024-001')}</Text>
            <TouchableOpacity onPress={onClose}>
              <GradientText text={'✕'} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.cardRow}>
              <View style={{}}>
                <Text style={styles.leftText}>Invoice</Text>
                <Text style={styles.centerText}>Invoice #INV-2024-001</Text>
              </View>

              <View style={{}}>
                <Text style={[styles.leftText, {fontSize: 10}]}>
                  Your Company Name
                </Text>
                <Text
                  style={[
                    styles.centerText,
                    {
                      fontSize: 11,
                      color: COLORS.textLight,
                      width: width(36),
                    },
                  ]}>
                  123 Business Street City, State 12345
                </Text>
                <Text
                  style={[
                    styles.centerText,
                    {
                      fontSize: 11,
                      color: COLORS.textLight,
                      width: width(36),
                    },
                  ]}>
                  contact@company.com
                </Text>
              </View>
            </View>

            <View style={styles.cardRow}>
              <View style={{}}>
                <Text style={styles.leftText}>Bill To:</Text>
                <Text style={styles.centerText}>Customer Name</Text>
                <Text style={styles.centerText}>customer@email.com</Text>
                <Text style={styles.centerText}>Customer Address</Text>
              </View>

              <View style={{}}>
                <Text style={[styles.leftText, {fontSize: 10}]}>
                  Invoice Details:
                </Text>
                <View
                  style={{
                    width: width(36),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={[
                      styles.centerText,
                      {
                        fontSize: 11,
                        color: COLORS.textLight,
                      },
                    ]}>
                    Date:
                  </Text>
                  <Text
                    style={[
                      styles.centerText,
                      {
                        fontSize: 11,
                        color: COLORS.textLight,
                      },
                    ]}>
                    1/15/2024
                  </Text>
                </View>
                <View
                  style={{
                    width: width(36),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={[
                      styles.centerText,
                      {
                        fontSize: 11,
                        color: COLORS.textLight,
                      },
                    ]}>
                    Due Date:
                  </Text>
                  <Text
                    style={[
                      styles.centerText,
                      {
                        fontSize: 11,
                        color: COLORS.textLight,
                      },
                    ]}>
                    2/14/2024
                  </Text>
                </View>
                <View
                  style={{
                    width: width(36),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={[
                      styles.centerText,
                      {
                        fontSize: 11,
                        color: COLORS.textLight,
                      },
                    ]}>
                    Status:
                  </Text>
                  <Text
                    style={[
                      styles.centerText,
                      {
                        fontSize: 11,
                        color: COLORS.textLight,
                      },
                    ]}>
                    Paid
                  </Text>
                </View>
              </View>
            </View>
            <SubscriptionTable
              data={dummyData}
              onFilterPress={() => {}}
              onExportPress={() => {}}
              //   handlPayAmount={() => setModalVisible(true)}
            />
            <View
              style={[
                styles.cardContainer,
                {
                  marginTop: width(2),
                },
              ]}>
              {renderCardData('Subtotal:', '', '$99.99')}
              {renderCardData('Tax (0%):', '', '$0.00')}
              {renderCardData('Security Fee:', '', '$25.00')}
              {renderCardData('Kilometer:', '10km', '$2')}
              <View
                style={{
                  borderBottomColor: COLORS.border,
                  borderBottomWidth: 1,
                }}
              />
              {renderCardData('Total:', '', '$126.99')}
            </View>
            <GradientButton
              icon={ICONS.downloadIcon}
              text="Export PDF"
              // onPress={handleDownloadPDF}
              textStyle={{
                fontSize: 12,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                color: 'white',
              }}
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
    marginTop: width(2),
  },
  body: {
    paddingHorizontal: width(4),
  },
  cardContainer: {
    borderRadius: width(4),
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: width(5),
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: width(3),
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginVertical: width(2),
  },
  leftText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  centerText: {
    color: COLORS.textLight,
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  rightText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  cardFieldContainer: {
    height: 50,
    marginVertical: 20,
  },
  cardField: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    textColor: '#000000',
    fontSize: 14,
    placeholderColor: COLORS.textLight,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width(4),
  },
  cancelButton: {
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: width(40),
  },
  payButtonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: 'white',
  },
});

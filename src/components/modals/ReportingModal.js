import moment from 'moment';
import React from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import RNFS from 'react-native-fs';
import {generatePDF} from 'react-native-html-to-pdf';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {formatEuro, formatPrice} from '../../utils';
import BookingTable from '../bookingTable';
import GradientButton from '../button';
import GradientText from '../gradiantText';

const ReportingModal = ({data, visible, onClose}) => {
  const {t} = useTranslation();
  const earningsData = [
    {label: 'Report Date:', value: moment().format('MMMM D, YYYY')},
    {label: 'Today Earning:', value: formatEuro(data?.stats?.todayEarnings || 0)},
    {
      label: 'Last Week Earning:',
      value: formatEuro(data?.stats?.lastWeekEarnings || 0),
    },
    {label: 'Total Earning:', value: formatEuro(data?.stats?.totalEarnings || 0)},
  ];

  // ✅ Function to generate and download PDF
  const handleDownloadPDF = async () => {
    try {
      const timeStamp = moment().format('YYYYMMDD_HHmmss');

      const htmlContent = `
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        color: #000;
        font-size: 13px;
      }
      h1 {
        text-align: center;
        font-size: 20px;
        margin-bottom: 10px;
      }
      .report-date {
        margin-bottom: 30px;
      }
      .report-date span {
        font-weight: bold;
      }
      h3 {
        margin-top: 25px;
        margin-bottom: 10px;
        font-size: 15px;
      }
      .earnings {
        margin-bottom: 25px;
        line-height: 1.8;
      }
      .earnings div {
        font-size: 13px;
      }
      .table-container {
        margin-top: 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
        font-size: 12px;
      }
      th {
        font-weight: bold;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
    </style>
  </head>
  <body>
    <h1>Analytics & Report</h1>

    <div class="report-date">
      <span>Report Date:</span> ${moment().format('MM/DD/YYYY')}
    </div>

    <h3>Earnings Summary</h3>
    <div class="earnings">
      <div>Today Earning: ${formatEuro(data?.stats?.todayEarnings || 0)}</div>
      <div>Last Week Earning: ${formatEuro(data?.stats?.lastWeekEarnings || 0)}</div>
      <div>Total Earning: ${formatEuro(data?.stats?.totalEarnings || 0)}</div>
    </div>

    <h3>Booking Details</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Booking Item</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          ${data?.bookingTable
            ?.map(
              item => `
              <tr>
                <td>${item?.trackingId || '-'}</td>
                <td>${item?.listingName || '-'}</td>
                <td>${formatEuro(item?.totalCost || 0, {space: false})}</td>
              </tr>
            `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </body>
</html>
`;

      const pdf = await generatePDF({
        html: htmlContent,
        fileName: `Report_${timeStamp}`,
        directory: 'Documents',
      });

      if (Platform.OS === 'android') {
        const folderPath = RNFS.DownloadDirectoryPath;
        const fileName = `Report_${timeStamp}.pdf`;
        const destinationPath = `${folderPath}/${fileName}`;

        if (!(await RNFS.exists(folderPath))) {
          await RNFS.mkdir(folderPath);
        }

        await RNFS.copyFile(pdf.filePath, destinationPath);
        Alert.alert('Success', 'PDF saved to Downloads folder.');
        onClose();
        console.log('Saved to Android Downloads:', destinationPath);
      } else {
        const destinationPath = `${RNFS.DocumentDirectoryPath}/Report_${timeStamp}.pdf`;
        await RNFS.moveFile(pdf.filePath, destinationPath);

        await Share.share({
          url: `file://${destinationPath}`,
          type: 'application/pdf',
          title: 'Share your Report PDF',
        });
      }
    } catch (error) {
      console.log('PDF Error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

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
          <View style={styles.header}>
            <Text style={styles.title}>{t('Analytics & Report')}</Text>
            <TouchableOpacity onPress={onClose}>
              <GradientText text="✕" />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.cardRow}>
              <FlatList
                data={earningsData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderEarningItem}
              />
            </View>

            <View style={{minHeight: width(60)}}>
              <BookingTable data={data} canDownload={false} />
            </View>

            <GradientButton
              icon={ICONS.downloadIcon}
              text="Export PDF"
              textStyle={styles.buttonText}
              onPress={handleDownloadPDF}
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

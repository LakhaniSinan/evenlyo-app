import moment from 'moment';
import React, {useRef} from 'react';
import {
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
import {generateSaleReportHTML} from '../../utils/htmlComtent';
import GradientButton from '../button';
import CommonAlert from '../commanAlert';
import GradientText from '../gradiantText';
import SaleItemTable from '../saleItemTable';

const SaleReportingModal = ({data, visible, onClose}) => {
  const {currentLanguage, t} = useTranslation();
  const modalRef = useRef(null);

  const earningsData = [
    {label: 'Report Date:', value: moment().format('MMMM D, YYYY')},
    {label: 'Today Earning:', value: `$${data?.stats?.todayEarnings || 0}`},
    {
      label: 'Last Week Earning:',
      value: `$${data?.stats?.lastWeekEarnings || 0}`,
    },
    {label: 'Total Earning:', value: `$${data?.stats?.totalEarnings || 0}`},
  ];

  const handleDownloadPDF = async () => {
    try {
      const timeStamp = moment().format('YYYYMMDD_HHmmss');
      const htmlContent = await generateSaleReportHTML(data, currentLanguage);

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
        modalRef.current?.show({
          status: 'ok',
          message: 'PDF saved to Downloads folder.',
          handlePressOk: () => {
            modalRef.current?.hide();
            setTimeout(() => {
              onClose();
            }, 500);
          },
        });
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
              <SaleItemTable data={data} canDownload={false} />
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
      <CommonAlert ref={modalRef} />
    </Modal>
  );
};

export default SaleReportingModal;

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

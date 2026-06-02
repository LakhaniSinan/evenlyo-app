import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const TrackingDetails = ({navigation}) => {
  const {currentLanguage} = useTranslation();
  const isDutch = currentLanguage === 'nl';
  const localizedText = {
    trackDetails: isDutch ? 'Volgdetails' : 'Track Details',
    orderMapping: isDutch ? 'Besteloverzicht - TRK001' : 'Order Mapping - TRK001',
    downloadPdf: isDutch ? 'PDF downloaden' : 'Download PDF',
    orderInformation: isDutch ? 'Bestelinformatie' : 'Order Information',
    orderId: isDutch ? 'Bestel-ID:' : 'Order ID:',
    clientName: isDutch ? 'Klantnaam:' : 'Client Name:',
    phone: isDutch ? 'Telefoon:' : 'Phone:',
    total: isDutch ? 'Totaal:' : 'Total:',
    orderTimeline: isDutch ? 'Besteltijdlijn' : 'Order Timeline',
    progressNotes: isDutch ? 'Voortgangsnotities' : 'Progress Notes',
    progressNotesDesc: isDutch
      ? 'Bestelling is in uitvoering. De volgende fase wordt als voltooid gemarkeerd zodra de huidige stap klaar is.'
      : 'Order Is In Progress. Next Phase Will Be Marked As Completed Once The Current Step Is Finished.',
    direction: isDutch ? 'Route' : 'Direction',
    requestSent: isDutch ? 'Verzoek verzonden' : 'Request Sent',
    requestSentDesc: isDutch ? 'Klant heeft bestelling aangevraagd' : 'Client Sent Order Request',
    orderAccepted: isDutch ? 'Bestelling geaccepteerd' : 'Order Accepted',
    orderAcceptedDesc: isDutch ? 'Leverancier heeft bestelling geaccepteerd' : 'Vendor Accepted The Order',
    pickedUp: isDutch ? 'Opgehaald' : 'Picked Up',
    pickedUpDesc: isDutch ? 'Bestelling opgehaald van locatie' : 'Order Picked Up From Location',
    delivered: isDutch ? 'Afgeleverd' : 'Delivered',
    received: isDutch ? 'Ontvangen' : 'Received',
    receivedDesc: isDutch ? 'Klant heeft ontvangst bevestigd' : 'Client Confirmed Receipt',
    completed: isDutch ? 'Voltooid' : 'Completed',
    completedDesc: isDutch ? 'Totale prijs: $2100.00' : 'Total Price: $2100.00',
    pending: isDutch ? 'In afwachting' : 'Pending',
    onTheWay: isDutch ? 'Onderweg' : 'On the way',
    vendor: isDutch ? 'Leverancier' : 'Vendor',
    driver: isDutch ? 'Bezorger' : 'Driver',
  };
  const [orderData] = useState({
    orderId: 'ORD-003',
    clientName: 'Global Supply Co',
    phone: '+1-234-567-8903',
    total: '$1,074.00',
    status: localizedText.onTheWay,
  });

  const [timelineData] = useState([
    {
      id: 1,
      status: localizedText.requestSent,
      description: localizedText.requestSentDesc,
      time: '2025-01-07/07:45',
      icon: 'time',
      badge: localizedText.onTheWay,
      badgeColor: '#FFE5E5',
      textColor: '#FF6B6B',
      completed: true,
    },
    {
      id: 2,
      status: localizedText.orderAccepted,
      description: localizedText.orderAcceptedDesc,
      time: '2025-01-07/07:45',
      icon: 'checkmark-circle',
      badge: localizedText.vendor,
      badgeColor: '#FFF3E0',
      textColor: '#FF9800',
      completed: true,
    },
    {
      id: 3,
      status: localizedText.pickedUp,
      description: localizedText.pickedUpDesc,
      time: '2025-01-07/07:45',
      icon: 'cube',
      badge: localizedText.driver,
      badgeColor: '#E8F5E8',
      textColor: '#4CAF50',
      completed: true,
    },
    {
      id: 4,
      status: localizedText.delivered,
      description: '',
      time: '',
      icon: 'car',
      badge: localizedText.pending,
      badgeColor: '#F5F5F5',
      textColor: '#9E9E9E',
      completed: false,
    },
    {
      id: 5,
      status: localizedText.received,
      description: localizedText.receivedDesc,
      time: '',
      icon: 'person',
      badge: localizedText.pending,
      badgeColor: '#F5F5F5',
      textColor: '#9E9E9E',
      completed: false,
    },
    {
      id: 6,
      status: localizedText.completed,
      description: localizedText.completedDesc,
      time: '',
      icon: 'checkmark-circle',
      badge: localizedText.pending,
      badgeColor: '#F5F5F5',
      textColor: '#9E9E9E',
      completed: false,
    },
  ]);

  const handleDownloadPDF = () => {
    console.log('Download PDF');
  };

  const handleDelete = () => {
    console.log('Delete order');
  };

  const handleDirection = () => {
    navigation.navigate('TrackDirections');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        headingText={localizedText.trackDetails}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => navigation.navigate('Notifications')}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: width(5),
        }}>
        <Text style={styles.headerTitle}>{localizedText.orderMapping}</Text>
        <View style={{width: width(45)}}>
          <GradientButton
            icon={ICONS.downloadIcon}
            text={localizedText.downloadPdf}
            onPress={handleDownloadPDF}
            textStyle={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              color: 'white',
            }}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoHeader}>
            <Text style={styles.orderInfoTitle}>{localizedText.orderInformation}</Text>
            <View style={[styles.statusBadge, {backgroundColor: '#FFE5E5'}]}>
              <Text style={[styles.statusText, {color: '#FF0092'}]}>
                {orderData.status}
              </Text>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{localizedText.orderId}</Text>
              <Text style={styles.detailValue}>{orderData.orderId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{localizedText.clientName}</Text>
              <Text style={styles.detailValue}>{orderData.clientName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{localizedText.phone}</Text>
              <Text style={styles.detailValue}>{orderData.phone}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{localizedText.total}</Text>
            <Text style={styles.totalValue}>{orderData.total}</Text>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>{localizedText.orderTimeline}</Text>
          <View style={styles.timeline}>
            {timelineData.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <View
                    style={[
                      styles.iconBackground,
                      {backgroundColor: item.completed ? '#E8F5E8' : '#F5F5F5'},
                    ]}>
                    <Icon
                      name={item.icon}
                      size={15}
                      color={item.completed ? '#4CAF50' : '#9E9E9E'}
                    />
                  </View>
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.updateStatus}>{item.status}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: item.badgeColor},
                      ]}>
                      <Text
                        style={[styles.statusText, {color: item.textColor}]}>
                        {item.badge}
                      </Text>
                    </View>
                  </View>
                  {item.description && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text style={styles.updateDescription}>
                        {item.description}
                      </Text>
                      <Text style={styles.updateTime}>{item.time}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.progressNotesSection}>
          <Text style={styles.progressNotesTitle}>{localizedText.progressNotes}</Text>
          <View style={styles.progressNotesContent}>
            <Icon
              name="trophy"
              size={20}
              color="#4CAF50"
              style={{marginTop: width(2)}}
            />
            <Text style={styles.progressNotesText}>
              {localizedText.progressNotesDesc}
            </Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Icon name="trash" size={20} color={COLORS.textDark} />
          </TouchableOpacity>

          <View style={styles.directionButtonContainer}>
            <GradientButton
              text={localizedText.direction}
              onPress={handleDirection}
              type="filled"
              textStyle={{
                fontSize: 16,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                color: 'white',
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  downloadButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 20,
  },
  orderInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderInfoTitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 9,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  orderDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.backgroundLight,
    marginBottom: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
  },
  totalValue: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  timelineSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: 10,
  },
  timeline: {
    gap: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: width(2),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconBackground: {
    width: 30,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.backgroundLight,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateStatus: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  updateDescription: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  updateTime: {
    fontSize: 9,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  progressNotesSection: {
    width: width(90),
    alignSelf: 'center',
    borderRadius: 12,
    marginBottom: width(3),
    backgroundColor: '#E8F5E8',
    flex: 1,
    padding: width(3),
  },
  progressNotesTitle: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.green,
  },
  progressNotesContent: {
    flexDirection: 'row',
    gap: 12,
  },
  progressNotesText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textDark,
    flex: 1,
    width: width(60),
    padding: width(1),
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    gap: 16,
  },
  deleteButton: {
    backgroundColor: COLORS.backgroundLight,
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionButtonContainer: {
    flex: 1,
  },
});

export default TrackingDetails;

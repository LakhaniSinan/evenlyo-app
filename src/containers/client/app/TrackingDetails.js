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

const TrackingDetails = ({navigation}) => {
  const [orderData] = useState({
    orderId: 'ORD-003',
    clientName: 'Global Supply Co',
    phone: '+1-234-567-8903',
    total: '$1,074.00',
    status: 'On the way',
  });

  const [timelineData] = useState([
    {
      id: 1,
      status: 'Request Sent',
      description: 'Client Sent Order Request',
      time: '2025-01-07/07:45',
      icon: 'time',
      badge: 'On the way',
      badgeColor: '#FFE5E5',
      textColor: '#FF6B6B',
      completed: true,
    },
    {
      id: 2,
      status: 'Order Accepted',
      description: 'Vendor Accepted The Order',
      time: '2025-01-07/07:45',
      icon: 'checkmark-circle',
      badge: 'Vendor',
      badgeColor: '#FFF3E0',
      textColor: '#FF9800',
      completed: true,
    },
    {
      id: 3,
      status: 'Picked Up',
      description: 'Order Picked Up From Location',
      time: '2025-01-07/07:45',
      icon: 'cube',
      badge: 'Driver',
      badgeColor: '#E8F5E8',
      textColor: '#4CAF50',
      completed: true,
    },
    {
      id: 4,
      status: 'Delivered',
      description: '',
      time: '',
      icon: 'car',
      badge: 'Pending',
      badgeColor: '#F5F5F5',
      textColor: '#9E9E9E',
      completed: false,
    },
    {
      id: 5,
      status: 'Received',
      description: 'Client Confirmed Receipt',
      time: '',
      icon: 'person',
      badge: 'Pending',
      badgeColor: '#F5F5F5',
      textColor: '#9E9E9E',
      completed: false,
    },
    {
      id: 6,
      status: 'Completed',
      description: 'Total Price: $2100.00',
      time: '',
      icon: 'checkmark-circle',
      badge: 'Pending',
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
        headingText={'Track Details'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => navigation.navigate('Notification')}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: width(5),
        }}>
        <Text style={styles.headerTitle}>Order Mapping - TRK001</Text>
        <View style={{width: width(45)}}>
          <GradientButton
            icon={ICONS.downloadIcon}
            text="Download PDF"
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
            <Text style={styles.orderInfoTitle}>Order Information</Text>
            <View style={[styles.statusBadge, {backgroundColor: '#FFE5E5'}]}>
              <Text style={[styles.statusText, {color: '#FF0092'}]}>
                {orderData.status}
              </Text>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID:</Text>
              <Text style={styles.detailValue}>{orderData.orderId}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Client Name:</Text>
              <Text style={styles.detailValue}>{orderData.clientName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{orderData.phone}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{orderData.total}</Text>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
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
          <Text style={styles.progressNotesTitle}>Progress Notes</Text>
          <View style={styles.progressNotesContent}>
            <Icon
              name="trophy"
              size={20}
              color="#4CAF50"
              style={{marginTop: width(2)}}
            />
            <Text style={styles.progressNotesText}>
              Order Is In Progress. Next Phase Will Be Marked As Completed Once
              The Current Step Is Finished.
            </Text>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Icon name="trash" size={20} color={COLORS.textDark} />
          </TouchableOpacity>

          <View style={styles.directionButtonContainer}>
            <GradientButton
              text="Direction"
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

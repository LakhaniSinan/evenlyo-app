import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import {COLORS, fontFamly} from '../../../constants';

const STATUS_CONFIG = {
  accepted: {
    title: 'Order Accepted',
    description: 'Vendor accepted the order',
    icon: 'checkmark-circle',
    badge: 'Vendor',
    badgeColor: '#FFF3E0',
    textColor: '#FF9800',
  },
  on_the_way: {
    title: 'On The Way',
    description: 'Driver is on the way',
    icon: 'car',
    badge: 'Driver',
    badgeColor: '#E3F2FD',
    textColor: '#2196F3',
  },
  picked_up: {
    title: 'Picked Up',
    description: 'Order picked up from location',
    icon: 'cube',
    badge: 'Driver',
    badgeColor: '#E8F5E8',
    textColor: '#4CAF50',
  },
  received: {
    title: 'Received',
    description: 'Client received the order',
    icon: 'person',
    badge: 'Client',
    badgeColor: '#E8F5E8',
    textColor: '#4CAF50',
  },
  finished: {
    title: 'Finished',
    description: 'Order process finished',
    icon: 'time',
    badge: 'System',
    badgeColor: '#EDE7F6',
    textColor: '#673AB7',
  },
  received_back: {
    title: 'Received Back',
    description: 'Item received back',
    icon: 'refresh',
    badge: 'Warehouse',
    badgeColor: '#FFFDE7',
    textColor: '#FBC02D',
  },
  completed: {
    title: 'Completed',
    description: 'Order completed successfully',
    icon: 'checkmark-done-circle',
    badge: 'Completed',
    badgeColor: '#E8F5E8',
    textColor: '#2E7D32',
  },
};

const TrackingBookingDetails = ({navigation, route}) => {
  const data = route.params;
  const statusHistory = data?.statusHistory || [];

  const timelineData = useMemo(() => {
    return statusHistory.map((item, index) => {
      const config = STATUS_CONFIG[item.status] || {};

      return {
        id: item._id || index,
        status: config.title || item.status,
        description: config.description || '',
        time: new Date(item.timestamp).toLocaleString(),
        icon: config.icon || 'time',
        badge: config.badge || 'Status',
        badgeColor: config.badgeColor || '#F5F5F5',
        textColor: config.textColor || '#9E9E9E',
        completed: true,
      };
    });
  }, [statusHistory]);

  const [orderData] = useState({
    orderId: data?.orderId || 'ORD-003',
    clientName: data?.clientName || 'Global Supply Co',
    phone: data?.phone || '+1-234-567-8903',
    total: data?.total || '$1,074.00',
    status: timelineData?.[timelineData.length - 1]?.status || 'Pending',
  });

  const handleDownloadPDF = () => {
    console.log('Download PDF');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        headingText={'Order Tracking'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() => navigation.navigate('Messages')}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* ========= ORDER INFO ========= */}
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

        {/* ========= TIMELINE ========= */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>

          <View style={styles.timeline}>
            {timelineData.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <View
                    style={[
                      styles.iconBackground,
                      {backgroundColor: '#E8F5E8'},
                    ]}>
                    <Icon name={item.icon} size={20} color="#4CAF50" />
                  </View>
                  {index < timelineData.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
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

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.updateDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.updateTime}>{item.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ========= BUTTON ========= */}
        <View style={styles.directionButtonContainer}>
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
      </ScrollView>
    </View>
  );
};

export default TrackingBookingDetails;

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
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    padding: 12,
    marginVertical: 20,
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
    fontSize: 10,
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
    borderRadius: 18,
    padding: 12,
    backgroundColor: COLORS.backgroundLight,
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.green,
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
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  updateDescription: {
    fontSize: 9,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  updateTime: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  progressNotesSection: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressNotesTitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
  },
  progressNotesContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  progressNotesText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    flex: 1,
    lineHeight: 20,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    gap: 16,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionButtonContainer: {
    flex: 1,
    marginBottom: 20,
  },
});

import React, {useCallback, useMemo} from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {generatePDF} from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import {useDispatch, useSelector} from 'react-redux';
import GradientButton from '../../../components/button';
import {COLORS, fontFamly} from '../../../constants';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {setActiveChat} from '../../../redux/slice/chat';
import {checkIsChatedBefore, createConnection} from '../../../services/Chat';

const STATUS_CONFIG = {
  requested: {
    title: 'New Request',
    description: 'Booking request received',
    icon: 'checkmark-circle',
    badge: 'Client',
    badgeColor: '#FFF2E2',
    textColor: '#D98B2B',
  },
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
    description: 'Status updated',
    icon: 'car',
    badge: 'Driver',
    badgeColor: '#E3F2FD',
    textColor: '#2196F3',
  },
  picked_up: {
    title: 'Service Received',
    description: 'Status updated',
    icon: 'checkmark-circle',
    badge: 'Client',
    badgeColor: '#E8F5E8',
    textColor: '#2E7D32',
  },
  received: {
    title: 'Order Accepted',
    description: 'Vendor accepted the booking',
    icon: 'checkmark-circle',
    badge: 'Vendor',
    badgeColor: '#E8F5E8',
    textColor: '#2E7D32',
  },
  finished: {
    title: 'Service Finished',
    description: 'Status updated',
    icon: 'checkmark-circle',
    badge: 'Vendor',
    badgeColor: '#E8F5E8',
    textColor: '#2E7D32',
  },
  received_back: {
    title: 'Service Finished',
    description: 'Item received back',
    icon: 'checkmark-circle',
    badge: 'Vendor',
    badgeColor: '#E8F5E8',
    textColor: '#2E7D32',
  },
  completed: {
    title: 'Order Completed',
    description: 'Order completed successfully',
    icon: 'checkmark-circle',
    badge: 'System',
    badgeColor: '#FFF1E6',
    textColor: '#E58845',
  },
};

function isSameCalendarDay(isoA, isoB) {
  if (!isoA || !isoB) {
    return true;
  }
  const a = new Date(isoA);
  const b = new Date(isoB);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) {
    return true;
  }
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDisplayDate(dateValue) {
  if (!dateValue) {
    return '—';
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** API often sends "08:00" / "22:00" strings, not full ISO datetimes. */
function formatDisplayTime(timeStr) {
  if (timeStr == null || String(timeStr).trim() === '') {
    return '—';
  }
  const s = String(timeStr).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (h > 23 || min > 59) {
      return s;
    }
    const d = new Date(2000, 0, 1, h, min, 0);
    return d.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return s;
}

function buildEventSchedule(data) {
  const details = data?.details || {};
  const bookingDateTime = data?.bookingDateTime || {};
  const startDateIso = details.startDate || bookingDateTime.start;
  const endDateIso = details.endDate || bookingDateTime.end;
  const startTimeRaw =
    details.startTime ??
    bookingDateTime.startTime ??
    details.schedule?.[0]?.startTime ??
    '';
  const endTimeRaw =
    details.endTime ??
    bookingDateTime.endTime ??
    details.schedule?.[0]?.endTime ??
    '';

  const sameCalendarDay = isSameCalendarDay(startDateIso, endDateIso);
  const isMultiDay =
    details.duration?.isMultiDay === true ||
    (!sameCalendarDay && Boolean(startDateIso && endDateIso));

  return {
    isMultiDay,
    startDateIso,
    endDateIso,
    startTimeRaw,
    endTimeRaw,
    singleDateLabel: formatDisplayDate(startDateIso),
    startDateLabel: formatDisplayDate(startDateIso),
    endDateLabel: formatDisplayDate(endDateIso),
    startTimeLabel: formatDisplayTime(startTimeRaw),
    endTimeLabel: formatDisplayTime(endTimeRaw),
  };
}

const TrackingBookingDetails = ({navigation, route}) => {
  const data = route?.params || {};
  console.log('data', data);
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.LoginSlice);
  const detailsData = data?.details || {};
  const statusHistory = data?.statusHistory || [];
  const pricingRows = data?.pricingBreakdown?.breakdown || [];
  const eventSchedule = useMemo(() => buildEventSchedule(data), [data]);

  const formatedParticipants = useCallback(participantsArr => {
    const participants = {};
    participantsArr?.forEach(({role, refPath, userId}) => {
      const commonData = {
        userId: userId?._id,
        name:
          refPath === 'Vendor'
            ? userId?.businessName
            : `${userId?.firstName || ''} ${userId?.lastName || ''}`.trim(),
        photo:
          userId?.profileImage || userId?.businessLogo || userId?.photo || null,
        email: userId?.email || userId?.businessEmail,
      };
      participants[role === 'vendor' ? 'vendor' : 'user'] = {
        ...commonData,
        role: role === 'vendor' ? 'vendor' : 'user',
      };
    });
    return participants;
  }, []);

  const handleOpenClientChat = useCallback(async () => {
    const client = data?.client || data?.userId;
    const clientId = client?._id || client?.id;
    const vendorId = user?.vendorId;
    if (!clientId || !vendorId) {
      Alert.alert(
        'Chat unavailable',
        'Client or vendor information is missing for this booking.',
      );
      return;
    }
    try {
      const response = await checkIsChatedBefore(clientId, vendorId);
      if (response?.status !== 200 && response?.status !== 201) {
        Alert.alert('Error', 'Could not open chat. Please try again.');
        return;
      }
      let conversation = response?.data?.data;
      if (!conversation) {
        const createRes = await createConnection({userId: clientId, vendorId});
        if (createRes?.status !== 200 && createRes?.status !== 201) {
          Alert.alert('Error', 'Could not start a conversation.');
          return;
        }
        conversation = createRes?.data?.data;
      }
      if (!conversation?.conversationId) {
        Alert.alert('Error', 'Could not open chat.');
        return;
      }
      const finalChatData = {
        ...conversation,
        participants: formatedParticipants(conversation?.participants),
      };
      dispatch(setActiveChat(finalChatData));
      navigation.navigate('ChatDetails', finalChatData);
    } catch (e) {
      Alert.alert('Error', 'Could not open chat. Please try again.');
    }
  }, [data, user?.vendorId, dispatch, navigation, formatedParticipants]);

  const formatAmount = amount =>
    `€ ${Number(amount || 0)
      .toFixed(2)
      .replace('.', ',')}`;

  const formatTimelineDateTime = dateValue => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const timelineData = useMemo(() => {
    const initialTimeline = data?.createdAt
      ? [
          {
            _id: 'requested-status',
            status: 'requested',
            timestamp: data.createdAt,
          },
        ]
      : [];

    const mergedHistory = [...initialTimeline, ...statusHistory];

    return mergedHistory.map((item, index) => {
      const config = STATUS_CONFIG[item.status] || {};

      return {
        id: item._id || index,
        status: config.title || item.status,
        description: config.description || '',
        timestamp: item.timestamp,
        time: formatTimelineDateTime(item.timestamp),
        icon: config.icon || 'time',
        badge: config.badge || 'Status',
        badgeColor: config.badgeColor || '#F5F5F5',
        textColor: config.textColor || '#9E9E9E',
        completed: true,
      };
    });
  }, [data?.createdAt, statusHistory]);

  const formatPDFDateTime = dateValue => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return 'Invalid date';
    }
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    return `${month} ${day}, ${year} ${hours12}:${minutes} ${ampm}`;
  };

  const escapeHtml = value =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const createOrderTrackingPDFHtml = () => {
    const timelineRows = timelineData
      .map(
        item => `
          <tr>
            <td>${escapeHtml(item.status)}</td>
            <td>Status updated to ${escapeHtml(item.status)}</td>
            <td>${escapeHtml(formatPDFDateTime(item.timestamp))}</td>
            <td>${escapeHtml(item.badge)}</td>
          </tr>
        `,
      )
      .join('');

    const pricingHtmlRows = pricingRows
      .map(
        row => `
          <tr>
            <td>${escapeHtml(row?.label || '-')}</td>
            <td style="text-align:right;">${escapeHtml(
              formatAmount(row?.amount).replace(',', '.'),
            )}</td>
          </tr>
        `,
      )
      .join('');

    const generatedAt = formatPDFDateTime(new Date().toISOString());
    const totalAmount = formatAmount(
      data?.totalPrice || data?.pricingBreakdown?.total || 0,
    ).replace(',', '.');

    const schedPdf = buildEventSchedule(data);
    const locPdf = escapeHtml(
      data?.eventLocation || detailsData?.eventLocation || 'N/A',
    );
    const eventLocationAndDatesPdf = schedPdf.isMultiDay
      ? `<tr><td class="key">Event Location</td><td class="value">${locPdf}</td><td class="key">Start date</td><td class="value">${escapeHtml(schedPdf.startDateLabel)}</td></tr><tr><td class="key">End date</td><td class="value">${escapeHtml(schedPdf.endDateLabel)}</td><td class="key"></td><td class="value"></td></tr>`
      : `<tr><td class="key">Event Location</td><td class="value">${locPdf}</td><td class="key">Event Date</td><td class="value">${escapeHtml(schedPdf.singleDateLabel)}</td></tr>`;
    const timesRowPdf = `<tr><td class="key">Start Time</td><td class="value">${escapeHtml(schedPdf.startTimeLabel)}</td><td class="key">End Time</td><td class="value">${escapeHtml(schedPdf.endTimeLabel)}</td></tr>`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 26px; color: #1f2a37; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .brand { display: flex; align-items: center; gap: 8px; }
          .brand-icon {
            width: 24px; height: 34px; border-radius: 10px;
            background: linear-gradient(180deg, #FF2C78 0%, #E31B95 60%, #C817AE 100%);
            color: #fff; font-weight: 700; font-size: 26px; line-height: 34px; text-align: center;
          }
          .brand-name { font-size: 42px; font-weight: 700; color: #0f2940; line-height: 1; }
          .report-title { color: #E31B95; font-size: 36px; font-weight: 700; }
          .section-title {
            color: #E31B95; font-size: 14px; font-weight: 700; margin-top: 14px; margin-bottom: 8px; text-transform: uppercase;
            border-bottom: 1px solid #EBC8DF; padding-bottom: 4px;
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
          th, td { border: 1px solid #EBC8DF; padding: 9px 10px; font-size: 11px; vertical-align: top; }
          th { background: #E31B95; color: #fff; text-align: left; font-weight: 700; }
          .key { width: 18%; font-weight: 700; }
          .value { width: 32%; }
          .total-row td { font-weight: 700; background: #F9F2F7; }
          .footer { margin-top: 28px; display: flex; justify-content: space-between; color: #374151; font-size: 10px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <div class="brand-icon">E</div>
            <div class="brand-name">Evenlyo</div>
          </div>
          <div class="report-title">Order Tracking Report</div>
        </div>

        <div class="section-title">Order Information</div>
        <table>
          <tr><td class="key">Order ID</td><td class="value">${escapeHtml(data?.trackingId || 'N/A')}</td><td class="key">Status</td><td class="value">${escapeHtml(data?.status || 'N/A')}</td></tr>
          <tr><td class="key">Client Name</td><td class="value">${escapeHtml(data?.client?.fullName || data?.userId?.fullName || 'N/A')}</td><td class="key">Phone</td><td class="value">${escapeHtml(data?.client?.contactNumber || data?.userId?.contactNumber || 'N/A')}</td></tr>
          <tr><td class="key">Email</td><td class="value">${escapeHtml(data?.client?.email || data?.userId?.email || 'N/A')}</td><td class="key">Client Location</td><td class="value">${escapeHtml(data?.eventLocation || detailsData?.eventLocation || 'N/A')}</td></tr>
          ${eventLocationAndDatesPdf}
          ${timesRowPdf}
        </table>

        <div class="section-title">Pricing Breakdown</div>
        <table>
          <tr><th>Description</th><th style="text-align:right;">Amount</th></tr>
          ${pricingHtmlRows}
          <tr class="total-row"><td>Total</td><td style="text-align:right;">${escapeHtml(totalAmount)}</td></tr>
        </table>

        <div class="section-title">Order Timeline</div>
        <table>
          <tr><th>Title</th><th>Description</th><th>Date</th><th>Actor</th></tr>
          ${timelineRows}
        </table>

        <div class="footer">
          <span>Generated on: ${escapeHtml(generatedAt)}</span>
          <span>Page 1</span>
        </div>
      </body>
      </html>
    `;
  };

  const handleDownloadPDF = async () => {
    try {
      const fileName = `order-tracking-${data?.trackingId || 'report'}`;
      const pdf = await generatePDF({
        html: createOrderTrackingPDFHtml(),
        fileName,
        directory: 'Documents',
      });

      if (Platform.OS === 'android') {
        const folderPath = RNFS.DownloadDirectoryPath;
        const destinationPath = `${folderPath}/${fileName}.pdf`;
        const folderExists = await RNFS.exists(folderPath);

        if (!folderExists) {
          await RNFS.mkdir(folderPath);
        }

        await RNFS.copyFile(pdf.filePath, destinationPath);
        Alert.alert('Success', 'PDF saved to Downloads folder.');
      } else {
        const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}.pdf`;
        await RNFS.moveFile(pdf.filePath, destinationPath);
        await Share.share({
          url: `file://${destinationPath}`,
          type: 'application/pdf',
          title: 'Order Tracking PDF',
        });
      }
    } catch (error) {
      console.log('PDF generation failed:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        headingText={'Order Tracking'}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={handleOpenClientChat}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topHeader}>
          <Text style={styles.pageTitle}>
            Order Tracking - {data?.trackingId || 'N/A'}
          </Text>
          <View style={styles.completedPill}>
            <Text style={styles.completedPillText}>
              {data?.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Order Information</Text>
        <View style={styles.orderInfoCard}>
          <View style={styles.fieldsRow}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Tracking ID</Text>
              <Text style={styles.fieldValue}>{data?.trackingId || 'N/A'}</Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Client Name</Text>
              <Text style={styles.fieldValue}>
                {data?.client?.fullName || data?.userId?.fullName || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.fieldsRow}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <Text style={styles.fieldValue}>
                {data?.client?.contactNumber ||
                  data?.userId?.contactNumber ||
                  'N/A'}
              </Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>
                {data?.client?.email || data?.userId?.email || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.fieldsRow}>
            <View style={[styles.fieldBlock, styles.fullWidth]}>
              <Text style={styles.fieldLabel}>Client Location</Text>
              <Text style={styles.fieldValue}>
                {data?.eventLocation || detailsData?.eventLocation || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.fieldsRow}>
            <View style={[styles.fieldBlock, styles.fullWidth]}>
              <Text style={styles.fieldLabel}>Event Location</Text>
              <Text style={styles.fieldValue}>
                {data?.eventLocation || detailsData?.eventLocation || 'N/A'}
              </Text>
            </View>
          </View>

          {eventSchedule.isMultiDay ? (
            <View style={styles.fieldsRow}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Start date</Text>
                <Text style={styles.fieldValue}>
                  {eventSchedule.startDateLabel}
                </Text>
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>End date</Text>
                <Text style={styles.fieldValue}>
                  {eventSchedule.endDateLabel}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.fieldsRow}>
              <View style={[styles.fieldBlock, styles.fullWidth]}>
                <Text style={styles.fieldLabel}>Event Date</Text>
                <Text style={styles.fieldValue}>
                  {eventSchedule.singleDateLabel}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.fieldsRow}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Start Time</Text>
              <Text style={styles.fieldValue}>
                {eventSchedule.startTimeLabel}
              </Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>End Time</Text>
              <Text style={styles.fieldValue}>
                {eventSchedule.endTimeLabel}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Pricing Breakdown</Text>
        <View style={styles.pricingCard}>
          {pricingRows.map((row, index) => (
            <View
              key={`${row?.label}-${index}`}
              style={[
                styles.pricingRow,
                index !== pricingRows.length - 1 && styles.borderBottom,
              ]}>
              <Text style={styles.pricingLabel}>{row?.label || '-'}</Text>
              <Text style={styles.pricingValue}>
                {formatAmount(row?.amount)}
              </Text>
            </View>
          ))}

          <View style={styles.pricingRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatAmount(
                data?.totalPrice || data?.pricingBreakdown?.total || 0,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionHeading}>Order Timeline</Text>

          <View style={styles.timeline}>
            {timelineData.map((item, index) => (
              <View key={item.id} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <View style={styles.iconBackground}>
                    <Icon name={item.icon} size={12} color="#4CAF50" />
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

                  <Text style={styles.updateDescription}>
                    {item.description}
                  </Text>
                  <Text style={styles.updateTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionHeading}>Progress Notes</Text>
        <View style={styles.progressNotesSection}>
          <Icon name="alert-circle-outline" size={14} color="#E6A100" />
          <Text style={styles.progressNotesText}>
            Current status:{' '}
            {timelineData[timelineData.length - 1]?.status || 'Completed'}
          </Text>
        </View>

        <GradientButton
          text="Download PDF"
          onPress={handleDownloadPDF}
          styleContainer={styles.pdfButton}
          textStyle={{
            fontSize: 12,
            fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            color: 'white',
          }}
        />
      </ScrollView>
    </View>
  );
};

export default TrackingBookingDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 14,
  },
  topHeader: {
    marginTop: 16,
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 14,
    color: '#222222',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  completedPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FDE8F4',
  },
  completedPillText: {
    fontSize: 9,
    color: '#D62B8A',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  closeIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D62B8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 13,
    color: '#232323',
    marginBottom: 8,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  orderInfoCard: {
    backgroundColor: '#F1F2F4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  fieldsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  fieldBlock: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#F6F7F9',
    borderWidth: 1,
    borderColor: '#E1E2E5',
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  fullWidth: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 8,
    color: '#8A8A8A',
    marginBottom: 2,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  fieldValue: {
    fontSize: 10,
    color: '#2A2A2A',
    fontFamily: fontFamly.PlusJakartaSansMedium,
    flexShrink: 1,
  },
  pricingCard: {
    backgroundColor: '#F1F2F4',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E4E5E8',
  },
  pricingLabel: {
    fontSize: 9,
    color: '#666',
    flex: 1,
    marginRight: 8,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  pricingValue: {
    fontSize: 10,
    color: '#363636',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  totalLabel: {
    fontSize: 11,
    color: '#232323',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  totalValue: {
    fontSize: 11,
    color: '#232323',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  timelineSection: {
    marginBottom: 14,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F1F2F4',
  },
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 4,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  iconBackground: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E7F6EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 34,
    backgroundColor: '#D9E7DA',
    marginTop: 2,
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
    fontSize: 9,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: '#2B2B2B',
  },
  updateDescription: {
    fontSize: 9,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: '#6E6E6E',
  },
  updateTime: {
    fontSize: 8,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: '#8C8C8C',
  },
  progressNotesSection: {
    backgroundColor: '#FFF8DD',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  progressNotesText: {
    fontSize: 9,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: '#9B7A00',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  pinkRoundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D62B8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinkRoundText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  closeButton: {
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#333333',
    fontSize: 11,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  pdfButton: {
    flex: 0,
    minWidth: 130,
  },
});

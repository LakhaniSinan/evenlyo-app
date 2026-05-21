import React, {useCallback, useMemo} from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {generatePDF} from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import ShareLib from 'react-native-share';
import {useDispatch, useSelector} from 'react-redux';
import GradientButton from '../../../components/button';
import {COLORS, fontFamly} from '../../../constants';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {useTranslation} from '../../../hooks';
import {setActiveChat} from '../../../redux/slice/chat';
import {checkIsChatedBefore, createConnection} from '../../../services/Chat';
import {
  normalizeStatusKey,
  translatePricingBreakdownLabel,
} from '../../../utils/translatePricingBreakdownLabel';

const BOOKING_STATUS_I18N = {
  pending: 'statusPending',
  accepted: 'statusAccepted',
  rejected: 'statusRejected',
  on_the_way: 'statusOnTheWay',
  received: 'statusReceived',
  finished: 'statusFinished',
  picked_up: 'statusPickedUp',
  received_back: 'statusReceivedBack',
  completed: 'statusCompleted',
  cancelled: 'statusCancelled',
  claim: 'statusClaim',
  requested: 'New Request',
};

const STATUS_TIMELINE_CONFIG = {
  requested: {
    titleKey: 'New Request',
    descriptionKey: 'Booking request received',
    icon: 'checkmark-circle',
    badgeKey: 'Client',
    badgeColor: '#FFF2E2',
    textColor: '#D98B2B',
  },
  accepted: {
    titleKey: 'Order Accepted',
    descriptionKey: 'Vendor accepted the order',
    icon: 'checkmark-circle',
    badgeKey: 'Vendor',
    badgeColor: '#FFF3E0',
    textColor: '#FF9800',
  },
  on_the_way: {
    titleKey: 'On The Way',
    descriptionKey: 'Status updated',
    icon: 'car',
    badgeKey: 'Driver',
    badgeColor: '#E3F2FD',
    textColor: '#2196F3',
  },
  picked_up: {
    titleKey: 'Service Received',
    descriptionKey: 'Status updated',
    icon: 'checkmark-circle',
    badgeKey: 'Client',
    badgeColor: '#E8F5E8',
    textColor: '#2E7D32',
  },
  received: {
    titleKey: 'Order Accepted',
    descriptionKey: 'Vendor accepted the booking',
    icon: 'checkmark-circle',
    badgeKey: 'Vendor',
    badgeColor: '#E8F5E8',
    textColor: '#2E7D32',
  },
  finished: {
    titleKey: 'Service Finished',
    descriptionKey: 'Status updated',
    icon: 'checkmark-circle',
    badgeKey: 'Vendor',
    badgeColor: '#E8F5E8',
    textColor: '#2E7D32',
  },
  received_back: {
    titleKey: 'Service Finished',
    descriptionKey: 'Item received back',
    icon: 'checkmark-circle',
    badgeKey: 'Vendor',
    badgeColor: '#E8F5E8',
    textColor: '#2E7D32',
  },
  completed: {
    titleKey: 'Order Completed',
    descriptionKey: 'Order completed successfully',
    icon: 'checkmark-circle',
    badgeKey: 'System',
    badgeColor: '#FFF1E6',
    textColor: '#E58845',
  },
  pending: {
    titleKey: 'statusPending',
    descriptionKey: 'Status updated',
    icon: 'time',
    badgeKey: 'Client',
    badgeColor: '#FFF4E5',
    textColor: '#FF9800',
  },
  rejected: {
    titleKey: 'statusRejected',
    descriptionKey: 'Booking rejected',
    icon: 'close-circle',
    badgeKey: 'Vendor',
    badgeColor: '#FDECEA',
    textColor: '#D32F2F',
  },
  cancelled: {
    titleKey: 'statusCancelled',
    descriptionKey: 'Status updated',
    icon: 'close-circle',
    badgeKey: 'System',
    badgeColor: '#FFEBEE',
    textColor: '#C62828',
  },
  claim: {
    titleKey: 'statusClaim',
    descriptionKey: 'Status updated',
    icon: 'alert-circle',
    badgeKey: 'Client',
    badgeColor: '#FFF8E1',
    textColor: '#FBC02D',
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

function getDateLocale(language) {
  return language === 'nl' ? 'nl-NL' : 'en-GB';
}

function formatDisplayDate(dateValue, locale, emptyLabel = '—') {
  if (!dateValue) {
    return emptyLabel;
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return emptyLabel;
  }
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** API often sends "08:00" / "22:00" strings, not full ISO datetimes. */
function formatDisplayTime(timeStr, locale, emptyLabel = '—') {
  if (timeStr == null || String(timeStr).trim() === '') {
    return emptyLabel;
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
    return d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  return s;
}

function buildEventSchedule(data, locale, emptyLabel = '—') {
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
    singleDateLabel: formatDisplayDate(startDateIso, locale, emptyLabel),
    startDateLabel: formatDisplayDate(startDateIso, locale, emptyLabel),
    endDateLabel: formatDisplayDate(endDateIso, locale, emptyLabel),
    startTimeLabel: formatDisplayTime(startTimeRaw, locale, emptyLabel),
    endTimeLabel: formatDisplayTime(endTimeRaw, locale, emptyLabel),
  };
}

const TrackingBookingDetails = ({navigation, route}) => {
  const data = route?.params || {};
  console.log('data', data);
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.LoginSlice);
  const {t, i18n, currentLanguage} = useTranslation();
  const dateLocale = getDateLocale(currentLanguage);
  const notAvailableLabel = t('notAvailable');
  const detailsData = data?.details || {};
  const statusHistory = data?.statusHistory || [];
  const pricingRows = data?.pricingBreakdown?.breakdown || [];
  const eventSchedule = useMemo(
    () => buildEventSchedule(data, dateLocale, notAvailableLabel),
    [data, dateLocale, notAvailableLabel],
  );

  const translatePricingLabel = useCallback(
    label => translatePricingBreakdownLabel(label, t, i18n),
    [t, i18n],
  );

  const getBookingStatusLabel = useCallback(
    status => {
      if (!status) {
        return t('N/A');
      }
      const key = normalizeStatusKey(status);
      const labelKey = BOOKING_STATUS_I18N[key];
      if (labelKey) {
        return t(labelKey);
      }
      return t(String(status).trim()) !== String(status).trim()
        ? t(String(status).trim())
        : String(status)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    },
    [t],
  );

  const listingTitle =
    currentLanguage === 'en'
      ? data?.listingDetails?.title?.en
      : data?.listingDetails?.title?.nl ||
        data?.listingDetails?.title?.en;

  const getPaymentStatusLabel = useCallback(
    status => {
      if (!status) {
        return t('N/A');
      }
      const paymentKeys = {
        paid: 'Paid',
        unpaid: 'Unpaid',
        pending: 'Pending',
      };
      const labelKey = paymentKeys[normalizeStatusKey(status)];
      return labelKey ? t(labelKey) : getBookingStatusLabel(status);
    },
    [t, getBookingStatusLabel],
  );

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
        t('Chat unavailable'),
        t('Client or vendor information is missing for this booking.'),
      );
      return;
    }
    try {
      const response = await checkIsChatedBefore(clientId, vendorId);
      if (response?.status !== 200 && response?.status !== 201) {
        Alert.alert(t('Error'), t('Could not open chat. Please try again.'));
        return;
      }
      let conversation = response?.data?.data;
      if (!conversation) {
        const createRes = await createConnection({userId: clientId, vendorId});
        if (createRes?.status !== 200 && createRes?.status !== 201) {
          Alert.alert(t('Error'), t('Could not start a conversation.'));
          return;
        }
        conversation = createRes?.data?.data;
      }
      if (!conversation?.conversationId) {
        Alert.alert(t('Error'), t('Could not open chat.'));
        return;
      }
      const finalChatData = {
        ...conversation,
        participants: formatedParticipants(conversation?.participants),
      };
      dispatch(setActiveChat(finalChatData));
      navigation.navigate('ChatDetails', finalChatData);
    } catch (e) {
      Alert.alert(t('Error'), t('Could not open chat. Please try again.'));
    }
  }, [data, user?.vendorId, dispatch, navigation, formatedParticipants, t]);

  const formatAmount = amount =>
    `€ ${Number(amount || 0)
      .toFixed(2)
      .replace('.', ',')}`;

  const formatTimelineDateTime = useCallback(
    dateValue => {
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) {
        return t('Invalid date');
      }
      return date.toLocaleString(dateLocale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    },
    [dateLocale, t],
  );

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
      const statusKey = normalizeStatusKey(item.status);
      const config = STATUS_TIMELINE_CONFIG[statusKey] || {};
      const bookingStatusKey = BOOKING_STATUS_I18N[statusKey];

      const statusTitle = config.titleKey
        ? t(config.titleKey)
        : bookingStatusKey
          ? t(bookingStatusKey)
          : item.status || t('Unknown');

      const statusDescription = config.descriptionKey
        ? t(config.descriptionKey)
        : bookingStatusKey
          ? t('Status updated')
          : '';

      return {
        id: item._id || index,
        status: statusTitle,
        description: statusDescription,
        timestamp: item.timestamp,
        time: formatTimelineDateTime(item.timestamp),
        icon: config.icon || 'time',
        badge: config.badgeKey ? t(config.badgeKey) : t('Status'),
        badgeColor: config.badgeColor || '#F5F5F5',
        textColor: config.textColor || '#9E9E9E',
        completed: true,
      };
    });
  }, [data?.createdAt, statusHistory, t, formatTimelineDateTime]);

  const formatPDFDateTime = useCallback(
    dateValue => {
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) {
        return t('Invalid date');
      }
      return date.toLocaleString(dateLocale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    },
    [dateLocale, t],
  );

  const escapeHtml = value =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const normalizeFilePath = path => String(path || '').replace(/^file:\/\//, '');

  const shareFileOnIos = async (filePath, {type, title}) => {
    const shareUrl = filePath.startsWith('file://')
      ? filePath
      : `file://${filePath}`;

    try {
      await ShareLib.open({
        url: shareUrl,
        type,
        title,
        failOnCancel: false,
      });
    } catch (shareLibError) {
      try {
        await Share.share({
          url: shareUrl,
          type,
          title,
        });
      } catch (shareError) {
        await Linking.openURL(shareUrl).catch(() => {
          throw shareLibError || shareError;
        });
      }
    }
  };

  const createOrderTrackingPDFHtml = useCallback(() => {
    const timelineRows = timelineData
      .map(
        item => `
          <tr>
            <td>${escapeHtml(item.status)}</td>
            <td>${escapeHtml(
              t('Status updated to {{status}}', {status: item.status}),
            )}</td>
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
            <td>${escapeHtml(translatePricingLabel(row?.label))}</td>
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

    const schedPdf = buildEventSchedule(data, dateLocale, notAvailableLabel);
    const locPdf = escapeHtml(
      data?.eventLocation || detailsData?.eventLocation || t('N/A'),
    );
    const eventLocationAndDatesPdf = schedPdf.isMultiDay
      ? `<tr><td class="key">${escapeHtml(t('Event Location'))}</td><td class="value">${locPdf}</td><td class="key">${escapeHtml(t('Start date'))}</td><td class="value">${escapeHtml(schedPdf.startDateLabel)}</td></tr><tr><td class="key">${escapeHtml(t('End date'))}</td><td class="value">${escapeHtml(schedPdf.endDateLabel)}</td><td class="key"></td><td class="value"></td></tr>`
      : `<tr><td class="key">${escapeHtml(t('Event Location'))}</td><td class="value">${locPdf}</td><td class="key">${escapeHtml(t('Event Date'))}</td><td class="value">${escapeHtml(schedPdf.singleDateLabel)}</td></tr>`;
    const timesRowPdf = `<tr><td class="key">${escapeHtml(t('Start Time'))}</td><td class="value">${escapeHtml(schedPdf.startTimeLabel)}</td><td class="key">${escapeHtml(t('End Time'))}</td><td class="value">${escapeHtml(schedPdf.endTimeLabel)}</td></tr>`;

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
          <div class="report-title">${escapeHtml(t('Order Tracking Report'))}</div>
        </div>

        <div class="section-title">${escapeHtml(t('Order Information'))}</div>
        <table>
          <tr><td class="key">${escapeHtml(t('Order ID'))}</td><td class="value">${escapeHtml(data?.trackingId || t('N/A'))}</td><td class="key">${escapeHtml(t('Status'))}</td><td class="value">${escapeHtml(getBookingStatusLabel(data?.status))}</td></tr>
          <tr><td class="key">${escapeHtml(t('Booking Item'))}</td><td class="value">${escapeHtml(listingTitle || t('Untitled'))}</td><td class="key">${escapeHtml(t('Payment Status'))}</td><td class="value">${escapeHtml(getPaymentStatusLabel(data?.paymentStatus))}</td></tr>
          <tr><td class="key">${escapeHtml(t('Client Name'))}</td><td class="value">${escapeHtml(data?.client?.fullName || data?.userId?.fullName || t('N/A'))}</td><td class="key">${escapeHtml(t('Phone'))}</td><td class="value">${escapeHtml(data?.client?.contactNumber || data?.userId?.contactNumber || t('N/A'))}</td></tr>
          <tr><td class="key">${escapeHtml(t('Email'))}</td><td class="value">${escapeHtml(data?.client?.email || data?.userId?.email || t('N/A'))}</td><td class="key">${escapeHtml(t('Client Location'))}</td><td class="value">${escapeHtml(data?.eventLocation || detailsData?.eventLocation || t('N/A'))}</td></tr>
          ${eventLocationAndDatesPdf}
          ${timesRowPdf}
        </table>

        <div class="section-title">${escapeHtml(t('Pricing Breakdown'))}</div>
        <table>
          <tr><th>${escapeHtml(t('Description'))}</th><th style="text-align:right;">${escapeHtml(t('Amount'))}</th></tr>
          ${pricingHtmlRows}
          <tr class="total-row"><td>${escapeHtml(t('Total'))}</td><td style="text-align:right;">${escapeHtml(totalAmount)}</td></tr>
        </table>

        <div class="section-title">${escapeHtml(t('Order Timeline'))}</div>
        <table>
          <tr><th>${escapeHtml(t('Title'))}</th><th>${escapeHtml(t('Description'))}</th><th>${escapeHtml(t('Date'))}</th><th>${escapeHtml(t('Actor'))}</th></tr>
          ${timelineRows}
        </table>

        <div class="footer">
          <span>${escapeHtml(t('Generated on:'))} ${escapeHtml(generatedAt)}</span>
          <span>${escapeHtml(t('Page 1'))}</span>
        </div>
      </body>
      </html>
    `;
  }, [
    timelineData,
    pricingRows,
    data,
    detailsData,
    dateLocale,
    notAvailableLabel,
    t,
    formatPDFDateTime,
    translatePricingLabel,
    getBookingStatusLabel,
    getPaymentStatusLabel,
    listingTitle,
  ]);

  const handleDownloadPDF = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `order-tracking-${data?.trackingId || 'report'}-${timestamp}`;
      const pdf = await generatePDF({
        html: createOrderTrackingPDFHtml(),
        fileName,
        directory: 'Documents',
      });

      const generatedPath = normalizeFilePath(pdf?.filePath);
      if (!generatedPath || !(await RNFS.exists(generatedPath))) {
        throw new Error(t('PDF file was not created'));
      }

      const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}.pdf`;

      if (generatedPath !== destinationPath) {
        if (await RNFS.exists(destinationPath)) {
          await RNFS.unlink(destinationPath);
        }
        await RNFS.copyFile(generatedPath, destinationPath);
      }

      if (Platform.OS === 'android') {
        const folderPath = RNFS.DownloadDirectoryPath;
        const androidPath = `${folderPath}/${fileName}.pdf`;
        const folderExists = await RNFS.exists(folderPath);

        if (!folderExists) {
          await RNFS.mkdir(folderPath);
        }

        if (await RNFS.exists(androidPath)) {
          await RNFS.unlink(androidPath);
        }

        await RNFS.copyFile(destinationPath, androidPath);
        Alert.alert(t('Success'), t('PDF saved to Downloads folder.'));
      } else {
        await shareFileOnIos(destinationPath, {
          type: 'application/pdf',
          title: t('Order Tracking PDF'),
        });
      }
    } catch (error) {
      console.log('PDF generation failed:', error);
      Alert.alert(
        t('Error'),
        error?.message || t('Failed to generate PDF. Please try again.'),
      );
    }
  };

  const lastTimelineStatus =
    timelineData[timelineData.length - 1]?.status || t('Order Completed');

  return (
    <View style={styles.container}>
      <AppHeader
        headingText={t('Order Tracking')}
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
            {t('Order Tracking')} - {data?.trackingId || t('N/A')}
          </Text>
          <View style={styles.completedPill}>
            <Text style={styles.completedPillText}>
              {getBookingStatusLabel(data?.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>{t('Order Information')}</Text>
        <View style={styles.orderInfoCard}>
          {listingTitle ? (
            <View style={styles.fieldsRow}>
              <View style={[styles.fieldBlock, styles.fullWidth]}>
                <Text style={styles.fieldLabel}>{t('Booking Item')}</Text>
                <Text style={styles.fieldValue}>{listingTitle}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.fieldsRow}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('Payment Status')}</Text>
              <Text style={styles.fieldValue}>
                {getPaymentStatusLabel(data?.paymentStatus)}
              </Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('Status')}</Text>
              <Text style={styles.fieldValue}>
                {getBookingStatusLabel(data?.status)}
              </Text>
            </View>
          </View>

          <View style={styles.fieldsRow}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('Tracking ID')}</Text>
              <Text style={styles.fieldValue}>
                {data?.trackingId || t('N/A')}
              </Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('Client Name')}</Text>
              <Text style={styles.fieldValue}>
                {data?.client?.fullName || data?.userId?.fullName || t('N/A')}
              </Text>
            </View>
          </View>

          <View style={styles.fieldsRow}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('Phone')}</Text>
              <Text style={styles.fieldValue}>
                {data?.client?.contactNumber ||
                  data?.userId?.contactNumber ||
                  t('N/A')}
              </Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('Email')}</Text>
              <Text style={styles.fieldValue}>
                {data?.client?.email || data?.userId?.email || t('N/A')}
              </Text>
            </View>
          </View>

          <View style={styles.fieldsRow}>
            <View style={[styles.fieldBlock, styles.fullWidth]}>
              <Text style={styles.fieldLabel}>{t('Client Location')}</Text>
              <Text style={styles.fieldValue}>
                {data?.eventLocation || detailsData?.eventLocation || t('N/A')}
              </Text>
            </View>
          </View>

          <View style={styles.fieldsRow}>
            <View style={[styles.fieldBlock, styles.fullWidth]}>
              <Text style={styles.fieldLabel}>{t('Event Location')}</Text>
              <Text style={styles.fieldValue}>
                {data?.eventLocation || detailsData?.eventLocation || t('N/A')}
              </Text>
            </View>
          </View>

          {eventSchedule.isMultiDay ? (
            <View style={styles.fieldsRow}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('Start date')}</Text>
                <Text style={styles.fieldValue}>
                  {eventSchedule.startDateLabel}
                </Text>
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('End date')}</Text>
                <Text style={styles.fieldValue}>
                  {eventSchedule.endDateLabel}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.fieldsRow}>
              <View style={[styles.fieldBlock, styles.fullWidth]}>
                <Text style={styles.fieldLabel}>{t('Event Date')}</Text>
                <Text style={styles.fieldValue}>
                  {eventSchedule.singleDateLabel}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.fieldsRow}>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('Start Time')}</Text>
              <Text style={styles.fieldValue}>
                {eventSchedule.startTimeLabel}
              </Text>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('End Time')}</Text>
              <Text style={styles.fieldValue}>
                {eventSchedule.endTimeLabel}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeading}>{t('Pricing Breakdown')}</Text>
        <View style={styles.pricingCard}>
          {pricingRows.map((row, index) => (
            <View
              key={`${row?.label}-${index}`}
              style={[
                styles.pricingRow,
                index !== pricingRows.length - 1 && styles.borderBottom,
              ]}>
              <Text style={styles.pricingLabel}>
                {translatePricingLabel(row?.label)}
              </Text>
              <Text style={styles.pricingValue}>
                {formatAmount(row?.amount)}
              </Text>
            </View>
          ))}

          <View style={styles.pricingRow}>
            <Text style={styles.totalLabel}>{t('Total')}</Text>
            <Text style={styles.totalValue}>
              {formatAmount(
                data?.totalPrice || data?.pricingBreakdown?.total || 0,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionHeading}>{t('Order Timeline')}</Text>

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

        <Text style={styles.sectionHeading}>{t('Progress Notes')}</Text>
        <View style={styles.progressNotesSection}>
          <Icon name="alert-circle-outline" size={14} color="#E6A100" />
          <Text style={styles.progressNotesText}>
            {t('Current status:')} {lastTimelineStatus}
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

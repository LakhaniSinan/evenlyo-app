import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import {normalizeStatusKey} from '../../utils/translatePricingBreakdownLabel';
import i18n from '../../services/i18n';

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
  complain: 'statusComplain',
  claim: 'statusClaim',
};

const STATUS_COLORS = {
  pending: {bg: '#FFF4E5', text: '#FF9800'},
  accepted: {bg: '#E3F2FD', text: '#1976D2'},
  on_the_way: {bg: '#E1F5FE', text: '#0288D1'},
  received: {bg: '#E0F7FA', text: '#0097A7'},
  finished: {bg: '#E8F5E9', text: '#2E7D32'},
  picked_up: {bg: '#F3E5F5', text: '#7B1FA2'},
  received_back: {bg: '#E0F2F1', text: '#00695C'},
  completed: {bg: '#E8F5E9', text: '#1B5E20'},
  rejected: {bg: '#FDECEA', text: '#D32F2F'},
  cancelled: {bg: '#FFEBEE', text: '#D32F2F'},
  claim: {bg: '#FFF8E1', text: '#FBC02D'},
  paid: {bg: '#E0F7FA', text: '#0097A7'},
  complain: {bg: '#FCE4EC', text: '#C2185B'},
  new_request: {bg: '#FFE8F0', text: '#E91E63'},
};

const StatusBadge = ({status}) => {
  const {t, currentLanguage} = useTranslation();

  if (!status) {
    return null;
  }

  const statusKey = normalizeStatusKey(status);
  const labelKey = BOOKING_STATUS_I18N[statusKey];
  const formattedStatus = labelKey ? t(labelKey) : String(status).trim();

  const {bg, text} = STATUS_COLORS[statusKey] || {
    bg: '#ECEFF1',
    text: '#37474F',
  };

  return (
    <View style={[styles.statusBadge, {backgroundColor: bg}]}>
      <Text style={[styles.statusText, {color: text}]}>{formattedStatus}</Text>
    </View>
  );
};

export default StatusBadge;

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
});

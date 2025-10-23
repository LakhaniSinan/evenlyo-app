import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {fontFamly} from '../../constants';

const StatusBadge = ({status}) => {
  if (!status) return null;

  // ✅ Format status (First letter capitalized, rest lowercase)
  const formattedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  // ✅ Define colors for each status
  const getStatusColor = status => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'finished':
        return {bg: '#E8F5E8', text: '#2E7D32'}; // Green shades
      case 'pending':
      case 'in progress':
        return {bg: '#FFF3E0', text: '#FF9800'}; // Orange shades
      case 'paid':
        return {bg: '#E0F7FA', text: '#0097A7'}; // Teal shades
      case 'new request':
      case 'newrequests':
        return {bg: '#FFE8F0', text: '#E91E63'}; // Pink shades
      case 'accepted':
        return {bg: '#E0F2FF', text: '#0288D1'}; // Blue shades
      case 'claim':
        return {bg: '#FFF8E1', text: '#FBC02D'}; // Yellow shades
      case 'rejected':
        return {bg: '#FFEBEE', text: '#D32F2F'}; // Red shades
      default:
        return {bg: '#F5F5F5', text: '#666666'}; // Neutral gray
    }
  };

  const {bg, text} = getStatusColor(status);

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

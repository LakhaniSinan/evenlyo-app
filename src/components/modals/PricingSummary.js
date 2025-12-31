import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const PricingSummary = ({data}) => {

  return (
    <View style={styles.pricingSection}>
      <Text style={styles.pricingTitle}>Pricing Summary</Text>
      <View style={styles.pricingRow}>
        <View>
          <Text style={styles.pricingLabel}>
            Multi-day Service (3 days × 10h)
          </Text>
          <Text style={styles.pricingLabel}>3 days × 10 hours × $500/hour</Text>
        </View>
        <Text style={styles.pricingValue}>$ 15000.00</Text>
      </View>
      <View style={styles.pricingRow}>
        <Text style={styles.pricingLabel}>Travel Cost (1160km)</Text>
        <Text style={styles.pricingValue}>$ 58000.00</Text>
      </View>
      <View style={styles.pricingRow}>
        <Text style={styles.pricingLabel}>Security Deposit(Refundable)</Text>
        <Text style={styles.pricingValue}>$500.00</Text>
      </View>
      <View style={styles.pricingRow}>
        <Text style={styles.pricingLabel}>Platform Service Fee (5%)</Text>
        <Text style={styles.pricingValue}>$3675.00</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.pricingRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>$ 77175.00</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pricingSection: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: width(3),
    paddingHorizontal: width(4),
    paddingVertical: width(3),
    marginBottom: width(4),
  },
  pricingTitle: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  pricingValue: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  divider: {height: 1, backgroundColor: '#e0e0e0', marginVertical: 15},
  totalLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  totalValue: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

export default PricingSummary;

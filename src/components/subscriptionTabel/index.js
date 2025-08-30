import React from 'react';
import {FlatList, StyleSheet, Text, TextInput, View} from 'react-native';
import {COLORS, fontFamly} from '../../constants';

const dummyData = [
  {
    id: '1',
    item: 'DJ',
    title: 'Premium Subscription',
    subText: 'Monthly subscription service',
    quantity: '2',
    securityFee: '$25',
  },
  {
    id: '2',
    item: 'AB',
    title: 'Gold Plan',
    subText: 'Annual subscription service',
    quantity: '1',
    securityFee: '$50',
  },
  {
    id: '3',
    item: 'XY',
    title: 'Basic Membership',
    subText: 'Weekly subscription',
    quantity: '3',
    securityFee: '$15',
  },
];

const SubscriptionTable = () => {
  const renderRow = ({item}) => (
    <View style={styles.row}>
      <Text style={[styles.cell, {flex: 1}]}>{item.item}</Text>

      <View style={{flex: 2}}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subText}>{item.subText}</Text>
      </View>

      <View style={[styles.quantityBox, {flex: 1}]}>
        <TextInput
          value={item.quantity}
          style={styles.input}
          editable={false}
        />
      </View>

      <Text style={[styles.cell, {flex: 1}]}>{item.securityFee}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.headerCell, {flex: 1}]}>Items</Text>
        <Text style={[styles.headerCell, {flex: 2}]}>Description</Text>
        <Text style={[styles.headerCell, {flex: 1}]}>Quantity</Text>
        <Text style={[styles.headerCell, {flex: 1}]}>Security Fee</Text>
      </View>

      {/* Data Rows */}
      <FlatList
        data={dummyData}
        keyExtractor={item => item.id}
        renderItem={renderRow}
      />
    </View>
  );
};

export default SubscriptionTable;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  headerRow: {
    backgroundColor: '#FDF1F4',
  },
  headerCell: {
    textAlign: 'center',
    fontSize: 9,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
  },
  cell: {
    textAlign: 'center',
    fontSize: 9,
    color: COLORS.textLight,
  },
  title: {
    fontWeight: '700',
    fontSize: 9,
    color: COLORS.black,
  },
  subText: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
  },
  quantityBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    width: 40,
    height: 25,
    textAlign: 'center',
    fontSize: 9,
    color: COLORS.black,
  },
});

import React, {useState} from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import InvoiceModal from '../modals/InvoiceModal';
import {runOnJS} from 'react-native-reanimated';

const BookingTable = ({data}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.bookingId}</Text>
      <Text style={styles.cell}>{item.bookingItem}</Text>
      <Text style={styles.cell}>{item.totalCost}</Text>
      <Text style={[styles.cell, styles.earning]}>{item.earning}</Text>
      <TouchableOpacity
        style={styles.cell}
        onPress={() => setModalVisible(true)}>
        <Image
          source={ICONS.downloadIcon}
          style={{height: 10, width: 10}}
          tintColor={COLORS.textLight}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.row, styles.header]}>
          <Text style={styles.headerCell}>Booking Id</Text>
          <Text style={styles.headerCell}>Booking Item</Text>
          <Text style={styles.headerCell}>Total Cost</Text>
          <Text style={styles.headerCell}>Earning</Text>
          <Text style={styles.headerCell}></Text>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      </View>
      <InvoiceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default BookingTable;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    backgroundColor: '#FDF1F4', // light pink header
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 10,
    color: COLORS.textLight,
  },
  cell: {
    flex: 1,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 9,
    textAlign: 'center',
    color: COLORS.textDark,
  },
  earning: {
    color: '#4CAF50', // green text for earning
    fontWeight: '600',
  },
});

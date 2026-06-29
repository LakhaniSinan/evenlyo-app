import moment from 'moment';
import React, {useMemo, useState} from 'react';
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
import {useTranslation} from '../../hooks';
import SaleReportingModal from '../saleReportingModal';

const SaleItemTable = ({data, canDownload}) => {
  console.log(data, 'datadatadata123456543retr');

  const {currentLanguage} = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const flatData = useMemo(() => {
    if (!data?.allSale) return [];
    return data?.allSale
      ?.map(order =>
        order.items.map(item => ({
          orderId: order._id,
          trackingId: order.trackingId,
          customerId: order.customerId,
          totalAmount: order.totalAmount,
          orderDate: order.createdAt,
          itemName:
            currentLanguage === 'en' ? item.itemName.en : item.itemName.nl,
          itemProfit: item.profit,
        })),
      )
      .flat();
  }, [data, currentLanguage]);

  const renderItem = ({item, index}) => (
    <View style={styles.row}>
      <Text style={styles.cell}>
        {index + 1}: {item.itemName}
      </Text>
      <Text style={styles.cell}>{item.customerId}</Text>
      <Text style={styles.cell}>${item.totalAmount}</Text>
      <Text style={styles.cell}>
        {moment(item.orderDate).format('DD/MM/YYYY')}
      </Text>
      {canDownload && (
        <TouchableOpacity
          style={styles.cell}
          onPress={() => setModalVisible(true)}>
          <Image
            source={ICONS.downloadIcon}
            style={{height: 10, width: 10}}
            tintColor={COLORS.textLight}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.row, styles.header]}>
          <Text style={styles.headerCell}>Item Name</Text>
          <Text style={styles.headerCell}>Customer ID</Text>
          <Text style={styles.headerCell}>Total Amount</Text>
          <Text style={styles.headerCell}>Order Date</Text>
          {canDownload && <Text style={styles.headerCell} />}
        </View>

        {/* Table Body */}
        <View style={styles.scrollContainer}>
          <FlatList
            data={flatData}
            keyExtractor={(item, index) => `${item.orderId}-${index}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Modal */}
      <SaleReportingModal
        data={data}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default SaleItemTable;

const styles = StyleSheet.create({
  container: {flex: 1},
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scrollContainer: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    backgroundColor: '#FDF1F4',
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
});

import React, {useEffect, useState} from 'react';
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
import TextField from '../textInput';

const BillingTable = ({
  data,
  onFilterPress,
  handleDownload,
  handlPayAmount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const {t} = useTranslation();

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredData(data);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = data.filter(
        item =>
          item.billingId.toLowerCase().includes(lowerQuery) ||
          item.status.toLowerCase().includes(lowerQuery) ||
          item.plan.toLowerCase().includes(lowerQuery),
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, data]);

  const renderItem = ({item, index}) => (
    <View
      style={[
        styles.row,
        {borderBottomWidth: 1, borderBottomColor: COLORS.border},
        index === filteredData.length - 1 && {borderBottomWidth: 0},
      ]}>
      <Text style={styles.cell}>{item.billingId}</Text>
      <Text style={styles.cell}>{item.date}</Text>
      <Text style={styles.cellBadge}>{item.plan}</Text>
      <Text style={styles.cell}>${item.amount}</Text>
      <View style={styles.statusWrapper}>
        {item?.status == 'Paid' ? (
          <Text
            style={[
              styles.status,
              {
                backgroundColor: item.status === 'Paid' ? '#E7F8EE' : '#FDEDED',
                color: item.status === 'Paid' ? '#4CAF50' : '#F44336',
              },
            ]}>
            {item.status}
          </Text>
        ) : (
          <TouchableOpacity onPress={handlPayAmount}>
            <Text
              style={[
                styles.status,
                {
                  backgroundColor:
                    item.status === 'Paid' ? '#E7F8EE' : '#FDEDED',
                  color: item.status === 'Paid' ? '#4CAF50' : '#F44336',
                },
              ]}>
              {item.status}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.downloadIcon} onPress={handleDownload}>
        <Image
          source={ICONS.downloadIcon}
          style={{height: 15, width: 15}}
          resizeMode="contain"
          tintColor={COLORS.textLight}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TextField
          placeholder={t('searchEvent')}
          placeholderTextColor="#aaa"
          bgColor={COLORS.white}
          startIcon={ICONS.search}
          inputContainer={{
            paddingVertical: 0,
            paddingHorizontal: 10,
            height: 45,
            width: '100%',
            marginTop: 0,
          }}
          styleProps={{
            fontSize: 14,
            color: '#000',
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 13,
          }}>
          <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
            <Image
              source={ICONS.calenderIcon}
              resizeMode="contain"
              style={{height: 20, width: 20}}
            />
            <Text
              style={{
                color: COLORS.textLight,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                fontSize: 12,
                marginLeft: 5,
              }}>
              Filter by date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
            <Image
              source={ICONS.downloadIcon}
              resizeMode="contain"
              style={{height: 20, width: 20}}
              tintColor={COLORS.textLight}
            />
            <Text
              style={{
                color: COLORS.textLight,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                fontSize: 12,
                marginLeft: 5,
              }}>
              Export
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{borderWidth: 1, borderColor: COLORS.border, borderRadius: 8}}>
        <View style={[styles.row, styles.header]}>
          <Text style={styles.headerCell}>Billing ID</Text>
          <Text style={styles.headerCell}>Date</Text>
          <Text style={styles.headerCell}>Plan</Text>
          <Text style={styles.headerCell}>Amount</Text>
          <Text style={styles.headerCell}>Status</Text>
          <Text style={styles.headerCell}>Actions</Text>
        </View>

        {/* Table Data */}
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
};

export default BillingTable;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  topBar: {
    marginVertical: 10,
    justifyContent: 'sbpace-between',
  },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 10,
  },
  exportButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  header: {
    backgroundColor: '#FDF1F4',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 9,
    color: COLORS.textDark,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    color: '#444',
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 9,
  },
  cellBadge: {
    flex: 1,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 2,
    fontSize: 9,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
  },
  statusWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 9,
  },
  downloadIcon: {
    flex: 1,
    alignItems: 'center',
  },
});

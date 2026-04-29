import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import ReportingModal from '../modals/ReportingModal';
import {useTranslation} from '../../hooks';

const BookingTable = ({data, canDownload, onSelectionChange}) => {
  const {currentLanguage} = useTranslation();
  const pageSize = 5;
  const bookingRows = data?.bookingTable || [];
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const totalPages = Math.max(1, Math.ceil(bookingRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
    onSelectionChange?.([]);
  }, [bookingRows.length]);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return bookingRows.slice(start, start + pageSize);
  }, [bookingRows, safePage]);

  const allRowIds = useMemo(
    () =>
      bookingRows.map(item => item?._id || item?.trackingId).filter(Boolean),
    [bookingRows],
  );
  const isAllSelected =
    allRowIds.length > 0 && allRowIds.every(id => selectedIds.includes(id));

  const pushSelection = ids => {
    if (!onSelectionChange) return;
    const selectedRows = bookingRows.filter(item => {
      const rowId = item?._id || item?.trackingId;
      return ids.includes(rowId);
    });
    onSelectionChange(selectedRows);
  };

  const toggleSelectOne = item => {
    const rowId = item?._id || item?.trackingId;
    if (!rowId) return;
    setSelectedIds(prev => {
      const nextIds = prev.includes(rowId)
        ? prev.filter(id => id !== rowId)
        : [...prev, rowId];
      pushSelection(nextIds);
      return nextIds;
    });
  };

  const toggleSelectAll = () => {
    const nextIds = isAllSelected ? [] : allRowIds;
    setSelectedIds(nextIds);
    pushSelection(nextIds);
  };

  const getRangeLabel = () => {
    if (!bookingRows.length) return 'Showing 0 to 0 of 0 bookings';
    const start = (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, bookingRows.length);
    return `Showing ${start} to ${end} of ${bookingRows.length} bookings`;
  };

  const renderItem = ({item}) => {
    const rowId = item?._id || item?.trackingId;
    const checked = selectedIds.includes(rowId);

    return (
      <View style={styles.row}>
        <Pressable
          style={styles.checkboxWrap}
          onPress={() => toggleSelectOne(item)}>
          <Icon
            name={checked ? 'checkbox' : 'square-outline'}
            size={16}
            color={checked ? '#E31B95' : '#B8B8B8'}
          />
        </Pressable>
        <Text numberOfLines={1} style={[styles.cell, styles.trackingCell]}>
          {item.trackingId}
        </Text>
        <Text numberOfLines={1} style={[styles.cell, styles.itemCell]}>
          {currentLanguage === 'en'
            ? item?.listingDetails?.title?.en
            : item?.listingDetails?.title?.nl}
        </Text>
        <Text style={[styles.cell, styles.costCell]}>
          € {item.pricingBreakdown?.total ?? 0}
        </Text>
        {canDownload && (
          <TouchableOpacity
            style={styles.exportCell}
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.row, styles.header]}>
          <Pressable style={styles.checkboxWrap} onPress={toggleSelectAll}>
            <Icon
              name={isAllSelected ? 'checkbox' : 'square-outline'}
              size={16}
              color={isAllSelected ? '#E31B95' : '#B8B8B8'}
            />
          </Pressable>
          <Text style={[styles.headerCell, styles.trackingCell]}>Tracking ID</Text>
          <Text style={[styles.headerCell, styles.itemCell]}>Booking Item</Text>
          <Text style={[styles.headerCell, styles.costCell]}>Total Cost</Text>
          {canDownload && (
            <Text style={[styles.headerCell, styles.exportCell]}>Export</Text>
          )}
        </View>

        {/* Scrollable Table Body */}
        <View style={styles.scrollContainer}>
          <FlatList
            data={paginatedData}
            keyExtractor={(item, index) =>
              String(item?._id || item?.trackingId || index)
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No bookings found</Text>
            }
          />
        </View>
      </View>

      <View style={styles.paginationRow}>
        <Text style={styles.paginationText}>{getRangeLabel()}</Text>
        <View style={styles.paginationButtons}>
          <Pressable
            disabled={safePage === 1}
            style={[
              styles.pageButton,
              safePage === 1 && styles.pageButtonDisabled,
            ]}
            onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}>
            <Text style={styles.pageButtonText}>Previous</Text>
          </Pressable>
          <View style={styles.pageCurrent}>
            <Text style={styles.pageCurrentText}>{safePage}</Text>
          </View>
          <Pressable
            disabled={safePage >= totalPages}
            style={[
              styles.pageButton,
              safePage >= totalPages && styles.pageButtonDisabled,
            ]}
            onPress={() =>
              setCurrentPage(prev => Math.min(totalPages, prev + 1))
            }>
            <Text style={styles.pageButtonText}>Next</Text>
          </Pressable>
        </View>
      </View>

      {/* Modal */}
      <ReportingModal
        data={data}
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
    // padding: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scrollContainer: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
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
    textAlign: 'left',
    fontFamily: fontFamly.PlusJakartaSansMedium,
    fontSize: 10,
    color: COLORS.textLight,
  },
  cell: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 10,
    textAlign: 'left',
    color: COLORS.textDark,
  },
  trackingCell: {
    flex: 1.5,
    paddingRight: 8,
  },
  itemCell: {
    flex: 1.8,
    paddingRight: 8,
  },
  costCell: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 8,
  },
  exportCell: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  checkboxWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 18,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 10,
  },
  paginationRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  paginationText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pageButtonDisabled: {
    opacity: 0.45,
  },
  pageButtonText: {
    fontSize: 9,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  pageCurrent: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E31B95',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageCurrentText: {
    color: COLORS.white,
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  earning: {
    color: '#4CAF50', // green text for earning
    fontWeight: '600',
  },
});

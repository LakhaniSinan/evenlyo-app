import React, {memo} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import EventCard from '../eventCard';
import {COLORS, fontFamly} from '../../constants';

const RelevantVendorsRow = ({
  vendors,
  currentLanguage,
  navigation,
  platformFeePercentage,
  onVendorPress,
  emptyLabel,
}) => (
  <FlatList
    data={vendors}
    horizontal
    extraData={vendors}
    showsHorizontalScrollIndicator={false}
    keyExtractor={(item, index) => item?._id || String(index)}
    renderItem={({item}) => (
      <EventCard
        item={item}
        navigation={navigation}
        platformFeePercentage={platformFeePercentage}
        onPress={() => onVendorPress(item)}
      />
    )}
    ListEmptyComponent={
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    }
  />
);

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width(100),
    height: width(10),
  },
  emptyText: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 12,
    color: COLORS.textLight,
  },
});

export default memo(RelevantVendorsRow);

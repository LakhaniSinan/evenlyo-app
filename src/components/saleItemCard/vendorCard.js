import React, {memo, useMemo} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import ProductItem from './productItem';

const CheckBox = memo(({checked, onPress}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && (
        <Image
          source={ICONS.cheackIcon}
          resizeMode="contain"
          style={styles.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
});

const VendorCard = memo(
  ({
    item,
    index,
    selectedProducts,
    onToggleVendorSelect,
    onToggleProductSelect,
    onIncrement,
    onDecrement,
  }) => {
    const allProductsChecked = useMemo(() => {
      return item?.products?.every(
        p => selectedProducts?.[`${index}-${p._id}`],
      );
    }, [item?.products, selectedProducts, index]);

    const handleVendorToggle = () => {
      onToggleVendorSelect(index, allProductsChecked);
    };

    return (
      <View style={styles.vendorCard}>
        <View style={styles.vendorHeader}>
          <CheckBox checked={allProductsChecked} onPress={handleVendorToggle} />

          <View style={styles.vendorInfo}>
            <Text style={styles.vendorTitle}>{item.vendorName}</Text>
            <Text style={styles.vendorLocation}>{item.businessLocation}</Text>
          </View>
        </View>

        {item?.products?.map(product => (
          <ProductItem
            key={product._id}
            product={product}
            vendorIndex={index}
            selectedProducts={selectedProducts}
            onToggleSelect={onToggleProductSelect}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        ))}
      </View>
    );
  },
);

export default VendorCard;

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkIcon: {
    width: width(5.5),
    height: width(5.5),
  },

  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  vendorInfo: {
    marginLeft: 8,
  },

  vendorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
  },

  vendorLocation: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    fontSize: 12,
    marginBottom: 10,
  },
});

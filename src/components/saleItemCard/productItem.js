import React, {memo, useCallback} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {formatPrice} from '../../utils';

const CheckBox = memo(({checked, onPress}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
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

const ProductItem = ({
  product,
  vendorIndex,
  selectedProducts,
  onToggleSelect,
  onIncrement,
  onDecrement,
}) => {
  const itemKey = `${vendorIndex}-${product._id}`;
  const isChecked = !!selectedProducts[itemKey];

  const handleToggle = useCallback(() => {
    onToggleSelect(itemKey, isChecked);
  }, [itemKey, isChecked, onToggleSelect]);

  const handleIncrement = useCallback(() => {
    onIncrement(vendorIndex, product._id);
  }, [vendorIndex, product._id, onIncrement]);

  const handleDecrement = useCallback(() => {
    onDecrement(vendorIndex, product._id);
  }, [vendorIndex, product._id, onDecrement]);

  return (
    <View style={styles.card}>
      <CheckBox checked={isChecked} onPress={handleToggle} />

      <Image source={{uri: product.image}} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {product.title?.en}
        </Text>

        <Text style={styles.price}>
          € {formatPrice(product.sellingPrice * product.quantity)}
        </Text>

        <View style={styles.counterRow}>
          <CounterButton text="-" onPress={handleDecrement} />
          <Text style={styles.quantity}>{product.quantity}</Text>
          <CounterButton text="+" onPress={handleIncrement} />
        </View>

        <Text style={styles.stock}>Available: {product.stockQuantity}</Text>
      </View>
    </View>
  );
};

export default memo(ProductItem);

const CounterButton = memo(({text, onPress}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={styles.counterBtn}>
    <Text style={styles.counterText}>{text}</Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkIcon: {
    width: width(5),
    height: width(5),
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  price: {
    color: COLORS.primary,
    fontWeight: '700',
    marginVertical: 4,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  counterBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  stock: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

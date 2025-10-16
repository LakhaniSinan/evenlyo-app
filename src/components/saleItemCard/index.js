import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {COLORS, fontFamly} from '../../constants';
import {setCartData} from '../../redux/slice/cart';
import GradientButton from '../button';

const SaleItemCard = ({handlePressCheckOut}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {cartData} = useSelector(state => state.CartSlice);
  const [localCart, setLocalCart] = useState(cartData || []);

  useEffect(() => {
    setLocalCart(cartData || []);
  }, [cartData]);

  const updateCartInRedux = async updatedCart => {
    dispatch(setCartData(updatedCart));
    await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));
  };

  const handleIncrement = useCallback(
    (vendorIndex, productId) => {
      const updatedCart = localCart.map((vendor, vIndex) => {
        if (vIndex !== vendorIndex) return vendor;

        const updatedProducts = vendor.products.map(product => {
          if (product._id !== productId) return product;
          if (product.quantity < product.stockQuantity) {
            return {...product, quantity: product.quantity + 1};
          } else {
            Alert.alert('Stock Limit', 'Maximum stock limit reached!');
            return product;
          }
        });

        return {...vendor, products: updatedProducts};
      });

      setLocalCart(updatedCart);
      updateCartInRedux(updatedCart);
    },
    [localCart],
  );

  const handleDecrement = useCallback(
    (vendorIndex, productId) => {
      const vendor = localCart[vendorIndex];
      const product = vendor.products.find(p => p._id === productId);
      if (!product) return;

      if (product.quantity === 1) {
        Alert.alert('Remove Item', `Remove "${product.title}" from the cart?`, [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Yes, Remove',
            style: 'destructive',
            onPress: () => {
              const updatedProducts = vendor.products.filter(
                p => p._id !== productId,
              );
              const updatedCart = localCart
                .map((v, i) =>
                  i === vendorIndex ? {...v, products: updatedProducts} : v,
                )
                .filter(v => v.products.length > 0);

              setLocalCart(updatedCart);
              updateCartInRedux(updatedCart);
            },
          },
        ]);
        return;
      }

      const updatedCart = localCart.map((vendor, vIndex) => {
        if (vIndex !== vendorIndex) return vendor;
        const updatedProducts = vendor.products.map(p =>
          p._id === productId ? {...p, quantity: p.quantity - 1} : p,
        );
        return {...vendor, products: updatedProducts};
      });

      setLocalCart(updatedCart);
      updateCartInRedux(updatedCart);
    },
    [localCart],
  );

  // ✅ Calculate vendor total (multiplied by quantity)
  const vendorTotals = useMemo(() => {
    return localCart.map(vendor => ({
      vendorName: vendor.vendorName,
      total: vendor.products.reduce(
        (sum, item) => sum + item.sellingPrice * item.quantity,
        0,
      ),
    }));
  }, [localCart]);

  // ✅ Grand total for all vendors
  const grandTotal = useMemo(
    () => vendorTotals.reduce((sum, v) => sum + v.total, 0),
    [vendorTotals],
  );

  // ✅ Product card
  const renderProduct = (vendorIndex, product) => (
    <View key={product._id} style={styles.card}>
      <Image source={{uri: product.image}} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
          ${(product.sellingPrice * product.quantity).toFixed(2)}
        </Text>

        <View style={styles.counterContainer}>
          <TouchableOpacity
            onPress={() => handleDecrement(vendorIndex, product._id)}
            style={styles.counterBtn}>
            <Text style={styles.counterText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantity}>{product.quantity}</Text>

          <TouchableOpacity
            onPress={() => handleIncrement(vendorIndex, product._id)}
            style={styles.counterBtn}>
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.stock}>Available: {product.stockQuantity}</Text>
      </View>
    </View>
  );

  // ✅ Vendor section
  const renderVendor = ({item, index}) => (
    <View style={styles.vendorCard}>
      <Text style={styles.vendorTitle}>{item.vendorName}</Text>
      <Text style={styles.vendorLoactions}>{item.businessLocation}</Text>
      {item.products.map(p => renderProduct(index, p))}
      <View style={styles.footer}>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalAmount}>${grandTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Security Fee</Text>
          <Text style={styles.totalAmount}>$ 0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Kilometre Fee</Text>
          <Text style={styles.totalAmount}>$ 0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Service Charges</Text>
          <Text style={styles.totalAmount}>$ 0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>${grandTotal.toFixed(2)}</Text>
        </View>
        <GradientButton
          text="Checkout"
          type="filled"
          onPress={handlePressCheckOut}
          style={styles.payNowBtn}
        />
      </View>
    </View>
  );

  // ✅ Empty cart
  if (localCart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty 😔</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.addButtonText}>Add Items to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <FlatList
        data={localCart}
        renderItem={renderVendor}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{padding: 16}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  vendorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  counterBtn: {
    backgroundColor: '#FF295D',
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: '#fff',
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
    color: COLORS.textLight,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: COLORS.primary || '#FF295D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#555',
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    marginVertical: 8,
  },
  payNowBtn: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vendorLoactions: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    fontSize: 12,
    marginBottom: 10,
  },
});

export default SaleItemCard;

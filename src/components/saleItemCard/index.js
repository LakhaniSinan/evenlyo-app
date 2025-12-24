import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {setCartData} from '../../redux/slice/cart';
import GradientButton from '../button';
import GooglePlacesInput from '../locationField';

// ✅ Simple Checkbox component
const CheckBox = ({checked, onPress}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.checkbox,
      {
        backgroundColor: checked ? COLORS.primary : '#fff',
        borderColor: COLORS.primary,
      },
    ]}>
    {checked && (
      <Image
        resizeMode="cover"
        source={ICONS.cheackIcon}
        style={{height: width(5.5), width: width(5.5)}}
      />
    )}
  </TouchableOpacity>
);

const SaleItemCard = ({handlePressCheckOut}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {cartData} = useSelector(state => state.CartSlice);
  console.log(cartData, 'cartDatacartDatacartDatacartData');

  const RATE_PER_KM = cartData[0]?.products[0]?.vendor;
  const [localCart, setLocalCart] = useState(cartData || []);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [selectedVendorIndex, setSelectedVendorIndex] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [vendorCoords, setVendorCoords] = useState(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);

  useEffect(() => {
    if (selectedVendorIndex !== null) {
      let vendor = localCart[selectedVendorIndex];

      vendor = vendor?.products[0]?.vendor?.location?.coordinates;

      if (vendor?.lat && vendor?.lng) {
        setVendorCoords({
          latitude: vendor.lat,
          longitude: vendor.lng,
        });
      }
    }
  }, [selectedVendorIndex, localCart]);

  const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const toRad = value => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSelectValue = place => {
    setDeliveryLocation(place.userAddress);
    if (!place?.latLng?.latitude || !place?.latLng?.longitude || !vendorCoords)
      return;

    const km = getDistanceInKm(
      vendorCoords.latitude,
      vendorCoords.longitude,
      place?.latLng?.latitude,
      place?.latLng?.longitude,
    );

    const roundedKm = Math.ceil(km);
    setDistanceKm(roundedKm);

    const charges = roundedKm * RATE_PER_KM?.deliveryCharges;
    setDeliveryCharges(charges);

    setDeliveryCoords({
      latitude: place?.latLng?.latitude,
      longitude: place?.latLng?.longitude,
    });
  };

  useEffect(() => {
    setLocalCart(cartData || []);
  }, [cartData]);

  const updateCartInRedux = async updatedCart => {
    dispatch(setCartData(updatedCart));
    await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));
  };

  const selectedProductsArray = useMemo(() => {
    const arr = [];
    Object.keys(selectedProducts).forEach(key => {
      const [vendorIndex, productId] = key.split('-');
      const vendor = localCart[Number(vendorIndex)];
      if (!vendor) return;
      const product = vendor.products.find(p => p._id === productId);
      if (product) arr.push(product);
    });
    return arr;
  }, [selectedProducts, localCart]);

  const selectedTotal = useMemo(() => {
    return selectedProductsArray.reduce(
      (sum, item) => sum + item.sellingPrice * item.quantity,
      0,
    );
  }, [selectedProductsArray]);

  const renderOrderSummary = () => {
    if (selectedProductsArray.length === 0) return null;

    return (
      <View style={styles.orderSummaryContainer}>
        <Text style={styles.orderSummaryHeading}>Order Summary</Text>

        {selectedProductsArray.map(item => (
          <View key={item._id} style={styles.orderItemRow}>
            <Text style={styles.orderItemName}>
              {item.title?.en} × {item.quantity}
            </Text>
            <Text style={styles.orderItemPrice}>
              ${(item.sellingPrice * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.deliveryBox}>
          <Text style={styles.deliveryLabel}>Delivery Location *</Text>
          <GooglePlacesInput
            selectedLocation={deliveryLocation}
            setSelectedLocation={handleSelectValue}
            placeholder="Enter Location"
            bgcolor={COLORS.white}
            showRightIcon={ICONS.locationIcon}
            lable="Add Location *"
          />
        </View>

        <View
          style={{
            backgroundColor: '#EFFFF4',
            borderRadius: 12,
            padding: 12,
            marginVertical: 8,
          }}>
          <Text style={{fontWeight: '700', color: '#1B7F4B'}}>
            Delivery Charges
          </Text>

          <View style={styles.row}>
            <Text style={{color: COLORS.black}}>Distance {distanceKm}Km</Text>
            <Text style={{color: COLORS.black}}>
              Base rate: ${RATE_PER_KM?.deliveryCharges}/km
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={{color: COLORS.black}}>Base delivery charge:</Text>
            <Text style={{color: COLORS.black}}> $ 74250</Text>
          </View>
          <View style={styles.row}>
            <Text style={{color: COLORS.black}}>Extra charges:</Text>
            <Text style={{color: COLORS.black}}> $ 200</Text>
          </View>

          <View style={styles.row}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: COLORS.black,
              }}>
              Total Delivery
            </Text>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: COLORS.black,
              }}>
              $ {deliveryCharges}
            </Text>
          </View>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalAmount}>${selectedTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, {fontWeight: '700'}]}>Total</Text>
          <Text style={[styles.totalAmount, {color: COLORS.primary}]}>
            $ {grandTotalWithDelivery.toFixed(2)}
          </Text>
        </View>

        <GradientButton
          text={
            deliveryLocation
              ? 'Proceed to Checkout'
              : 'Enter Valid Location to Continue'
          }
          type="filled"
          onPress={() => {
            if (!deliveryLocation) return;
            handlePressCheckOut(selectedProductsArray, deliveryLocation);
          }}
          style={{marginTop: 8}}
          disabled={!deliveryLocation}
        />
      </View>
    );
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
        Alert.alert(
          'Remove Item',
          `Remove "${product.title?.en}" from the cart?`,
          [
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
          ],
        );
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

  const vendorTotals = useMemo(() => {
    return localCart.map(vendor => ({
      vendorName: vendor.vendorName,
      total: vendor.products.reduce(
        (sum, item) => sum + item.sellingPrice * item.quantity,
        0,
      ),
    }));
  }, [localCart]);

  const grandTotal = useMemo(
    () => vendorTotals.reduce((sum, v) => sum + v.total, 0),
    [vendorTotals],
  );

  const renderProduct = (vendorIndex, product) => {
    const key = `${vendorIndex}-${product._id}`;
    const checked = !!selectedProducts[key];

    return (
      <View key={product._id} style={styles.card}>
        <CheckBox
          checked={checked}
          onPress={() => {
            const newSelectedProducts = {...selectedProducts, [key]: !checked};

            // ✅ Remove keys with false
            Object.keys(newSelectedProducts).forEach(k => {
              if (!newSelectedProducts[k]) delete newSelectedProducts[k];
            });

            // ✅ Determine vendor index of currently selected products
            const selectedVendorIndexes = Object.keys(newSelectedProducts).map(
              k => Number(k.split('-')[0]),
            );
            const uniqueVendorIndexes = [...new Set(selectedVendorIndexes)];

            // ✅ If more than one vendor, block
            if (!checked && uniqueVendorIndexes.length > 1) {
              Alert.alert(
                'One Vendor Only',
                'You can only place an order from one vendor at a time.',
              );
              return;
            }

            setSelectedProducts(newSelectedProducts);

            // ✅ Update selectedVendorIndex
            if (uniqueVendorIndexes.length === 0) {
              setSelectedVendorIndex(null);
            } else {
              setSelectedVendorIndex(uniqueVendorIndexes[0]);
            }
          }}
        />
        <Image source={{uri: product.image}} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.title}>{product.title?.en}</Text>
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
  };

  const renderVendor = ({item, index}) => {
    const allProductsChecked = item.products.every(
      p => selectedProducts[`${index}-${p._id}`],
    );
    return (
      <View style={styles.vendorCard}>
        <View
          style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
          <CheckBox
            checked={allProductsChecked}
            onPress={() => {
              const newSelected = {...selectedProducts};
              if (allProductsChecked) {
                item.products.forEach(
                  p => delete newSelected[`${index}-${p._id}`],
                );
                setSelectedVendorIndex(null);
              } else {
                if (
                  selectedVendorIndex !== null &&
                  selectedVendorIndex !== index
                ) {
                  Alert.alert(
                    'One Vendor Only',
                    'You can only place an order from one vendor at a time.',
                  );
                  return;
                }
                item.products.forEach(p => {
                  newSelected[`${index}-${p._id}`] = true;
                });
                setSelectedVendorIndex(index);
              }
              setSelectedProducts(newSelected);
            }}
          />

          <View style={{marginLeft: 8}}>
            <Text style={styles.vendorTitle}>{item.vendorName}</Text>
            <Text style={styles.vendorLoactions}>{item.businessLocation}</Text>
          </View>
        </View>
        {item.products.map(p => renderProduct(index, p))}
        <View style={styles.footer}>
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalAmount}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const grandTotalWithDelivery = useMemo(() => {
    return selectedTotal + deliveryCharges;
  }, [selectedTotal, deliveryCharges]);

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
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{flex: 1}}>
        <FlatList
          data={localCart}
          renderItem={renderVendor}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{padding: 16}}
          showsVerticalScrollIndicator={false}
        />
        {renderOrderSummary()}
      </View>
    </KeyboardAvoidingView>
  );
};

export default SaleItemCard;

const styles = StyleSheet.create({
  orderSummaryContainer: {
    backgroundColor: '#fff',
    borderRadius: width(5),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    marginHorizontal: width(3),
    padding: width(3),
    elevation: 5,
  },
  orderSummaryHeading: {
    fontSize: 18,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    marginBottom: 12,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderItemName: {fontSize: 14, color: '#333', flexShrink: 1},
  orderItemPrice: {fontSize: 14, color: '#333', fontWeight: '600'},
  deliveryBox: {
    backgroundColor: '#FDF0FA',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
  },
  deliveryLabel: {fontWeight: '600', color: COLORS.primary, marginBottom: 6},
  deliveryInput: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  deliveryHint: {fontSize: 12, color: '#666', marginTop: 6},
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  totalLabel: {fontSize: 14, color: '#333'},
  totalAmount: {fontSize: 14, fontWeight: '600', color: '#333'},

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
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
  vendorTitle: {fontSize: 18, fontWeight: '700', color: '#000'},
  vendorLoactions: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    fontSize: 12,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    alignItems: 'center',
  },
  image: {width: 80, height: 80, borderRadius: 10, marginHorizontal: 8},
  info: {flex: 1, justifyContent: 'space-between'},
  title: {fontWeight: '600', fontSize: 16, color: '#333'},
  counterContainer: {flexDirection: 'row', alignItems: 'center', marginTop: 6},
  counterBtn: {
    backgroundColor: '#FF295D',
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {color: '#fff', fontSize: 18, fontWeight: '600'},
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
  emptyText: {fontSize: 18, color: '#666', marginBottom: 20},
  addButton: {
    backgroundColor: COLORS.primary || '#FF295D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: width(2),
    backgroundColor: '#fff',
  },
  totalLabel: {fontSize: 12, fontWeight: '600', color: '#555'},
  totalAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
    marginVertical: 8,
  },
  payNowBtn: {marginTop: 8},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

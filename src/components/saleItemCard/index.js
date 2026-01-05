import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, View, Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from '../../hooks';
import {setCartData} from '../../redux/slice/cart';
import {buySaleItem, createPaymentIntent} from '../../services/Payment';
import OrderSummary from '../orderSummryAndPayment';
import VendorCard from './vendorCard';

const SaleItemCard = ({modalRef, setIsLoading}) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const {cartData} = useSelector(state => state.CartSlice);

  const [localCart, setLocalCart] = useState(cartData || []);
  const [showStripeform, setShowStripeform] = useState(false);

  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState(null);
  const [vendorCoords, setVendorCoords] = useState(null);

  const [selectedVendorIndex, setSelectedVendorIndex] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});

  const [distanceKm, setDistanceKm] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);

  const [cardDetails, setCardDetails] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  const [inputValues, setInputValues] = useState({
    fullname: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    setLocalCart(cartData || []);
  }, [cartData]);

  useEffect(() => {
    if (selectedVendorIndex !== null && localCart[selectedVendorIndex]) {
      const vendorLocation =
        localCart[selectedVendorIndex]?.products[0]?.vendor?.location
          ?.coordinates;

      if (vendorLocation?.lat && vendorLocation?.lng) {
        setVendorCoords({
          latitude: vendorLocation.lat,
          longitude: vendorLocation.lng,
        });
      }
    }
  }, [selectedVendorIndex, localCart]);

  const handleCahnge = (key, value) => {
    setInputValues(prev => ({...prev, [key]: value}));
  };

  const getDistanceInKm = useCallback((lat1, lon1, lat2, lon2) => {
    const toRad = v => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }, []);

  const updateCartInRedux = useCallback(
    async updatedCart => {
      dispatch(setCartData(updatedCart));
      await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));
    },
    [dispatch],
  );

  const handleIncrement = useCallback(
    (vendorIndex, productId) => {
      setLocalCart(prevCart => {
        const updatedCart = prevCart.map((vendor, vIndex) => {
          if (vIndex !== vendorIndex) {
            return vendor;
          }
          return {
            ...vendor,
            products: vendor.products.map(product => {
              if (product._id !== productId) {
                return product;
              }
              if (product.quantity < product.stockQuantity) {
                return {...product, quantity: product.quantity + 1};
              } else {
                modalRef.current?.show({
                  status: 'error',
                  message: 'Maximum stock limit reached!',
                });
                return product;
              }
            }),
          };
        });
        updateCartInRedux(updatedCart);
        return updatedCart;
      });
    },
    [updateCartInRedux],
  );

  const handleDecrement = useCallback(
    (vendorIndex, productId) => {
      setLocalCart(prevCart => {
        const vendor = prevCart[vendorIndex];
        const product = vendor?.products.find(p => p._id === productId);
        if (!product) {
          return prevCart;
        }

        if (product.quantity === 1) {
          modalRef.current?.show({
            status: 'alert',
            message: `Remove "${product.title?.en}" from the cart?`,
            handlePressOk: () => {
              const updatedProducts = vendor.products.filter(
                p => p._id !== productId,
              );
              const updatedCart = prevCart
                .map((v, i) =>
                  i === vendorIndex ? {...v, products: updatedProducts} : v,
                )
                .filter(v => v.products.length > 0);
              updateCartInRedux(updatedCart);
              setLocalCart(updatedCart);
            },
          });
          return prevCart;
        }

        const updatedCart = prevCart.map((vendor, vIndex) => {
          if (vIndex !== vendorIndex) {
            return vendor;
          }
          return {
            ...vendor,
            products: vendor.products.map(p =>
              p._id === productId ? {...p, quantity: p.quantity - 1} : p,
            ),
          };
        });
        updateCartInRedux(updatedCart);
        return updatedCart;
      });
    },
    [updateCartInRedux],
  );

  const onToggleProductSelect = useCallback((key, checked) => {
    setSelectedProducts(prev => {
      const newSelected = {...prev, [key]: !checked};
      Object.keys(newSelected).forEach(k => {
        if (!newSelected[k]) {
          delete newSelected[k];
        }
      });

      const selectedVendorIndexes = Object.keys(newSelected).map(k =>
        Number(k.split('-')[0]),
      );
      const uniqueVendorIndexes = [...new Set(selectedVendorIndexes)];

      if (!checked && uniqueVendorIndexes.length > 1) {
        modalRef.current?.show({
          status: 'error',
          message: 'You can only place an order from one vendor at a time.',
        });
        return prev;
      }

      setSelectedVendorIndex(
        uniqueVendorIndexes.length === 0 ? null : uniqueVendorIndexes[0],
      );
      return newSelected;
    });
  }, []);

  const onToggleVendorSelect = useCallback(
    (index, allChecked) => {
      setSelectedProducts(prev => {
        const newSelected = {...prev};
        if (allChecked) {
          localCart[index].products.forEach(
            p => delete newSelected[`${index}-${p._id}`],
          );
          setSelectedVendorIndex(null);
        } else {
          if (selectedVendorIndex !== null && selectedVendorIndex !== index) {
            modalRef.current?.show({
              status: 'error',
              message: 'You can only place an order from one vendor at a time.',
            });
            return prev;
          }
          localCart[index].products.forEach(p => {
            newSelected[`${index}-${p._id}`] = true;
          });
          setSelectedVendorIndex(index);
        }
        return newSelected;
      });
    },
    [localCart, selectedVendorIndex],
  );

  const handlePressCheckOut = async totalAmount => {
    try {
      setIsLoading(true);
      const res = await createPaymentIntent({
        amount: Math.round(totalAmount * 100),
      });

      console.log(res, 'asjdbasdjkbaskdjbaskjdbjaksd');

      if (res?.data?.clientSecret) {
        const clientSecret = res.data.clientSecret;

        const piId = clientSecret.split('_secret')[0];

        setPaymentIntentId(piId);
        setShowStripeform(true);
      }
    } catch (err) {
      console.log('PAYMENT INTENT ERROR', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectValue = useCallback(
    place => {
      setDeliveryLocation(place.userAddress);

      if (!vendorCoords) {
        return;
      }

      const km = getDistanceInKm(
        vendorCoords.latitude,
        vendorCoords.longitude,
        place.latLng.latitude,
        place.latLng.longitude,
      );

      const roundedKm = Math.ceil(km);
      setDistanceKm(roundedKm);

      const rate =
        localCart[selectedVendorIndex]?.products[0]?.vendor?.deliveryCharges ||
        0;

      setDeliveryCharges(roundedKm * rate);

      setDeliveryCoords({
        latitude: place.latLng.latitude,
        longitude: place.latLng.longitude,
      });
    },
    [vendorCoords, selectedVendorIndex, localCart, getDistanceInKm],
  );

  const selectedProductsArray = useMemo(() => {
    return Object.keys(selectedProducts)
      .map(key => {
        const [vendorIndex, productId] = key.split('-');
        return localCart[+vendorIndex]?.products.find(p => p._id === productId);
      })
      .filter(Boolean);
  }, [selectedProducts, localCart]);

  const selectedTotal = useMemo(
    () =>
      selectedProductsArray.reduce(
        (sum, p) => sum + p.sellingPrice * p.quantity,
        0,
      ),
    [selectedProductsArray],
  );

  const extraDeliveryCharges =
    selectedProductsArray[0]?.extraDeliveryCharges || 0;

  const platformFeePercentage =
    selectedProductsArray[0]?.platformFeePercentage || 0;

  const platformFee = useMemo(
    () => (selectedTotal * platformFeePercentage) / 100,
    [selectedTotal, platformFeePercentage],
  );

  const total = useMemo(
    () => selectedTotal + deliveryCharges + extraDeliveryCharges + platformFee,
    [selectedTotal, deliveryCharges, extraDeliveryCharges, platformFee],
  );

  const handlePayPress = async () => {
    if (
      inputValues.fullname.trim() === '' ||
      inputValues.email.trim() === '' ||
      inputValues.phoneNumber.trim() === ''
    ) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please fill in all required fields.',
      });
      return;
    }

    if (!cardDetails?.complete) {
      modalRef.current?.show({
        status: 'error',
        message: 'Please fill in all card details.',
      });
      return;
    }

    try {
      const vendor = localCart[selectedVendorIndex]?.products[0]?.vendor;

      const payload = {
        items: selectedProductsArray.map((item, index) => ({
          itemId: item._id,
          title: item.title,
          image: item.image,
          quantity: item.quantity,
          price: item.sellingPrice,
          extraDeliveryCharges: item.extraDeliveryCharges || 0,
          index,
        })),

        itemLocation: {
          coordinates: vendor?.location?.coordinates,
          fullAddress: vendor?.location?.fullAddress,
          _id: vendor?.location?._id,
        },

        totalAmount: total,
        deliveryAmount: deliveryCharges,
        platformFee,
        platformFeePercentage,

        deliveryLocation: {
          coordinates: {
            lat: deliveryCoords?.latitude,
            lng: deliveryCoords?.longitude,
          },
          fullAddress: deliveryLocation,
        },

        totalKms: distanceKm,
        vendorId: vendor?._id,

        customerInfo: {
          name: inputValues.fullname,
          email: inputValues.email,
          phone: inputValues.phoneNumber,
        },

        paymentIntentId: paymentIntentId,
      };

      setIsLoading(true);
      const res = await buySaleItem(payload);
      if (res.status === 200 || res.status === 201) {
        modalRef.current?.show({
          status: 'ok',
          message: res?.data?.message,
          handlePressOk: () => {
            removeOrderedItemsFromCart();
            resetOrderState();
          },
        });
      } else {
        modalRef.current?.show({
          status: 'error',
          message: res?.data?.message,
        });
      }
    } catch (err) {
      console.log('PAY ERROR', err);
      modalRef.current?.show({
        status: 'error',
        message: 'An error occurred during payment.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetOrderState = useCallback(() => {
    setSelectedProducts({});
    setSelectedVendorIndex(null);

    setShowStripeform(false);

    setDeliveryLocation('');
    setDeliveryCoords(null);
    setVendorCoords(null);

    setDistanceKm(0);
    setDeliveryCharges(0);

    setInputValues({
      fullname: '',
      email: '',
      phoneNumber: '',
    });

    setCardDetails(null);
    setPaymentIntentId(null);
  }, []);

  const removeOrderedItemsFromCart = useCallback(() => {
    const updatedCart = localCart
      .map((vendor, vIndex) => {
        const remainingProducts = vendor.products.filter(
          p => !selectedProducts[`${vIndex}-${p._id}`], // only remove selected
        );

        if (remainingProducts.length === 0) {
          return null;
        }

        return {
          ...vendor,
          products: remainingProducts,
        };
      })
      .filter(Boolean);

    updateCartInRedux(updatedCart);
    setLocalCart(updatedCart);
  }, [localCart, selectedProducts, updateCartInRedux]);

  return (
    <View style={{flex: 1}}>
      {localCart.length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{fontSize: 18, color: 'gray'}}>Your cart is empty</Text>
        </View>
      ) : (
        <FlatList
          data={localCart}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({item, index}) => (
            <VendorCard
              item={item}
              index={index}
              selectedProducts={selectedProducts}
              onToggleVendorSelect={onToggleVendorSelect}
              onToggleProductSelect={onToggleProductSelect}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          )}
          ListFooterComponent={
            <OrderSummary
              selectedProductsArray={selectedProductsArray}
              selectedTotal={selectedTotal}
              deliveryLocation={deliveryLocation}
              distanceKm={distanceKm}
              deliveryCharges={deliveryCharges}
              extraDeliveryCharges={extraDeliveryCharges}
              platformFee={platformFee}
              total={total}
              showStripeform={showStripeform}
              onLocationSelect={handleSelectValue}
              onCheckout={() => handlePressCheckOut(total)}
              handleCahnge={handleCahnge}
              inputValues={inputValues}
              setIsLoading={setIsLoading}
              t={t}
              onpayPress={handlePayPress}
              setCardDetails={setCardDetails}
              onCancelPress={() => setShowStripeform(false)}
            />
          }
        />
      )}
    </View>
  );
};

export default SaleItemCard;

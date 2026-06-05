import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useRef, useState} from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {useDispatch, useSelector} from 'react-redux';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import HeadingComponent from '../../../components/headingComponent';
import HomeCard from '../../../components/homeCard';
import Loader from '../../../components/loder';
import PopularCard from '../../../components/popularCard';
import ReviewsCard from '../../../components/reviewsCard';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {setCartData} from '../../../redux/slice/cart';
import {checkIsChatedBefore, createConnection} from '../../../services/Chat';
import {listingAddToCart} from '../../../services/ListingsItem';
import {getVendorDetails} from '../../../services/Vendor';

function VendorDetails({navigation, route}) {
  const item = route.params;
  const modalRef = useRef();
  const dispatch = useDispatch();
  const {currentLanguage} = useTranslation();
  const {user} = useSelector(state => state.LoginSlice);
  const isDutch = currentLanguage === 'nl';
  const localizedText = {
    vendorProfile: isDutch ? 'Leveranciersprofiel' : 'Vendor Profile',
    employees: isDutch ? 'medewerkers' : 'employees',
    noReviews: isDutch ? 'Geen beoordelingen' : 'No Reviews',
    review: isDutch ? 'Beoordeling' : 'Review',
    reviews: isDutch ? 'Beoordelingen' : 'Reviews',
    connectToSupplier: isDutch
      ? 'Verbinden met leverancier'
      : 'Connect To Supplier',
    notAvailable: isDutch ? 'Niet beschikbaar' : 'Not Available',
    call: isDutch ? 'Bellen' : 'Call',
    email: isDutch ? 'E-mail' : 'Email',
    aboutUs: isDutch ? 'Over ons' : 'About Us',
    description: isDutch ? 'Beschrijving' : 'Description',
    vendorListing: isDutch ? 'Leverancierslijst' : 'Vendor Listing',
    popularItems: isDutch ? 'Populaire items' : 'Popular Items',
    noPopularItems: isDutch
      ? 'Geen populaire items beschikbaar'
      : 'No Popular Items Available',
    mostRecentReviews: isDutch
      ? 'Meest recente beoordelingen'
      : 'Most Recent Reviews',
    noRecentReviews: isDutch
      ? 'Geen recente beoordelingen'
      : 'No Recent Reviews',
    viewLess: isDutch ? 'Minder bekijken' : 'View Less',
    viewAll: isDutch ? 'Alles bekijken' : 'View All',
  };

  const [isLoading, setIsLoading] = useState(false);
  const [vendorDetail, setVendorDetails] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const reviews = vendorDetail?.reviews || [];
  const displayedReviews = showAll ? reviews : reviews.slice(0, 4);
  const {cartData} = useSelector(state => state.CartSlice);
  const [chatData, setChatData] = useState(null);

  useEffect(() => {
    getVendorDetailsByID();
    handleCheckIsChatedBefore();
  }, []);

  const formatParticipants = data => {
    const participants = {};
    data?.forEach(({role, refPath, userId}) => {
      const normalizedRole = String(role || '').toLowerCase();
      const normalizedRefPath = String(refPath || '').toLowerCase();
      const isVendorParticipant =
        normalizedRole === 'vendor' || normalizedRefPath === 'vendor';

      if (isVendorParticipant) {
        participants.vendor = {
          userId: userId?._id || userId?.id || item?._id,
          name: userId?.businessName || userId?.fullName || 'Vendor',
          photo: userId?.businessLogo || userId?.photo || null,
          email: userId?.businessEmail || userId?.email || '',
          role: 'vendor',
        };
      } else {
        participants.user = {
          userId: userId?._id || userId?.id || user?.id,
          name:
            `${userId?.firstName || ''} ${userId?.lastName || ''}`.trim() ||
            userId?.fullName ||
            user?.fullName ||
            'User',
          photo: userId?.photo || userId?.profileImage || null,
          email: userId?.email || user?.email || '',
          role: 'user',
        };
      }
    });

    if (!participants.vendor) {
      participants.vendor = {
        userId: item?._id,
        name:
          item?.businessName || item?.vendorName || item?.fullName || 'Vendor',
        photo: item?.businessLogo || item?.photo || null,
        email: item?.businessEmail || item?.email || '',
        role: 'vendor',
      };
    }

    if (!participants.user) {
      participants.user = {
        userId: user?.id,
        name: user?.fullName || 'User',
        photo: user?.photo || null,
        email: user?.email || '',
        role: 'user',
      };
    }

    return participants;
  };

  const getVendorDetailsByID = async () => {
    try {
      setIsLoading(true);
      const responce = await getVendorDetails(item?.userId, {userId: user?.id});
      console.log(responce, 'responceresponceresponceresponce');
      setIsLoading(false);
      if (responce?.status == 200 || responce.status == 201) {
        let data = responce?.data?.data;
        setVendorDetails(data);
      } else {
        modalRef.current.show({
          status: 'error',
          message: responce?.data?.message?.en
            ? currentLanguage == 'en'
              ? responce?.data?.message?.en
              : responce?.data?.message?.nl
            : responce?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log('errorerrorerrorerrorerrorerror');
    }
  };

  const handleCheckIsChatedBefore = async () => {
    try {
      setIsLoading(true);
      const responce = await checkIsChatedBefore(user?.id, item?._id);
      setIsLoading(false);
      if (responce?.status == 200 || responce.status == 201) {
        let data = responce?.data?.data;

        setChatData(
          data === null
            ? null
            : {
                ...data,
                participants: formatParticipants(data?.participants),
              },
        );
      } else {
        modalRef.current.show({
          status: 'error',
          message: responce?.data?.message?.en
            ? currentLanguage == 'en'
              ? responce?.data?.message?.en
              : responce?.data?.message?.nl
            : responce?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log('errorerrorerrorerrorerrorerror');
    }
  };

  const handleConnect = () => {
    if (chatData) {
      navigation.navigate('ChatDetail', chatData);
    } else {
      handleCreateSocketConnenction();
    }
  };

  const handleCreateSocketConnenction = async () => {
    try {
      setIsLoading(true);
      let params = {
        userId: user?.id,
        vendorId: item?._id,
      };
      const responce = await createConnection(params);

      if (responce?.status == 200 || responce.status == 201) {
        let data = responce?.data?.data;
        setChatData({
          ...data,
          participants: formatParticipants(data?.participants),
        });
        navigation.navigate('ChatDetail', {
          ...data,
          participants: formatParticipants(data?.participants),
        });
      } else {
        modalRef.current.show({
          status: 'error',
          message: responce?.data?.message?.en
            ? currentLanguage == 'en'
              ? responce?.data?.message?.en
              : responce?.data?.message?.nl
            : responce?.data?.message,
        });
      }
    } catch (error) {
      console.log(error, 'asdasdasdasdasdasdasdasd');
    } finally {
      setIsLoading(false);
    }
  };

  const onBookingCardPress = item => {
    navigation.navigate('EventDetails', item);
  };

  const handleAddToWishList = async listingId => {
    const userToken = await AsyncStorage.getItem('token');
    let token = JSON.parse(userToken);

    if (token == null) {
      setShowLoginModal(true);
    } else {
      try {
        setIsLoading(true);
        const response = await listingAddToCart({listingId});
        setIsLoading(false);
        if (response.status == 200 || response.status == 201) {
          modalRef.current.show({
            status: 'ok',
            message: response?.data?.message?.en
              ? currentLanguage == 'en'
                ? response?.data?.message?.en
                : response?.data?.message?.nl
              : response?.data?.message,
          });
        } else {
          modalRef.current.show({
            status: 'error',
            message: response?.data?.message?.en
              ? currentLanguage == 'en'
                ? response?.data?.message?.en
                : response?.data?.message?.nl
              : response?.data?.message,
          });
        }
      } catch (error) {
        setIsLoading(false);
        console.log(error, 'errorerrorerrorerrorerrorerror2-3423432');
      }
    }
  };
  const reviewsss = vendorDetail?.reviews || [];

  const totalReviews = reviewsss.length;
  const averageRating =
    vendorDetail?.averageRating ||
    (totalReviews
      ? reviewsss.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
        totalReviews
      : 0);

  const formatRatingText = () => {
    if (!totalReviews) {
      return localizedText.noReviews;
    }

    return `${averageRating.toFixed(1)} (${totalReviews} ${
      totalReviews === 1 ? localizedText.review : localizedText.reviews
    })`;
  };

  const getDisplayValue = value => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      return localizedText.notAvailable;
    }
    return value;
  };

  const getImageSource = imageUrl => {
    if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      return {uri: imageUrl};
    }
    return ICONS.personalIcon;
  };

  const handleAddToCart = async item => {
    try {
      let updatedCart = JSON.parse(JSON.stringify(cartData || []));
      const vendorId = item?.vendor?._id;

      const vendorIndex = updatedCart.findIndex(v => v.vendorId === vendorId);

      const productObject = {
        _id: item?._id,
        title: item?.title,
        image: item?.image,
        sellingPrice: item?.sellingPrice,
        quantity: 1,
        stockQuantity: item?.stockQuantity,
        extraDeliveryCharges: item?.extraDeliveryCharges || 0,
        platformFeePercentage: item?.platformFeePercentage || 10,
        vendor: {
          ...item?.vendor,
          _id: item?.vendor?._id,
          businessName: item?.vendor?.fullName,
          businessLogo: item?.vendor?.businessLogo,
          location: item?.location,
        },
        linkedListing: item?.linkedListing,
        orderStatus: 'Pending',
        type: 'saleItem',
        createdAt: new Date().toISOString(),
      };

      if (vendorIndex !== -1) {
        const alreadyExists = updatedCart[vendorIndex].products.some(
          p => p._id === item._id,
        );

        if (alreadyExists) {
          modalRef.current.show({
            status: 'error',
            message: 'Item already exists in your cart',
          });
          return;
        } else {
          updatedCart[vendorIndex].products.push(productObject);
        }
      } else {
        updatedCart.push({
          vendorId: vendorId,
          products: [productObject],
          vendorName: item?.vendor?.fullName,
          businessLocation: item?.location?.fullAddress,
        });
      }

      dispatch(setCartData(updatedCart));
      await AsyncStorage.setItem('cartData', JSON.stringify(updatedCart));

      modalRef.current.show({
        status: 'ok',
        message: 'Item added to cart successfully!',
      });
    } catch (error) {
      console.log('Add to Cart Error:', error);
      modalRef.current.show({
        status: 'error',
        message: 'Something went wrong while adding to cart',
      });
    }
  };

  const hasCoverImage = Boolean(
    vendorDetail?.businessDetails?.businessImage &&
      String(vendorDetail?.businessDetails?.businessImage).trim(),
  );
  const hasProfileImage = Boolean(
    vendorDetail?.businessDetails?.businessLogo &&
      String(vendorDetail?.businessDetails?.businessLogo).trim(),
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={localizedText.vendorProfile}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={() => navigation.goBack()}
        setModalVisible={() => {}}
        onRightIconPress={handleConnect}
        containerStyle={{
          marginVertical: 10,
        }}
      />
      <ScrollView style={{flex: 1, backgroundColor: COLORS.white}}>
        <ImageBackground
          resizeMode="cover"
          source={getImageSource(vendorDetail?.businessDetails?.businessImage)}
          style={{
            height: width(55),
            width: width(100),
            padding: width(2),
            position: 'relative',
            borderRadius: 20,
            backgroundColor: COLORS.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {!hasCoverImage && (
            <Image
              source={ICONS.personalIcon}
              resizeMode="contain"
              style={{height: width(20), width: width(20)}}
            />
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              height: width(45),
              position: 'absolute',
              bottom: -70,
              left: 20,
            }}>
            <View
              style={{
                borderWidth: width(1),
                borderColor: COLORS.white,
                borderRadius: 100,
                overflow: 'hidden',
                height: width(25),
                width: width(25),
                marginBottom: width(5),
                backgroundColor: COLORS.white,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                source={
                  hasProfileImage
                    ? {uri: vendorDetail?.businessDetails?.businessLogo}
                    : ICONS.personalIcon
                }
                resizeMode={hasProfileImage ? 'cover' : 'contain'}
                style={
                  hasProfileImage
                    ? {height: width(25), width: width(25)}
                    : {height: width(14), width: width(14)}
                }
              />
            </View>
            <View style={{marginLeft: width(5)}}>
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 15,
                  fontFamily: fontFamly.PlusJakartaSansSemiBold,
                }}>
                {vendorDetail?.businessDetails?.businessName}
              </Text>
              <Text style={{color: COLORS.textLight, fontSize: 14}}>
                {vendorDetail?.businessDetails?.employees}{' '}
                {localizedText.employees}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Rating
                  type="star"
                  ratingCount={5}
                  imageSize={12}
                  readonly
                  startingValue={Number(vendorDetail?.averageRating) || 0}
                  fractions={1}
                  tintColor={COLORS.white}
                  ratingBackgroundColor="#E0E0E0"
                  style={{marginTop: 5}}
                />
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                    color: COLORS.textLight,
                    fontSize: 12,
                    marginLeft: 5,
                  }}>
                  {formatRatingText()}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: width(25),
            marginHorizontal: width(5),
          }}>
          <GradientButton
            text={localizedText.connectToSupplier}
            onPress={handleConnect}
            type="filled"
            gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          />
          {/* <TouchableOpacity
            style={{
              height: width(13),
              width: width(13),
              borderRadius: width(3),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={ICONS.menuIcon}
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
            />
          </TouchableOpacity> */}
        </View>
        <View
          style={{
            backgroundColor: COLORS.backgroundLight,
            padding: width(5),
            borderRadius: width(5),
            margin: width(5),
          }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
              color: COLORS.textLight,
              marginTop: width(2),
            }}>
            📞 {localizedText.call}:{' '}
            {vendorDetail?.businessDetails?.phone
              ? `+${vendorDetail?.businessDetails?.phone}`
              : localizedText.notAvailable}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
              color: COLORS.textLight,
              marginTop: width(2),
            }}>
            ✉️ {localizedText.email}:{' '}
            {getDisplayValue(vendorDetail?.businessDetails?.email)}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
              color: COLORS.textLight,
              marginTop: width(2),
            }}>
            📍{vendorDetail?.businessDetails?.location}
          </Text>
        </View>
        <View
          style={{
            marginHorizontal: width(5),
          }}>
          <Text
            style={{
              fontSize: 15,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
              color: COLORS.black,
            }}>
            {localizedText.aboutUs}{' '}
            {vendorDetail?.businessDetails?.businessName}
          </Text>
          <Text
            style={{
              marginTop: width(2),
              color: COLORS.text,
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansBold,
            }}>
            {localizedText.description} :
          </Text>
          <Text
            style={{
              color: COLORS.textLight,
              fontSize: 10,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            }}>
            {currentLanguage == 'en'
              ? vendorDetail?.businessDetails?.description?.en
              : vendorDetail?.businessDetails?.description?.nl}
          </Text>
        </View>

        <View>
          <HeadingComponent
            heading={localizedText.vendorListing}
            gradientText={`(${vendorDetail?.listingItems?.length || 0})`}
            onPress={() => {}}
          />
        </View>
        <View style={{}}>
          <HomeCard
            data={vendorDetail?.listingItems || []}
            onBookingCardPress={onBookingCardPress}
            handleAddToWishList={handleAddToWishList}
          />
        </View>
        <View>
          <HeadingComponent
            heading={localizedText.popularItems}
            gradientText={`(${vendorDetail?.popularItems?.length || 0})`}
          />
        </View>
        <View style={{}}>
          {(vendorDetail?.popularItems || []).length > 0 ? (
            <PopularCard
              data={vendorDetail?.popularItems || []}
              handleAddToCart={handleAddToCart}
            />
          ) : (
            <Text
              style={{
                width: '100%',
                marginTop: width(2),
                color: COLORS.textLight,
                fontSize: 12,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                textAlign: 'center',
              }}>
              {localizedText.noPopularItems}
            </Text>
          )}
        </View>
        <View
          style={{
            marginTop: width(5),
            alignItems: 'center',
            marginHorizontal: width(5),
          }}>
          <View style={{width: '100%'}}>
            <Text
              style={{
                color: COLORS.black,
                fontSize: 12,
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
              }}>
              {localizedText.mostRecentReviews} (
              {`${vendorDetail?.reviews?.length}`})
            </Text>
          </View>
          {displayedReviews?.length === 0 && (
            <Text
              style={{
                width: '100%',
                marginTop: width(2),
                color: COLORS.textLight,
                fontSize: 12,
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                textAlign: 'center',
              }}>
              {localizedText.noRecentReviews}
            </Text>
          )}
          {displayedReviews?.map((review, index) => (
            <ReviewsCard key={index} item={review} />
          ))}
          {displayedReviews?.length > 3 && (
            <View
              style={{
                height: width(20),
                width: width(50),
                backgroundColor: COLORS.white,
                justifyContent: 'center',
              }}>
              <GradientButton
                text={showAll ? localizedText.viewLess : localizedText.viewAll}
                onPress={() => setShowAll(!showAll)}
                type="outline"
                useGradient={true}
                gradientColors={['#FF295D', '#E31B95', '#C817AE']}
              />
            </View>
          )}
        </View>
        <View style={{height: width(10)}} />
      </ScrollView>
    </SafeAreaView>
  );
}
export default VendorDetails;

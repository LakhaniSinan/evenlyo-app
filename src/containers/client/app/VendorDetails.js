import {useEffect, useRef, useState} from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {Rating} from 'react-native-ratings';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import HeadingComponent from '../../../components/headingComponent';
import Loader from '../../../components/loder';
import PopularCard from '../../../components/popularCard';
import ReviewsCard from '../../../components/reviewsCard';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getVendorDetails} from '../../../services/Vendor';

function VendorDetails({navigation, route}) {
  const item = route.params;
  const modalRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [vendorDetail, setVendorDetails] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const reviews = vendorDetail?.reviews || [];
  const displayedReviews = showAll ? reviews : reviews.slice(0, 4);

  console.log(vendorDetail, 'displayedReviewsdisplayedReviewsdisplayedReviews');

  const {t} = useTranslation();
  useEffect(() => {
    getVendorDetailsByID();
  }, []);

  const getVendorDetailsByID = async () => {
    try {
      setIsLoading(true);
      const responce = await getVendorDetails('688cee39901d51358af867fa');
      setIsLoading(false);
      if (responce?.status == 200 || responce.status == 201) {
        let data = responce?.data?.data;
        console.log(data, 'datadatadatadatadatadata');
        setVendorDetails(data);
      } else {
        modalRef.current.show({
          status: 'error',
          message: responce?.data?.message,
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log('errorerrorerrorerrorerrorerror');
    }
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={t('Vendor Profile')}
        rightIcon={ICONS.chatIcon}
        onLeftIconPress={() => navigation.goBack()}
        setModalVisible={() => {}}
        onRightIconPress={() => navigation.navigate('MessagesScreen')}
        containerStyle={{
          marginVertical: 10,
        }}
      />
      <ScrollView style={{flex: 1, backgroundColor: COLORS.white}}>
        <ImageBackground
          resizeMode="contain"
          source={{uri: vendorDetail?.businessDetails?.bannerImage}}
          style={{
            height: width(55),
            width: width(100),
            padding: width(2),
            position: 'relative',
            borderRadius: 20,
          }}>
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
              }}>
              <Image
                source={{uri: vendorDetail?.businessDetails?.bannerImage}}
                resizeMode="cover"
                style={{height: width(25), width: width(25)}}
              />
            </View>
            <View style={{marginLeft: width(5)}}>
              <Text
                style={{
                  color: COLORS.black,
                  fontSize: 15,
                  fontFamily: fontFamly.PlusJakartaSansSemiBold,
                }}>
                {vendorDetail?.userDetails?.name}
              </Text>
              <Text style={{color: COLORS.textLight, fontSize: 14}}>
                {vendorDetail?.businessDetails?.employees} {t('employees')}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Rating
                  count={5}
                  defaultRating={4}
                  imageSize={12}
                  selectedColor={'#FCAD38'}
                  isDisabled={true}
                  readonly={true}
                  style={{marginRight: 5, marginTop: 5}}
                  ratingContainerStyle={{marginRight: 5}}
                />
                <Text
                  style={{
                    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                    color: COLORS.textLight,
                    fontSize: 12,
                    marginLeft: 5,
                  }}>
                  {vendorDetail?.businessDetails?.rating}{' '}
                  {`(${vendorDetail?.businessDetails?.reviews} ${t(
                    'Reviews',
                  )}}`}
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
          <View style={{width: width(75)}}>
            <GradientButton
              text={t('contactMe')}
              onPress={() => {}}
              type="filled"
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
            />
          </View>
          <TouchableOpacity
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
          </TouchableOpacity>
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
            📞 {t('call')}: {`+${vendorDetail?.businessDetails?.phone}`}
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
              color: COLORS.textLight,
              marginTop: width(2),
            }}>
            ✉️ {t('email')}: {vendorDetail?.businessDetails?.email}
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
            {t('aboutUs')} {vendorDetail?.userDetails?.name}
          </Text>
          <Text
            style={{
              marginTop: width(2),
              color: COLORS.text,
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansBold,
            }}>
            {t('description')} :
          </Text>
          <Text
            style={{
              color: COLORS.textLight,
              fontSize: 10,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            }}>
            {vendorDetail?.businessDetails?.description}
          </Text>
          <Text
            style={{
              marginTop: width(2),
              fontSize: 12,
              color: COLORS.text,
              fontFamily: fontFamly.PlusJakartaSansBold,
            }}>
            {t('whyChooseUs')} :
          </Text>
          <Text
            style={{
              color: COLORS.textLight,
              fontSize: 10,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
            }}>
            {vendorDetail?.businessDetails?.whyChooseUs}
          </Text>
        </View>
        <View
          style={{
            marginHorizontal: width(5),
            marginTop: width(5),
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: width(2),
            }}>
            <Text
              style={{
                color: COLORS.black,
                fontSize: 15,
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
              }}>
              {t('categories')}:
            </Text>
            {vendorDetails.organizer.categories.map((category, index) => (
              <Text
                key={index}
                style={{
                  fontSize: 12,
                  paddingHorizontal: width(3),
                  paddingVertical: width(1),
                  backgroundColor: COLORS.backgroundLight,
                  borderRadius: width(5),
                  fontFamily: fontFamly.PlusJakartaSansSemiBold,
                  marginHorizontal: width(1),
                  marginTop: width(3),
                  color: COLORS.black,
                }}>
                {category}
              </Text>
            ))}
          </View>
        </View>

        <View>
          <HeadingComponent
            heading={t('Vendor Listing')}
            gradientText={`(${vendorDetail?.listings?.length || 0})`}
            rightArrow={true}
            onPress={() => {}}
          />
        </View>
        <View style={{}}>
          <PopularCard data={vendorDetail?.listings || []} />
        </View>
        <View>
          <HeadingComponent
            heading={t('Most Popular')}
            gradientText={`(${vendorDetail?.popularListings?.length || 0})`}
            rightArrow={true}
            onPress={() => {}}
          />
        </View>
        <View style={{}}>
          <PopularCard data={vendorDetail?.popularListings || []} />
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
              {t('mostRecent')} ({`${vendorDetail?.reviews?.length}`})
            </Text>
          </View>
          {displayedReviews?.map((review, index) => (
            <ReviewsCard key={index} item={review} />
          ))}
          <View
            style={{
              height: width(20),
              width: width(50),
              backgroundColor: COLORS.white,
              justifyContent: 'center',
            }}>
            <GradientButton
              text={showAll ? t('View Less') : t('viewAll')}
              onPress={() => setShowAll(!showAll)}
              type="outline"
              useGradient={true}
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
            />
          </View>
        </View>
        <View style={{height: width(10)}} />
      </ScrollView>
    </SafeAreaView>
  );
}
export default VendorDetails;

export const vendorDetails = {
  organizer: {
    id: '1',
    name: 'Ahsan Khan',
    profileImage: 'https://example.com/images/ahsan.jpg',
    bannerImage: 'https://example.com/images/banner.jpg',
    tagline: 'Event brand management',
    location: 'Karachi, Pakistan',
    contactNumber: '+92 300 1234567',
    description:
      'Ahsan Khan is a leading event organizer with over 10 years of experience in managing weddings, concerts, and corporate events.',
    categories: ['DJ', 'Sound & Lighting', 'Live Bands', 'Street Food Trucks'],
    services: [
      'Wedding Planning',
      'Corporate Events',
      'Birthday Parties',
      'Concert Setup',
    ],
  },
  reviews: [
    {
      id: 'r1',
      user: {
        name: 'Areeba Khan',
        avatar: 'https://example.com/images/user1.jpg',
      },
      rating: 5,
      date: '17 July 2025',
      comment:
        'Ahsan Bhai organized our wedding flawlessly. Everything was on point!',
    },
    {
      id: 'r2',
      user: {
        name: 'Hassan Ali',
        avatar: 'https://example.com/images/user2.jpg',
      },
      rating: 4,
      date: '10 July 2025',
      comment: 'Sound and lights were amazing. Highly recommended!',
    },
    {
      id: 'r3',
      user: {
        name: 'Maha Yousuf',
        avatar: 'https://example.com/images/user3.jpg',
      },
      rating: 5,
      date: '5 July 2025',
      comment: 'Professional and creative team. Loved the decor and stage.',
    },
  ],
  popularDJs: [
    {
      id: 'dj1',
      name: 'DJ Roy Vibes',
      price: 330,
      image: IMAGES.profilePhoto,
    },
    {
      id: 'dj2',
      name: 'DJ Sana Beats',
      price: 290,
      image: IMAGES.profilePhoto,
    },
    {
      id: 'dj3',
      name: 'DJ Zee Drop',
      price: 310,
      image: IMAGES.profilePhoto,
    },
  ],
};

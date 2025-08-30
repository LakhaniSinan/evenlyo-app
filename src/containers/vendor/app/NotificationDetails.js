import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import Carousel from 'react-native-snap-carousel';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {COLORS, fontFamly} from '../../../constants';
import GradientText from '../../../components/gradiantText';
import CarouselComponent from '../../../components/carousel';
import GradientButton from '../../../components/button';

const NotificationDetails = () => {
  const navigation = useNavigation();
  const data = [1, 2, 3, 4, 5];
  const [activeSlide, setActiveSlide] = useState(0);
  console.log(activeSlide, 'activeSlideactiveSlideactiveSlide');

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={'Notifications'}
        onLeftIconPress={() => navigation.goBack()}
      />
      <CarouselComponent data={data} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: width(3),
        }}>
        <View style={{width: width(50)}}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansSemiBold,
              color: COLORS.semiLightText,
              fontSize: 12,
            }}>
            Newyork, USA
          </Text>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: COLORS.textDark,
              fontSize: 15,
            }}>
            Morning Date at a Hidden Art Gallery
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={ICONS.locationWithoutBg}
              resizeMode="contain"
              style={{height: 10, width: 10}}
              tintColor={COLORS.semiLightText}
            />
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansSemiRegular,
                marginLeft: width(2),
                color: COLORS.semiLightText,
                fontSize: 11,
              }}>
              12.6 Km away
            </Text>
          </View>
        </View>
        <View style={{}}>
          <View
            style={{
              backgroundColor: '#04C373',
              borderRadius: 100,
              marginBottom: width(2),
              paddingHorizontal: 10,
            }}>
            <Text
              style={{
                fontFamily: fontFamly.PlusJakartaSansBold,
                color: '#FFFF',
                fontSize: 12,
              }}>
              20%
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              color: '#000',
              fontSize: 15,
            }}>
            $ 300
          </Text>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              color: '#000',
              fontSize: 9,
            }}>
            /Par Event
          </Text>
        </View>
      </View>
      <View
        style={{
          padding: width(3),
        }}>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansBold,
            fontSize: 12,
          }}>
          Description:
        </Text>
        <Text
          numberOfLines={4}
          style={{
            fontFamily: fontFamly.PlusJakartaSansMedium,
            fontSize: 10,
            color: COLORS.textLight,
          }}>
          With over 7 years of event experience, DJ RayBeatz is known for
          high-energy dance floors, seamless transitions, and crowd-pleasing
          remixes. From desi weddings to corporate raves, he brings the perfect
          vibe for every crow With over 7...
        </Text>
      </View>
      <View
        style={{
          marginHorizontal: 10,
          flex: 1,
          justifyContent: 'flex-end',
          marginBottom: 10,
        }}>
        <GradientButton text={'Book Now'} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: width(5),
    marginBottom: width(5),
  },
  indicator: {
    height: width(2),
    borderRadius: width(1),
    marginHorizontal: width(1),
    transition: 'all 0.3s ease',
  },
});

export default NotificationDetails;

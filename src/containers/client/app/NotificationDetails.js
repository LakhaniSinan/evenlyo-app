import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Image, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import Carousel from 'react-native-snap-carousel';
import {ICONS, IMAGES} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import {COLORS, fontFamly} from '../../../constants';
import GradientText from '../../../components/gradiantText';

const NotificationDetails = () => {
  const navigation = useNavigation();
  const data = [1, 2, 3, 4, 5];
  const [activeSlide, setActiveSlide] = useState(0);
  console.log(activeSlide, 'activeSlideactiveSlideactiveSlide');

  const renderItem = ({item}) => {
    return (
      <View
        style={{
          height: width(80),
          backgroundColor: 'red',
          width: width(90),
          borderRadius: width(5),
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <Image
          source={IMAGES.backgroundImage}
          resizeMode="cover"
          style={{height: '100%', width: '100%'}}
        />
        <View
          style={{
            zIndex: 999,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}>
          {renderIndicators()}
        </View>
      </View>
    );
  };

  const renderIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {data.map((_, index) => {
          console.log(index, activeSlide, 'indexindexindexindex');

          return (
            <View
              style={{
                padding: Number(index) === Number(activeSlide) ? width(1) : '',
                paddingVertical:
                  Number(index) === Number(activeSlide) ? width(2) : '',
                borderWidth: Number(index) === Number(activeSlide) ? 1 : '',
                borderRadius: 100,
                borderColor: COLORS.white,
              }}>
              <View
                style={{
                  height: 7,
                  width: 7,
                  backgroundColor: COLORS.white,
                  borderRadius: 10,
                  marginHorizontal: width(1),
                }}
              />
            </View>
          );
        })}
      </View>
    );
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={'Notifications'}
        onLeftIconPress={() => navigation.goBack()}
      />
      <View>
        <Carousel
          data={data}
          renderItem={renderItem}
          sliderWidth={width(100)}
          itemWidth={width(100)}
          containerCustomStyle={{
            margin: width(5),
          }}
          onSnapToItem={index => setActiveSlide(index)}
        />
      </View>
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
              style={{height: 20, width: 20}}
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
            fontFamily: fontFamly.PlusJakartaSansBold,
            fontSize: 10,
            color: COLORS.textLight,
          }}>
          With over 7 years of event experience, DJ RayBeatz is known for
          high-energy dance floors, seamless transitions, and crowd-pleasing
          remixes. From desi weddings to corporate raves, he brings the perfect
          vibe for every crow With over 7...
          <View style={{marginBottom: -width(2)}}>
            <GradientText
              text={'Read More'}
              customStyles={{padding: 0, marginTop: 0, marginBottom: 0}}
            />
          </View>
        </Text>
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

import React, {useState} from 'react';
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {ICONS} from '../../../assets';
import Categories from '../../../components/categories';
import EventCard from '../../../components/eventCard';
import HeadingComponent from '../../../components/headingComponent';
import HomeCard from '../../../components/homeCard';
import FilterModal from '../../../components/modals/FilterModal';
import PopularCard from '../../../components/popularCard';
import SubCategories from '../../../components/subCategories';
import TextField from '../../../components/textInput';
import {COLORS, fontFamly} from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';

const Home = ({navigation}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const {t} = useTranslation();
  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={{flex: 1, backgroundColor: COLORS.white}}>
        <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: COLORS.backgroundLight,
              borderBottomRightRadius: 20,
              borderBottomLeftRadius: 20,
            }}>
            <View
              style={{
                paddingVertical: width(2),
                paddingHorizontal: width(2),
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  marginLeft: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <View>
                  <Image
                    resizeMode="contain"
                    style={{width: 40, height: 40}}
                    source={ICONS.locationIcon}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    marginLeft: width(3),
                    fontFamily: fontFamly.PlusJakartaSansSemiMedium,
                  }}>
                  San Francisco, CA
                </Text>
              </View>
              <TouchableOpacity
                style={{borderRadius: 20}}
                onPress={() => navigation.navigate('Notification')}>
                <Image
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                  source={ICONS.notificationIcon}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                width: '100%',
                paddingLeft: width(4),
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: width(3),
                justifyContent: 'space-between',
              }}>
              <TextField
                placeholder={t('searchEvent')}
                placeholderTextColor="#aaa"
                bgColor={COLORS.white}
                startIcon={ICONS.search}
                inputContainer={{
                  paddingVertical: 0,
                  paddingHorizontal: 10,
                  height: 45,
                  width: '80%',
                  marginTop: 0,
                }}
                styleProps={{
                  fontSize: 14,
                  color: '#000',
                }}
              />

              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  marginRight: 10,
                }}>
                <Image
                  resizeMode="contain"
                  style={{width: 40, height: 40}}
                  source={ICONS.filters}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              marginTop: 10,
            }}>
            <Categories />
          </View>
          <View
            style={{
              marginTop: 10,
            }}>
            <SubCategories />
          </View>
          <View>
            <HomeCard />
          </View>
          <View>
            <HeadingComponent
              heading={t('popular')}
              gradientText={t('nearYou')}
              rightArrow={true}
              onPress={() => {}}
            />
          </View>
          <View>
            <PopularCard />
          </View>
          <View>
            <HeadingComponent
              heading={t('relevant')}
              gradientText={t('vendors')}
              rightArrow={true}
              onPress={() => {}}
            />
          </View>
          <View>
            <EventCard navigation={navigation} />
          </View>
          <View style={{height: width(10)}} />
        </ScrollView>
        <FilterModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Home;

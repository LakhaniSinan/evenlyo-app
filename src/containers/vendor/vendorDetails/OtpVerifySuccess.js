import React, {useEffect} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {useDispatch} from 'react-redux';
import {ICONS} from '../../../assets';
import Background from '../../../components/background';
import Header from '../../../components/header';
import {COLORS} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {setUserData} from '../../../redux/slice/auth';
import {globalStyles} from '../../../styles/globalStyle';

const OtpVerifySuccess = ({}) => {
  const dispatch = useDispatch();

  const {t} = useTranslation();
  useEffect(() => {
    setTimeout(() => {
      dispatch(
        setUserData({
          name: 'Sinan',
          type: 'vendor',
          vendorDetails: {
            id: 1,
            name: 'Sinan',
            email: 'sinan@gmail.com',
            phone: '03001234567',
            address: '123 Main St, Anytown, USA',
            city: 'Anytown',
            state: 'CA',
          },
        }),
      );
    }, 3000);
  }, []);

  return (
    <Background>
      <ScrollView style={{flex: 1, width: width(90)}}>
        <View style={{flex: 1, paddingVertical: width(20)}}>
          <Header languageModal={false} />
          <View
            style={{
              width: width(90),
              backgroundColor: COLORS.backgroundLight,
              borderRadius: width(5),
              padding: width(4),
              marginTop: width(20),
              marginBottom: width(10),
              height: width(90),
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={[
                globalStyles.title,
                {fontSize: 20, textAlign: 'center', marginVertical: width(10)},
              ]}>
              {t('Successfully Verified!')}
            </Text>
            <Image
              source={ICONS.checkIcon}
              resizeMode="contain"
              style={{height: 61, width: 61}}
            />
          </View>
        </View>
      </ScrollView>
    </Background>
  );
};

export default OtpVerifySuccess;

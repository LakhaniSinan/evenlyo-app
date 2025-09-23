import React, {useEffect} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import Background from '../../components/background';
import Header from '../../components/header';
import {COLORS} from '../../constants';
import {useTranslation} from '../../hooks';
import {globalStyles} from '../../styles/globalStyle';

const AuthSuccess = ({route, navigation}) => {
  const {type} = route.params;
  const {t} = useTranslation();
  useEffect(() => {
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Login',
            params: {type: type},
          },
        ],
      });
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
              {t('successfullyChanged')}
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

export default AuthSuccess;

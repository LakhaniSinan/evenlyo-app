import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import { fontFamly } from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const Onboarding = ({navigation}) => {
  const {t} = useTranslation();
  
  return (
    <Background>
      <View style={{flex: 1, justifyContent: 'space-around'}}>
        <View style={styles.logoContainer}>
          <Image
            source={ICONS.logoIcon}
            resizeMode="contain"
            style={{height: 60, width: 60, marginBottom: 16}}
          />
          <Text style={styles.title}>{t('bookManageEvents')}</Text>
          <Text style={styles.title}>{t('easily')}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <GradientButton
            text={t('continueAsClient')}
            onPress={() => navigation.navigate('Login')}
            type="filled"
            gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          />

          <GradientButton
            text={t('continueAsVendor')}
            onPress={() => navigation.navigate('Login')}
            type="outline"
            gradientColors={['#FF295D', '#E31B95', '#C817AE']}
          />
        </View>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    // fontWeight: '700',
    fontFamily:fontFamly.PlusJakartaSansBold,
    color: '#000',
  },
  buttonContainer: {width: width(90), alignSelf: 'center'},
  gradientWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default Onboarding;

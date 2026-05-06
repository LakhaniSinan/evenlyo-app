import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS} from '../../assets';
import Background from '../../components/background';
import GradientButton from '../../components/button';
import {
  BRAND_BUTTON_GRADIENT_COLORS,
  COLORS,
  fontFamly,
} from '../../constants';
import useTranslation from '../../hooks/useTranslation';

const Onboarding = ({navigation}) => {
  const {t} = useTranslation();

  return (
    <Background>
      <View style={styles.screen}>
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
            onPress={() => navigation.navigate('Login', {type: 'client'})}
            type="filled"
            gradientColors={BRAND_BUTTON_GRADIENT_COLORS}
          />

          <GradientButton
            text={t('continueAsVendor')}
            onPress={() => navigation.navigate('Login', {type: 'vendor'})}
            type="outline"
            gradientColors={BRAND_BUTTON_GRADIENT_COLORS}
          />
        </View>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: width(6),
    paddingBottom: width(6),
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    // fontWeight: '700',
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
  },
  buttonContainer: {width: width(90), alignSelf: 'center', gap: 10},
  gradientWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default Onboarding;

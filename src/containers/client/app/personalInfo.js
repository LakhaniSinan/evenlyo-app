import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { width } from 'react-native-dimension';
import { ICONS, IMAGES } from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import ContactNumberInput from '../../../components/phoneInput';
import TextField from '../../../components/textInput';
import { COLORS, SIZES } from '../../../constants';

const PersonalInfo = ({ navigation }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView>

        <AppHeader
          leftIcon={ICONS.leftArrowIcon}
          onLeftIconPress={() => navigation.goBack()}
          headingText={'Personal Info'}
        />
        <View style={{ alignItems: 'center', marginTop: width(4) }}>
          <Image
            style={{
              height: 100,
              width: 100,
              borderRadius: 200,
            }}
            source={IMAGES.backgroundImage}
          />
        </View>

        <View style={styles.form}>
          <TextField
            label={t('firstName')}
            placeholder={t('firstNamePlaceholder')}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{ height: 10 }} />
          <TextField
            label={t('lastName')}
            placeholder={t('lastNamePlaceholder')}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={{ height: 10 }} />
          <TextField
            label={t('emailAddress')}
            placeholder={t('emailPlaceholder')}
            // value={email}
            // onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={{ height: 10 }} />
          <ContactNumberInput
            labelText={t('contactNumber')}
            labelColor={'#000'}
            phoneNumber={formData.contact}
            containerStyle={{
              backgroundColor: COLORS.backgroundLight,
            }}
          // onChange={value => handleInputChange('contact', value)}
          // ref={phoneInput}
          />
          <View style={{ height: 10 }} />
          <TextField
            label={t('Address')}
            placeholder={t('estherhoward@gmail.com')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View
          style={{
            marginHorizontal: 10,
            flex: 1,
            justifyContent: 'flex-end',
            marginBottom: 15,
          }}>
          <GradientButton
            text={'Save & Change'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: SIZES.lg,
    marginTop: 20,
    marginHorizontal: 10,
  },
});

export default PersonalInfo;

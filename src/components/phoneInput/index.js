import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from 'react-i18next';

const ContactNumberInput = ({labelColor, phoneNumber, ref, onChange}) => {
  const {t} = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, {color: labelColor ? labelColor : '#000'}]}>
        {t('contactNumber')}
      </Text>
      <PhoneInput
        ref={ref}
        defaultValue={phoneNumber}
        defaultCode="US"
        layout="first"
        withShadow={false}
        withDarkTheme={false}
        placeholder="0000******"
        onChangeFormattedText={text => onChange(text)}
        containerStyle={styles.phoneContainer}
        textContainerStyle={styles.textInput}
        textInputStyle={styles.textInputStyle}
        codeTextStyle={styles.codeTextStyle}
        countryPickerButtonStyle={styles.flagButton}
        textInputProps={{
          placeholderTextColor: '#aaa',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: width(1),
  },

  label: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  phoneContainer: {
    width: '100%',
    height: 55,
    borderRadius: 15,
    backgroundColor: COLORS.backgroundLight,
    paddingLeft: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },

  textInput: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },

  flagButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },

  countryPickerStyle: {
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 10,
  },

  codeTextStyle: {
    fontSize: 16,
    color: '#000',
  },
});

export default ContactNumberInput;

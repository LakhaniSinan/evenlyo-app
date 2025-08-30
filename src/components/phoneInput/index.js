import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import PhoneInput from 'react-native-phone-number-input';
import {fontFamly} from '../../constants';

const ContactNumberInput = ({
  labelColor,
  phoneNumber,
  ref,
  containerStyle,
  onChange,
  labelText,
  endIcon,
}) => {
  return (
    <View style={styles.container}>
      <Text
        style={{
          color: labelColor ? labelColor : '#000',
          fontSize: 12,
          fontFamily: fontFamly.PlusJakartaSansBold,
        }}>
        {labelText}
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
        containerStyle={[styles.phoneContainer, {...containerStyle}]}
        textContainerStyle={styles.textInput}
        textInputStyle={styles.textInputStyle}
        codeTextStyle={styles.codeTextStyle}
        countryPickerButtonStyle={styles.flagButton}
        textInputProps={{
          placeholderTextColor: '#aaa',
        }}
      />
      {endIcon && <View>{endIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: width(4),
  },

  label: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },

  phoneContainer: {
    width: '100%',
    height: 55,
    borderRadius: 15,
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

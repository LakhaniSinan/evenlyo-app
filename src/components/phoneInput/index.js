import React, {forwardRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import PhoneInput from 'react-native-phone-number-input';
import {fontFamly} from '../../constants';

const ContactNumberInput = forwardRef(({
  labelColor,
  phoneNumber,
  value, // ✅ controlled value
  containerStyle,
  onChange,
  labelText,
  endIcon,
}, inputRef) => {
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
        ref={inputRef}
        defaultCode="US"
        layout="first"
        withShadow={false}
        withDarkTheme={false}
        placeholder="0000******"
        value={value || phoneNumber} // ✅ controlled
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
});

const styles = StyleSheet.create({
  container: {
    gap: width(4),
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

  textInputStyle: {
    fontSize: 14,
    color: '#000',
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

  codeTextStyle: {
    fontSize: 16,
    color: '#000',
  },
});

export default ContactNumberInput;

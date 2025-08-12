import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {fontFamly} from '../../constants';

const TextField = ({
  placeholder,
  onChangeText,
  multiline,
  numberOfLines,
  startIcon,
  endIcon,
  bgColor,
  value,
  inputBorderColor,
  keyboardType,
  onEndIconPress,
  labelColor,
  secure,
  styleProps,
  inputContainer,
  label,
  editable,
}) => {
  return (
    <>
      {label && (
        <Text
          style={{
            color: labelColor ? labelColor : '#000',
            fontSize: 12,
            fontFamily: fontFamly.PlusJakartaSansBold,
          }}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            ...inputContainer,
            backgroundColor: bgColor ? bgColor : '#F6F6F6',
            borderWidth: 1,
            borderColor: inputBorderColor ? inputBorderColor : '#F6F6F6',
          },
        ]}>
        {startIcon && (
          <Image
            resizeMode="contain"
            source={startIcon}
            color="#808080"
            style={styles.icon}
          />
        )}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#ABABAB"
          keyboardType={keyboardType}
          value={value}
          secureTextEntry={secure}
          style={[
            styles.textInput,
            {
              paddingLeft: startIcon ? 10 : 5,
              textAlignVertical: 'top',
              backgroundColor: bgColor ? bgColor : '#F6F6F6',
              borderColor: inputBorderColor ? inputBorderColor : '#F6F6F6',
              ...styleProps,
            },
          ]}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onChangeText={onChangeText}
        />
        {endIcon && (
          <TouchableOpacity onPress={onEndIconPress}>
            <Image
              resizeMode="contain"
              source={endIcon}
              color="#808080"
              style={styles.icon}
            />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    color: '#000',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  icon: {
    marginLeft: 10,
    height: 24,
    width: 24,
    objectFit: 'contain',
  },
});

export default TextField;

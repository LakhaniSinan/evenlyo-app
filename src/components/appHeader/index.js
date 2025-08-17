import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { width } from 'react-native-dimension';
import { ICONS } from '../../assets';
import { COLORS, fontFamly } from '../../constants';
import useTranslation from '../../hooks/useTranslation';
import TextField from '../textInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
const AppHeader = ({
  showSearch,
  setModalVisible,
  showLocation,
  leftIcon,
  rightIcon,
  headingText,
  showNotifications,
  onLeftIconPress,
  onRightIconPress,
  containerStyle,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: COLORS.backgroundLight,
        borderBottomLeftRadius: width(10),
        borderBottomRightRadius: width(10),
        paddingVertical: 10,
        paddingHorizontal: 10,
        flexDirection: 'column',
      }}>
      <View
        style={{
          ...containerStyle,
          marginHorizontal: 10,
          marginTop: width(4),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        {leftIcon && (
          <TouchableOpacity onPress={() => onLeftIconPress()}>
            <Image
              resizeMode="contain"
              style={{ width: 40, height: 40 }}
              source={leftIcon}
            />
          </TouchableOpacity>
        )}
        {headingText && (
          <Text
            style={{
              fontSize: 16,
              fontFamily: fontFamly.PlusJakartaSansBold,
            }}>
            {headingText}
          </Text>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={() => onRightIconPress()}>
            <Image
              resizeMode="contain"
              style={{ width: 40, height: 40 }}
              source={rightIcon}
            />
          </TouchableOpacity>
        )}
        {showLocation && (
          <>
            <View>
              <Image
                resizeMode="contain"
                style={{ width: 40, height: 40 }}
                source={ICONS.locationIcon}
              />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: fontFamly.PlusJakartaSansSemiMedium,
                }}>
                San Francisco, CA
              </Text>
            </View>
          </>
        )}
        {showNotifications && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Notification")}
            style={{
              flexDirection: 'row',
              marginRight: 10,
              justifyContent: 'flex-end',
              flex: 1,
            }}>
            <Image
              resizeMode="contain"
              style={{ width: 40, height: 40 }}
              source={ICONS.notificationIcon}
            />
          </TouchableOpacity>
        )}
      </View>
      {showSearch && (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 10,
            marginVertical: 15,
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
              flex: 1,
              justifyContent: 'flex-end',
              marginRight: 10,
            }}>
            <Image
              resizeMode="contain"
              style={{ width: 40, height: 40 }}
              source={ICONS.filters}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    width: '80%',
    elevation: 3,
  },
  icon: {
    marginRight: 6,
    height: 20,
    width: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
});

export default AppHeader;

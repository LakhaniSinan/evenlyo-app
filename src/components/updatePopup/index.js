import { exitApp } from '@logicwind/react-native-exit-app';
import React, { useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import { width } from 'react-native-dimension';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import { IMAGES } from '../../assets';
import { COLORS, fontFamly } from '../../constants';
import GradientButton from '../button';

const UpdatePopUp = React.forwardRef((props, ref) => {
  const [isVisible, ModalVisibility] = useState(false);

  const handleCancel = () => {
    ModalVisibility(false);
    exitApp();
  };

  React.useImperativeHandle(ref, () => ({
    isVisible(params) {
      ModalVisibility(true);
    },
    backdropPress() {
      ModalVisibility(false);
    },
  }));

  return (
    <Modal
      style={{ alignSelf: 'center', alignItems: 'center' }}
      isVisible={isVisible}
      animationIn="slideInLeft"
      animationOut="slideOutRight"
      backdropOpacity={0.5}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}>
      <View
        style={{
          width: width(86),
          backgroundColor: 'white',
          borderRadius: width(2),
          padding: width(8),
        }}>
        <View style={{ alignSelf: 'center' }}>
          <FastImage
            source={IMAGES.logo}
            resizeMode='contain'
            style={{ height: width(25), width: width(25) }}
          />
        </View>
        <Text
          style={{
            fontSize: width(4),
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.black,
            textAlign: 'center',
            marginTop: width(5),
          }}>
          New Features Available!
        </Text>
        <Text
          style={{
            fontSize: width(2.5),
            fontFamily: fontFamly.PlusJakartaSansBold,
            color: COLORS.black,
            textAlign: 'center',
            marginTop: width(5),
          }}>
          A new version brings performance boosts and exciting features. Please
          update to continue.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: width(5),
          }}>
          <View style={{ width: '46%', height: width(14) }}>
            <GradientButton text="Cancel" onPress={handleCancel} />
          </View>
          <View style={{ width: '46%', height: width(14) }}>
            <GradientButton
              text="Update"
              onPress={() => {
                const url =
                  Platform.OS === 'android'
                    ? 'https://play.google.com/store/apps'
                    : 'itms-apps://itunes.apple.com';
                Linking.openURL(url);
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default UpdatePopUp;

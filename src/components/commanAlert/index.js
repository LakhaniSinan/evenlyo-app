import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Text, View} from 'react-native';
import {width} from 'react-native-dimension';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';

const CommonAlert = forwardRef((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalData, setModalData] = useState({});
  const {t} = useTranslation();

  useImperativeHandle(ref, () => ({
    show(params) {
      setModalData(params);
      setIsVisible(true);
    },
    hide() {
      setIsVisible(false);
    },
  }));

  const {message, status, handleDelete, handlePressOk} = modalData;

  return (
    <Modal
      style={{alignSelf: 'center', alignItems: 'center'}}
      isVisible={isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.5}
      useNativeDriver
      hideModalContentWhileAnimating>
      <View
        style={{
          width: width(86),
          backgroundColor: 'white',
          borderRadius: width(2),
          padding: width(8),
        }}>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          {status === 'ok' && (
            <FastImage
              source={ICONS.checkedCircle}
              style={{height: width(25), width: width(25)}}
            />
          )}
          {status === 'error' && (
            <FastImage
              source={ICONS.redcross}
              style={{height: width(12), width: width(12)}}
            />
          )}
        </View>

        <Text
          style={{
            fontSize: 14,
            color: COLORS.textDark,
            fontFamily: fontFamly.PlusJakartaSansBold,
            marginVertical: width(5),
            textAlign: 'center',
          }}>
          {message}
        </Text>

        <View style={{justifyContent: 'center', height: width(14)}}>
          <GradientButton
            text={t('OK')}
            onPress={() => {
              if (status === 'ok' && handlePressOk) {
                handlePressOk();
              } else if (status === 'ok' && handleDelete) {
                handleDelete();
              }
              setIsVisible(false);
            }}
            type="filled"
            textStyle={{
              fontSize: 12,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              color: 'white',
            }}
          />
        </View>
      </View>
    </Modal>
  );
});

export default CommonAlert;

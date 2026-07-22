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

  const normalizedStatus =
    status === 'ok' || status === 'alert' || status === 'error'
      ? status
      : 'error';
  const normalizedMessage =
    typeof message === 'string' && message.trim().length > 0
      ? message
      : 'Something went wrong.';

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
          {normalizedStatus === 'ok' && (
            <FastImage
              source={ICONS.checkedCircle}
              style={{height: width(25), width: width(25)}}
            />
          )}
          {normalizedStatus === 'alert' && (
            <FastImage
              resizeMode="contain"
              source={ICONS.alertIcon}
              style={{height: width(25), width: width(25)}}
            />
          )}
          {normalizedStatus === 'error' && (
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
          {normalizedMessage}
        </Text>

        {normalizedStatus === 'ok' && (
          <View style={{justifyContent: 'center', height: width(14)}}>
            <GradientButton
              text={t('OK')}
              onPress={() => {
                if (handlePressOk) {
                  handlePressOk();
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
        )}
        {normalizedStatus === 'error' && (
          <View style={{justifyContent: 'center', height: width(14)}}>
            <GradientButton
              text={t('OK')}
              onPress={() => {
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
        )}

        {normalizedStatus === 'alert' && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: width(3),
            }}>
            <View style={{width: width(33)}}>
              <GradientButton
                text={t('No')}
                onPress={() => {
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
            <View style={{width: width(33)}}>
              <GradientButton
                text={t('Yes')}
                onPress={() => {
                  if (handlePressOk) {
                    handlePressOk();
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
        )}
      </View>
    </Modal>
  );
});

export default CommonAlert;

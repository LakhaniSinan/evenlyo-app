import React, {forwardRef, useImperativeHandle, useState, useRef} from 'react';
import {Animated, Modal, Text, View, StyleSheet} from 'react-native';
import {width} from 'react-native-dimension';
import FastImage from 'react-native-fast-image';
import {ICONS} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import {useTranslation} from '../../hooks';
import GradientButton from '../button';

const CommonAlert = forwardRef((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalData, setModalData] = useState({});
  const opacity = useRef(new Animated.Value(0)).current;
  const {t} = useTranslation();

  const animateTo = (toValue, cb) => {
    Animated.timing(opacity, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start(cb);
  };

  useImperativeHandle(ref, () => ({
    show(params) {
      setModalData(params);
      setIsVisible(true);
      animateTo(1);
    },
    hide() {
      animateTo(0, () => setIsVisible(false));
    },
  }));

  const {message, status, handlePressOk} = modalData;

  const normalizedStatus =
    status === 'ok' || status === 'alert' || status === 'error'
      ? status
      : 'error';
  const normalizedMessage =
    typeof message === 'string' && message.trim().length > 0
      ? message
      : 'Something went wrong.';

  const close = () => animateTo(0, () => setIsVisible(false));

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}>
      <Animated.View style={[styles.backdrop, {opacity}]}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
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

          <Text style={styles.message}>{normalizedMessage}</Text>

          {normalizedStatus === 'ok' && (
            <View style={{justifyContent: 'center', height: width(14)}}>
              <GradientButton
                text={t('OK')}
                onPress={() => {
                  if (handlePressOk) handlePressOk();
                  close();
                }}
                type="filled"
                textStyle={styles.buttonText}
              />
            </View>
          )}
          {normalizedStatus === 'error' && (
            <View style={{justifyContent: 'center', height: width(14)}}>
              <GradientButton
                text={t('OK')}
                onPress={close}
                type="filled"
                textStyle={styles.buttonText}
              />
            </View>
          )}

          {normalizedStatus === 'alert' && (
            <View style={styles.alertActions}>
              <View style={{width: width(33)}}>
                <GradientButton
                  text={t('No')}
                  onPress={close}
                  type="filled"
                  textStyle={styles.buttonText}
                />
              </View>
              <View style={{width: width(33)}}>
                <GradientButton
                  text={t('Yes')}
                  onPress={() => {
                    if (handlePressOk) handlePressOk();
                    close();
                  }}
                  type="filled"
                  textStyle={styles.buttonText}
                />
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width(86),
    backgroundColor: 'white',
    borderRadius: width(2),
    padding: width(8),
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
    marginVertical: width(5),
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: 'white',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: width(3),
  },
});

export default CommonAlert;
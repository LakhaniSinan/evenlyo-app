import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {useSelector} from 'react-redux';
import {ICONS, IMAGES} from '../../assets';
import {COLORS, fontFamly} from '../../constants';
import useTranslation from '../../hooks/useTranslation';
import LanguageModal from '../languageModal';

const Header = ({languageModal, showBack, onBackPress}) => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const {t} = useTranslation();
  const {currentLanguage} = useSelector(state => state.LanguageSlice);

  const getLanguageDisplayName = () => {
    return currentLanguage === 'en' ? t('english') : t('dutch');
  };

  const languageChip = languageModal ? (
    <TouchableOpacity
      style={styles.langChip}
      onPress={() => setShowLanguageModal(true)}>
      <Image
        source={ICONS.languageIcon}
        resizeMode="contain"
        style={styles.langIcon}
      />
      <Text style={styles.langText}>{getLanguageDisplayName()}</Text>
    </TouchableOpacity>
  ) : null;

  if (showBack) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.singleRow}>
          <View style={styles.leftGroup}>
            <TouchableOpacity
              onPress={onBackPress}
              activeOpacity={0.8}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Image
                source={ICONS.leftArrowIcon}
                resizeMode="contain"
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Image
              source={IMAGES.logo}
              resizeMode="contain"
              style={styles.logoCompact}
            />
          </View>

          <View style={styles.sideSlotRight}>
            {languageChip || <View style={styles.sidePlaceholder} />}
          </View>
        </View>

        <LanguageModal
          visible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.singleRow,
          !languageModal && styles.singleRowCentered,
        ]}>
        <Image
          source={IMAGES.logo}
          resizeMode="contain"
          style={styles.logoLarge}
        />
        {languageChip}
      </View>

      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: width(90),
    alignSelf: 'center',
    paddingTop: width(4),
    paddingBottom: width(4),
  },
  singleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  singleRowCentered: {
    justifyContent: 'center',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width(2),
    flexShrink: 1,
  },
  sideSlotRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: width(2),
  },
  sidePlaceholder: {
    width: width(10),
    height: width(10),
  },
  backIcon: {
    width: width(10),
    height: width(10),
  },
  logoCompact: {
    height: width(26),
    width: width(24),
  },
  logoLarge: {
    height: width(28),
    width: width(26),
  },
  langChip: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  langIcon: {
    width: 15,
    height: 15,
    tintColor: COLORS.black,
  },
  langText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.black,
  },
});

export default Header;

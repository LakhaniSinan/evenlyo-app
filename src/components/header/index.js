import React, {useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ICONS, IMAGES} from '../../assets';
import {COLORS} from '../../constants';
import {useSelector} from 'react-redux';
import useTranslation from '../../hooks/useTranslation';
import LanguageModal from '../languageModal';

const Header = () => {
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const {t} = useTranslation();
  const {currentLanguage} = useSelector(state => state.LanguageSlice);

  const getLanguageDisplayName = () => {
    return currentLanguage === 'en' ? t('english') : t('dutch');
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: width(90),
        alignSelf: 'center',
      }}>
      <Image
        source={IMAGES.logo}
        resizeMode="contain"
        style={{height: 120, width: 114}}
      />
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: COLORS.black,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 5,
          flexDirection: 'row',
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
        onPress={() => setShowLanguageModal(true)}>
        <Image
          source={ICONS.languageIcon}
          resizeMode="contain"
          style={{width: 15, height: 15, tintColor: COLORS.black}}
        />
        <Text style={{fontSize: 12, fontWeight: '600'}}>
          {getLanguageDisplayName()}
        </Text>
      </TouchableOpacity>

      <LanguageModal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </View>
  );
};

export default Header;

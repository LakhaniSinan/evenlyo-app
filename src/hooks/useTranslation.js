import {useTranslation as useI18nTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

const useTranslation = () => {
  const {t: originalT, i18n} = useI18nTranslation();
  const currentLanguage = useSelector(
    state => state.LanguageSlice.currentLanguage,
  );
  const t = (key, options) => {
    if (!key) {return '';}
    if (i18n.exists(key)) {
      return originalT(key, options);
    }
    return key;
  };

  return {
    t,
    i18n,
    currentLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
};

export default useTranslation;

import {useTranslation as useI18nTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

const useTranslation = () => {
  const {t, i18n} = useI18nTranslation();
  const currentLanguage = useSelector(state => state.LanguageSlice.currentLanguage);
  
  return {
    t,
    i18n,
    currentLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
};

export default useTranslation;

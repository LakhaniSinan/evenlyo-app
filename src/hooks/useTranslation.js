import {useCallback} from 'react';
import {useTranslation as useI18nTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {findTranslationKey} from '../utils/translateLabel';

const useTranslation = () => {
  const {t: originalT, i18n} = useI18nTranslation();
  const currentLanguage = useSelector(
    state => state.LanguageSlice.currentLanguage,
  );
  // Stable reference: a new `t` every render breaks useCallback/useEffect deps
  // in screens (e.g. analytics fetch loop).
  const t = useCallback(
    (key, options) => {
      if (!key) {
        return '';
      }
      const resolvedKey = findTranslationKey(key, i18n);
      if (resolvedKey) {
        return originalT(resolvedKey, options);
      }
      return key;
    },
    [originalT, i18n],
  );

  return {
    t,
    i18n,
    currentLanguage,
    isRTL: i18n.dir() === 'rtl',
  };
};

export default useTranslation;

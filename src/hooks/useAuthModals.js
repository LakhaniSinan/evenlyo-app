import {useCallback, useState} from 'react';
import {InteractionManager} from 'react-native';

export const AUTH_MODAL_SWITCH_MS = 480;

const STAGGERED_TYPES = new Set([
  'forgot',
  'register',
  'reset',
  'goBackToLogin',
  'registeredOTP',
]);

/**
 * Shared login / forgot / register modal state used across client screens.
 */
const useAuthModals = ({onAfterTransition} = {}) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const openLogin = useCallback(() => setShowLogin(true), []);

  const closeAll = useCallback(() => {
    setShowLogin(false);
    setShowForgot(false);
    setShowRegister(false);
  }, []);

  const handlePressFun = useCallback(
    type => {
      closeAll();

      const openTargetModal = () => {
        if (type === 'forgot') {
          setShowForgot(true);
        } else if (type === 'register') {
          setShowRegister(true);
        } else if (
          type === 'reset' ||
          type === 'goBackToLogin' ||
          type === 'registeredOTP'
        ) {
          setShowLogin(true);
        }
        onAfterTransition?.(type);
      };

      if (STAGGERED_TYPES.has(type)) {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(openTargetModal, AUTH_MODAL_SWITCH_MS);
        });
      } else {
        openTargetModal();
      }
    },
    [closeAll, onAfterTransition],
  );

  return {
    showLogin,
    showForgot,
    showRegister,
    setShowLogin,
    setShowForgot,
    setShowRegister,
    openLogin,
    closeAll,
    handlePressFun,
  };
};

export default useAuthModals;

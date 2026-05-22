import React from 'react';
import ForgotModal from './ForgotModal';
import LoginModal from './index';
import RegistrationModal from './RegistrationModal';

const AuthModalsGroup = ({
  showLogin,
  showForgot,
  showRegister,
  setShowLogin,
  setShowForgot,
  setShowRegister,
  handlePressFun,
}) => (
  <>
    <LoginModal
      isVisible={showLogin}
      onClose={() => setShowLogin(false)}
      handlePressFun={handlePressFun}
    />
    <ForgotModal
      isVisible={showForgot}
      onClose={() => setShowForgot(false)}
      handlePressFun={handlePressFun}
    />
    <RegistrationModal
      isVisible={showRegister}
      onClose={() => setShowRegister(false)}
      handlePressFun={handlePressFun}
    />
  </>
);

export default AuthModalsGroup;

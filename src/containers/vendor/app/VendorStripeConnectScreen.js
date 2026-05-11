import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {WebView} from 'react-native-webview';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CommonAlert from '../../../components/commanAlert';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {
  vendorStripeConnect,
  vendorStripeOnboardingLink,
  vendorStripeOnboardingStatus,
} from '../../../services/VendorStripe';

const VendorStripeConnectScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const alertRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [onboardingUrl, setOnboardingUrl] = useState(null);
  const [webVisible, setWebVisible] = useState(false);
  const [statusSyncing, setStatusSyncing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const res = await vendorStripeOnboardingStatus();
      setConnected(res?.data?.onboarded);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [fetchStatus]),
  );

  const handleOnboardingCompletion = useCallback(async () => {
    try {
      setStatusSyncing(true);
      const res = await vendorStripeOnboardingStatus();
      setConnected(res?.data?.onboarded);
      await fetchStatus();
    } finally {
      setStatusSyncing(false);
      setWebVisible(false);
    }
  }, [fetchStatus]);

  const handleWebNavigation = useCallback(
    navState => {
      console.log(navState, 'navStatenavStatenavStatenavStatenavState');

      const currentUrl = String(navState?.url || '').toLowerCase();
      if (!currentUrl) return;
      const isStripeHost = currentUrl.includes('connect.stripe.com');
      if (isStripeHost) return;

      // Stripe redirects to app return/refresh URLs when onboarding flow changes state.
      const reachedReturnUrl = currentUrl.includes('/leverancier/succes');

      console.log(
        reachedReturnUrl,
        'reachedReturnUrlreachedReturnUrlreachedReturnUrl',
      );
      if (reachedReturnUrl) {
        handleOnboardingCompletion();
      }
    },
    [handleOnboardingCompletion],
  );

  const handleConnect = useCallback(async () => {
    try {
      setLoading(true);
      const connectRes = await vendorStripeConnect();
      console.log(connectRes, 'connectResconnectResconnectResconnectRes');

      if (connectRes?.status !== 200 && connectRes?.status !== 201) return;
      const linkRes = await vendorStripeOnboardingLink();
      console.log(linkRes, 'linkReslinkReslinkReslinkRes');

      const url = linkRes?.data?.url;
      if (!url) {
        Alert.alert('Stripe', t('Unable to get Stripe onboarding link.'));
        return;
      }
      setOnboardingUrl(url);
      setWebVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        headingText={t('Payment')}
        leftIcon={ICONS.leftArrowIcon}
        rightIcon={ICONS.notificationIcon}
        onLeftIconPress={() => navigation.goBack()}
        onRightIconPress={() =>
          navigation.navigate('Dashboard', {
            screen: 'Home',
            params: {screen: 'Notifications'},
          })
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('Stripe account')}</Text>
          <Text style={styles.status}>
            {statusLoading
              ? t('Checking…')
              : connected
              ? t('Connected')
              : t('Not connected')}
          </Text>
        </View>
        <View style={{height: width(10)}} />
        <GradientButton
          text={t('Connect Stripe account')}
          onPress={handleConnect}
        />
      </ScrollView>

      <Loader isLoading={loading} />
      <Loader isLoading={statusSyncing} />
      <CommonAlert ref={alertRef} />

      <Modal
        visible={webVisible}
        animationType="slide"
        onRequestClose={() => setWebVisible(false)}>
        <SafeAreaView style={styles.container}>
          <View style={styles.webHeader}>
            <TouchableOpacity onPress={() => setWebVisible(false)}>
              <Text style={styles.webCloseText}>{t('Close')}</Text>
            </TouchableOpacity>
          </View>
          {onboardingUrl ? (
            <WebView
              source={{uri: onboardingUrl}}
              startInLoadingState
              onNavigationStateChange={handleWebNavigation}
            />
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default VendorStripeConnectScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},
  scrollContent: {padding: width(4)},
  card: {
    padding: width(4),
    borderRadius: 12,
    backgroundColor: COLORS.backgroundLight,
  },
  title: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    fontSize: 16,
  },
  status: {
    marginTop: 8,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  webHeader: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: width(4),
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
  },
  webCloseText: {
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.primary,
    fontSize: 14,
  },
});

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
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

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

const pickOnboardingUrl = res => {
  const body = res?.data;
  if (!body) {
    return null;
  }
  return (
    body.url ||
    body.onboardingUrl ||
    body.data?.url ||
    body.link ||
    body.data?.link ||
    null
  );
};

const isStripeReady = data => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  if (data.payoutsEnabled === true || data.payouts_enabled === true) {
    return true;
  }
  if (data.chargesEnabled === true || data.charges_enabled === true) {
    return true;
  }
  if (data.onboardingComplete === true || data.onboarding_complete === true) {
    return true;
  }
  if (data.connected === true) {
    return true;
  }
  if (data.status === 'complete' || data.status === 'enabled') {
    return true;
  }
  if (data.detailsSubmitted === true || data.details_submitted === true) {
    return true;
  }
  return false;
};

const VendorPaymentsScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const alertRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [onboardingUrl, setOnboardingUrl] = useState(null);
  const [webVisible, setWebVisible] = useState(false);
  const [statusPayload, setStatusPayload] = useState(null);

  const connected = isStripeReady(statusPayload?.data ?? statusPayload ?? null);

  const fetchStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const res = await vendorStripeOnboardingStatus();
      if (res?.status === 200 || res?.status === 201) {
        setStatusPayload(res.data);
      } else {
        setStatusPayload(null);
      }
    } catch (e) {
      setStatusPayload(null);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [fetchStatus]),
  );

  const handleConnect = useCallback(async () => {
    try {
      setLoading(true);
      const connectRes = await vendorStripeConnect();
      console.log(connectRes, 'connectResconnectResconnectResconnectRes');

      if (connectRes?.status !== 200 && connectRes?.status !== 201) {
        alertRef.current?.show({
          status: 'error',
          message:
            connectRes?.data?.message ||
            t('Could not start Stripe connection. Please try again.'),
        });
        return;
      }

      const linkRes = await vendorStripeOnboardingLink();
      console.log(linkRes, 'linkReslinkReslinkReslinkRes');

      if (linkRes?.status !== 200 && linkRes?.status !== 201) {
        alertRef.current?.show({
          status: 'error',
          message:
            linkRes?.data?.message ||
            t('Could not get Stripe onboarding link. Please try again.'),
        });
        return;
      }

      const url = pickOnboardingUrl(linkRes);
      if (!url || typeof url !== 'string') {
        alertRef.current?.show({
          status: 'error',
          message: t('Invalid onboarding link from server.'),
        });
        return;
      }

      setOnboardingUrl(url);
      setWebVisible(true);
    } catch (e) {
      alertRef.current?.show({
        status: 'error',
        message: t('Something went wrong. Please try again.'),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  const closeWeb = useCallback(() => {
    setWebVisible(false);
    setOnboardingUrl(null);
    fetchStatus();
  }, [fetchStatus]);

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text style={styles.heroLabel}>{t('Payouts')}</Text>
            <View style={styles.heroIconWrap}>
              <Icon name="wallet-outline" size={18} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.heroTitle}>{t('Receive your earnings')}</Text>
          <Text style={styles.heroBody}>
            {t(
              'Connect your Stripe account to receive payouts from your bookings and sales. You will complete verification securely on Stripe.',
            )}
          </Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>{t('Stripe account')}</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusValue}>
              {statusLoading
                ? t('Checking…')
                : connected
                ? t('Connected')
                : t('Not connected')}
            </Text>
            <View
              style={[
                styles.statusPill,
                connected ? styles.statusPillOk : styles.statusPillPending,
              ]}>
              <Text
                style={[
                  styles.statusPillText,
                  connected ? styles.statusPillTextOk : {},
                ]}>
                {statusLoading
                  ? '…'
                  : connected
                  ? t('Active')
                  : t('Action needed')}
              </Text>
            </View>
          </View>
        </View>

        <GradientButton
          text={t('Connect Stripe account')}
          onPress={handleConnect}
          styleContainer={styles.ctaWrap}
          styleProps={styles.ctaInner}
        />

        <Text style={styles.hint}>
          {t(
            'After tapping Connect, sign in or create your Stripe account in the secure browser. You can return here anytime to check your status.',
          )}
        </Text>
      </ScrollView>

      <Loader isLoading={loading} />

      <CommonAlert ref={alertRef} />

      <Modal
        visible={webVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeWeb}>
        <SafeAreaView style={styles.webRoot}>
          <LinearGradient colors={GRADIENT_COLORS} style={styles.webHeader}>
            <TouchableOpacity
              onPress={closeWeb}
              style={styles.webCloseBtn}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <Icon name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.webHeaderTitle}>{t('Stripe')}</Text>
            <View style={styles.webHeaderSpacer} />
          </LinearGradient>
          {onboardingUrl ? (
            <WebView
              source={{uri: onboardingUrl}}
              style={styles.webView}
              startInLoadingState
              onNavigationStateChange={navState => {
                const u = (navState?.url || '').toLowerCase();
                if (
                  u.includes('onboarding/complete') ||
                  u.includes('stripe.com/connect/onboarding/success')
                ) {
                  closeWeb();
                }
              }}
            />
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default VendorPaymentsScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.white},
  scrollContent: {
    paddingBottom: width(10),
  },
  heroCard: {
    padding: width(4),
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: width(3.5),
    borderRadius: width(3),
    marginTop: width(3),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    color: COLORS.black,
    fontSize: 10,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  heroIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 18,
    marginTop: width(2),
  },
  heroBody: {
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 13,
    marginTop: width(2),
    lineHeight: 20,
  },
  statusCard: {
    padding: width(4),
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: width(3.5),
    borderRadius: width(3),
    marginTop: width(3),
  },
  statusLabel: {
    color: COLORS.textLight,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: width(2),
  },
  statusValue: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: width(3),
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusPillPending: {
    backgroundColor: '#FFF4E5',
  },
  statusPillOk: {
    backgroundColor: '#E8F5E9',
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: '#FF9800',
  },
  statusPillTextOk: {
    color: '#2E7D32',
  },
  ctaWrap: {
    marginHorizontal: width(5),
    marginTop: width(4),
  },
  ctaInner: {
    minHeight: width(12),
  },
  hint: {
    marginHorizontal: width(5),
    marginTop: width(3),
    color: COLORS.textLight,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    lineHeight: 18,
    textAlign: 'center',
  },
  webRoot: {flex: 1, backgroundColor: COLORS.white},
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: width(3),
  },
  webCloseBtn: {
    padding: 8,
    borderRadius: 12,
  },
  webHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 16,
  },
  webHeaderSpacer: {width: 40},
  webView: {flex: 1, backgroundColor: COLORS.white},
});

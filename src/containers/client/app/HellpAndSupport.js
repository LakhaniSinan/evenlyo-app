import React, {useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import {width} from 'react-native-dimension';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ICONS} from '../../../assets';
import AppHeader from '../../../components/appHeader';
import GradientButton from '../../../components/button';
import CustomerSupport from '../../../components/modals/CustomerSupport';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';

const faqData = [
  {
    id: 1,
    question: 'How do I book an event?',
    answer:
      'To book an event, simply browse through our vendors, select the one you like, choose your date and time, and click "Book Now". You will receive a confirmation email once your booking is confirmed.',
  },
  {
    id: 2,
    question: 'Can I cancel my booking?',
    answer:
      'Yes, you can cancel your booking up to 24 hours before the event date. Go to your bookings section and click on "Cancel Booking". Please note that cancellation fees may apply.',
  },
  {
    id: 3,
    question: 'How do I contact a vendor?',
    answer:
      'You can contact vendors directly through our messaging system or by clicking the "Contact Me" button on their profile. You can also call them using the phone number provided.',
  },
  {
    id: 4,
    question: 'What payment methods are accepted?',
    answer:
      'We accept all major credit cards, debit cards, PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.',
  },
  {
    id: 5,
    question: 'How do I become a vendor?',
    answer:
      'To become a vendor, click on "Continue as Vendor" during registration. You will need to provide business details, upload necessary documents, and wait for approval from our team.',
  },
  {
    id: 6,
    question: 'Is there a service fee?',
    answer:
      'Yes, there is a small service fee added to each booking to help maintain our platform and provide customer support. The fee is clearly displayed before you confirm your booking.',
  },
  {
    id: 7,
    question: 'How do I change my account settings?',
    answer:
      'Go to your Profile section and tap on Settings. From there you can update your personal information, notification preferences, and language settings.',
  },
  {
    id: 8,
    question: 'What if I have issues with a vendor?',
    answer:
      'If you experience any issues with a vendor, please contact our support team immediately. We will investigate the matter and work to resolve it as quickly as possible.',
  },
];

const HelpAndSupport = ({navigation}) => {
  const {t} = useTranslation();
  const [collapsedItems, setCollapsedItems] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const toggleCollapse = id => {
    setCollapsedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderFAQItem = item => {
    const isCollapsed = collapsedItems[item.id] !== false;
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.faqItem}
        onPress={() => toggleCollapse(item.id)}
        activeOpacity={0.7}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{item.question}</Text>
          <Image
            source={ICONS.rightIcon}
            style={[
              styles.arrowIcon,
              {transform: [{rotate: isCollapsed ? '0deg' : '90deg'}]},
            ]}
            resizeMode="contain"
          />
        </View>

        <Collapsible collapsed={isCollapsed} duration={300}>
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>{item.answer}</Text>
          </View>
        </Collapsible>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        leftIcon={ICONS.leftArrowIcon}
        headingText={t('Help & Support')}
        onLeftIconPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>
            {t(`Questions? We're Happy to Answer!`)}
          </Text>
        </View>
        <View style={styles.faqSection}>{faqData.map(renderFAQItem)}</View>
        <View
          style={{
            borderRadius: width(5),
            backgroundColor: COLORS.backgroundLight,
            marginHorizontal: width(5),
            padding: width(10),
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansBold,
              fontSize: 14,
              color: COLORS.textDark,
              textAlign: 'center',
            }}>
            {t(`Have Questions?`)}
          </Text>
          <Text
            style={{
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              fontSize: 12,
              color: COLORS.textLight,
              textAlign: 'center',
              marginTop: width(2),
            }}>
            {t(
              `Check out our comprehensive FAQ section or contact our support team.`,
            )}
          </Text>
          <View style={{width: width(50), marginTop: width(4)}}>
            <GradientButton
              text={t('Customer Support')}
              onPress={() => setIsVisible(true)}
              textStyle={{
                fontSize: 12,
                fontFamily: fontFamly.PlusJakartaSansSemiBold,
                color: COLORS.white,
              }}
              type="filled"
              gradientColors={['#FF295D', '#E31B95', '#C817AE']}
            />
          </View>
        </View>
      </ScrollView>
      <CustomerSupport
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
      <View style={{height: insets.bottom}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
    width: width(90),
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  faqSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  faqItem: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.backgroundLight,
  },
  questionText: {
    flex: 1,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.textDark,
    marginRight: 10,
    lineHeight: 22,
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.textLight,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: COLORS.backgroundLight,
  },
  answerText: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  supportSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 20,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  supportSubtitle: {
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  contactIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.white,
    marginRight: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.white,
  },
});

export default HelpAndSupport;

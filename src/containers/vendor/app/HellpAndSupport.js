import React, {useEffect, useRef, useState} from 'react';
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
import CommonAlert from '../../../components/commanAlert';
import CustomerSupport from '../../../components/modals/CustomerSupport';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getFaqs} from '../../../services/Faqs';

const HelpAndSupport = ({navigation}) => {
  const {t, currentLanguage} = useTranslation();
  const modalRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);

  const insets = useSafeAreaInsets();
  const toggleCollapse = id => {
    setActiveId(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    handleGetFAQs();
  }, []);

  const handleGetFAQs = async () => {
    try {
      setIsLoading(true);
      const response = await getFaqs();
      if (response.status == 200 || response.status == 201) {
        let data = response.data.data;
        setFaqs(data);
      } else {
        modalRef.current.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const SKELETON_ITEMS = Array.from({length: 6});

  const renderFAQItem = item => {
    const isCollapsed = activeId !== item._id;

    return (
      <View key={item._id} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={() => toggleCollapse(item._id)}
          activeOpacity={0.7}>
          <Text style={styles.questionText}>
            {currentLanguage === 'en' ? item.question.en : item?.question?.nl}
          </Text>

          <Image
            source={ICONS.rightIcon}
            style={[
              styles.arrowIcon,
              {transform: [{rotate: isCollapsed ? '0deg' : '90deg'}]},
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Collapsible collapsed={isCollapsed} duration={250}>
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>
              {currentLanguage === 'en' ? item.answer.en : item?.answer?.nl}
            </Text>
          </View>
        </Collapsible>
      </View>
    );
  };
  const renderSkeletonItem = (_, index) => {
    return (
      <View key={index} style={styles.faqItem}>
        <View style={styles.questionContainer}>
          <View style={styles.skeletonQuestion} />
          <View style={styles.skeletonArrow} />
        </View>
      </View>
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
            {t("Questions? We're Happy to Answer!")}
          </Text>
        </View>
        <View style={styles.faqSection}>
          {isLoading
            ? SKELETON_ITEMS.map(renderSkeletonItem)
            : faqs.map(renderFAQItem)}
        </View>

        {/* <View
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
            {t('Have Questions?')}
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
              'Check out our comprehensive FAQ section or contact our support team.',
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
        </View> */}
      </ScrollView>
      {/* <CustomerSupport
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />
      <View style={{height: insets.bottom}} />
      <CommonAlert ref={modalRef} /> */}
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

  skeletonQuestion: {
    height: 12,
    width: '75%',
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },

  skeletonArrow: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
});

export default HelpAndSupport;

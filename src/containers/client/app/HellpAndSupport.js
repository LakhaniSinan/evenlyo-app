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
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {useTranslation} from '../../../hooks';
import {getFaqs} from '../../../services/Faqs';

const getLocalizedFaqField = (field, currentLanguage) => {
  if (!field) {
    return '';
  }
  if (typeof field === 'string') {
    return field;
  }
  return currentLanguage === 'en'
    ? field.en || field.nl || ''
    : field.nl || field.en || '';
};

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
      if (response?.status === 200 || response?.status === 201) {
        setFaqs(response?.data?.data || []);
      } else {
        modalRef.current?.show({
          status: 'error',
          message: response?.data?.message,
        });
      }
    } catch {
      modalRef.current?.show({
        status: 'error',
        message: t('noFaqsAvailable'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFAQItem = item => {
    const itemId = item._id ?? item.id;
    const isCollapsed = activeId !== itemId;

    return (
      <View key={itemId} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={() => toggleCollapse(itemId)}
          activeOpacity={0.7}>
          <Text style={styles.questionText}>
            {getLocalizedFaqField(item.question, currentLanguage)}
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
              {getLocalizedFaqField(item.answer, currentLanguage)}
            </Text>
          </View>
        </Collapsible>
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
          {!isLoading && faqs.length === 0 ? (
            <Text style={styles.emptyText}>{t('noFaqsAvailable')}</Text>
          ) : (
            faqs.map(renderFAQItem)
          )}
        </View>

        <View style={styles.supportCard}>
          <Text style={styles.supportCardTitle}>{t('helpHaveQuestions')}</Text>
          <Text style={styles.supportCardSubtitle}>{t('helpFaqBlurb')}</Text>
          <View style={styles.supportButtonWrap}>
            <GradientButton
              text={t('Customer Support')}
              onPress={() => setIsVisible(true)}
              textStyle={styles.supportButtonText}
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
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
    </SafeAreaView>
  );
};

export default HelpAndSupport;

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
  faqSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: 16,
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
  supportCard: {
    borderRadius: width(5),
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: width(5),
    padding: width(10),
    alignItems: 'center',
  },
  supportCardTitle: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 14,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  supportCardSubtitle: {
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: width(2),
  },
  supportButtonWrap: {
    width: width(50),
    marginTop: width(4),
  },
  supportButtonText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    color: COLORS.white,
  },
});

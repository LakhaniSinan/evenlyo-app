import React, {useRef, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ProgressStep, ProgressSteps} from 'react-native-progress-steps';
import Background from '../../../components/background';
import Header from '../../../components/header';
import {COLORS} from '../../../constants';
import BusinessPersonalInfo from './BusinessPresonalDetails';
import Categories from './Categories';
import MultipleMediaUpload from './GalleryForBusiness';
import PersonalInfo from './PrsonalInfo';
import SecurityTab from './SecurityTab';
import SubCategories from './SubCategories';
import VendorTypeScreen from './VendorTypeScreen';
import VerifyTab from './VerifyTab';

const VendorPersonalDetails = ({navigation}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [vendorType, setVendorType] = useState('');
  const modalRef = useRef(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const [subCategoriesSelected, setSubCategoriesSelected] = useState([]);
  const [media, setMedia] = useState({
    banner: [],
    workImages: [],
    workVideos: [],
  });
  const [security, setSecurity] = useState({password: '', confirmPassword: ''});
  const [verification, setVerification] = useState({
    phoneNumber: '',
    email: '',
  });

  const handleNextStep = type => {
    setSelectedType(type);
    setVendorType(type);
    setActiveStep(prev => prev + 1);
  };

  const handlePersonalNext = data => {
    setPersonalInfo(data);
    setActiveStep(pre => pre + 1);
  };

  const handleBusinessNext = data => {
    setBusinessInfo(data);
    setActiveStep(pre => pre + 1);
  };

  const handleCategoriesNext = data => {
    setCategoriesSelected(data || []);
    setActiveStep(pre => pre + 1);
  };

  const handleSubCategoriesNext = data => {
    setSubCategoriesSelected(data || []);
    setActiveStep(pre => pre + 1);
  };

  const handleMediaNext = data => {
    setMedia({
      banner: data?.banner || [],
      workImages: data?.workImages || [],
      workVideos: data?.workVideos || [],
    });
    setActiveStep(pre => pre + 1);
  };

  const handleSecurityNext = data => {
    setSecurity({
      password: data?.password || '',
      confirmPassword: data?.confirmPassword || '',
    });
    setActiveStep(pre => pre + 1);
  };

  const showAlert = message => {
    modalRef.current.show({
      status: 'error',
      message: message,
    });
  };

  const validateAll = () => {
    // 1) Phone or Email required
    const hasPhoneOrEmail =
      Boolean(verification?.phoneNumber) || Boolean(verification?.email);
    if (!hasPhoneOrEmail) {
      showAlert('At least one of phone or email is required.');
      return false;
    }

    // 2) No empty fields for the chosen path
    if (selectedType === 'personal') {
      const requiredPersonal = [
        'firstName',
        'lastName',
        'email',
        'contact',
        'city',
        'postalCode',
        'address',
        'cnicPassport',
      ];
      if (!personalInfo) {
        showAlert('This field is required.');
        return false;
      }
      for (const key of requiredPersonal) {
        if (!personalInfo[key]) {
          showAlert('This field is required.');
          return false;
        }
      }
    } else if (selectedType === 'business') {
      const requiredBusiness = [
        'companyName',
        'businessType',
        'companyEmail',
        'contact',
        'companyAddress',
        'companyWebsite',
      ];
      if (!businessInfo) {
        showAlert('This field is required.');
        return false;
      }
      for (const key of requiredBusiness) {
        if (!businessInfo[key]) {
          showAlert('This field is required.');
          return false;
        }
      }
    }

    // 3) Categories and SubCategories
    const hasCategory = (categoriesSelected || []).length > 0;
    const hasSubCategory =
      selectedType === 'personal'
        ? (subCategoriesSelected || []).length > 0
        : true;
    if (!hasCategory || !hasSubCategory) {
      showAlert('Please select at least one category or subcategory.');
      return false;
    }

    // 4) Media (at least one image) for business flow where media step exists
    if (selectedType === 'business') {
      const totalImages =
        (media?.banner?.length || 0) + (media?.workImages?.length || 0);
      if (totalImages < 1) {
        showAlert('Please upload at least one image.');
        return false;
      }
    }

    // 5) Security: non-empty and match
    if (!security?.password || !security?.confirmPassword) {
      showAlert('This field is required.');
      return false;
    }
    if (security.password !== security.confirmPassword) {
      showAlert('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleVerifyNext = data => {
    setVerification({
      phoneNumber: data?.phoneNumber || '',
      email: data?.email || '',
    });

    const nextTick = () => {
      if (!validateAll()) return;
      const payload = {
        vendorType,
        personalInfo: selectedType === 'personal' ? personalInfo : null,
        businessInfo: selectedType === 'business' ? businessInfo : null,
        categories: categoriesSelected,
        subCategories: selectedType === 'personal' ? subCategoriesSelected : [],
        media:
          selectedType === 'business'
            ? media
            : {banner: [], workImages: [], workVideos: []},
        security,
        verification,
      };
      // Final payload
      // eslint-disable-next-line no-console
      console.log('Final Vendor Registration Payload:', payload);
    };

    // Ensure state is set before validation
    setTimeout(nextTick, 0);
  };

  return (
    <Background>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View
          style={{flex: 1, paddingTop: width(10), paddingBottom: width(20)}}>
          <Header languageModal={false} />
          <View
            style={{
              backgroundColor: COLORS.backgroundLight,
              borderRadius: width(5),
              paddingBottom: width(4),
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,
              elevation: 1,
            }}>
            <ProgressSteps
              activeStep={activeStep}
              completedStepIconColor="#FF2B7A"
              completedProgressBarColor="#FF2B7A"
              activeStepIconBorderColor="#FF2B7A"
              activeLabelColor="#FF2B7A"
              labelColor="#d3d3d3">
              <ProgressStep removeBtnRow>
                <VendorTypeScreen onSelectType={handleNextStep} />
              </ProgressStep>

              {selectedType === 'personal' ? (
                <ProgressStep removeBtnRow>
                  <PersonalInfo
                    onPressBack={() => setActiveStep(pre => pre - 1)}
                    handleNextStep={handlePersonalNext}
                  />
                </ProgressStep>
              ) : (
                <ProgressStep removeBtnRow>
                  <BusinessPersonalInfo
                    onPressBack={() => setActiveStep(pre => pre - 1)}
                    handleNextStep={handleBusinessNext}
                  />
                </ProgressStep>
              )}
              <ProgressStep removeBtnRow>
                <Categories
                  onPressBack={() => setActiveStep(pre => pre - 1)}
                  handleNextStep={handleCategoriesNext}
                />
              </ProgressStep>

              {selectedType === 'personal' ? (
                <ProgressStep removeBtnRow>
                  <SubCategories
                    onPressBack={() => setActiveStep(pre => pre - 1)}
                    handleNextStep={handleSubCategoriesNext}
                  />
                </ProgressStep>
              ) : (
                <ProgressStep removeBtnRow>
                  <MultipleMediaUpload
                    onPressBack={() => setActiveStep(pre => pre - 1)}
                    handleNextStep={handleMediaNext}
                  />
                </ProgressStep>
              )}
              <ProgressStep removeBtnRow>
                <SecurityTab
                  onPressBack={() => setActiveStep(pre => pre - 1)}
                  handleNextStep={handleSecurityNext}
                />
              </ProgressStep>

              <ProgressStep removeBtnRow>
                <VerifyTab
                  onPressBack={() => setActiveStep(pre => pre - 1)}
                  handleNextStep={handleVerifyNext}
                />
              </ProgressStep>
            </ProgressSteps>
          </View>
        </View>
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
});

export default VendorPersonalDetails;

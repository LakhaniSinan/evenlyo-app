import React, {useRef, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ProgressStep, ProgressSteps} from 'react-native-progress-steps';
import Background from '../../../components/background';
import CommonAlert from '../../../components/commanAlert';
import Header from '../../../components/header';
import Loader from '../../../components/loder';
import {COLORS} from '../../../constants';
import {registerUser} from '../../../services/Auth';
import BusinessPersonalInfo from './BusinessPresonalDetails';
import Categories from './Categories';
import MultipleMediaUpload from './GalleryForBusiness';
import PersonalInfo from './PrsonalInfo';
import SecurityTab from './SecurityTab';
import SubCategories from './SubCategories';
import VendorTypeScreen from './VendorTypeScreen';
import VerifyTab from './VerifyTab';
import {useTranslation} from '../../../hooks';

const VendorPersonalDetails = ({navigation}) => {
  const {t, currentLanguage} = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [vendorType, setVendorType] = useState('business');
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [categoriesSelected, setCategoriesSelected] = useState([]);
  const [subCategoriesSelected, setSubCategoriesSelected] = useState([]);

  const [media, setMedia] = useState({
    banner: '',
    workImages: '',
    workVideos: '',
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
    console.log('Selected categories:', data);
    setCategoriesSelected(data || []);
    setActiveStep(pre => pre + 1);
    // step will move after subcategories are fetched
  };

  const handleSubCategoriesNext = data => {
    console.log(data, 'datadatadata12312');

    // setSubCategoriesSelected(data || []);
    // setActiveStep(pre => pre + 1);
  };

  const handleBackStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleMediaNext = data => {
    setMedia({
      banner: data?.bannerImage,
      workImages: data?.businessLogo,
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

  const validateAll = () => {};

  const handleVerifyNext = data => {
    console.log(data, 'datadatadatadatadatadatadata');

    setVerification({
      phoneNumber: data?.phoneNumber || '',
      email: data?.email || '',
    });

    const nextTick = async () => {
      // if (!validateAll()) return;
      try {
        const payload = {
          vendorType,
          personalInfo: personalInfo,
          businessInfo: businessInfo,
          categories: categoriesSelected,
          subCategories: subCategoriesSelected,
          media: media,
          security,
          verification,
        };

        console.log(payload, 'payloadpayloadpayloadpayloadpayload');

        setIsLoading(true);
        const response = await registerUser({email: data?.email});
        console.log(response, 'responseresponseresponse');

        setIsLoading(false);
        if (response?.status == 200 || response?.status == 201) {
          modalRef.current.show({
            status: 'ok',
            message:
              currentLanguage == 'en'
                ? response.data?.message.en
                : response.data?.message.nl,
            handlePressOk: () => {
              modalRef.current.hide();
              navigation.navigate('RegistrationOtp', {
                ...payload,
                type: 'vendor',
              });
            },
          });
        } else {
          modalRef.current.show({
            status: 'error',
            message:
              currentLanguage == 'en'
                ? response.data?.message.en
                : response.data?.message.nl,
          });
        }
      } catch (error) {
        console.log(error, 'errorerrorerrorerrorerror123123');
      } finally {
        setIsLoading(false);
      }
    };
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
              marginHorizontal: width(3),
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 1},
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
              {/* <ProgressStep removeBtnRow>
                <VendorTypeScreen onSelectType={handleNextStep} />
              </ProgressStep> */}

              {/* {selectedType === 'personal' ? (
                <ProgressStep removeBtnRow>
                  <PersonalInfo
                    personalInfo={personalInfo}
                    onPressBack={() => setActiveStep(pre => pre - 1)}
                    handleNextStep={handlePersonalNext}
                  />
                </ProgressStep>
              ) : (
                <ProgressStep removeBtnRow>
                  <BusinessPersonalInfo
                    businessInfo={businessInfo}
                    onPressBack={() => setActiveStep(pre => pre - 1)}
                    handleNextStep={handleBusinessNext}
                  />
                </ProgressStep>
                )} */}
              <ProgressStep removeBtnRow>
                <BusinessPersonalInfo
                  businessInfo={businessInfo}
                  onPressBack={handleBackStep}
                  handleNextStep={handleBusinessNext}
                />
              </ProgressStep>
              <ProgressStep removeBtnRow>
                <Categories
                  selectedCat={categoriesSelected}
                  onPressBack={handleBackStep}
                  handleNextStep={handleCategoriesNext}
                />
              </ProgressStep>

              <ProgressStep removeBtnRow>
                <SubCategories
                  selectedSubCat={subCategoriesSelected}
                  categoriesSelected={categoriesSelected}
                  onPressBack={handleBackStep}
                  handleNextStep={handleSubCategoriesNext}
                />
              </ProgressStep>

              <ProgressStep removeBtnRow>
                <MultipleMediaUpload
                  media={media}
                  onPressBack={handleBackStep}
                  handleNextStep={handleMediaNext}
                />
              </ProgressStep>

              <ProgressStep removeBtnRow>
                <SecurityTab
                  enteredPass={security}
                  onPressBack={handleBackStep}
                  handleNextStep={handleSecurityNext}
                />
              </ProgressStep>

              <ProgressStep removeBtnRow>
                <VerifyTab
                  setVerification={setVerification}
                  onPressBack={handleBackStep}
                  handleNextStep={handleVerifyNext}
                />
              </ProgressStep>
            </ProgressSteps>
          </View>
        </View>
      </ScrollView>
      <Loader isLoading={isLoading} />
      <CommonAlert ref={modalRef} />
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

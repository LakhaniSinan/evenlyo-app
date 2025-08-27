import React, {useState} from 'react';
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

  const handleNextStep = type => {
    setSelectedType(type);
    console.log(type, 'typetypetypetype');
    setActiveStep(prev => prev + 1);
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
                    handleNextStep={() => setActiveStep(pre => pre + 1)}
                  />
                </ProgressStep>
              ) : (
                <ProgressStep removeBtnRow>
                  <BusinessPersonalInfo
                    onPressBack={() => setActiveStep(pre => pre - 1)}
                    handleNextStep={() => setActiveStep(pre => pre + 1)}
                  />
                </ProgressStep>
              )}
              <ProgressStep removeBtnRow>
                <Categories
                  onPressBack={() => setActiveStep(pre => pre - 1)}
                  handleNextStep={() => setActiveStep(pre => pre + 1)}
                />
              </ProgressStep>

              {selectedType === 'personal' ? (
                <ProgressStep removeBtnRow>
                  <SubCategories
                    onPressBack={() => setActiveStep(pre => pre - 1)}
                    handleNextStep={() => setActiveStep(pre => pre + 1)}
                  />
                </ProgressStep>
              ) : (
                <ProgressStep removeBtnRow>
                  <MultipleMediaUpload
                    onPressBack={() => setActiveStep(pre => pre - 1)}
                    handleNextStep={() => setActiveStep(pre => pre + 1)}
                  />
                </ProgressStep>
              )}
              <ProgressStep removeBtnRow>
                <SecurityTab
                  onPressBack={() => setActiveStep(pre => pre - 1)}
                  handleNextStep={() => setActiveStep(pre => pre + 1)}
                />
              </ProgressStep>

              <ProgressStep removeBtnRow>
                <VerifyTab
                  onPressBack={() => setActiveStep(pre => pre - 1)}
                  handleNextStep={() => setActiveStep(pre => pre + 1)}
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

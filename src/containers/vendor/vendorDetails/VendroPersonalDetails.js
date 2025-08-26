import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import {ProgressStep, ProgressSteps} from 'react-native-progress-steps';
import Background from '../../../components/background';
import Header from '../../../components/header';
import {COLORS} from '../../../constants';
import PersonalInfo from './PrsonalInfo';
import VendorTypeScreen from './VendorTypeScreen';

const VendorPersonalDetails = ({navigation}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedType, setSelectedType] = useState('');

  const handleNextStep = type => {
    setSelectedType(type);
    setActiveStep(prev => prev + 1);
    console.log(activeStep, 'activeStepactiveStepactiveStep');
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

              <ProgressStep removeBtnRow>
                <PersonalInfo
                  onPressBack={() => setActiveStep(0)}
                  handleNextStep={() => setActiveStep(pre => pre + 1)}
                />
              </ProgressStep>

              <ProgressStep removeBtnRow>
                <TouchableOpacity
                  style={styles.center}
                  onPress={() => setActiveStep(0)}>
                  <Text>Step 3 Content</Text>
                </TouchableOpacity>
              </ProgressStep>

              <ProgressStep removeBtnRow>
                <TouchableOpacity
                  style={styles.center}
                  onPress={() => setActiveStep(0)}>
                  <Text>Step 4 Content</Text>
                </TouchableOpacity>
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

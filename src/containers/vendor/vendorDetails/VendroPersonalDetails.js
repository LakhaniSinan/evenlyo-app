import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {width} from 'react-native-dimension';
import {ProgressStep, ProgressSteps} from 'react-native-progress-steps';
import Background from '../../../components/background';
import Header from '../../../components/header';
import {COLORS, fontFamly} from '../../../constants';
import VendorTypeScreen from './VendorTypeScreen';

const VendorPersonalDetails = ({navigation}) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <Background>
        <ScrollView style={{flex: 1, width: width(90)}}>
          <View style={{flex: 1}}>
            <Header languageModal={false} />
            <View
              style={{
                width: width(90),
                backgroundColor: COLORS.error,
                borderRadius: width(5),
              }}>
              <ProgressSteps>
                <ProgressStep>
                  <VendorTypeScreen />
                </ProgressStep>
                <ProgressStep></ProgressStep>
                <ProgressStep></ProgressStep>
              </ProgressSteps>
            </View>
          </View>
        </ScrollView>
      </Background>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: width(5),
    padding: width(1),
    marginVertical: width(3),
    backgroundColor: COLORS.white,
    gap: width(1),
  },
  tabGradient: {
    flex: 1,
    borderRadius: width(3),
  },
  tab: {
    paddingHorizontal: width(3),
    paddingVertical: width(3.5),
    borderRadius: width(3),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: width(12),
  },
  tabText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.white,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(10),
    gap: 10,
    justifyContent: 'flex-end',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
});

export default VendorPersonalDetails;

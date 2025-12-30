import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../constants';
import GradientText from '../gradiantText';

const TermsAcceptance = ({acceptTerms, setAcceptTerms}) => {
  return (
    <View style={styles.termsSection}>
      <TouchableOpacity
        onPress={() => setAcceptTerms(prev => !prev)}
        style={styles.termsContainer}>
        <View
          style={[
            styles.checkbox,
            acceptTerms && styles.checkboxChecked,
          ]}>
          {acceptTerms && (
            <Icon name="checkmark" size={16} color="white" />
          )}
        </View>
        <View style={styles.termsTextContainer}>
          <Text style={styles.termsText}>I Accept The Company's </Text>
          <TouchableOpacity>
            <GradientText
              text="Terms & Conditions"
              customStyles={styles.termsLink}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  termsSection: {marginBottom: 25},
  termsContainer: {flexDirection: 'row', alignItems: 'flex-start'},
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF295D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {backgroundColor: '#FF295D'},
  termsTextContainer: {flexDirection: 'row', flexWrap: 'wrap', flex: 1},
  termsText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  termsLink: {
    fontSize: 12,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

export default TermsAcceptance;

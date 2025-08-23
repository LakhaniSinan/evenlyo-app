import React from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CustomDropDown = ({
  label,
  data,
  ratingsData,
  showData,
  showPriceData,
  handleSelectRange,
  selectedRange,
  handleCheckBoxChange,
  selectedBudgets,
  handleOpen,
  type,
}) => {
  return (
    <>
      <TouchableOpacity
        onPress={() => handleOpen(type)}
        style={{
          marginTop: width(3),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text
          style={{
            fontFamily: fontFamly.PlusJakartaSansBold,
            fontSize: 14,
            color: COLORS.white,
          }}>
          {label}
        </Text>
        {/* <MaterialIcons
          name={'keyboard-arrow-down'}
          size={18}
          color={appColors.white}
        /> */}
      </TouchableOpacity>

      {/* {showData && (
        <View style={{paddingVertical: width(2)}}>
          {ratingsData?.map((budget, index) => {
            const isChecked = budget?.ratings == selectedBudgets?.ratings;
            return (
              <View
                key={index}
                style={{
                  height: width(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <CustomCheckBox
                  checked={isChecked}
                  onChange={() => handleCheckBoxChange(budget)}
                  label={`${budget?.ratings} Stars`}
                />
              </View>
            );
          })}
        </View>
      )} */}

      {/* {showPriceData && (
        <View style={{paddingVertical: width(2)}}>
          {data?.map((budget, index) => {
            const isChecked = selectedRange?.minPrice === budget?.minPrice;
            return (
              <View
                key={index}
                style={{
                  height: width(10),
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <CustomCheckBox
                  checked={isChecked}
                  onChange={() => handleSelectRange(budget)}
                  label={`${budget?.minPrice} $ - ${budget?.maxPrice} $`}
                />
              </View>
            );
          })}
        </View>
      )} */}
    </>
  );
};

export default CustomDropDown;

const styles = StyleSheet.create({});

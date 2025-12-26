import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';

const RangeSliderComponent = ({
  minValue = 0,
  maxValue = 100,
  step = 1,
  minRange = 5,
  low,
  high,
  onChange = () => {},
  onSlidingStart = () => {},
  onSlidingEnd = () => {},
  disableRange = false,
  sliderLength = 280,
}) => {
  const handleValueChange = useCallback(values => {
    onChange({min: values[0], max: values[1]});
  }, []);

  const CustomMarkerLeft = () => (
    <View style={[styles.thumb, {backgroundColor: '#8A2BE2'}]} />
  );

  const CustomMarkerRight = () => (
    <View style={[styles.thumb, {backgroundColor: '#6AFF6A'}]} />
  );

  return (
    <></>
    // <MultiSlider
    //   values={[low, high]}
    //   min={minValue}
    //   max={maxValue}
    //   step={step}
    //   sliderLength={sliderLength}
    //   onValuesChange={handleValueChange}
    //   onValuesChangeStart={onSlidingStart}
    //   onValuesChangeFinish={onSlidingEnd}
    //   isMarkersSeparated={true}
    //   customMarkerLeft={CustomMarkerLeft}
    //   customMarkerRight={CustomMarkerRight}
    //   selectedStyle={{backgroundColor: '#FF295D', height: 4}}
    //   unselectedStyle={{backgroundColor: '#ccc', height: 4}}
    //   trackStyle={{height: 4}}
    //   allowOverlap={false}
    //   minMarkerOverlapDistance={minRange}
    // />
  );
};

export default RangeSliderComponent;

const THUMB_RADIUS = 10;

const styles = StyleSheet.create({
  valueText: {
    color: '#000',
    fontSize: 12,
  },
  thumb: {
    width: THUMB_RADIUS * 2,
    height: THUMB_RADIUS * 2,
    borderRadius: THUMB_RADIUS,
    borderWidth: 3,
    borderColor: '#000',
  },
  rail: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  railSelected: {
    height: 4,
    borderRadius: 4,
    backgroundColor: '#FF295D',
  },
});

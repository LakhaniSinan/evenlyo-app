import React, {useCallback} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {width} from 'react-native-dimension';
import RangeSlider from 'react-native-sticky-range-slider';
import {COLORS} from '../../constants';

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
}) => {
  const handleValueChange = useCallback((newLow, newHigh) => {
    onChange({min: newLow, max: newHigh});
  }, []);

  const Thumb = type => (
    <TouchableOpacity
      style={[
        styles.thumb,
        {backgroundColor: type === 'high' ? '#ffffffff' : '#ffffffff'},
      ]}
    />
  );

  const Rail = () => <View style={styles.rail} />;
  const RailSelected = () => <View style={styles.railSelected} />;

  return (
    <RangeSlider
      min={minValue}
      max={maxValue}
      step={step}
      minRange={minRange}
      low={low}
      high={high}
      onValueChanged={handleValueChange}
      onSlidingStart={onSlidingStart}
      onSlidingEnd={onSlidingEnd}
      renderThumb={Thumb}
      renderRail={Rail}
      renderRailSelected={RailSelected}
      disableRange={disableRange}
      pannableAreaStyle={{height: 50}}
    />
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
    width: width(4),
    height: width(4),
    borderRadius: width(100),
    borderWidth: 3,
    borderColor: COLORS.primary,
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

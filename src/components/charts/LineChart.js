import React, {useRef, useState} from 'react';
import {Text, View} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import CustomPicker from '../customPicker';

const LineChartComponent = () => {
  const selectSizeRef = useRef();
  const [filterType, setFilterType] = useState(null);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(255, 41, 93, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.backgroundLight,
    backgroundGradientTo: COLORS.backgroundLight,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#FF295D',
    },
    fillShadowGradient: '#FF295D',
    fillShadowGradientOpacity: 0.2,
  };

  const handleSelectValue = (name, value) => {
    setFilterType(value?.name || value);
  };

  return (
    <View
      style={{
        paddingHorizontal: width(2.5),
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: width(4),
        }}>
        <Text
          style={{
            fontSize: 12,
            fontFamily: fontFamly.PlusJakartaSansBold,
          }}>
          Orders Overview
        </Text>

        <View style={{width: width(40)}}>
          <CustomPicker
            ref={selectSizeRef}
            labelll={'1Month'}
            value={filterType || 'Select'}
            dropdownContainerStyle={{
              backgroundColor: COLORS.white,
              paddingVertical: width(1),
              borderRadius: 6,
            }}
            listData={[
              {name: 'Today'},
              {name: 'Weekly'},
              {name: 'Monthly'},
              {name: '6Monthly'},
              {name: 'Yearly'},
            ]}
            name="filterType"
            handleSelectValue={handleSelectValue}
          />
        </View>
      </View>

      <LineChart
        data={data}
        width={width(89)}
        height={250}
        yAxisLabel="$"
        yAxisSuffix="k"
        chartConfig={chartConfig}
        bezier
        style={{
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default LineChartComponent;

import React, {useRef, useState} from 'react';
import {Text, View} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import CustomPicker from '../customPicker';

const PieChartComponent = () => {
  const selectSizeRef = useRef();
  const [filterType, setFilterType] = useState(null);

  const data = [
    {
      name: 'Jan',
      population: 20,
      color: '#FF295D',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Feb',
      population: 45,
      color: '#4CAF50',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Mar',
      population: 28,
      color: '#2196F3',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Apr',
      population: 80,
      color: '#FFC107',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'May',
      population: 99,
      color: '#9C27B0',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Jun',
      population: 43,
      color: '#00BCD4',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ];

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

      <PieChart
        data={data}
        width={width(89)}
        height={250}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={{
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default PieChartComponent;

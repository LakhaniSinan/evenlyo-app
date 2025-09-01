import React, {useRef, useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import CustomPicker from '../customPicker';

const screenWidth = Dimensions.get('window').width;

const PieChartComponent = ({labelll = 'Orders Overview'}) => {
  const selectSizeRef = useRef();
  const [filterType, setFilterType] = useState(null);

  // Updated values for better visual variation
  const data = [
    {name: 'DJ', population: 3500, color: '#FF2D87'}, // Pink
    {name: 'Live Band', population: 4500, color: '#3B82F6'}, // Blue
    {name: 'Photo Booth', population: 2000, color: '#F59E0B'}, // Orange
    {name: 'Catering', population: 3000, color: '#FBBF24'}, // Yellow
  ];

  const handleSelectValue = (name, value) => {
    setFilterType(value?.name || value);
  };

  return (
    <View style={{paddingHorizontal: width(2.5)}}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>{labelll}</Text>
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

      <View style={styles.chartContainer}>
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendRow}>
              <View style={[styles.legendDot, {backgroundColor: item.color}]} />
              <Text style={styles.legendText}>{item.name}</Text>
              <Text style={styles.legendValue}>${item.population}</Text>
            </View>
          ))}
        </View>

        <View style={styles.pieWrapper}>
          <PieChart
            data={data}
            width={screenWidth * 0.5} // Half of screen width for chart
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="50"
            center={[10, 0]} // small shift if needed
            absolute
            hasLegend={false} // hide default legends
            style={{borderRadius: 16}}
          />
        </View>
      </View>
    </View>
  );
};

export default PieChartComponent;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: width(4),
  },
  headerText: {
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendContainer: {
    width: width(40),
    justifyContent: 'center',
  },
  pieWrapper: {
    flex: 1,
    alignItems: 'flex-end',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: width(2.5),
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  legendValue: {
    fontSize: 12,
    color: '#000',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
});

import React, {useRef, useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {PieChart} from 'react-native-chart-kit';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';
import CustomPicker from '../customPicker';

const screenWidth = Dimensions.get('window').width;

const PieChartComponent = ({
  labelll = 'Orders Overview',
  data = [],
  loading = false,
}) => {
  const selectSizeRef = useRef();
  const [filterType, setFilterType] = useState('Monthly');

  // 🎨 Auto color list for pie slices
  const chartColors = [
    '#FF2D87',
    '#3B82F6',
    '#F59E0B',
    '#10B981',
    '#8B5CF6',
    '#F97316',
  ];

  // 🧠 Convert API data into chart format
  const chartData = data?.length
    ? data.map((item, index) => ({
        name: item.categoryName || 'Unknown',
        population: item.totalEarnings || 0, // 👈 change to totalBookings if needed
        color: chartColors[index % chartColors.length],
        legendFontColor: '#000',
        legendFontSize: 10,
      }))
    : [];

  const handleSelectValue = (_, value) => {
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
            value={filterType}
            labelll={labelll}
            listData={[{name: 'Monthly'}, {name: '6 Months'}, {name: 'Yearly'}]}
            name="filterType"
            handleSelectValue={handleSelectValue}
            dropdownContainerStyle={{backgroundColor: COLORS.white}}
          />
        </View>
      </View>

      {/* Wait for data */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary || '#FF2D87'} />
          <Text style={styles.loaderText}>Loading chart data...</Text>
        </View>
      ) : !data?.length ? (
        <View style={styles.loaderContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          {/* Left side legend */}
          <View style={styles.legendContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.legendRow}>
                <View
                  style={[styles.legendDot, {backgroundColor: item.color}]}
                />
                <Text style={styles.legendText}>{item.name}</Text>
                <Text style={styles.legendValue}>${item.population}</Text>
              </View>
            ))}
          </View>

          {/* Right side chart */}
          <PieChart
            data={chartData}
            width={screenWidth * 0.5}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="40"
            center={[0, 0]}
            hasLegend={false}
            style={{borderRadius: 16}}
          />
        </View>
      )}
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
    color: COLORS.black,
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendContainer: {flex: 1},
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: width(2),
    paddingRight: width(3),
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 10,
    color: '#333',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  legendValue: {
    fontSize: 12,
    color: '#000',
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
  noDataText: {
    color: '#999',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansMedium,
  },
});
